import { expect } from '../dist/index.js';

const updateTestSnapshot = process.env.UPDATE_TEST_SNAPSHOT === 'true';

describe('inline test', function () {
  if (updateTestSnapshot) {
    before(function () {
      this.snapshotStateOptions = {
        updateSnapshot: 'all',
      };
    });
  }

  describe('toMachSnapshot()', function () {
    it('should match one snapshot', function () {
      expect({ foo: 'bar' }).toMatchInlineSnapshot(`
{
  "foo": "bar",
}
`);
    });

    it('should match two snapshots', function () {
      expect({ foo: 'bar' }).toMatchInlineSnapshot(`
{
  "foo": "bar",
}
`);
      expect({ foo2: 'bar' }).toMatchInlineSnapshot(`
{
  "foo2": "bar",
}
`);
    });
  });
});
