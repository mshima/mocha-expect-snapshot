import { NodeSnapshotEnvironment } from '@vitest/snapshot/environment';
import { Test } from 'mocha';

let currentTest: Test;

class CustomNodeSnapshotEnvironment extends NodeSnapshotEnvironment {
  getHeader(): string {
    return `// mocha-expect-snapshot snapshot v${this.getVersion()}`;
  }
}

export const getCurrentEnvironment = (options?: any) =>
  new CustomNodeSnapshotEnvironment({
    snapshotsDirName: '__snapshots__',
    ...options,
  });

export const getCurrentTest = () => currentTest;
