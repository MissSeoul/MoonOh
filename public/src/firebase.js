import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAEoQAuU8WsZ-Xfwpuehzlr3zh2mRSuVMI",
  authDomain: "puppy-yejin.firebaseapp.com",
  databaseURL: "https://puppy-yejin-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "puppy-yejin",
  storageBucket: "puppy-yejin.firebasestorage.app",
  messagingSenderId: "97024468182",
  appId: "1:97024468182:web:4ab76202f9ec4ab5c41577"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

auth.languageCode = 'ko';

console.log("✅ Firebase 초기화 완료:", { auth, db });
console.log("✅ Firestore 연결 성공:", db);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier };