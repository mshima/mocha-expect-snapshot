const expect = require('expect');

describe('matching test', function () {
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
