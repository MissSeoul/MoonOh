import { auth, signInWithEmailAndPassword } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const signupBtn = document.getElementById("signup-btn");

  if (!signupForm) {
    console.error("❌ signup-form 요소를 찾을 수 없습니다.");
    return;
  }

  // 📌 강제로 버튼 활성화
  if (signupBtn) {
    signupBtn.disabled = false;
    console.log("✅ signup-btn 버튼이 활성화됨!");
  } else {
    console.error("❌ signup-btn 요소를 찾을 수 없습니다.");
  }

  // **✅ async 추가 (중요)**
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // 이메일 검증 (정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || password.length < 6) {
      showErrorMessage("아이디 혹은 비밀번호가 정상적이지 않습니다.");
      return;
    }

    // **✅ 버튼 중복 클릭 방지 (로그인 처리 중)**
    signupBtn.disabled = true;
    signupBtn.textContent = "로그인 중...";

    try {
      // **📌 Firebase Auth 로그인 시도**
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ 로그인 성공:", userCredential.user);

      alert("로그인 성공! 대시보드로 이동합니다.");
      window.location.href = "dashboard.html"; // 로그인 후 이동할 페이지
    } catch (error) {
      console.error("❌ 로그인 실패:", error.message);
      showErrorMessage("로그인 실패: " + error.message);
    } finally {
      // **📌 로그인 성공 여부 관계없이 버튼 다시 활성화**
      signupBtn.disabled = false;
      signupBtn.textContent = "로그인하기";
    }
  });
});

// 📌 오류 메시지 표시 함수 (5초 후 자동 숨김)
function showErrorMessage(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 5000);
}
