const expect = require('expect');

const { setup, teardown } = require('../');

describe('hooks', function () {
  beforeEach(setup);

  afterEach(teardown);

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
    it('should not match snapshot', function () {
      expect(() => expect({ foo: 'bar' }).toMatchSnapshot()).toThrow();
    });
  });
});
