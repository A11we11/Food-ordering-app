// jest.config.js
export default {
  // Use Node.js environment for testing
  testEnvironment: "node",

  // Enable ES6 modules
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  // File patterns for tests
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],

  // Setup files to run before tests
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "models/**/*.js",
    "routes/**/*.js",
    "config/**/*.js",
    "!**/*.test.js",
    "!**/node_modules/**",
    "!coverage/**",
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,

  // Module file extensions
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx"],

  // Transform ignore patterns
  transformIgnorePatterns: ["node_modules/(?!(mongodb-memory-server)/)"],

  // Test timeout
  testTimeout: 10000,
};
