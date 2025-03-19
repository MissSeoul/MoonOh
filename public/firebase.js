import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, Timestamp, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
const storage = getStorage(app);

auth.languageCode = 'ko';

console.log("✅ Firebase 초기화 완료:", { auth, db });
console.log("✅ Firestore 연결 성공:", db);

export { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber, 
  RecaptchaVerifier, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  storage,
  Timestamp,    // 추가
  setDoc,       // 추가
  ref,          // 추가
  uploadBytes,  // 추가
  getDownloadURL, // 추가
  onSnapshot
};

let map;
function initMap() {
  console.log("🗺 Google 지도 초기화 시작");
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    console.error("❌ 지도 요소(id='map')를 찾을 수 없습니다!");
    return;
  }
  map = new google.maps.Map(mapElement, {
    center: { lat: 37.5665, lng: 126.978 },
    zoom: 12
  });
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);
  const request = {
    origin: { lat: 37.5665, lng: 126.978 },
    destination: { lat: 37.5701, lng: 126.9894 },
    travelMode: google.maps.TravelMode.DRIVING,
  };
  directionsService.route(request, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(response);
      console.log("✅ 경로 생성 완료");
    } else {
      console.error("❌ 경로를 찾을 수 없습니다:", status);
      alert("경로를 찾을 수 없습니다: " + status);
    }
  });
}
window.initMap = initMap;