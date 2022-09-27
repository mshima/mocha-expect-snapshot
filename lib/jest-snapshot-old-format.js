const jestSnapshot = require('./jest-snapshot.js');

jestSnapshot.setSnapshotStateOptions({
  prettierPath: undefined,
  snapshotFormat: undefined,
});

module.exports = jestSnapshot;
