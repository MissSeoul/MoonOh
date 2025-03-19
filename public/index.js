document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ index.js 로드 완료");

  const loginButton = document.getElementById("login-button");
  const signupButton = document.getElementById("signup-button");

  if (!loginButton || !signupButton) {
    console.error("❌ 버튼 요소를 찾을 수 없습니다. HTML을 확인하세요.");
    return;
  }

  loginButton.addEventListener("click", () => {
    console.log("🔄 로그인 버튼 클릭됨, login.html로 이동");
    window.location.href = "login.html"; // ✅ 로그인 페이지로 이동
  });

  signupButton.addEventListener("click", () => {
    console.log("🔄 회원가입 버튼 클릭됨, signup.html로 이동");
    window.location.href = "signup.html"; // ✅ 회원가입 페이지로 이동
  });
});
