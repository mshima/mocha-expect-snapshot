const { toMatchSnapshot, buildSnapshotResolver, SnapshotState } = require('jest-snapshot');
const expect = require('expect');
const chalk = require('chalk');

const snapshotStateOptions = {
  updateSnapshot: (process.argv.includes('--updateSnapshot') ? 'new' : process.env['UPDATE_SNAPSHOT']) || 'none',
};

/**
 * Utility class to defer SnapshotState instantiation for custom `context.snapshotStateOptions`.
 */
class SnapshotHolder {
  constructor(title, context) {
    this.title = title;
    this.context = context;
    this.postSaveCallbacks = [];
  }

  async buildSnapshotResolver(testFile, snapshotResolverOptions = {}) {
    this.snapshotResolver = await buildSnapshotResolver({
      transform: [],
      ...snapshotResolverOptions,
    });
    this.snapshotFile = this.snapshotResolver.resolveSnapshotPath(testFile);
  }

  setSnapshotFile(snapshotFile) {
    this.snapshotFile = snapshotFile;
  }

  get snapshotState() {
    return this.buildStateIfNeeded();
  }

  buildStateIfNeeded() {
    if (!this.snapshotResolver || !this.snapshotFile) throw new Error('snapshotResolver or snapshotFile not found');
    if (this._snapshotState) return this._snapshotState;

    this._snapshotState = new SnapshotState(this.snapshotFile, {
      ...snapshotStateOptions,
      ...this.context.snapshotStateOptions,
    });
    return this._snapshotState;
  }

  addPostSave(postSaveCallback) {
    this.postSaveCallbacks.push(postSaveCallback);
  }

  async save() {
    if (!this._snapshotState) throw new Error('snapshotState is invalid');
    this._snapshotState.removeUncheckedKeys();
    const state = this._snapshotState.save();
    for (const postSaveCallback of this.postSaveCallbacks) {
      postSaveCallback.call(this);
    }
    return state;
  }

  createToMatchSnapshot(currentTestName) {
    return (received, name) => {
      return toMatchSnapshot.call(
        {
          snapshotState: this.snapshotState,
          currentTestName,
        },
        received,
        name || ''
      );
    };
  }
}

function getTestStack(test) {
  let current = test;
  const stack = [test];

  while (current.parent) {
    current = current.parent;
    stack.unshift(current);
  }

  return stack;
}

const mochaHooks = {
  async beforeAll() {
    const testStack = getTestStack(this.test);
    this.snapshotStates = await Promise.all(
      testStack[0].suites.map(async (suite) => {
        const snapshotState = new SnapshotHolder(suite.title, suite.ctx);
        await snapshotState.buildSnapshotResolver(suite.file);
        suite.ctx.snapshotState = snapshotState;
        return snapshotState;
      })
    );
  },

  async beforeEach() {
    const testStack = getTestStack(this.currentTest);
    const { snapshotState } = testStack[1].ctx;
    const { currentTest } = this;
    if (currentTest && snapshotState) {
      expect.extend({
        toMatchSnapshot: snapshotState.createToMatchSnapshot(
          testStack
            .map((test) => test.title)
            .filter(Boolean)
            .join(' ')
        ),
      });
    } else {
      expect.extend({
        toMatchSnapshot: () => {
          throw new Error("Current test or snapshot state doesn't exist");
        },
      });
    }
  },

  afterEach() {
    expect.extend({
      toMatchSnapshot: () => {
        throw new Error('Snapshot context dismissed');
      },
    });
  },

  async afterAll() {
    const unchecked = this.snapshotStates
      .map((snapshotState) => snapshotState.snapshotState.getUncheckedCount())
      .reduce((a, b) => a + b, 0);
    this.snapshotsSaveStatus = await Promise.all(this.snapshotStates.map((snapshotState) => snapshotState.save()));
    const added = this.snapshotStates.map((snapshotState) => snapshotState.snapshotState.added).reduce((a, b) => a + b, 0);
    const updated = this.snapshotStates.map((snapshotState) => snapshotState.snapshotState.updated).reduce((a, b) => a + b, 0);
    // const matched = this.snapshotStates.map((snapshotState) => snapshotState.snapshotState.matched).reduce((a, b) => a + b, 0);
    // const unmatched = this.snapshotStates.map((snapshotState) => snapshotState.snapshotState.unmatched).reduce((a, b) => a + b, 0);

    const summary = [];
    if (added > 0) {
      summary.push(`${chalk.green(`  > ${added} snapshot written`)} from ${this.snapshotStates.length} test suite`);
    }
    if (updated > 0) {
      summary.push(`${chalk.green(`  > ${updated} snapshot updated`)} from ${this.snapshotStates.length} test suite`);
    }
    if (unchecked > 0) {
      summary.push(`${chalk.green(`  > ${unchecked} snapshot removed`)} from ${this.snapshotStates.length} test suite`);
    }

    if (summary.length > 0) {
      setTimeout(() => {
        if (this.snapshotStates.length === 1) {
          summary.unshift(`  ${this.snapshotStates[0].title}`);
        }
        console.log(summary.join('\n') + '\n');
      });
    }
  },
};

module.exports = {
  snapshotStateOptions,
  mochaHooks,
};
