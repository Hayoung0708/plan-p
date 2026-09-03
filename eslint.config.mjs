import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';
import { configs as tseslintConfigs } from 'typescript-eslint';

/** function 키워드·default import/export 금지 셀렉터. 오버라이드에서 재사용한다 */
const baseRestrictedSyntax = [
  {
    selector: 'FunctionDeclaration',
    message: 'function 키워드 금지. 화살표 함수를 쓴다',
  },
  {
    selector: 'FunctionExpression',
    message: 'function 키워드 금지. 화살표 함수를 쓴다',
  },
  {
    selector: 'ExportDefaultDeclaration',
    message: 'default export 금지. named export만 쓴다',
  },
  {
    // 프로젝트 내부 모듈에만 적용. 외부 라이브러리는 default만 내보내는 경우가 많다
    selector: 'ImportDeclaration[source.value=/^[.]/] > ImportDefaultSpecifier',
    message: 'default import 금지. named import만 쓴다',
  },
];

export default defineConfig([
  { ignores: ['dist/*', '.expo/*', 'scripts/*', 'expo-env.d.ts'] },
  expoConfig,
  tseslintConfigs.recommended,
  jsdoc.configs['flat/recommended-typescript-error'],
  prettierRecommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // any는 타입 시스템을 통째로 무력화한다. 모르는 타입은 unknown으로 받고 좁힌다
      '@typescript-eslint/no-explicit-any': 'error',

      // 추론에 기대지 않는다. 함수 경계 타입이 명시돼야 시그니처만 읽고 호출할 수 있다
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: false }],
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // cl.name 같은 단건 접근 금지. 구조분해로 꺼낸다
      'prefer-destructuring': ['error', { VariableDeclarator: { object: true, array: false } }],

      // 모든 함수는 화살표 함수
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'no-restricted-syntax': ['error', ...baseRestrictedSyntax],

      // 이름 붙은 함수는 왜 존재하는지 JSDoc으로 남긴다
      'jsdoc/require-jsdoc': [
        'error',
        {
          require: { ArrowFunctionExpression: true, FunctionDeclaration: true },
          contexts: ['VariableDeclarator > ArrowFunctionExpression'],
        },
      ],
      'jsdoc/require-description': 'error',
      // 구조분해 프로퍼티까지 하나씩 @param을 요구하면 컴포넌트마다 주석이 타입 정의를 베낀다.
      // 타입은 Props 타입이 이미 말하고 있으니 JSDoc은 인자 단위까지만 요구한다
      'jsdoc/require-param': ['error', { checkDestructured: false }],
      'jsdoc/check-param-names': ['error', { checkDestructured: false }],
      'jsdoc/require-returns': 'error',

      // 하나의 함수는 하나의 일만. 넘으면 쪼갤 곳이 있다는 신호
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 10],
    },
  },

  {
    // 계산(utils)과 데이터(constants)에 상태·액션이 들어오면 안 된다.
    // 훅을 부르는 순간 React 렌더 사이클에 묶여 테스트도 재사용도 불가능해진다
    files: ['src/utils/**/*.ts', 'src/constants/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...baseRestrictedSyntax,
        {
          selector: 'CallExpression[callee.name=/^use[A-Z]/]',
          message: '훅 호출은 hooks/에만. utils는 순수 계산, constants는 데이터만 둔다',
        },
      ],
    },
  },

  {
    // expo-router는 라우트 파일에 default export를 강제한다
    files: ['src/app/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...baseRestrictedSyntax.filter(({ selector }) => selector !== 'ExportDefaultDeclaration'),
      ],
    },
  },
]);
