import { auth, db, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from "./script.js";
import { Timestamp, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// Firebase 초기화가 완료된 후 실행되도록 설정
document.addEventListener("DOMContentLoaded", () => {
  setupRecaptcha();
});

let phoneVerified = false; // 전화번호 인증 여부

// 📌 **전화번호 변환 함수 (010 → +82 변환)**
function formatPhoneNumber(phoneNumber) {
  if (phoneNumber.startsWith("010")) {
    return "+82" + phoneNumber.slice(1); // 010 → +8210 변환
  }
  return phoneNumber; // 국제번호 입력 시 그대로 사용
}

// reCAPTCHA 초기화
function setupRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',  // 보이지 않는 reCAPTCHA
      callback: function(response) {
        console.log("reCAPTCHA verified:", response);
        onSolvedRecaptcha();  // reCAPTCHA가 완료되었을 때 실행되는 함수
      },
      'expired-callback': function() {
        console.log("reCAPTCHA 만료됨. 다시 시도하세요.");
      }
    });
  }
}

// "인증번호 받기" 버튼 클릭 이벤트
document.getElementById('send-code').addEventListener('click', () => {
  let phoneNumber = document.getElementById('phone-number').value.trim();
  phoneNumber = formatPhoneNumber(phoneNumber); // 📌 자동 변환 적용

  if (!phoneNumber.startsWith("+82")) {
    showErrorMessage("전화번호 형식을 확인하세요. (예: 01012341234)");
    return;
  }

  const appVerifier = window.recaptchaVerifier;
  signInWithPhoneNumber(auth, phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      console.log("문자 인증 코드가 발송되었습니다.");
      alert("문자 인증 코드가 발송되었습니다.");
    })
    .catch((error) => {
      console.error("전화번호 인증 실패:", error);
      showErrorMessage("전화번호 인증에 실패했습니다. 다시 시도해주세요.");
    });
});

// "인증 확인" 버튼 클릭 이벤트
document.getElementById('verify-code').addEventListener('click', () => {
  const verificationCode = document.getElementById('verification-code').value.trim();

  if (!verificationCode) {
    showErrorMessage("인증 코드를 입력하세요.");
    return;
  }

  window.confirmationResult.confirm(verificationCode)
  .then((result) => {
    const user = result.user;
    console.log("전화번호 인증 성공:", user);
    phoneVerified = true; // 전화번호 인증 완료
    alert("전화번호 인증이 완료되었습니다!");
    document.getElementById('verify-code').textContent = "인증 완료"; // 버튼 텍스트 변경
    document.getElementById('verify-code').disabled = true; // 버튼 비활성화
  })
  .catch((error) => {
    console.error("인증 코드 확인 실패:", error);
    showErrorMessage("인증 코드가 잘못되었습니다.");
  });
});

// 회원가입 버튼 클릭 이벤트
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!phoneVerified) {
    showErrorMessage("전화번호 인증을 먼저 완료하세요.");
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const name = document.getElementById('login-name').value.trim();
  const storeName = document.getElementById('login-store').value.trim();
  const userType = document.getElementById('user-type').value; // representative 또는 staff
  let phoneNumber = document.getElementById('phone-number').value.trim();
  phoneNumber = formatPhoneNumber(phoneNumber); // 📌 Firebase 저장 전 변환

 // 사업자 관련 입력값
 const fileInput = document.getElementById('business-license');
  const file = fileInput.files[0];
  if (!file) {
    showErrorMessage("사업자 등록증 파일을 선택해주세요.");
    return;
  }
  const storeAddress = document.getElementById('store-address').value.trim();


  // 이메일, 비밀번호 검증
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErrorMessage("이메일 형식이 올바르지 않습니다.");
    return;
  }
  if (password.length < 6) {
    showErrorMessage("비밀번호는 6자 이상이어야 합니다.");
    return;
  }
  if (!name || !storeName || !storeAddress) {
    showErrorMessage("모든 정보를 입력해 주세요.");
    return;
  }
    try {
      // Firebase Auth에 사용자 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("회원가입 성공:", user);
  
      // Storage 업로드: 사업자 등록증 파일을 Firebase Storage에 업로드
      const storage = getStorage(); // Storage 인스턴스 가져오기
      // Storage 경로 예시: businessLicenses/{user.uid}/{파일명}
      const storageRef = ref(storage, `businessLicenses/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const businessLicenseURL = await getDownloadURL(storageRef);
      console.log("사업자 등록증 업로드 완료, URL:", businessLicenseURL);
  
 
    // Firestore에 사용자 정보 저장 (사업자 등록증 URL 포함)
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      phoneNumber: phoneNumber,
      name: name,
      storeName: storeName,
      userType: userType,
      businessLicenseURL: businessLicenseURL, // 여기서 업로드된 파일의 다운로드 URL 저장
      storeAddress: storeAddress,
      createdAt: new Date(),
    });

    console.log("✅ Firestore 저장 완료");


 // ✅ 회원가입 완료 알림 후 페이지 이동
 alert("회원가입이 완료되었습니다!");
 setTimeout(() => {
   window.location.href = "booking.html";
 }, 500);
 
} catch (error) {
 console.error("❌ 회원가입 오류:", error);
 showErrorMessage(error.message);
}
});

// 오류 메시지 표시 함수
function showErrorMessage(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}






