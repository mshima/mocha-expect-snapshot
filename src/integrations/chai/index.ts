// https://raw.githubusercontent.com/vitest-dev/vitest/main/packages/vitest/src/integrations/chai/index.ts
import * as chai from 'chai';
import './setup.js';
import { ASYMMETRIC_MATCHERS_OBJECT, GLOBAL_EXPECT, addCustomEqualityTesters, getState, setState } from '@vitest/expect';
import type { Assertion, ExpectStatic, MatcherState } from '@vitest/expect';

export function createExpect() {
  const expect = ((value: any, message?: string): Assertion => {
    const { assertionCalls } = getState(expect);
    setState({ assertionCalls: assertionCalls + 1 }, expect);
    return chai.expect(value, message) as unknown as Assertion;
  }) as ExpectStatic;
  Object.assign(expect, chai.expect);
  Object.assign(expect, (globalThis as any)[ASYMMETRIC_MATCHERS_OBJECT]);

  expect.getState = () => getState<MatcherState>(expect);
  expect.setState = (state) => setState(state as Partial<MatcherState>, expect);

  // @ts-expect-error untyped
  expect.extend = (matchers) => chai.expect.extend(expect, matchers);
  expect.addEqualityTesters = (customTesters) => addCustomEqualityTesters(customTesters);

  expect.soft = (...arguments_) => {
    // @ts-expect-error private soft access
    return expect(...arguments_).withContext({ soft: true }) as Assertion;
  };

  expect.unreachable = (message?: string) => {
    chai.assert.fail(`expected${message ? ` "${message}" ` : ' '}not to be reached`);
  };

  function assertions(expected: number) {
    const errorGen = () => new Error(`expected number of assertions to be ${expected}, but got ${expect.getState().assertionCalls}`);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(errorGen(), assertions);
    }

    expect.setState({
      expectedAssertionsNumber: expected,
      expectedAssertionsNumberErrorGen: errorGen,
    });
  }

  function hasAssertions() {
    const error = new Error('expected any number of assertion, but got none');
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, hasAssertions);
    }

    expect.setState({
      isExpectingAssertions: true,
      isExpectingAssertionsError: error,
    });
  }

  chai.util.addMethod(expect, 'assertions', assertions);
  chai.util.addMethod(expect, 'hasAssertions', hasAssertions);

  return expect;
}

const globalExpect = createExpect();

Object.defineProperty(globalThis, GLOBAL_EXPECT, {
  value: globalExpect,
  writable: true,
  configurable: true,
});

export function setSuiteState({ testPath, currentTestName }: { testPath: string; currentTestName: string }) {
  const globalState = getState((globalThis as any)[GLOBAL_EXPECT]) || {};

  setState<MatcherState>(
    {
      // this should also add "snapshotState" that is added conditionally
      ...globalState,
      assertionCalls: 0,
      isExpectingAssertions: false,
      isExpectingAssertionsError: null,
      expectedAssertionsNumber: null,
      expectedAssertionsNumberErrorGen: null,
      testPath,
      currentTestName,
      // dontThrow() {},
    },
    globalExpect
  );
}

export { assert, should } from 'chai';
export { globalExpect as expect };
