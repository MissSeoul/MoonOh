import { auth, signInWithEmailAndPassword } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const signupBtn = document.getElementById("signup-btn");

  if (!signupForm) {
    console.error("❌ signup-form 요소를 찾을 수 없습니다.");
    return;
  }

  // 📌 강제로 버튼 활성화
  if (signupBtn) {
    signupBtn.disabled = false; // 비활성화 상태 해제
    console.log("✅ signup-btn 버튼이 활성화됨!");
  } else {
    console.error("❌ signup-btn 요소를 찾을 수 없습니다.");
  }

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault(); // 기본 폼 제출 막기

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // 이메일 형식 검증 (정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || password.length < 6) {
      showErrorMessage("아이디 혹은 비밀번호가 정상적이지 않습니다.");
      return;
    }

    // 📌 회원가입이 아니라 로그인 기능 사용
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("로그인 성공! 대시보드로 이동합니다.");
        window.location.href = "dashboard.html"; // 로그인 후 이동할 페이지
      })
      .catch((error) => {
        showErrorMessage("로그인 실패: " + error.message);
      });
  });
});


// 오류 메시지 표시 함수
function showErrorMessage(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}
