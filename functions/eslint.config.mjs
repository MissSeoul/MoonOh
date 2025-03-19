// ESLint의 설정 파일이며,**ESM(ECMAScript Module-정적인(import/export) 모듈 로딩) 방식(.mjs)**을 사용하여 모듈을 가져오고(import), 설정을 내보내는 역할을 함
//JavaScript, TypeScript 코드 스타일 및 문법 오류를 검사하는 규칙을 정의하는 역할을 수행
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];