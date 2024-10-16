import { expect } from '../dist/index.js';
import crypto from 'crypto';
import { rmSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { getCurrentEnvironment } from '../dist/integrations/test-state.js';

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('creating test', function () {
  const tempSnapshotFolder = `__snapshots_${crypto.randomBytes(4).readUInt32LE(0)}__`;
  const tempSnapshotFile = resolve('test', tempSnapshotFolder, 'creating.js.snap');
  const snapshotFile = resolve('test', '__snapshots__', 'creating.js.snap');

  before(function () {
    if (!updateTestSnapshot) {
      this.snapshotOptions.updateSnapshot = 'all';
      this.snapshotOptions.snapshotEnvironment = getCurrentEnvironment({ snapshotsDirName: tempSnapshotFolder });
    }
  });
  after(function () {
    delete this.snapshotOptions.updateSnapshot;
    delete this.snapshotOptions.snapshotEnvironment;
    if (!updateTestSnapshot) {
      this.postTests.push(() => {
        const actual = readFileSync(tempSnapshotFile).toString();
        rmSync(resolve('test', tempSnapshotFolder), { recursive: true });
        expect(actual).toBe(readFileSync(snapshotFile).toString());
      });
    }
  });

  describe('toMachSnapshot()', function () {
    it('should match one snapshot', async function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
      if (!updateTestSnapshot) {
        expect(await this.snapshotClient.snapshotState.pack()).toMatchObject(
          expect.objectContaining({
            added: 1,
            matched: 0,
            unchecked: 0,
          })
        );
      }
    });

    it('should match two snapshots', async function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
      expect({ foo2: 'bar' }).toMatchSnapshot();
      if (!updateTestSnapshot) {
        expect(await this.snapshotClient.snapshotState.pack()).toMatchObject(
          expect.objectContaining({
            added: 3,
            matched: 0,
            unchecked: 0,
          })
        );
      }
    });
  });
});
