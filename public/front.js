// Firestore에 데이터 저장
async function saveToFirestore() {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name: "Test User",
      email: "testuser@example.com",
    });
    console.log("Document written with ID: ", docRef.id);
    alert("Firestore에 데이터가 저장되었습니다!");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// 버튼 클릭 이벤트 리스너
document.getElementById("save-button").addEventListener("click", saveToFirestore);
