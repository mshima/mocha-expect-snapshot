const expect = require('expect');

describe('non matching test', function () {
  before(function () {
    this.snapshotStateOptions = {
      updateSnapshot: 'none',
    };
  });

  describe('toMachSnapshot()', function () {
    it('should not match snapshot', function () {
      expect(() => expect({ foo: 'bar' }).toMatchSnapshot()).toThrow();
    });
  });
});
