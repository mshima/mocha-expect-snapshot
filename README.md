# mocha-expect-snapshot

> `expect` extension to use Jest's `toMatchSnapshot` in Mocha

The module is a reimplementation of [expect-mocha-snapshot](https://github.com/blogfoster/expect-mocha-snapshot).

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
  });
});
```

Update snapshots by passing --updateSnapshot option to mocha (not compatible with parallel mode).

```sh
mocha --updateSnapshot
```

Or my passing `UPDATE_SNAPSHOT` environment variable with value `all` or `new`.

```sh
UPDATE_SNAPSHOT=all mocha
```

Custom configuration (can be used as a [root hook](https://mochajs.org/#root-hook-plugins)):

```js
const expect = require('expect');

describe('foo', function () {
  before(function () {
    this.snapshotStateOptions = { updateSnapshot: 'new' };
    // https://github.com/facebook/jest/blob/817d8b6aca845dd4fcfd7f8316293e69f3a116c5/packages/jest-snapshot/src/State.ts#L25-L30
    this.snapshotState.setSnapshotFile('foo');
  });
  it('matches the snapshot', function () {
    expect({ foo: 'bar' }).toMatchSnapshot();
  });
});
```

## License

MIT
