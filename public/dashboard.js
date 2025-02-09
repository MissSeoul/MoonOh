import { auth, db } from "./script.js";
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";


// 📌 예약 목록 불러오는 함수 추가
async function loadReservations(userId) {
  try {
    console.log("📌 예약 데이터 불러오기 실행됨. userId:", userId);
    
    const q = query(collection(db, "reservations"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const reservationList = document.getElementById("reservation-list");

    if (!reservationList) {
      console.error("❌ reservation-list 요소를 찾을 수 없습니다!");
      return;
    }

    reservationList.innerHTML = ""; // 기존 목록 초기화

    querySnapshot.forEach((doc) => {
      let li = document.createElement("li");
      li.textContent = `${doc.data().date} ${doc.data().time}: ${doc.data().guardianName} - ${doc.data().dogName} (${doc.data().dogBreed})`;
      reservationList.appendChild(li);
    });

    console.log("✅ 예약 데이터 로드 완료");
  } catch (error) {
    console.error("❌ 예약 데이터 불러오기 오류:", error);
    alert("예약 정보를 불러오는 중 오류가 발생했습니다.");
  }
}

// 예약 데이터를 Firestore에 저장하는 함수
async function saveReservation() {
  const user = auth.currentUser;
  if (!user) {
    alert("사용자 정보가 없습니다.");
    return;
  }
  if (!selectedDate || !selectedTime) {
    alert("날짜와 시간을 선택해 주세요.");
    return;
  }
  
  // 입력 필드에서 값 읽어오기
  const guardianName = document.getElementById("guardian-name").value.trim();
  const dogName = document.getElementById("dog-name").value.trim();
  const dogAge = document.getElementById("dog-age").value.trim();
  const dogBreed = document.getElementById("dog-breed").value.trim();
  const phoneNumber = document.getElementById("phone-number").value.trim();
  
  // 모든 입력 값이 입력되었는지 확인
  if (!guardianName || !dogName || !dogAge || !dogBreed || !phoneNumber) {
    alert("모든 정보를 입력해 주세요.");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "reservations"), {
      userId: user.uid,
      date: selectedDate,
      time: selectedTime,
      guardianName: guardianName,
      dogName: dogName,
      dogAge: dogAge,
      dogBreed: dogBreed,
      phoneNumber: phoneNumber
    });
    console.log("✅ 예약 저장 완료. 문서 ID:", docRef.id);
    alert("예약이 저장되었습니다!");
    
    // 저장 후 모달 닫고 예약 목록 갱신
    document.getElementById("reservation-modal").style.display = "none";
    loadReservations(user.uid);
    
  } catch (error) {
    console.error("❌ 예약 저장 실패:", error);
    alert("예약 저장 중 오류가 발생했습니다.");
  }
}

// 📌 HTML이 완전히 로드된 후 실행될 코드
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ 문서 로드 완료");

  // 로그인 상태 확인
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      console.log("로그인된 사용자:", user.uid);
      document.getElementById("user-name").textContent = user.email;
      loadReservations(user.uid);
    }
  });


  // 로그아웃 처리
  document.getElementById("logout-button").addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });

// 📌 달력 날짜 클릭 시 시간 슬롯 생성
document.getElementById("calendar-grid").addEventListener("click", (event) => {
  if (event.target.classList.contains("calendar-day")) {
    selectedDate = event.target.textContent;
    console.log("✅ 선택된 날짜:", selectedDate);
    document.getElementById("selected-date").textContent = selectedDate;

    // 📌 0.2초 후에 `generateTimeSlots()` 실행 (HTML 렌더링을 기다림)
    

    setTimeout(() => {
      generateTimeSlots();
    }, 200);
  }
});

renderCalendar(displayedYear, displayedMonth);

