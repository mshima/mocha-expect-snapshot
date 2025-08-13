const crypto = require('crypto');
const { expect } = require('expect');
const { unlinkSync, rmSync = unlinkSync, readFileSync, copyFileSync } = require('fs');
const { resolve } = require('path');

const createExpectedSnapshot = process.env.UPDATE_EXPECTED_SNAPSHOT === 'true';
const createTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';
const mode = createTestSnapshot ? 'createTestSnapshot' : createExpectedSnapshot ? 'createExpectedSnapshot' : 'test';

describe('updating test', function () {
  const expectedSnapshotFile = resolve('test', '__snapshots__', 'updating.updated.js.snap');
  const outdatedSnapshotFile = resolve('test', '__snapshots__', 'updating.outdated.js.snap');
  const tempSnapshotFile = resolve('test', '__snapshots__', 'updating.js.snap' + +crypto.randomBytes(4).readUInt32LE(0));

  before(function () {
    this.snapshotStateOptions = {
      updateSnapshot: 'all',
    };
    if (mode === 'createTestSnapshot') {
      this.snapshotFile = outdatedSnapshotFile;
    } else if (mode === 'createExpectedSnapshot') {
      this.snapshotFile = expectedSnapshotFile;
    } else {
      copyFileSync(outdatedSnapshotFile, tempSnapshotFile);
      this.snapshotFile = tempSnapshotFile;
      this.addAfterSnapshotSave((summary) => {
        expect(readFileSync(tempSnapshotFile).toString()).toBe(readFileSync(expectedSnapshotFile).toString());
        rmSync(tempSnapshotFile);
        expect(summary).toEqual(
          expect.objectContaining({
            added: 1,
            removed: 1,
            updated: 1,
          }),
        );
      });
    }
  });

  if (mode === 'createTestSnapshot') {
    it('should be deleted', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });
  }

  if (mode === 'createExpectedSnapshot' || mode === 'test') {
    it('should be created', function () {
      expect({ bar: 'foo' }).toMatchSnapshot();
    });
  }

  if (mode === 'createExpectedSnapshot' || mode === 'test') {
    it('should be updated', function () {
      expect({ bar: 'new value' }).toMatchSnapshot();
    });
  } else {
    it('should be updated', function () {
      expect({ bar: 'old value' }).toMatchSnapshot();
    });
  }

  it('should match one snapshot', function () {
    expect({ foo: 'bar' }).toMatchSnapshot();
  });
});
