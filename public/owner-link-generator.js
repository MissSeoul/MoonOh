import { auth } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  auth.onAuthStateChanged((user) => {
    if (!user) window.location.href = "booking.html?redirect=" + encodeURIComponent(window.location.href);
  });
});

document.getElementById("linkForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("customer-phone").value;
  const name = document.getElementById("customer-name").value; // 수정됨

  console.log("Phone:", phone, "Name:", name, "OwnerId:", auth.currentUser?.uid);

  if (!phone || !name) {
    document.getElementById("generated-link").textContent = "전화번호와 이름을 입력해주세요.";
    return;
  }

  try {
    const response = await fetch("https://us-central1-puppy-yejin.web.app/api/send-kakao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name, ownerId: auth.currentUser.uid })
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById("generated-link").textContent = "견주에게 카톡 전송 완료!";
    } else {
      document.getElementById("generated-link").textContent = "전송 실패: " + result.error;
    }
  } catch (error) {
    document.getElementById("generated-link").textContent = "전송 실패: " + error.message;
  }
});