const { expect: jestExpect } = require('expect');

const { mochaHooks } = require('./hooks.js');
const {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
} = require('./jest-snapshot-config');

/**
 * stripSnapshotIndentation - removes consistent leading indentation from
 * multi-line inline snapshot strings (mirrors @vitest/snapshot behaviour).
 */
function stripSnapshotIndentation(inlineSnapshot) {
  const match = inlineSnapshot.match(/^([^\S\n]*)\S/m);
  if (!match || !match[1]) {
    return inlineSnapshot;
  }
  const indentation = match[1];
  const lines = inlineSnapshot.split(/\n/g);
  if (lines.length <= 2) {
    return inlineSnapshot;
  }
  if (lines[0].trim() !== '' || lines[lines.length - 1].trim() !== '') {
    return inlineSnapshot;
  }
  for (let i = 1; i < lines.length - 1; i++) {
    if (lines[i] !== '') {
      if (lines[i].indexOf(indentation) !== 0) {
        return inlineSnapshot;
      }
      lines[i] = lines[i].substring(indentation.length);
    }
  }
  lines[lines.length - 1] = '';
  return lines.join('\n');
}

/** Build a simple snapshot mismatch message */
const snapshotMismatchMessage = (key, expected, actual) => `Snapshot name: "${key}"\n\nExpected:\n${expected}\n\nReceived:\n${actual}`;

/** Build message for a snapshot that hasn't been written yet */
const noSnapshotWrittenMessage = (key, actual) =>
  `Snapshot name: "${key}"\n\nNew snapshot was not written. The update flag must be explicitly passed to write a new snapshot.\n\nReceived:${actual.includes('\n') ? '\n' : ' '}${actual}`;

jestExpect.extend({
  // https://github.com/facebook/jest/blob/e0b33b74b5afd738edc183858b5c34053cfc26dd/e2e/custom-inline-snapshot-matchers/__tests__/bail.test.js
  toMatchSnapshot: function toMatchSnapshot(received, propertiesOrHint, hint) {
    this.dontThrow = () => {};
    const { snapshotState, currentTestName } = this;

    let hintString;
    let properties;
    if (typeof propertiesOrHint === 'string') {
      hintString = propertiesOrHint;
    } else if (propertiesOrHint != null) {
      properties = propertiesOrHint;
      hintString = hint;
    }

    const testName = currentTestName && hintString ? `${currentTestName}: ${hintString}` : currentTestName || '';

    if (properties != null) {
      const propertyPass = this.equals(received, properties, [this.utils.iterableEquality, this.utils.subsetEquality]);
      if (!propertyPass) {
        return {
          pass: false,
          message: () => `Snapshot properties mismatched`,
        };
      }
      received = Object.assign({}, received, properties);
    }

    const { actual, expected, key, pass } = snapshotState.match({
      testId: testName,
      testName,
      received,
      isInline: false,
    });

    if (pass) {
      return { pass: true, message: () => '' };
    }
    if (expected === undefined) {
      return { pass: false, message: () => noSnapshotWrittenMessage(key, actual) };
    }
    return { pass: false, message: () => snapshotMismatchMessage(key, expected, actual) };
  },

  toMatchInlineSnapshot: function toMatchInlineSnapshot(received, propertiesOrSnapshot, inlineSnapshot) {
    this.dontThrow = () => {};
    const { snapshotState, currentTestName } = this;

    let snapshotString;
    let properties;
    if (typeof propertiesOrSnapshot === 'string') {
      snapshotString = propertiesOrSnapshot;
    } else if (propertiesOrSnapshot != null) {
      properties = propertiesOrSnapshot;
      snapshotString = inlineSnapshot;
    }

    if (properties != null) {
      const propertyPass = this.equals(received, properties, [this.utils.iterableEquality, this.utils.subsetEquality]);
      if (!propertyPass) {
        return {
          pass: false,
          message: () => `Snapshot properties mismatched`,
        };
      }
      received = Object.assign({}, received, properties);
    }

    const normalizedSnapshot = snapshotString != null ? stripSnapshotIndentation(snapshotString) : undefined;

    const { actual, expected, key, pass } = snapshotState.match({
      testId: currentTestName,
      testName: currentTestName,
      received,
      isInline: true,
      inlineSnapshot: normalizedSnapshot,
      error: new Error('snapshot'),
    });

    if (pass) {
      return { pass: true, message: () => '' };
    }
    if (expected === undefined) {
      return { pass: false, message: () => noSnapshotWrittenMessage(key, actual) };
    }
    return { pass: false, message: () => snapshotMismatchMessage(key, expected, actual) };
  },

  toThrowErrorMatchingSnapshot: function toThrowErrorMatchingSnapshot(received, hint) {
    let error;
    try {
      received();
    } catch (e) {
      error = e;
    }

    if (!error) {
      return { pass: false, message: () => 'Expected function to throw an error' };
    }

    const { snapshotState, currentTestName } = this;
    const testName = currentTestName && hint ? `${currentTestName}: ${hint}` : currentTestName || '';

    const { actual, expected, key, pass } = snapshotState.match({
      testId: testName,
      testName,
      received: error.message,
      isInline: false,
    });

    if (pass) {
      return { pass: true, message: () => '' };
    }
    if (expected === undefined) {
      return { pass: false, message: () => noSnapshotWrittenMessage(key, actual) };
    }
    return { pass: false, message: () => snapshotMismatchMessage(key, expected, actual) };
  },

  toThrowErrorMatchingInlineSnapshot: function toThrowErrorMatchingInlineSnapshot(received, inlineSnapshot) {
    let error;
    try {
      received();
    } catch (e) {
      error = e;
    }

    if (!error) {
      return { pass: false, message: () => 'Expected function to throw an error' };
    }

    const { snapshotState, currentTestName } = this;
    const normalizedSnapshot = inlineSnapshot != null ? stripSnapshotIndentation(inlineSnapshot) : undefined;

    const { actual, expected, key, pass } = snapshotState.match({
      testId: currentTestName,
      testName: currentTestName,
      received: error.message,
      isInline: true,
      inlineSnapshot: normalizedSnapshot,
      error: new Error('snapshot'),
    });

    if (pass) {
      return { pass: true, message: () => '' };
    }
    if (expected === undefined) {
      return { pass: false, message: () => noSnapshotWrittenMessage(key, actual) };
    }
    return { pass: false, message: () => snapshotMismatchMessage(key, expected, actual) };
  },
});

module.exports = {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
  mochaHooks,
  jestExpect,
};
