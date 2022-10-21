const { prettierOption, updateSnapshotOption, snapshotFormatOption } = require('./jest-snapshot-options');

/** @type {import('jest-snapshot').SnapshotResolver} */
let defaultSnapshotResolver;

const getSnapshotResolver = () => {
  return defaultSnapshotResolver;
};

/** @type {(snapshotResolver: import('jest-snapshot').SnapshotResolver) => void} */
const setSnapshotResolver = (snapshotResolver) => {
  defaultSnapshotResolver = snapshotResolver;
};

/** @type {import('@jest/types').Config.ProjectConfig} */
const defaultSnapshotResolverOptions = {};

/** @type {(snapshotResolverOptions: import('@jest/types').Config.ProjectConfig) => void} */
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

/** @type {(snapshotStateOptions: SnapshotStateOptions) => void} */
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
