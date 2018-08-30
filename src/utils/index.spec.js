const childProcess = require('child_process');
const { execSync } = childProcess;
const {
  buildReleaseEnvironment,
  loadReleaseConfig,
  execCommands,
  currentCommitId,
  rollbackCommit
} = require('./index');
const config = require('./config');
const validations = require('./validations');
const client = require('./client');

jest.mock('fs');
jest.mock('child_process');
jest.mock('./config');
jest.mock('./validations');
jest.mock('./client');

require('fs').__setReadFileSyncReturnValue('package.json', JSON.stringify({}));

describe('buildReleaseEnvironment', () => {
  const throwError = () => {
    throw new Error();
  };

  describe('when PWD is not package root', () => {
    it('throws an error', () => {
      validations.validatePkgRoot.mockImplementation(throwError);

      expect(() => buildReleaseEnvironment()).toThrow();

      validations.validatePkgRoot.mockRestore();
    });
  });

  describe('when lerna is the detected client', () => {
    beforeAll(() => client.publishClient.mockReturnValue('lerna'));

    describe('and lerna was bootstrapped', () => {
      it('does not throw an error', () => {
        expect(() => buildReleaseEnvironment()).not.toThrow();
      });
    });

    describe('and lerna was not bootstrapped', () => {
      it('throws an error', () => {
        validations.validateLerna.mockImplementation(throwError);

        expect(() => buildReleaseEnvironment()).toThrow();

        validations.validateLerna.mockRestore();
      });
    });
  });
});

describe('loadReleaseConfig', () => {
  describe('when .release.yml is present in the root pkg directory', () => {
    const MOCKED_FILES = ['.release.yml'];

    it('loads the custom configuration', () => {
      require('fs').__setMockFiles(MOCKED_FILES);
      require('fs').__setReadFileSyncReturnValue(
        '.release.yml',
        'file contents'
      );
      config.readReleaseConfig.mockReturnValue('configuration');

      const strConfig = loadReleaseConfig();

      expect(config.readReleaseConfig).toHaveBeenCalledWith('file contents');
      expect(strConfig).toBe('configuration');
    });
  });

  describe('when .release.yml is not present in the root pkg directory', () => {
    it('loads the default configuration', () => {
      require('fs').__setMockFiles([]);

      loadReleaseConfig();

      expect(config.buildReleaseConfig).toHaveBeenCalled();
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
      execCommands();

      expect(execSync).not.toHaveBeenCalled();
    });
  });

  describe('when a single command is being passed', () => {
    it('execCommand is called 1 time', () => {
      execCommands('mycommand --some-arg');

      expect(execSync).toHaveBeenCalledTimes(1);
      expect(execSync.mock.calls[0][0]).toBe('mycommand --some-arg');
    });
  });

  describe('when multiple commands are being passed as an array', () => {
    it('execCommand is called multiple times', () => {
      execCommands(['mycommand --some-arg', 'mySecondCommand --some-arg']);

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

    const commitId = currentCommitId();

    expect(execSync).toHaveBeenCalled();
    expect(commitId).toBe('f030084d079ba5e07de6546879a84e23de536db1');

    execSync.mockClear();
  });
});

describe('rollbackCommit', () => {
  it('rolls back to the specified commit', () => {
    childProcess.__permitCommands(['git']);

    rollbackCommit('f030084d079ba5e07de6546879a84e23de536db1');

    expect(execSync).toHaveBeenCalled();
    expect(execSync.mock.calls[0][0]).toBe(
      'git reset --hard f030084d079ba5e07de6546879a84e23de536db1'
    );

    execSync.mockClear();
  });
});
