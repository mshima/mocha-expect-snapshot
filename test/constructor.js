const { expect } = require('expect');
const proxyquire = require('proxyquire');
const {
  setSnapshotResolver,
  getSnapshotResolver,
  setSnapshotResolverOptions,
  getSnapshotResolverOptions,
  setSnapshotStateOptions,
  getSnapshotStateOptions,
} = require('../lib/jest-snapshot');

describe('lifecycle', function () {
  before(function () {
    expect(this.snapshotState).toBeDefined();

    expect(expect({}).toMatchSnapshot).toBeDefined();
  });

  beforeEach(function () {
    expect(this.snapshotState).toBeDefined();
    expect(this.snapshotState).toBe(expect.getState().snapshotState);
    expect(expect.getState().snapshotState).toBeDefined();
  });

  afterEach(function () {
    expect(expect.getState().snapshotState).toBeDefined();
  });

  after(function () {
    expect(this.snapshotFile).toBeDefined();
    expect(expect.getState().snapshotState).toBeUndefined();
  });

  describe('setSnapshotResolver()', function () {
    let oldValue;
    const value = 'foo';

    before(() => {
      oldValue = getSnapshotResolver();
      setSnapshotResolver(value);
    });

    after(() => {
      setSnapshotResolver(oldValue);
    });

    it('should resolver the value using the getter', function () {
      expect(getSnapshotResolver()).toBe(value);
    });
  });

  describe('setSnapshotResolverOptions()', function () {
    let oldValue;
    const value = 'foo';

    before(() => {
      oldValue = getSnapshotResolverOptions().value;
      setSnapshotResolverOptions({ value });
    });

    after(() => {
      setSnapshotResolverOptions({ value: undefined });
    });

    it('should set the value', function () {
      expect(getSnapshotResolverOptions().value).toBe(value);
    });
  });

  describe('setSnapshotStateOptions()', function () {
    let oldValue;
    const value = 'foo';

    before(() => {
      oldValue = getSnapshotStateOptions().value;
      setSnapshotStateOptions({ value });
    });

    after(() => {
      setSnapshotStateOptions({ value: oldValue });
    });

    it('should set the value', function () {
      expect(getSnapshotStateOptions().value).toBe(value);
    });
  });

  describe('should use UPDATE_SNAPSHOT env variable as updateSnapshot value', function () {
    let updateSnapshotValue;

    before(() => {
      updateSnapshotValue = process.env['UPDATE_SNAPSHOT'];
      process.env['UPDATE_SNAPSHOT'] = 'FOO_BAR';
    });

    after(() => {
      process.env['UPDATE_SNAPSHOT'] = updateSnapshotValue;
    });

    it('should set snapshotStateOptions.updateSnapshot value', function () {
      const { getSnapshotStateOptions } = proxyquire('../lib/hooks.js', {});
      expect(getSnapshotStateOptions().updateSnapshot).toBe('FOO_BAR');
    });
  });

  describe('should accept --updateSnapshot parameter', function () {
    let argvValue;

    before(() => {
      argvValue = process.argv;
      process.argv = [...process.argv, '--updateSnapshot'];
    });

    after(() => {
      process.argv = argvValue;
    });

    it('should load snapshotStateOptions.updateSnapshot value', function () {
      const { getSnapshotStateOptions } = proxyquire('../lib/hooks.js', {});
      expect(getSnapshotStateOptions().updateSnapshot).toBe('all');
    });
  });

  describe('should extend expect', function () {
    let fooContext;
    let fooArg;

    before(() => {
      expect.extend({
        toFoo: function (...args) {
          fooArg = args[0];
          fooContext = this;
          return { message: 'ok', pass: true };
        },
      });
    });

    it('should extend toFoo and execute it', function () {
      expect('fooArg').toFoo();

      expect(fooContext.snapshotState).toBeDefined();
      expect(fooContext.currentTestName).toBeDefined();
      expect(fooContext.testPath).toBeDefined();

      expect(fooArg).toFoo('fooArg');
    });
  });
});
