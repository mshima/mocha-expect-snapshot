const { existsSync, readFileSync } = require('fs');
const path = require('path');
const picocolors = require('picocolors');
const { expect } = require('expect');

const { getSnapshotResolver, getSnapshotStateOptions } = require('./jest-snapshot-config');

const libDir = path.resolve(__dirname);

// Lazily loaded @vitest/snapshot (ESM-only module)
let vitestSnapshot;
let vitestSnapshotEnvironment;

const loadVitestSnapshot = async () => {
  if (!vitestSnapshot) {
    [vitestSnapshot, vitestSnapshotEnvironment] = await Promise.all([import('@vitest/snapshot'), import('@vitest/snapshot/environment')]);
  }
  return { vitestSnapshot, vitestSnapshotEnvironment };
};

// Queue serializers added before the module is loaded
const pendingSerializers = [];
expect.addSnapshotSerializer = (serializer) => {
  if (vitestSnapshot) {
    vitestSnapshot.addSerializer(serializer);
  } else {
    pendingSerializers.push(serializer);
  }
};

const { setState } = expect;

/**
 * Resolve the snapshot path for a test file.
 * Respects a custom resolver set via setSnapshotResolver().
 */
const resolveSnapshotPath = async (testFilePath) => {
  const resolver = getSnapshotResolver();
  if (resolver && typeof resolver.resolveSnapshotPath === 'function') {
    return resolver.resolveSnapshotPath(testFilePath);
  }
  const { NodeSnapshotEnvironment } = vitestSnapshotEnvironment;
  const env = new NodeSnapshotEnvironment();
  return env.resolvePath(testFilePath);
};

function getTestStack(test) {
  const stack = [test];
  do {
    test = test.parent;
    stack.unshift(test);
  } while (test.parent);
  return stack;
}

/**
 * Custom SnapshotState that correctly infers the inline snapshot call site when
 * matchers are invoked through jest's `expect` library inside mocha tests.
 *
 * @vitest/snapshot's default `_inferInlineSnapshotStack` looks for a frame whose
 * method name is exactly `toMatchInlineSnapshot` or
 * `toThrowErrorMatchingInlineSnapshot`.  When the matcher is registered via
 * `jestExpect.extend()`, V8 records it as `Object.toMatchInlineSnapshot`, and
 * the frame points to the library file rather than the test file.  We therefore
 * fall back to returning the first user-space frame: a frame that is neither
 * inside `node_modules` nor our own `lib/` directory.
 */
let MochaSnapshotState;
const buildMochaSnapshotState = () => {
  if (MochaSnapshotState) return;
  const { SnapshotState } = vitestSnapshot;
  MochaSnapshotState = class MochaSnapshotState extends SnapshotState {
    _inferInlineSnapshotStack(stacks) {
      // First try the original logic (handles __INLINE_SNAPSHOT_OFFSET__ etc.)
      const result = super._inferInlineSnapshotStack(stacks);
      if (result) return result;
      // Fallback: first frame outside node_modules and our lib/ directory.
      // Normalize paths to forward slashes for consistent cross-platform comparison.
      const normalizedLibDir = libDir.split(path.sep).join('/');
      return (
        stacks.find(
          (s) =>
            s.file &&
            !s.file.split(path.sep).join('/').includes('/node_modules/') &&
            !s.file.split(path.sep).join('/').startsWith(normalizedLibDir),
        ) ?? null
      );
    }
  };
};

const setupSuite = (suite, defaultSnapshotPath) => {
  const { NodeSnapshotEnvironment } = vitestSnapshotEnvironment;
  const context = suite.ctx;
  context.afterSnapshotSave = [];
  context.addAfterSnapshotSave = (callback) => {
    context.afterSnapshotSave.push(callback);
  };
  Object.defineProperty(context, 'snapshotState', {
    get: function () {
      if (!context._snapshotState) {
        const snapshotFile = context.snapshotFile || defaultSnapshotPath;
        context.snapshotFile = snapshotFile;
        const snapshotContent = existsSync(snapshotFile) ? readFileSync(snapshotFile, 'utf8') : null;
        const { snapshotStateOptions: contextSnapshotStateOptions } = context;
        context._snapshotState = new MochaSnapshotState(suite.file, snapshotFile, snapshotContent, {
          ...getSnapshotStateOptions(),
          ...contextSnapshotStateOptions,
          snapshotEnvironment: new NodeSnapshotEnvironment(),
        });
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
 * @param {import('@vitest/snapshot').SnapshotState} snapshotState
 * @return {Promise<SnapshotSummary>}
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
  const saveState = await snapshotState.save();

  const summary = {
    title,
    // @vitest/snapshot's `added` and `updated` are CounterMap objects with a
    // valueOf() that returns the total count; convert to plain numbers so that
    // callers can do strict equality checks (e.g. `expect(summary.added).toBe(3)`).
    added: Number(snapshotState.added),
    updated: Number(snapshotState.updated),
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
    // Load @vitest/snapshot (ESM) and apply any pending serializers
    await loadVitestSnapshot();
    for (const serializer of pendingSerializers) {
      vitestSnapshot.addSerializer(serializer);
    }
    pendingSerializers.length = 0;
    expect.addSnapshotSerializer = vitestSnapshot.addSerializer;

    // Build the custom SnapshotState subclass now that modules are loaded
    buildMochaSnapshotState();

    // Create snapshotState at context of every test suite.
    const rootTest = getTestStack(this.test)[0];
    await Promise.all(
      rootTest.suites.map(async (suite) => {
        const defaultSnapshotPath = await resolveSnapshotPath(suite.file);
        setupSuite(suite, defaultSnapshotPath);
      }),
    );
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
