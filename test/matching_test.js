const { expect } = require('expect');

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('matching test', function () {
  if (updateTestSnapshot) {
    before(function () {
      this.snapshotStateOptions = {
        updateSnapshot: 'all',
      };
    });
  }

  describe('toMachSnapshot()', function () {
    it('should match one snapshot', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
    });

    it('should match two snapshots', function () {
      expect({ foo: 'bar' }).toMatchSnapshot();
      expect({ foo2: 'bar' }).toMatchSnapshot();
    });

    it('should match error snapshots', function () {
      expect(() => {
        throw new Error('foo');
      }).toThrowErrorMatchingSnapshot();
    });

    it('should match inline error snapshots', function () {
      expect(() => {
        throw new Error('foo');
      }).toThrowErrorMatchingInlineSnapshot(`"foo"`);
    });
  });
});
