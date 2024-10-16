import { expect } from '../dist/index.js';

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('matching test', function () {
  if (updateTestSnapshot) {
    beforeEach(function () {
      this.snapshotClient.snapshotState._updateSnapshot = 'all';
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
      }).toThrowErrorMatchingInlineSnapshot(`[Error: foo]`);
    });
  });
});
