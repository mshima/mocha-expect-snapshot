import { Context, RootHookObject } from 'mocha';
import { getSnapshotClient } from './integrations/snapshot/chai.js';
import { getCurrentEnvironment } from './integrations/test-state.js';
import { getTestName, getUpdateSnapshotStatus, printSummary } from './utils.js';
import { SnapshotManager } from '@vitest/snapshot/manager';
import { SnapshotClient } from '@vitest/snapshot';
import { setSuiteState } from './integrations/chai/index.js';

declare module 'mocha' {
  interface Context {
    snapshotClient?: SnapshotClient;
    summary?: SnapshotManager['summary'];
  }
}
const snapshotOptions = {};

export const mochaHooks: RootHookObject = {
  async beforeAll(this: Context) {
    this.snapshotClient = getSnapshotClient();
    this.snapshotOptions = snapshotOptions;
  },
  async beforeEach(this: Context) {
    /*
    chai.use((chai, utils) => {
        utils.flag(chai, 'vitest-test', this.currentTest)
    });
    */

    const test = this.currentTest;
    if (test) {
      const testName = getTestName(test);
      setSuiteState({ testPath: test.file!, currentTestName: testName });
      await this.snapshotClient?.startCurrentRun(test.file!, testName, {
        snapshotEnvironment: getCurrentEnvironment(),
        updateSnapshot: getUpdateSnapshotStatus(),
        ...snapshotOptions,
      });
    }
  },
  async afterAll(this: Context) {
    if (this.snapshotClient) {
      await this.snapshotClient?.finishCurrentRun();
      const snapshotManager = new SnapshotManager({ updateSnapshot: getUpdateSnapshotStatus() });
      for (const [_key, state] of this.snapshotClient.snapshotStateMap.entries()) {
        snapshotManager.add(await state.pack());
      }
      this.summary = snapshotManager.summary;
      if (this.summary.didUpdate) {
        printSummary(this.summary, this.test?.parent?.title);
      }
      this.snapshotClient.clear();
      snapshotManager.clear();
    }
  },
};
