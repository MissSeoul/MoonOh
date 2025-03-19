import { db } from "./firebase.js";
import { collection, doc, getDoc, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get("shopId"); // URL에서 매장 ID 가져오기

// 📌 매장 정보 불러오기
async function loadShopInfo() {
  if (!shopId) {
    alert("잘못된 접근입니다.");
    return;
  }

  const shopRef = doc(db, "shops", shopId);
  const shopSnap = await getDoc(shopRef);

  if (shopSnap.exists()) {
    const shopData = shopSnap.data();
    document.getElementById("shop-name").textContent = shopData.name;
    document.getElementById("shop-image").src = shopData.imageUrl || "default.jpg";
    document.getElementById("shop-description").textContent = shopData.description;
    document.getElementById("shop-hours").textContent = shopData.hours;
    document.getElementById("shop-location").textContent = shopData.location;
  } else {
    alert("매장 정보를 찾을 수 없습니다.");
  }
}

// 📌 고객이 예약 가능한 시간 조회 (bookings 컬렉션에서 중복된 예약 시간 확인)
document.getElementById("check-schedule").addEventListener("click", async () => {
  const phone = document.getElementById("customer-phone").value.trim();
  const dogName = document.getElementById("dog-name").value.trim();

  if (!phone || !dogName) {
    alert("전화번호와 반려견 이름을 입력해주세요.");
    return;
  }

  // ✅ 예약 가능한 시간 불러오기
  const scheduleList = document.getElementById("schedule-list");
  scheduleList.innerHTML = ""; // 기존 데이터 삭제
  const today = new Date().toISOString().split("T")[0];

  const q = query(collection(db, "bookings"), where("shopId", "==", shopId), where("date", ">=", today));
  const snapshot = await getDocs(q);

  let bookedTimes = {};
  snapshot.forEach((doc) => {
    const booking = doc.data();
    if (!bookedTimes[booking.date]) bookedTimes[booking.date] = [];
    bookedTimes[booking.date].push(booking.time);
  });

  // ✅ 예약 가능 시간 표시
  const availableTimes = generateTimeSlots("08:00", "19:00", 30);

  for (let date = 0; date < 7; date++) {
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + date);
    let dateString = targetDate.toISOString().split("T")[0];

    let listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${dateString}</strong><br>`;

    availableTimes.forEach((time) => {
      let isBooked = bookedTimes[dateString]?.includes(time);
      let timeButton = document.createElement("button");
      timeButton.textContent = isBooked ? `🚫 ${time} (마감)` : `✅ ${time} 예약 가능`;
      timeButton.disabled = isBooked;
      timeButton.classList.add("time-slot");
      timeButton.onclick = () => selectTime(dateString, time);
      listItem.appendChild(timeButton);
    });

    scheduleList.appendChild(listItem);
  }

  document.getElementById("schedule-section").style.display = "block";
});

// 📌 시간 선택 시 변수 저장
let selectedDate = null;
let selectedTime = null;
function selectTime(date, time) {
  selectedDate = date;
  selectedTime = time;
  console.log(`✅ 선택된 예약: ${date} ${time}`);

  document.getElementById("confirm-booking").disabled = false;
}

// 📌 예약 확정
document.getElementById("confirm-booking").addEventListener("click", async () => {
  if (!selectedDate || !selectedTime) {
    alert("예약할 날짜와 시간을 선택하세요.");
    return;
  }

  const phone = document.getElementById("customer-phone").value.trim();
  const dogName = document.getElementById("dog-name").value.trim();

  try {
    await addDoc(collection(db, "bookings"), {
      shopId,
      date: selectedDate,
      time: selectedTime,
      phone,
      dogName,
      status: "pending"
    });

    alert("예약이 완료되었습니다!");
    document.getElementById("transport-section").style.display = "block";
  } catch (error) {
    console.error("예약 실패:", error);
    alert("예약 처리 중 오류가 발생했습니다.");
  }
});

// 📌 운송 서비스 선택
document.getElementById("use-transport").addEventListener("click", () => {
  alert("운송 서비스가 추가되었습니다!");
  window.location.href = "thankyou.html";
});

document.getElementById("skip-transport").addEventListener("click", () => {
  alert("예약이 완료되었습니다!");
  window.location.href = "thankyou.html";
});

// 📌 시간 슬롯 생성 함수 (30분 간격)
function generateTimeSlots(start, end, interval) {
  let times = [];
  let currentTime = new Date(`2000-01-01T${start}:00`);
  let endTime = new Date(`2000-01-01T${end}:00`);

  while (currentTime <= endTime) {
    let timeStr = currentTime.toTimeString().slice(0, 5);
    times.push(timeStr);
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return times;
}

// 📌 페이지 로드 시 매장 정보 불러오기
document.addEventListener("DOMContentLoaded", loadShopInfo);
