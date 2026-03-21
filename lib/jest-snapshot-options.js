/** @typedef {import('@vitest/snapshot').SnapshotStateOptions} SnapshotStateOptions */
/** @type {SnapshotStateOptions} */
const prettierOption = {};

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
