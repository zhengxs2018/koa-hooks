const pkg = require('./package.json')

module.exports = {
  name: pkg.name,
  preset: 'ts-jest',
  rootDir: __dirname,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  collectCoverageFrom: ['src/**/*.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json']
}
