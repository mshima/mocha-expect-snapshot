const expect = require('expect');

describe('hooks', function () {
  describe('toMachSnapshot()', function () {
    it('should match snapshot', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });
  });
});
