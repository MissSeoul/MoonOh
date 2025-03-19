// ✅ dotenv 패키지로 환경 변수 로드
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// `.env` 파일 존재 여부 확인
const envPath = path.resolve(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env 파일이 존재하지 않습니다:', envPath);
  process.exit(1); // ❌ 강제 종료 (환경 변수가 없으면 실행 불가)
} else {
  console.log('✅ .env 파일이 존재합니다:', envPath);
}

// ✅ 환경 변수 확인
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS 환경 변수가 설정되지 않았습니다!');
  process.exit(1); // ❌ 강제 종료
} else {
  console.log('✅ GOOGLE_APPLICATION_CREDENTIALS 로드됨:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

// ✅ Firebase 모듈 불러오기
const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');

const app = express();

// ✅ Firebase Admin SDK 초기화
if (admin.apps.length === 0) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK 초기화 성공');
  } catch (error) {
    console.error('❌ Firebase Admin SDK 초기화 실패:', error.message);
    process.exit(1); // ❌ Firebase 초기화 실패 시 강제 종료
  }
}

// ✅ Firestore DB 연결
const db = admin.firestore();
console.log('✅ Firestore 데이터베이스 연결 완료');

app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ 테스트용 기본 엔드포인트
app.get('/', (req, res) => {
  res.send(`🎉 Express 서버가 Firebase Functions에서 정상적으로 실행되고 있습니다!`);
});

// ✅ 카카오톡 전송 시뮬레이션 API 추가
app.post('/api/send-kakao', async (req, res) => {
  const { phone, name, ownerId } = req.body;

  if (!phone || !name || !ownerId) {
    return res.status(400).json({ success: false, error: 'phone, name, ownerId는 필수입니다.' });
  }

  console.log(`📩 카카오톡 전송 시뮬레이션: ${phone} / ${name} / ${ownerId}`);

  // 🔹 실제 카카오톡 API 연동이 없으므로 단순히 성공 응답을 반환
  res.json({ success: true, message: '카카오톡 전송 시뮬레이션 완료!' });
});
// ✅ Firebase Cloud Functions로 내보내기
exports.api = functions.https.onRequest(app);
