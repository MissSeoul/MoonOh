import { auth, db, createUserWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier, Timestamp, doc, setDoc, storage, ref, uploadBytes, getDownloadURL } from "./firebase.js";

const VISION_API_KEY = "AIzaSyA9N-KTwC9YJk3k0FiV_BQc3kiMMxzSzUI";
const NTS_API_KEY = "VK%2BdfOnirAAyzd%2FmenaR6E5czUXby%2FUHHdaH1yTT7c%2B%2BHRnCxH42ABgs%2F9Y9RtYbYRhcXRNZpDUpWNl8F0Lq6w%3D%3D";
const NTS_API_URL = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${NTS_API_KEY}`;

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded 이벤트 시작");
  if (!auth || !db) {
    console.error("Firebase 초기화 실패: auth 또는 db가 정의되지 않음");
    showErrorMessage("Firebase 초기화에 실패했습니다. 새로고침 후 다시 시도해주세요.");
    return;
  }
  console.log("Firebase 초기화 확인 완료:", { auth, db });
  setupRecaptcha();

  const businessLicenseInput = document.getElementById("business-license");
  const sendCodeButton = document.getElementById("send-code");
  const verifyCodeButton = document.getElementById("verify-code");
  if (!businessLicenseInput) console.error("business-license 요소를 찾을 수 없습니다.");
  if (!sendCodeButton) console.error("send-code 버튼을 찾을 수 없습니다.");
  if (!verifyCodeButton) console.error("verify-code 버튼을 찾을 수 없습니다.");
});

let phoneVerified = false;
let extractedBusinessNumber = "";
let businessStatus = "";

async function extractBusinessNumber(imageUrl) {
  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;
  const requestBody = {
    requests: [{ image: { source: { imageUri: imageUrl } }, features: [{ type: "TEXT_DETECTION" }] }]
  };

  try {
    console.log("OCR 요청 시작:", apiUrl);
    const response = await fetch(apiUrl, { // NTS_API_URL → apiUrl로 수정
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
    const result = await response.json();
    console.log("OCR 응답:", result);

    if (result.responses && result.responses[0].textAnnotations) {
      const extractedText = result.responses[0].textAnnotations[0].description;
      console.log("OCR 추출 결과:", extractedText);

      const businessNumberMatch = extractedText.match(/\d{3}-\d{2}-\d{5}/);
      if (businessNumberMatch) {
        extractedBusinessNumber = businessNumberMatch[0].replace(/-/g, "");
        alert(`📌 OCR 분석 결과: ${extractedBusinessNumber}`);
        return extractedBusinessNumber;
      } else {
        showErrorMessage("사업자 등록번호를 인식할 수 없습니다.");
        return null;
      }
    } else {
      showErrorMessage("OCR 결과가 없습니다.");
      return null;
    }
  } catch (error) {
    console.error("❌ OCR 분석 실패:", error);
    showErrorMessage("OCR 분석에 실패했습니다. 다시 시도해주세요.");
    return null;
  }
}

async function checkBusinessStatus(businessNumber) {
  const requestBody = { b_no: [businessNumber] };

  try {
    console.log("국세청 API 요청 시작:", NTS_API_URL);
    const response = await fetch(NTS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);

    const data = await response.json();
    console.log("✅ 국세청 API 응답:", data);

    if (!data.data || !data.data[0] || !data.data[0].b_stt) {
      showErrorMessage("🚨 국세청에서 사업자 정보를 찾을 수 없습니다.");
      return "조회 불가";
    }

    businessStatus = data.data[0].b_stt;
    alert(`📌 사업자 상태: ${businessStatus}`);
    
    if (businessStatus === "폐업자") {
      document.getElementById("signup-button").disabled = true;
      showErrorMessage("🚨 폐업된 사업자는 가입할 수 없습니다.");
    } else {
      document.getElementById("signup-button").disabled = false;
    }
    return businessStatus;
  } catch (error) {
    console.error("❌ 사업자 상태 조회 실패:", error);
    showErrorMessage("사업자 상태 조회에 실패했습니다. 다시 시도해주세요.");
    return "API 오류";
  } finally {
    console.log("사업자 상태 조회 작업 완료");
  }
}

// 나머지 함수들은 그대로 유지 (extractBusinessNumber 호출하는 부분에서 apiUrl 수정 반영됨)
document.addEventListener("DOMContentLoaded", () => {
  const businessLicenseInput = document.getElementById("business-license");
  if (businessLicenseInput) {
    businessLicenseInput.addEventListener("change", async (event) => {
      console.log("business-license change 이벤트 발생");
      const file = event.target.files[0];
      if (!file) {
        showErrorMessage("파일을 선택해주세요.");
        return;
      }
      const storage = getStorage();
      const storageRef = ref(storage, `businessLicenses/${Date.now()}_${file.name}`);

      try {
        console.log("파일 업로드 시작:", file.name);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);
        console.log("사업자 등록증 이미지 URL:", imageUrl);

        const businessNumber = await extractBusinessNumber(imageUrl);
        if (!businessNumber) {
          showErrorMessage("사업자 등록번호를 인식할 수 없습니다. 다시 업로드하세요.");
          return;
        }

        const status = await checkBusinessStatus(businessNumber);
        if (status === "폐업자") {
          showErrorMessage("🚨 폐업된 사업자는 가입할 수 없습니다.");
        } else {
          console.log("사업자 검증 완료:", { businessNumber, status });
        }
      } catch (error) {
        console.error("❌ 파일 업로드 실패:", error);
        showErrorMessage("파일 업로드에 실패했습니다: " + error.message);
      }
    });
  } else {
    console.error("business-license 요소가 DOM에 없습니다.");
  }
});

function formatPhoneNumber(phoneNumber) {
  if (phoneNumber.startsWith("010")) {
    return "+82" + phoneNumber.slice(1);
  }
  return phoneNumber;
}

function setupRecaptcha() {
  console.log("setupRecaptcha 호출됨");
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        console.log("reCAPTCHA 통과됨", response);
      },
      'expired-callback': function() {
        console.log("reCAPTCHA 만료됨");
        showErrorMessage("reCAPTCHA가 만료되었습니다. 다시 시도하세요.");
      }
    });
    console.log("reCAPTCHA 초기화 완료");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sendCodeButton = document.getElementById("send-code");
  if (sendCodeButton) {
    sendCodeButton.addEventListener("click", () => {
      console.log("send-code 버튼 클릭");
      let phoneNumber = document.getElementById("phone-number").value.trim();
      phoneNumber = formatPhoneNumber(phoneNumber);

      if (!phoneNumber.startsWith("+82")) {
        showErrorMessage("전화번호 형식을 확인하세요. (예: 01012341234)");
        return;
      }

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        console.error("reCAPTCHA verifier가 초기화되지 않음");
        showErrorMessage("reCAPTCHA 초기화 오류. 새로고침 후 다시 시도해주세요.");
        return;
      }

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
  } else {
    console.error("send-code 버튼이 DOM에 없습니다.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const verifyCodeButton = document.getElementById("verify-code");
  if (verifyCodeButton) {
    verifyCodeButton.addEventListener("click", () => {
      console.log("verify-code 버튼 클릭");
      const verificationCode = document.getElementById("verification-code").value.trim();

      if (!verificationCode) {
        showErrorMessage("인증 코드를 입력하세요.");
        return;
      }

      window.confirmationResult.confirm(verificationCode)
        .then((result) => {
          phoneVerified = true;
          alert("전화번호 인증이 완료되었습니다!");
          document.getElementById("verify-code").innerText = "인증 완료";
          document.getElementById("verify-code").disabled = true;
        })
        .catch((error) => {
          console.error("인증 코드 확인 실패:", error);
          showErrorMessage("인증 코드가 잘못되었습니다.");
        });
    });
  } else {
    console.error("verify-code 버튼이 DOM에 없습니다.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!phoneVerified) {
        showErrorMessage("전화번호 인증을 먼저 완료하세요.");
        return;
      }

      if (!extractedBusinessNumber || !businessStatus) {
        showErrorMessage("사업자 등록증을 업로드하고 검증을 완료하세요.");
        return;
      }

      if (businessStatus === "폐업자") {
        showErrorMessage("폐업된 사업자는 가입할 수 없습니다.");
        return;
      }

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();
      const name = document.getElementById("login-name").value.trim();
      const storeName = document.getElementById("login-store").value.trim();
      const userType = document.getElementById("user-type").value;
      let phoneNumber = document.getElementById("phone-number").value.trim();
      phoneNumber = formatPhoneNumber(phoneNumber);
      const storeAddress = document.getElementById("store-address").value.trim();

      if (!email || !password || !name || !storeName || !storeAddress) {
        showErrorMessage("모든 정보를 입력해 주세요.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErrorMessage("이메일 형식이 올바르지 않습니다.");
        return;
      }
      if (password.length < 6) {
        showErrorMessage("비밀번호는 6자 이상이어야 합니다.");
        return;
      }

      const fileInput = document.getElementById("business-license");
      const file = fileInput.files[0];
      if (!file) {
        showErrorMessage("사업자 등록증 파일을 선택해주세요.");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("회원가입 성공:", user);

        const storage = getStorage();
        const storageRef = ref(storage, `businessLicenses/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const businessLicenseURL = await getDownloadURL(storageRef);
        console.log("사업자 등록증 업로드 완료, URL:", businessLicenseURL);

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: email,
          phoneNumber: phoneNumber,
          name: name,
          storeName: storeName,
          userType: userType,
          businessLicenseURL: businessLicenseURL,
          storeAddress: storeAddress,
          businessNumber: extractedBusinessNumber,
          businessStatus: businessStatus,
          createdAt: Timestamp.fromDate(new Date()),
        });
        console.log("✅ Firestore 저장 완료");

        alert("회원가입이 완료되었습니다!");
        setTimeout(() => {
          window.location.href = "booking.html";
        }, 500);
      } catch (error) {
        console.error("❌ 회원가입 오류:", error);
        showErrorMessage(error.message);
      }
    });
  } else {
    console.error("signup-form 요소가 DOM에 없습니다.");
  }
});

function showErrorMessage(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => errorDiv.style.display = "none", 5000);
  } else {
    console.error("error-message 요소가 DOM에 없습니다.");
  }
}