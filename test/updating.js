import crypto from 'crypto';
import { expect } from '../dist/index.js';
import { rmSync, readFileSync, copyFileSync, mkdirSync, cpSync } from 'fs';
import { resolve } from 'path';
import { after } from 'mocha';
import { getCurrentEnvironment } from '../dist/integrations/test-state.js';

const createExpectedSnapshot = process.env.UPDATE_EXPECTED_SNAPSHOT === 'true';
const createTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';
const mode = createTestSnapshot ? 'createTestSnapshot' : createExpectedSnapshot ? 'createExpectedSnapshot' : 'test';

describe('updating test', function () {
  const expectedSnapshotFile = resolve('test', '__snapshots__', 'updating.updated.js.snap');
  const outdatedSnapshotFile = resolve('test', '__snapshots__', 'updating.outdated.js.snap');
  const tempSnapshotFile = resolve('test', '__snapshots__', 'updating.js.snap' + +crypto.randomBytes(4).readUInt32LE(0));

  before(function () {
    this.snapshotOptions.updateSnapshot = 'all';
    this.snapshotOptions.snapshotEnvironment = getCurrentEnvironment();
    if (mode === 'createTestSnapshot') {
      this.snapshotOptions.snapshotEnvironment.resolvePath = () => outdatedSnapshotFile;
    } else if (mode === 'createExpectedSnapshot') {
      this.snapshotOptions.snapshotEnvironment.resolvePath = () => expectedSnapshotFile;
    } else {
      copyFileSync(outdatedSnapshotFile, tempSnapshotFile);
      this.snapshotOptions.snapshotEnvironment.resolvePath = () => tempSnapshotFile;
    }
  });
  after(function () {
    delete this.snapshotOptions.updateSnapshot;
    delete this.snapshotOptions.snapshotEnvironment;
    if (mode === 'test') {
      this.postTests.push(() => {
        const actual = readFileSync(tempSnapshotFile).toString();
        rmSync(tempSnapshotFile, { recursive: true });
        expect(actual).toBe(readFileSync(expectedSnapshotFile).toString());
      });
    }
  });

  if (mode === 'createTestSnapshot') {
    it('should be deleted', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });
  }

  if (mode === 'createExpectedSnapshot' || mode === 'test') {
    it('should be created', async function () {
      expect({ bar: 'foo' }).toMatchSnapshot();
      if (mode === 'test') {
        expect(await this.snapshotClient.snapshotState.pack()).toMatchObject(
          expect.objectContaining({
            added: 1,
            matched: 0,
            unchecked: 3,
          })
        );
      }
    });
  }

  if (mode === 'createExpectedSnapshot' || mode === 'test') {
    it('should be updated', async function () {
      expect({ bar: 'new value' }).toMatchSnapshot();
      if (mode === 'test') {
        expect(await this.snapshotClient.snapshotState.pack()).toMatchObject(
          expect.objectContaining({
            added: 2,
            matched: 0,
            unchecked: 0,
          })
        );
      }
    });
  } else {
    it('should be updated', function () {
      expect({ bar: 'old value' }).toMatchSnapshot();
    });
  }

  it('should match one snapshot', async function () {
    expect({ foo: 'bar' }).toMatchSnapshot();
    if (mode === 'test') {
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
