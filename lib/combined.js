const {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
  mochaHooks,
  jestExpect,
} = require('./jest-snapshot.js');

require('./jest-image-snapshot.js');

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