document.getElementById("save-reservation").addEventListener("click", saveReservation);
});

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const currentMonth = document.getElementById("current-month");
  let selectedDate = null;
  let selectedTime = null;
  const today = new Date();
  let displayedMonth = today.getMonth();
  let displayedYear = today.getFullYear();

  // 📌 달력 렌더링 함수
  function renderCalendar(year, month) {
    const calendarGrid = document.getElementById("calendar-grid");
    calendarGrid.innerHTML = "";
    currentMonth.textContent = `${year}년 ${month + 1}월`;

    let firstDay = new Date(year, month, 1).getDay();
    let lastDate = new Date(year, month + 1, 0).getDate();

    // 요일 표시
    weekdays.forEach((day) => {
      let dayHeader = document.createElement("div");
      dayHeader.classList.add("day-header");
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });

    // 빈 칸 채우기 (첫 주 시작 요일 조정)
    for (let i = 0; i < firstDay; i++) {
      let emptyDiv = document.createElement("div");
      emptyDiv.classList.add("empty-day");
      calendarGrid.appendChild(emptyDiv);
    }

    // 날짜 채우기
    for (let date = 1; date <= lastDate; date++) {
      let dayButton = document.createElement("button");
      dayButton.classList.add("calendar-day");
      dayButton.textContent = date;

      let dateStr = `${year}-${month + 1}-${date}`;
      if (dateStr === `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`) {
        dayButton.classList.add("today");
      }

      dayButton.addEventListener("click", () => {
        document.querySelectorAll(".calendar-day").forEach(day => day.classList.remove("selected-day"));
        dayButton.classList.add("selected-day");

        selectedDate = dateStr;
        console.log("✅ 선택된 날짜:", selectedDate);

        document.getElementById("selected-date").textContent = selectedDate;
        generateTimeSlots();

        document.getElementById("reservation-modal").style.display = "block";
      });

      calendarGrid.appendChild(dayButton);
    }
  }

  renderCalendar(displayedYear, displayedMonth);

  document.getElementById("prev-month").addEventListener("click", () => {
    displayedMonth--;
    if (displayedMonth < 0) {
      displayedMonth = 11;
      displayedYear--;
    }
    renderCalendar(displayedYear, displayedMonth);
  });

  document.getElementById("next-month").addEventListener("click", () => {
    displayedMonth++;
    if (displayedMonth > 11) {
      displayedMonth = 0;
      displayedYear++;
    }
    renderCalendar(displayedYear, displayedMonth);
  });

  // 📌 시간 슬롯 생성 함수
  function generateTimeSlots() {
    console.log("📌 generateTimeSlots() 실행됨, selectedDate:", selectedDate);

    if (!selectedDate) {
      console.error("❌ 날짜가 선택되지 않음!");
      return;
    }

    const timeContainer = document.getElementById("time-slots");
    console.log("✅ time-slots 요소 확인 완료:", timeContainer); // 👉 콘솔에서 요소 확인
    
    if (!timeContainer) {
      console.error("❌ time-slots 요소를 찾을 수 없습니다!");
      return;
    }
  
    timeContainer.innerHTML = "";

    let startTime = 7 * 60 + 30;
    let endTime = 20 * 60 + 30;

    for (let minutes = startTime; minutes <= endTime; minutes += 30) {
      let hour = Math.floor(minutes / 60);
      let minute = minutes % 60;
      let timeText = `${hour}:${minute === 0 ? "00" : minute}`;

      let timeButton = document.createElement("button");
      timeButton.classList.add("time-slot");
      timeButton.textContent = timeText;
      timeContainer.appendChild(timeButton);

      console.log("✅ 생성된 버튼:", timeButton.textContent); // 👉 시간 슬롯이 생성되는지 확인

      timeButton.addEventListener("click", () => {
        console.log("시간 버튼 클릭됨:", timeText); // 클릭한 시간이 출력되는지 확인
        document.querySelectorAll(".time-slot").forEach(slot => slot.classList.remove("selected"));
        timeButton.classList.add("selected");

        selectedTime = timeText;
        document.getElementById("selected-time").textContent = selectedTime;
        document.getElementById("reservation-modal").style.display = "block";
      });
    }
    console.log("✅ 시간 슬롯 생성 완료");
    console.log("✅ timeContainer의 innerHTML:", timeContainer.innerHTML); // 👈 time-slots의 내용 출력 확인
  }

  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("reservation-modal").style.display = "none";
  });

