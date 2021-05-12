const { toMatchSnapshot, buildSnapshotResolver, SnapshotState } = require('jest-snapshot');
const expect = require('expect');

let snapshotState;
let snapshotStateOptions = {
  updateSnapshot: process.argv.includes('--update-snapshot') ? 'all' : undefined,
};
let snapshotResolverOptions = {
  rootDir: 'test',
};

function clearState() {
  snapshotState = undefined;
}

function setOptions(stateOptions = {}, resolverOptions = {}) {
  snapshotStateOptions = { ...snapshotStateOptions, ...stateOptions };
  snapshotResolverOptions = { ...snapshotResolverOptions, ...resolverOptions };
}

function buildState(currentTest) {
  const snapshotResolver = buildSnapshotResolver(snapshotResolverOptions);
  const snapshotFile = snapshotResolver.resolveSnapshotPath(currentTest.file);
  return new SnapshotState(snapshotFile, snapshotStateOptions);
}

function createToMatchSnapshot(currentTest) {
  return (received, name) => {
    if (!snapshotState) {
      snapshotState = buildState(currentTest);
    }

    const result = toMatchSnapshot.call(
      {
        snapshotState: snapshotState,
        currentTestName: makeTestTitle(currentTest),
      },
      received,
      name || ''
    );

    snapshotState.save();

    return result;
  };
}

function makeTestTitle(test) {
  let next = test;
  const title = [];

  for (;;) {
    if (!next.parent) {
      break;
    }

    title.push(next.title);
    next = next.parent;
  }

  return title.reverse().join(' ');
}

const mochaHooks = {
  beforeEach() {
    if (this.currentTest) {
      expect.extend({
        toMatchSnapshot: createToMatchSnapshot(this.currentTest),
      });
    } else {
      expect.extend({
        toMatchSnapshot: () => {
          throw new Error("Current test doesn't exist");
        },
      });
    }
  },
  afterEach: clearState,
};

module.exports = {
  setOptions,
  mochaHooks,
};
