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
const { expect } = require('expect');

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

Typed expect

```js
import { jestExpect as expect } from 'mocha-expect-snapshot';

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

### jest-image-snapshot

Install.

```sh
npm install jest-image-snapshot --save-dev
```

Configure as a mocha [module](https://mochajs.org/#-require-module-r-module).

```json
{
  "require": ["mocha-expect-snapshot/image"]
}
```

For both:

```json
{
  "require": ["mocha-expect-snapshot", "mocha-expect-snapshot/image"]
}
```

Create tests.

```js
const { expect } = require('expect');

it('test image', () => {
  const image = ...
  expect(image).toMatchImageSnapshot();
});
```

### Custom configuration

File specific configuration must be set at top-level before, SnapshotState is created once per file:

```js
const { expect } = require('expect');

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

Global configuration must be implemented with a custom [hook plugin](https://mochajs.org/#defining-a-root-hook-plugin]

```js
// test/hooks.js
const {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
  mochaHooks,
} = require('mocha-expect-snapshot');

// set your custom config

module.exports = {
  mochaHooks,
};
```

```json
{
  "require": "./test/hooks.js"
}
```

This module is a reimplementation of [expect-mocha-snapshot](https://github.com/blogfoster/expect-mocha-snapshot).

## License

MIT
