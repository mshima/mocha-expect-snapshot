const expect = require('expect');
const proxyquire = require('proxyquire');

describe('lifecycle', function () {
  before(function () {
    expect(this.snapshotState).toBeDefined();
    this.snapshotStateOptions = {
      updateSnapshot: 'foo',
    };
  });

  beforeEach(function () {
    expect(this.snapshotState).toBeDefined();
  });

  it('should load snapshotStateOptions from before hooks', function () {
    expect(this.snapshotState.snapshotState._updateSnapshot).toBe('foo');
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

    it('should load snapshotStateOptions from before hooks', function () {
      const { snapshotStateOptions } = proxyquire('../index', {});
      expect(snapshotStateOptions.updateSnapshot).toBe('FOO_BAR');
    });
  });
});
