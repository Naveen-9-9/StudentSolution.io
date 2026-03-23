module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000,
  clearMocks: true,
  restoreMocks: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'apps/**/*.js',
    'libraries/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ]
};
