// Firebase 모듈 불러오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";


// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAEoQAuU8WsZ-Xfwpuehzlr3zh2mRSuVMI",
  authDomain: "puppy-yejin.firebaseapp.com",
  databaseURL: "https://puppy-yejin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "puppy-yejin",
  storageBucket: "puppy-yejin.firebasestorage.app",
  messagingSenderId: "97024468182",
  appId: "1:97024468182:web:4ab76202f9ec4ab5c41577"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 📌 Firestore 초기화 확인 로그 추가
console.log("Firebase Firestore 초기화 완료:", db);


// 언어 설정
auth.languageCode = 'it';

// Firebase 객체 내보내기
export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, addDoc, collection, RecaptchaVerifier, signInWithPhoneNumber };

