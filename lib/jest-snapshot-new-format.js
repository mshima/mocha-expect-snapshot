/**
 * When using old-format, you can migrate to new format each test file.
 */
const { snapshotFormatOption, prettierOption } = require('./jest-snapshot-options.js');
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

// force jest@29 format
setSnapshotStateOptions({
  ...prettierOption,
  ...snapshotFormatOption,
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
