//Node.js 기반의 서버를 실행하는 파일
//Express 같은 프레임워크를 사용해 HTTP 서버를 실행할 수 있음.
//라우팅: 클라이언트가 요청하는 URL 경로를 처리하고 적절한 응답을 보냄.
//데이터베이스와 연결: Firestore, MySQL, MongoDB 같은 DB와 연동하여 데이터를 읽고 저장.
//API 제공: 클라이언트(React, Vue, Firebase 등)에서 서버의 API를 호출할 수 있도록 API 엔드포인트 생성
//웹 서버 실행: Firebase Functions, AWS Lambda, Heroku 등과 연동하여 서버를 실행할 수 있음.


const express = require("express");
const app = express();
const port = 3000;

// 미들웨어: 요청 로깅
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // 다음 미들웨어 또는 라우트 핸들러로 이동
});

// 미들웨어: JSON 파싱
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎉 Express 서버가 잘 작동합니다!");
});

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});