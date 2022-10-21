const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { expect: jestExpect } = require('expect');

const { mochaHooks } = require('./hooks.js');
const {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
} = require('./jest-snapshot-config.js');

jestExpect.extend({
  toMatchImageSnapshot(...args) {
    this.dontThrow = () => {};
    return toMatchImageSnapshot.call(this, ...args);
  },
});

module.exports = {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
  mochaHooks,
  jestExpect,
};
