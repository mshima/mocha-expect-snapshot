const proxyquire = require('proxyquire');
const expect = require('expect26');
const jestSnapshot = require('jest-snapshot26');

const { setup, teardown } = proxyquire('../', { expect: expect, 'jest-snapshot': jestSnapshot });

describe('hooks with expect@26', function () {
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
