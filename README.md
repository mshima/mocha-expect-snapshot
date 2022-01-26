# mocha-expect-snapshot

Mocha plugin to use `expect` with `jest-snapshot` and derived projects like `jest-image-snapshot`.

## Usage

Configure as a mocha [module](https://mochajs.org/#-require-module-r-module).

```json
{
  "require": "mocha-expect-snapshot"
}
```

Implement test.

```js
const expect = require('expect');

describe('foo', function () {
  it('matches the snapshot', function () {
    expect({ foo: 'bar' }).toMatchSnapshot();

    expect({ foo: 'bar' }).toMatchInlineSnapshot(`
Object {
  "foo": "bar",
}
`);
  });
});
```

Update snapshots by passing --updateSnapshot option to mocha (not compatible with parallel mode).

```sh
mocha --updateSnapshot
```

Or by passing `UPDATE_SNAPSHOT` environment variable with value `all` or `new`.

```sh
UPDATE_SNAPSHOT=all mocha
```

Custom configuration:

```js
const expect = require('expect');

describe('foo', function () {
  before(function () {
    // https://github.com/facebook/jest/blob/817d8b6aca845dd4fcfd7f8316293e69f3a116c5/packages/jest-snapshot/src/State.ts#L25-L30
    this.snapshotStateOptions = { updateSnapshot: 'new' };
    this.snapshotFile = '/foo';
  });

  it('matches the snapshot', function () {
    expect({ foo: 'bar' }).toMatchSnapshot();
  });

  it('matches the inline snapshot', function () {
    expect({ foo: 'bar' }).toMatchInlineSnapshot(`
Object {
  "foo": "bar",
}
`);
  });
});
```

This module is a reimplementation of [expect-mocha-snapshot](https://github.com/blogfoster/expect-mocha-snapshot).

## License

MIT
