import { auth, db, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  let currentDate = new Date();
  let shopId;

  auth.onAuthStateChanged((user) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }
    shopId = user.uid;
    document.getElementById("user-name").textContent = user.email.split("@")[0];
    loadCalendar(currentDate);
    listenReservations(shopId); // 실시간 예약 목록
  });

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      auth.signOut().then(() => window.location.href = "login.html")
        .catch((error) => console.error("로그아웃 실패:", error));
    });
  }

  document.getElementById("prev-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    loadCalendar(currentDate);
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    loadCalendar(currentDate);
  });
});

// 캘린더 로드 (기존 코드 유지)
function loadCalendar(date) {
  const monthYear = date.toLocaleString("ko", { month: "long", year: "numeric" });
  document.getElementById("current-month").textContent = monthYear;

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekdaysDiv = document.getElementById("calendar-weekdays");
  weekdaysDiv.innerHTML = weekdays.map(day => `<div>${day}</div>`).join("");

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    grid.innerHTML += `<div class="calendar-day" data-date="${dateStr}">${day}</div>`;
  }

  document.querySelectorAll(".calendar-day").forEach(day => {
    day.addEventListener("click", () => openReservationModal(day.dataset.date));
  });
}

// 실시간 예약 목록 (네 스타일 유지)
function listenReservations(shopId) {
  console.log(`📅 ${shopId}의 예약을 불러옵니다.`);
  const reservationsList = document.getElementById("reservation-list");
  const q = query(collection(db, "bookings"), where("shopId", "==", shopId));
  onSnapshot(q, (snapshot) => {
    reservationsList.innerHTML = "";
    snapshot.forEach((docSnapshot) => {
      const booking = docSnapshot.data();
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        🐶 <strong>${booking.dogName}</strong> / 📅 ${booking.date} ${booking.time} <br>
        📞 고객: ${booking.customerPhone}
        <button onclick="window.acceptBooking('${docSnapshot.id}')">✅ 승인</button>
        <button onclick="window.rejectBooking('${docSnapshot.id}')">❌ 거절</button>
      `;
      reservationsList.appendChild(listItem);
    });
  });
}

// 예약 모달 열기/저장 (기존 코드 유지)
function openReservationModal(date) {
  const modal = document.getElementById("reservation-modal");
  document.getElementById("selected-date").textContent = date;
  modal.style.display = "block";

  document.getElementById("close-modal").onclick = () => modal.style.display = "none";
  document.getElementById("save-reservation").onclick = () => saveReservation(date);
}

function saveReservation(date) {
  const guardianName = document.getElementById("guardian-name").value;
  const dogName = document.getElementById("dog-name").value;
  const dogAge = document.getElementById("dog-age").value;
  const dogBreed = document.getElementById("dog-breed").value;
  const phoneNumber = document.getElementById("phone-number").value;
  const time = document.getElementById("time-slot").value;

  if (!guardianName || !dogName || !time) {
    alert("필수 정보를 입력하세요!");
    return;
  }

  addDoc(collection(db, "bookings"), {
    shopId: auth.currentUser.uid,
    guardianName,
    dogName,
    dogAge,
    dogBreed,
    customerPhone: phoneNumber,
    date,
    time,
    status: "pending"
  }).then(() => {
    alert("예약이 추가되었습니다!");
    document.getElementById("reservation-modal").style.display = "none";
    document.querySelectorAll(".form-group input").forEach(input => input.value = "");
  });
}

window.acceptBooking = async (bookingId) => {
  await updateDoc(doc(db, "bookings", bookingId), { status: "confirmed" });
  alert("예약이 승인되었습니다.");
};

window.rejectBooking = async (bookingId) => {
  await deleteDoc(doc(db, "bookings", bookingId));
  alert("예약이 취소되었습니다.");
};