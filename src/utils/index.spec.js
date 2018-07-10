const childProcess = require('child_process');
const { execSync } = childProcess;
const utils = require('./index');
const config = require('./config');

jest.mock('fs');
jest.mock('child_process');
jest.mock('./config');

describe('validateEnvironment', () => {
  beforeEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when not run from the root of the package', () => {
    const MOCKED_FILES = ['not_package.json'];

    it('throws an error', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(utils.validateEnvironment).toThrow(
        'Run this script from the root of your package.'
      );
    });
  });

  describe('when run from the root of the package', () => {
    const MOCKED_FILES = ['package.json'];

    it('returns', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(utils.validateEnvironment).not.toThrow();
    });
  });
});

describe('loadReleaseConfig', () => {
  describe('when .release.yml is present in the root pkg directory', () => {
    const MOCKED_FILES = ['.release.yml'];

    it('loads the custom configuration', () => {
      require('fs').__setMockFiles(MOCKED_FILES);
      require('fs').__setReadFileSyncReturnValue('file contents');
      config.readReleaseConfig.mockReturnValue('configuration');

      const strConfig = utils.loadReleaseConfig();

      expect(config.readReleaseConfig).toHaveBeenCalledWith('file contents');
      expect(strConfig).toBe('configuration');
    });
  });

  describe('when .release.yml is not present in the root pkg directory', () => {
    it('loads the default configuration', () => {
      require('fs').__setMockFiles([]);

      utils.loadReleaseConfig();

      expect(config.buildReleaseConfig).toHaveBeenCalled();
    });
  });
});

describe('validVersion', () => {
  describe('when version is valid', () => {
    it('returns true', () => {
      expect(utils.validVersion('minor')).toBe(true);
    });
  });

  describe('when version is not valid', () => {
    it('returns false', () => {
      expect(utils.validVersion('preminor')).toBe(false);
    });
  });
});

describe('execCommands', () => {
  childProcess.__permitCommands(['mycommand', 'mySecondCommand']);

  afterEach(() => {
    execSync.mockClear();
  });

  describe('when config commands are undefined', () => {
    it('execCommand is not called', () => {
      utils.execCommands();

      expect(execSync).not.toHaveBeenCalled();
    });
  });

  describe('when a single command is being passed', () => {
    it('execCommand is called 1 time', () => {
      utils.execCommands('mycommand --some-arg');

      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync.mock.calls[0][0]).toBe('mycommand --some-arg');
    });
  });

  describe('when multiple commands are being passed as an array', () => {
    it('execCommand is called multiple times', () => {
      utils.execCommands([
        'mycommand --some-arg',
        'mySecondCommand --some-arg'
      ]);

      expect(execSync).toHaveBeenCalledTimes(2);
      expect(execSync.mock.calls[0][0]).toBe('mycommand --some-arg');
      expect(execSync.mock.calls[1][0]).toBe('mySecondCommand --some-arg');
    });
  });
});

describe('currentCommitId', () => {
  it("returns the HEAD commit's ID", () => {
    childProcess.__permitCommands(['git']);
    childProcess.__setReturnValues({
      'git rev-parse HEAD': Buffer.from(
        'f030084d079ba5e07de6546879a84e23de536db1\n',
        'utf8'
      )
    });

    const commitId = utils.currentCommitId();

    expect(execSync).toHaveBeenCalled();
    expect(commitId).toBe('f030084d079ba5e07de6546879a84e23de536db1');

    execSync.mockClear();
  });
});

describe('rollbackCommit', () => {
  it('rolls back to the specified commit', () => {
    childProcess.__permitCommands(['git']);

    utils.rollbackCommit('f030084d079ba5e07de6546879a84e23de536db1');

    expect(execSync).toHaveBeenCalled();
    expect(execSync.mock.calls[0][0]).toBe(
      'git reset --hard f030084d079ba5e07de6546879a84e23de536db1'
    );

    execSync.mockClear();
  });
});
