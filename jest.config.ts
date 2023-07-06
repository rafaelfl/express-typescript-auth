import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  verbose: true,
  moduleFileExtensions: ["js", "json", "jsx", "node", "ts", "tsx"],
  moduleDirectories: ["node_modules", "src"],
  rootDir: "./",
  testRegex: "(/src/.*/?__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)?$",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        babel: true,
        tsconfig: "tsconfig.json",
        diagnostics: false,
      },
    ],
  },
  automock: false,
  resetMocks: false,
  testEnvironment: "node",
  transformIgnorePatterns: ["./node_modules/"],
  setupFilesAfterEnv: ["./jest.setup.ts"],
  setupFiles: ["dotenv/config"],
  roots: ["<rootDir>"],
  collectCoverage: false,
  collectCoverageFrom: ["src/**/*.{js{,x},ts{,x}}"],
  coverageReporters: ["text", "lcov"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

export default config;
