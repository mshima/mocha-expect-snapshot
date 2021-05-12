const expect = require('expect');

const { setup, teardown } = require('../');

describe('hooks', function () {
  describe('toMachSnapshot()', function () {
    it('should match snapshot', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });
  });

  describe('toMachSnapshot() failure', function () {
    before(function () {
      this.snapshotResolverOptions = { rootDir: 'test2' };
      this.snapshotStateOptions = { updateSnapshot: false };
    });
    it('should match snapshot', function () {
      try {
        expect({ foo: 'bar' }).toMatchSnapshot();
        throw new Error('Should not happen');
      } catch (_error) {}
    });
  });
});
