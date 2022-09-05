const { expect } = require('expect');

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('non matching test', function () {
  before(function () {
    if (updateTestSnapshot) {
      this.snapshotStateOptions = {
        updateSnapshot: 'all',
        snapshotFormat: {
          escapeString: true,
          printBasicPrototype: true,
        },
      };
    } else {
      this.snapshotStateOptions = {
        updateSnapshot: 'none',
      };

      this.addAfterSnapshotSave((summary) => {
        expect(summary).toEqual(
          expect.objectContaining({
            added: 0,
            removed: 0,
            updated: 0,
          })
        );
      });
    }
  });

  describe('toMachSnapshot()', function () {
    if (!updateTestSnapshot) {
      it('should not match snapshot', function () {
        expect(() => expect({ foo: 'bar' }).toMatchSnapshot()).toThrow();
      });
    }
  });
});
