import { expect } from '../dist/index.js';

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('non matching test', function () {
  beforeEach(function () {
    if (updateTestSnapshot) {
      this.snapshotClient.snapshotState._updateSnapshot = 'all';
    } else {
      this.snapshotClient.snapshotState._updateSnapshot = 'none';
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
