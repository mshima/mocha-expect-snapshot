const jestSnapshot = require('./jest-snapshot.js');

jestSnapshot.setSnapshotStateOptions({
  snapshotFormat: null,
});

module.exports = jestSnapshot;
