const expect = require('expect');
const crypto = require('crypto');
const { unlinkSync, rmSync = unlinkSync, readFileSync } = require('fs');
const { resolve } = require('path');

const createSnapshot = false;

describe('creting test', function () {
  const tempSnapshotFile = resolve('test', '__snapshots__', 'creating.js.snap.' + crypto.randomBytes(4).readUInt32LE(0));
  const snapshotFile = resolve('test', '__snapshots__', 'creating.js.snap');

  before(function () {
    this.snapshotStateOptions = {
      updateSnapshot: 'all',
    };
    if (!createSnapshot) {
      this.snapshotFile = tempSnapshotFile;
      this.addAfterSnapshotSave((summary) => {
        expect(readFileSync(tempSnapshotFile).toString()).toBe(readFileSync(snapshotFile).toString());
        rmSync(tempSnapshotFile);

        expect(summary).toEqual(
          expect.objectContaining({
            added: 3,
            removed: 0,
            updated: 0,
          })
        );
      });
    }
  });

  describe('toMachSnapshot()', function () {
    it('should match one snapshot', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });

    it('should match two snapshots', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
      expect({ foo2: 'bar' }).toMatchSnapshot();
    });
  });
});
