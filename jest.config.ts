/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  bail: true,
  clearMocks: true,
  coverageProvider: 'v8',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {}],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'], // adicionar
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
