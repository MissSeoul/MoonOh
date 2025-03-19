import { auth, db, collection, addDoc, query, where, getDocs, RecaptchaVerifier, signInWithPhoneNumber } from "./firebase.js";

// URL 파라미터 읽기
const urlParams = new URLSearchParams(window.location.search);
const phoneFromUrl = urlParams.get("phone");
const nameFromUrl = urlParams.get("name");

let isVerified = false;

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  if (phoneFromUrl && nameFromUrl) {
    document.getElementById("phone").value = phoneFromUrl;
    document.getElementById("guardian-name").value = nameFromUrl;
    setupRecaptcha();
    loadShops(); // 인증 전에도 가게 목록 로드
  } else {
    document.getElementById("auth-message").textContent = "업주로부터 받은 링크로 접속해주세요.";
  }
});

// reCAPTCHA 설정
function setupRecaptcha() {
  window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: () => console.log("reCAPTCHA verified"),
  });
}

// 인증 코드 전송
document.getElementById("send-code").addEventListener("click", async () => {
  const phone = document.getElementById("phone").value;
  try {
    const formattedPhone = formatPhoneNumber(phone);
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    document.getElementById("auth-message").textContent = "인증 코드가 전송되었습니다.";
    document.getElementById("auth-message").style.color = "#667eea";
  } catch (error) {
    document.getElementById("auth-message").textContent = "코드 전송 실패: " + error.message;
  }
});

// 인증 코드 확인
document.getElementById("verify-code").addEventListener("click", async () => {
  const code = document.getElementById("verification-code").value;
  try {
    const result = await window.confirmationResult.confirm(code);
    isVerified = true;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("booking-section").style.display = "block";
  } catch (error) {
    document.getElementById("auth-message").textContent = "인증 실패: " + error.message;
  }
});

// 전화번호 포맷팅
function formatPhoneNumber(phone) {
  if (phone.startsWith("010")) {
    return "+82" + phone.slice(1);
  }
  return phone;
}

// 가게 목록 로드
async function loadShops() {
  console.log("🔍 Firestore에서 가게 목록을 불러옵니다...");
  const shopsRef = collection(db, "shops");
  const snapshot = await getDocs(shopsRef);
  console.log("📋 가져온 가게 목록 snapshot:", snapshot);

  const shopSelect = document.getElementById("shop-select");
  shopSelect.innerHTML = '<option value="">가게 선택</option>';

  snapshot.forEach((doc) => {
    const shop = doc.data();
    console.log("🏪 가게 데이터:", shop);
    const option = document.createElement("option");
    option.value = doc.id;
    option.textContent = shop.name;
    shopSelect.appendChild(option);
  });
  console.log("✅ 가게 목록 업데이트 완료!");
}

// Google Maps API로 주소 → 좌표 변환
async function geocodeAddress(address) {
  const apiKey = "AIzaSyBMxI8hr3CabA-6g7AczVIaXx39sC5ri_0"; // 실제 키 사용
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  );
  const data = await response.json();
  if (data.status === "OK") {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } else {
    throw new Error("주소 변환 실패: " + data.status);
  }
}

// 예약 가능 여부 확인
async function checkAvailability(shopId, date, time) {
  const q = query(
    collection(db, "bookings"),
    where("shopId", "==", shopId),
    where("date", "==", date),
    where("time", "==", time)
  );
  const snapshot = await getDocs(q);
  return snapshot.size < 5;
}

// 예약 생성
document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!isVerified) {
    document.getElementById("message").textContent = "먼저 전화번호 인증을 완료해주세요.";
    return;
  }

  const pickupAddress = document.getElementById("pickup-address").value;
  const shopId = document.getElementById("shop-select").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const guardianName = document.getElementById("guardian-name").value;
  const dogName = document.getElementById("dog-name").value;

  if (!pickupAddress || !shopId || !date || !time || !guardianName || !dogName) {
    document.getElementById("message").textContent = "모든 필드를 입력해주세요.";
    return;
  }

  try {
    const available = await checkAvailability(shopId, date, time);
    if (!available) {
      document.getElementById("message").textContent = "이 시간대는 예약이 가득 찼습니다.";
      return;
    }

    const pickupCoords = await geocodeAddress(pickupAddress);
    const user = auth.currentUser;

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      shopId,
      pickupAddress,
      pickupCoords,
      date,
      time,
      guardianName,
      dogName,
      status: "pending"
    });

    document.getElementById("message").textContent = "예약이 성공적으로 생성되었습니다!";
    document.getElementById("message").style.color = "#667eea";
    document.getElementById("bookingForm").reset();
  } catch (error) {
    document.getElementById("message").textContent = "예약 생성 실패: " + error.message;
  }
});