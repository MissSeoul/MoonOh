import { defineConfig } from 'vite';

export default defineConfig({
  root: './public', // public 폴더를 루트로 설정
  build: {
    outDir: '../dist' // 빌드 출력은 루트의 dist로
  }
});