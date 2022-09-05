const { readFileSync } = require('fs');
const { join } = require('path');

const { expect } = require('expect');

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('matching test', function () {
  const imageData = readFileSync(join(__dirname, 'fixtures', 'image.png'));

  if (updateTestSnapshot) {
    before(function () {
      this.snapshotStateOptions = {
        updateSnapshot: 'all',
      };
    });
  }

  describe('toMatchImageSnapshot()', function () {
    it('should match one snapshot', function () {
      expect(imageData).toMatchImageSnapshot();
    });
  });
});
