export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Specify the root directory for Jest to look for tests
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151002],
      },
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.(js|jsx|mjs)$': 'babel-jest',
  },
  testMatch: [
    '**/?(*.)+(spec|test).ts?(x)', // Match test files with .spec.ts or .test.ts extensions
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/(?!mielk-fn|mielk-db).+\\.js$'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports/html-report',
        filename: 'report.html',
        pageTitle: 'mielk-db - Test Report',
        expand: true,
        openReport: true,
        groupBy: ['describe'],
      },
    ],
  ],
};
