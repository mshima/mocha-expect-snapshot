const crypto = require('crypto');
const { expect } = require('expect');
const { unlinkSync, rmSync = unlinkSync, readFileSync, copyFileSync } = require('fs');
const { resolve } = require('path');

const createSnapshot = false;
const createOutdated = false;

describe('updating test', function () {
  const updatedSnapshotFile = resolve('test', '__snapshots__', 'updating.updated.js.snap');
  const outdatedSnapshotFile = resolve('test', '__snapshots__', 'updating.outdated.js.snap');
  const tempSnapshotFile = resolve('test', '__snapshots__', 'updating.js.snap' + +crypto.randomBytes(4).readUInt32LE(0));

  before(function () {
    this.snapshotStateOptions = {
      updateSnapshot: 'all',
    };
    if (!createSnapshot) {
      copyFileSync(outdatedSnapshotFile, tempSnapshotFile);
      this.snapshotFile = tempSnapshotFile;
      this.addAfterSnapshotSave((summary) => {
        expect(readFileSync(tempSnapshotFile).toString()).toBe(readFileSync(updatedSnapshotFile).toString());
        rmSync(tempSnapshotFile);
        expect(summary).toEqual(
          expect.objectContaining({
            added: 1,
            removed: 1,
            updated: 1,
          })
        );
      });
    } else if (createOutdated) {
      this.snapshotFile = outdatedSnapshotFile;
    } else {
      this.snapshotFile = updatedSnapshotFile;
    }
  });

  if (createSnapshot && createOutdated) {
    it('should be deleted', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });
  }

  if (!createSnapshot || !createOutdated) {
    it('should be created', function () {
      expect({ bar: 'foo' }).toMatchSnapshot();
    });
  }

  if (!createSnapshot || !createOutdated) {
    it('should be updated', function () {
      expect({ bar: 'new value' }).toMatchSnapshot();
    });
  } else if (createOutdated) {
    it('should be updated', function () {
      expect({ bar: 'old value' }).toMatchSnapshot();
    });
  }

  it('should match one snapshot', function () {
    expect({ foo: 'bar' }).toMatchSnapshot();
  });
});
