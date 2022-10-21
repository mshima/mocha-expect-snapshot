let prettierPath;
try {
  prettierPath = require.resolve('prettier');
} catch (_error) {}

/** @typedef {ConstructorParameters<typeof import('jest-snapshot').SnapshotState>[1]} SnapshotStateOptions */
/** @type {SnapshotStateOptions} */
const prettierOption = {
  prettierPath,
};

/** @type {SnapshotStateOptions} */
const snapshotFormatOption = {
  get snapshotFormat() {
    return {
      escapeString: false,
      printBasicPrototype: false,
    };
  },
};

/** @type {SnapshotStateOptions} */
const updateSnapshotOption = {
  updateSnapshot:
    process.argv.includes('--updateSnapshot') || process.argv.includes('--update-snapshot')
      ? 'all'
      : process.env['UPDATE_SNAPSHOT'] || 'none',
};

module.exports = {
  prettierOption,
  updateSnapshotOption,
  snapshotFormatOption,
};
