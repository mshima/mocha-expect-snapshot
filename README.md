# mocha-expect-snapshot

> `expect` extension to use Jest's `toMatchSnapshot` in Mocha

The module is a reimplementation of [expect-mocha-snapshot](https://github.com/blogfoster/expect-mocha-snapshot).

## Usage

```js
const expect = require('expect');

describe('foo', function () {
  it('matches the snapshot', function () {
    expect({ foo: 'bar' }).toMatchSnapshot();
  });
});
```

Update snapshots by passing --update-snapshot option to mocha.

```sh
mocha --update-snapshot
```

## License

MIT
