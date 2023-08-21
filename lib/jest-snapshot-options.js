const loadPrettier = (specifier) => {
  let prettierPath;
  try {
    const { name, version } = require(`${specifier}/package.json`);
    if (name === 'prettier' && version.startsWith('2')) {
      prettierPath = require.resolve(specifier);
    }
  } catch (_error) {}
};

const prettierPath = loadPrettier('prettier') || loadPrettier('prettier2') || loadPrettier('prettier-2');

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
