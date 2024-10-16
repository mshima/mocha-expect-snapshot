import type { Plugin as PrettyFormatPlugin } from '@vitest/pretty-format';
import type { SnapshotState } from '@vitest/snapshot';
import type { PromisifyAssertion, Tester } from '@vitest/expect';

interface SnapshotMatcher<T> {
  <U extends { [P in keyof T]: any }>(snapshot: Partial<U>, message?: string): void;
  (message?: string): void;
}

interface InlineSnapshotMatcher<T> {
  <U extends { [P in keyof T]: any }>(properties: Partial<U>, snapshot?: string, message?: string): void;
  (message?: string): void;
}

declare module '@vitest/expect' {
  interface MatcherState {
    snapshotState: SnapshotState;
  }

  interface ExpectPollOptions {
    interval?: number;
    timeout?: number;
    message?: string;
  }

  interface ExpectStatic {
    unreachable: (message?: string) => never;
    soft: <T>(actual: T, message?: string) => Assertion<T>;
    poll: <T>(actual: () => T, options?: ExpectPollOptions) => PromisifyAssertion<Awaited<T>>;
    addEqualityTesters: (testers: Array<Tester>) => void;
    assertions: (expected: number) => void;
    hasAssertions: () => void;
    addSnapshotSerializer: (plugin: PrettyFormatPlugin) => void;
  }

  interface Assertion<T> {
    // Snapshots are extended in @vitest/snapshot and are not part of @vitest/expect
    matchSnapshot: SnapshotMatcher<T>;
    toMatchSnapshot: SnapshotMatcher<T>;
    toMatchInlineSnapshot: InlineSnapshotMatcher<T>;
    toThrowErrorMatchingSnapshot: (message?: string) => void;
    toThrowErrorMatchingInlineSnapshot: (snapshot?: string, message?: string) => void;
    toMatchFileSnapshot: (filepath: string, message?: string) => Promise<void>;
  }
}
