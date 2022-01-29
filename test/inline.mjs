import expect from 'expect';

describe('mjs inline test', function () {
  describe('toMachSnapshot()', function () {
    it('should match one snapshot', function () {
      expect({ foo: 'bar' }).toMatchInlineSnapshot(`
Object {
  "foo": "bar",
}
`);
    });

    it('should match two snapshots', function () {
      expect({ foo: 'bar' }).toMatchInlineSnapshot(`
Object {
  "foo": "bar",
}
`);
      expect({ foo2: 'bar' }).toMatchInlineSnapshot(`
Object {
  "foo2": "bar",
}
`);
    });
  });
});
