import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@app$": "<rootDir>/src/app.ts",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default config;