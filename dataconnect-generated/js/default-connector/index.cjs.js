//Node.js 기반의 Firebase/Google Cloud 데이터베이스 연결 설정 파일
//PostgreSQL, Firestore 또는 Cloud SQL에 연결할 때 사용될 가능성 큼
//Firebase Functions, Cloud Run 등에서 데이터 연동 시 활용 가능
const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'puppy-yejin',
  location: 'asia-northeast3'
};
exports.connectorConfig = connectorConfig;

