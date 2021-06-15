const { toMatchSnapshot, buildSnapshotResolver, SnapshotState } = require('jest-snapshot');
const expect = require('expect');

let snapshotState;
const snapshotStateOptions = {
  updateSnapshot: process.argv.includes('--updateSnapshot') ? 'all' : undefined,
};
const snapshotResolverOptions = {
  rootDir: 'test',
  snapshotResolver: undefined,
};

function teardown() {
  if (snapshotState) {
    snapshotState.save();
  }
  snapshotState = undefined;
}

async function buildState(currentTest, context = {}) {
  const snapshotResolver = await buildSnapshotResolver({
    transform: [],
    ...snapshotResolverOptions,
    ...context.snapshotResolverOptions,
  });
  const snapshotFile = snapshotResolver.resolveSnapshotPath(currentTest.file);
  return new SnapshotState(snapshotFile, { ...snapshotStateOptions, ...context.snapshotStateOptions });
}

async function createToMatchSnapshot(context) {
  const { currentTest } = context;
  if (!snapshotState) {
    snapshotState = await buildState(currentTest, context);
  }
  return (received, name) => {
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

async function setup(context = this) {
  if (context.currentTest) {
    expect.extend({
      toMatchSnapshot: await createToMatchSnapshot(context),
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
