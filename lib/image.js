const { expect } = require('expect');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({
  toMatchImageSnapshot(...args) {
    this.dontThrow = () => {};
    return toMatchImageSnapshot.call(this, ...args);
  },
});
