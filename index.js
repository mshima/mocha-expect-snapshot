const { toMatchSnapshot, buildSnapshotResolver, SnapshotState } = require('jest-snapshot');
const expect = require('expect');

let snapshotState;
const snapshotStateOptions = {
  updateSnapshot: process.argv.includes('--updateSnapshot') ? 'all' : undefined,
};
const snapshotResolverOptions = {
  rootDir: 'test',
};

function teardown() {
  if (snapshotState) {
    snapshotState.save();
  }
  snapshotState = undefined;
}

function buildState(currentTest, context = {}) {
  const snapshotResolver = buildSnapshotResolver({ ...snapshotResolverOptions, ...context.snapshotResolverOptions });
  const snapshotFile = snapshotResolver.resolveSnapshotPath(currentTest.file);
  return new SnapshotState(snapshotFile, { ...snapshotStateOptions, ...context.snapshotStateOptions });
}

function createToMatchSnapshot(context) {
  const { currentTest } = context;
  return (received, name) => {
    if (!snapshotState) {
      snapshotState = buildState(currentTest, context);
    }

    return toMatchSnapshot.call(
      {
        snapshotState,
        currentTestName: makeTestTitle(currentTest),
      },
      received,
      name || ''
    );
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

function setup(context = this) {
  if (context.currentTest) {
    expect.extend({
      toMatchSnapshot: createToMatchSnapshot(context),
    });
  } else {
    expect.extend({
      toMatchSnapshot: () => {
        throw new Error("Current test doesn't exist");
      },
    });
  }
}

const mochaHooks = {
  beforeEach: setup,
  afterEach: teardown,
};

module.exports = {
  setup,
  teardown,
  mochaHooks,
};
