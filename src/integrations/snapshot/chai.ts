// https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/integrations/snapshot/chai.ts
import type { ChaiPlugin } from '@vitest/expect';
import { equals, iterableEquality, subsetEquality } from '@vitest/expect';
import { SnapshotClient, addSerializer, stripSnapshotIndentation } from '@vitest/snapshot';
import type { Test } from 'mocha';
import { getTestName } from '../../utils.js';
// import { getNames } from '@vitest/runner/utils'
// import { recordAsyncExpect } from '../../../../expect/src/utils'

let _client: SnapshotClient;

export function getSnapshotClient(): SnapshotClient {
  if (!_client) {
    _client = new SnapshotClient({
      isEqual: (received, expected) => {
        return equals(received, expected, [iterableEquality, subsetEquality]);
      },
    });
  }
  return _client;
}

function getError(expected: () => void | Error, promise: string | undefined) {
  if (typeof expected !== 'function') {
    if (!promise) {
      throw new Error(`expected must be a function, received ${typeof expected}`);
    }

    // when "promised", it receives thrown error
    return expected;
  }

  try {
    expected();
  } catch (error) {
    return error;
  }

  throw new Error("snapshot function didn't throw");
}

function getTestNames(test?: Test) {
  if (!test?.file) {
    return {};
  }
  return {
    filepath: test.file,
    name: getTestName(test),
  };
}

export const SnapshotPlugin: ChaiPlugin = (chai, utils) => {
  for (const key of ['matchSnapshot', 'toMatchSnapshot']) {
    utils.addMethod(chai.Assertion.prototype, key, function (this: Record<string, unknown>, properties?: object, message?: string) {
      const isNot = utils.flag(this, 'negate');
      if (isNot) {
        throw new Error(`${key} cannot be used with "not"`);
      }
      const expected = utils.flag(this, 'object');
      const test = utils.flag(this, 'vitest-test');
      if (typeof properties === 'string' && message === undefined) {
        message = properties;
        properties = undefined;
      }
      const errorMessage = utils.flag(this, 'message');
      getSnapshotClient().assert({
        received: expected,
        message,
        isInline: false,
        properties,
        errorMessage,
        ...getTestNames(test),
      });
    });
  }

  utils.addMethod(
    chai.Assertion.prototype,
    'toMatchFileSnapshot',
    function (this: Record<string, unknown>, file: string, message?: string) {
      const isNot = utils.flag(this, 'negate');
      if (isNot) {
        throw new Error('toMatchFileSnapshot cannot be used with "not"');
      }
      const expected = utils.flag(this, 'object');
      const test = utils.flag(this, 'vitest-test') as Test;
      const errorMessage = utils.flag(this, 'message');

      const promise = getSnapshotClient().assertRaw({
        received: expected,
        message,
        isInline: false,
        rawSnapshot: {
          file,
        },
        errorMessage,
        ...getTestNames(test),
      });

      return promise;
    }
  );

  utils.addMethod(
    chai.Assertion.prototype,
    'toMatchInlineSnapshot',
    function __INLINE_SNAPSHOT__(this: Record<string, unknown>, properties?: object, inlineSnapshot?: string, message?: string) {
      const isNot = utils.flag(this, 'negate');
      if (isNot) {
        throw new Error('toMatchInlineSnapshot cannot be used with "not"');
      }
      const test = utils.flag(this, 'vitest-test');
      const isInsideEach = test && (test.each || test.suite?.each);
      if (isInsideEach) {
        throw new Error('InlineSnapshot cannot be used inside of test.each or describe.each');
      }
      const expected = utils.flag(this, 'object');
      const error = utils.flag(this, 'error');
      if (typeof properties === 'string') {
        message = inlineSnapshot;
        inlineSnapshot = properties;
        properties = undefined;
      }
      if (inlineSnapshot) {
        inlineSnapshot = stripSnapshotIndentation(inlineSnapshot);
      }
      const errorMessage = utils.flag(this, 'message');

      getSnapshotClient().assert({
        received: expected,
        message,
        isInline: true,
        properties,
        inlineSnapshot,
        error,
        errorMessage,
        ...getTestNames(test),
      });
    }
  );
  utils.addMethod(chai.Assertion.prototype, 'toThrowErrorMatchingSnapshot', function (this: Record<string, unknown>, message?: string) {
    const isNot = utils.flag(this, 'negate');
    if (isNot) {
      throw new Error('toThrowErrorMatchingSnapshot cannot be used with "not"');
    }
    const expected = utils.flag(this, 'object');
    const test = utils.flag(this, 'vitest-test');
    const promise = utils.flag(this, 'promise') as string | undefined;
    const errorMessage = utils.flag(this, 'message');
    getSnapshotClient().assert({
      received: getError(expected, promise),
      message,
      errorMessage,
      ...getTestNames(test),
    });
  });
  utils.addMethod(
    chai.Assertion.prototype,
    'toThrowErrorMatchingInlineSnapshot',
    function __INLINE_SNAPSHOT__(this: Record<string, unknown>, inlineSnapshot: string, message: string) {
      const isNot = utils.flag(this, 'negate');
      if (isNot) {
        throw new Error('toThrowErrorMatchingInlineSnapshot cannot be used with "not"');
      }
      const test = utils.flag(this, 'vitest-test');
      const isInsideEach = test && (test.each || test.suite?.each);
      if (isInsideEach) {
        throw new Error('InlineSnapshot cannot be used inside of test.each or describe.each');
      }
      const expected = utils.flag(this, 'object');
      const error = utils.flag(this, 'error');
      const promise = utils.flag(this, 'promise') as string | undefined;
      const errorMessage = utils.flag(this, 'message');

      if (inlineSnapshot) {
        inlineSnapshot = stripSnapshotIndentation(inlineSnapshot);
      }

      getSnapshotClient().assert({
        received: getError(expected, promise),
        message,
        inlineSnapshot,
        isInline: true,
        error,
        errorMessage,
        ...getTestNames(test),
      });
    }
  );
  utils.addMethod(chai.expect, 'addSnapshotSerializer', addSerializer);
};
