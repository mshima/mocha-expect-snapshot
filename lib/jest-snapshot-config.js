const { prettierOption, updateSnapshotOption, snapshotFormatOption } = require('./jest-snapshot-options');

/** @type {object | undefined} */
let defaultSnapshotResolver;

const getSnapshotResolver = () => {
  return defaultSnapshotResolver;
};

/** @type {(snapshotResolver: object) => void} */
const setSnapshotResolver = (snapshotResolver) => {
  defaultSnapshotResolver = snapshotResolver;
};

/** @type {object} */
const defaultSnapshotResolverOptions = {};

/** @type {(snapshotResolverOptions: object) => void} */
const setSnapshotResolverOptions = (snapshotResolverOptions) => {
  Object.assign(defaultSnapshotResolverOptions, snapshotResolverOptions);
};

const getSnapshotResolverOptions = () => {
  return defaultSnapshotResolverOptions;
};

const defaultSnapshotStateOptions = {
  ...prettierOption,
  ...updateSnapshotOption,
  ...snapshotFormatOption,
};

/** @type {(snapshotStateOptions: import('@vitest/snapshot').SnapshotStateOptions) => void} */
const setSnapshotStateOptions = (snapshotStateOptions) => {
  Object.assign(defaultSnapshotStateOptions, snapshotStateOptions);
};

const getSnapshotStateOptions = () => {
  return defaultSnapshotStateOptions;
};

module.exports = {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
};
