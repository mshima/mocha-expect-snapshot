const picocolors = require('picocolors');
const { expect } = require('expect');
const { addSerializer, buildSnapshotResolver, SnapshotState } = require('jest-snapshot');

const { setSnapshotResolver, getSnapshotResolver, getSnapshotResolverOptions, getSnapshotStateOptions } = require('./jest-snapshot-config');

expect.addSnapshotSerializer = addSerializer;

const { setState } = expect;

/** @type {(import('@jest/types').Config.ProjectConfig) => Promise<import('jest-snapshot').SnapshotResolver>;} */
const buildCustomSnapshotResolver = () => {
  return buildSnapshotResolver({
    transform: [],
    ...getSnapshotResolverOptions(),
  });
};

function getTestStack(test) {
  const stack = [test];
  do {
    test = test.parent;
    stack.unshift(test);
  } while (test.parent);
  return stack;
}

const setupSuite = (suite) => {
  const context = suite.ctx;
  context.afterSnapshotSave = [];
  context.addAfterSnapshotSave = (callback) => {
    context.afterSnapshotSave.push(callback);
  };
  Object.defineProperty(context, 'snapshotState', {
    get: function () {
      if (!context._snapshotState) {
        context.snapshotFile = context.snapshotFile || getSnapshotResolver().resolveSnapshotPath(suite.file);
        const { snapshotFile, snapshotStateOptions: contextSnapshotStateOptions } = context;
        context._snapshotState = new SnapshotState(snapshotFile, { ...getSnapshotStateOptions(), ...contextSnapshotStateOptions });
      }
      return context._snapshotState;
    },
  });
};

/**
 * @type SnapshotSummary
 * @property {string} title
 * @property {number} added
 * @property {number} updated
 * @property {number} removed
 * @property {Object} saveState
 */

/**
 * @param {import('jest-snapshot').SnapshotStateType}
 * @return {SnapshotSummary}
 */
const saveSuite = async (suite) => {
  const { ctx: context, title } = suite;
  const { snapshotState, afterSnapshotSave } = context;
  const uncheckedBefore = snapshotState.getUncheckedCount();

  const getAllSuites = (suites) => suites.map((suite) => [suite, ...getAllSuites(suite.suites)]).flat();
  const allTests = [
    ...suite.tests,
    ...getAllSuites(suite.suites)
      .map((suite) => suite.tests)
      .flat(),
  ];
  const allStates = allTests.map((test) => test.state);
  if (!allStates.includes('failed')) {
    snapshotState.removeUncheckedKeys();
  }
  const saveState = snapshotState.save();

  const summary = {
    title,
    added: snapshotState.added,
    updated: snapshotState.updated,
    removed: uncheckedBefore - snapshotState.getUncheckedCount(),
    saveState,
  };
  for (callback of afterSnapshotSave) {
    await callback.call(snapshotState, summary);
  }
  return summary;
};

/**
 * @param {SnapshotSummary[]} summaries
 */
function printSummary(summaries) {
  const removed = summaries.map((summary) => summary.removed).reduce((a, b) => a + b, 0);
  const added = summaries.map((summary) => summary.added).reduce((a, b) => a + b, 0);
  const updated = summaries.map((summary) => summary.updated).reduce((a, b) => a + b, 0);
  // const matched = snapshotHolders.map((snapshotHolder) => snapshotHolder.snapshotState.matched).reduce((a, b) => a + b, 0);
  // const unmatched = snapshotHolders.map((snapshotHolder) => snapshotHolder.snapshotState.unmatched).reduce((a, b) => a + b, 0);

  const summary = [];
  if (added > 0) {
    summary.push(`${picocolors.green(`  > ${added} snapshot written`)} from ${summaries.length} test suite`);
  }
  if (updated > 0) {
    summary.push(`${picocolors.green(`  > ${updated} snapshot updated`)} from ${summaries.length} test suite`);
  }
  if (removed > 0) {
    summary.push(`${picocolors.green(`  > ${removed} snapshot removed`)} from ${summaries.length} test suite`);
  }

  if (summary.length > 0) {
    /* istanbul ignore next, depends on mocha parallel mode */
    if (summaries.length === 1) {
      summary.unshift(`  ${summaries[0].title} snapshot summary`);
    } else {
      summary.unshift(`  Suite snapshot summary`);
    }
    console.log(summary.join('\n'));
  }
}

/** @type {import('mocha').RootHookObject} */
const mochaHooks = {
  async beforeAll() {
    // Create snapshotState at context of every test.
    const rootTest = getTestStack(this.test)[0];
    getSnapshotResolver() || setSnapshotResolver(await buildCustomSnapshotResolver());
    rootTest.suites.forEach((suite) => setupSuite(suite));
  },

  async beforeEach() {
    const { currentTest } = this;
    const {
      file: testPath,
      ctx: { snapshotState },
    } = currentTest;

    setState({
      snapshotState,
      testPath,
      currentTestName: getTestStack(currentTest)
        .map((test) => test.title)
        .filter(Boolean)
        .join(' '),
    });
  },

  afterEach() {
    setState({
      snapshotState: undefined,
      testPath: undefined,
      currentTestName: undefined,
    });
  },

  async afterAll() {
    const rootTest = getTestStack(this.test)[0];
    const snapshotsSummaries = await Promise.all(rootTest.suites.map((suite) => saveSuite(suite)));
    printSummary(snapshotsSummaries);
  },
};

module.exports = {
  mochaHooks,
};
