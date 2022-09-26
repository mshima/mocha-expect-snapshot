const {
  toMatchSnapshot,
  toMatchInlineSnapshot,
  toThrowErrorMatchingInlineSnapshot,
  toThrowErrorMatchingSnapshot,
} = require('jest-snapshot');
const { expect } = require('expect');

const hooks = require('./hooks.js');

expect.extend({
  // https://github.com/facebook/jest/blob/e0b33b74b5afd738edc183858b5c34053cfc26dd/e2e/custom-inline-snapshot-matchers/__tests__/bail.test.js
  toMatchSnapshot(...args) {
    this.dontThrow = () => {};
    return toMatchSnapshot.call(this, ...args);
  },
  toMatchInlineSnapshot(...args) {
    this.dontThrow = () => {};
    return toMatchInlineSnapshot.call(this, ...args);
  },
  toThrowErrorMatchingInlineSnapshot,
  toThrowErrorMatchingSnapshot,
});

module.exports = hooks;
