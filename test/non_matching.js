const expect = require('expect');

describe('non matching test', function () {
  before(function () {
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
  });

  describe('toMachSnapshot()', function () {
    it('should not match snapshot', function () {
      expect(() => expect({ foo: 'bar' }).toMatchSnapshot()).toThrow();
    });
  });
});
