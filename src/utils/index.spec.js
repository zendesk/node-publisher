const path = require('path');
const childProcess = require('child_process');
const { execSync } = childProcess;
const {
  DEFAULT_TEST_RUNNER,
  DEFAULT_BRANCH,
  DEFAULT_CONFIG_PATH
} = require('./constants');
const {
  packageJson,
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

const mockTestRunner = testRunner =>
  require('fs').__setReadFileSyncReturnValue(
    'package.json',
    JSON.stringify({
      scripts: {
        [testRunner]: 'jest'
      }
    })
  );

describe('packageJson', () => {
  it('returns the package.json as a JSON object', () => {
    require('fs').__setReadFileSyncReturnValue(
      'package.json',
      JSON.stringify({
        scripts: {
          test: 'jest'
        }
      })
    );

    expect(packageJson()).toEqual({
      scripts: {
        test: 'jest'
      }
    });
  });
});

describe('buildReleaseEnvironment', () => {
  const baseOptions = {};
  const throwError = () => {
    throw new Error();
  };

  describe('when branch is passed', () => {
    beforeAll(() => mockTestRunner('test'));

    it('contains the passed in branch', () => {
      const env = buildReleaseEnvironment({ branch: 'my-branch' });

      expect(env.branch).toBe('my-branch');
    });
  });

  describe('when branch is not passed', () => {
    it('contains the default branch', () => {
      const env = buildReleaseEnvironment({});

      expect(env.branch).toBe(DEFAULT_BRANCH);
    });
  });

  describe('when configPath is passed', () => {
    beforeAll(() => mockTestRunner('test'));

    it('contains the passed in config path', () => {
      const env = buildReleaseEnvironment({ configPath: '.pre-release.yml' });

      expect(env.configPath).toBe('.pre-release.yml');
    });
  });

  describe('when configPath is not passed', () => {
    it('contains the default config path', () => {
      const env = buildReleaseEnvironment({});

      expect(env.configPath).toBe(DEFAULT_CONFIG_PATH);
    });
  });

  describe('when errors are silenced', () => {
    const options = Object.assign({}, baseOptions, { quiet: true });

    describe('and PWD is not package root', () => {
      it('throws an error', () => {
        validations.validatePkgRoot.mockImplementation(throwError);

        expect(() => buildReleaseEnvironment(options)).toThrow();

        validations.validatePkgRoot.mockRestore();
      });
    });

    describe('and the detected test runner is invalid', () => {
      beforeAll(() => {
        mockTestRunner('test');
        validations.validateTestRunner.mockImplementation(throwError);
      });

      afterAll(() => validations.validateTestRunner.mockRestore());

      it('does not throw an error', () => {
        expect(() => buildReleaseEnvironment(options)).not.toThrow();
      });

      it('returns the default test runner', () => {
        const env = buildReleaseEnvironment(options);

        expect(env.testRunner).toBe(DEFAULT_TEST_RUNNER);
      });
    });
  });

  describe('when errors are not silenced', () => {
    const options = baseOptions;

    describe('and PWD is not package root', () => {
      it('throws an error', () => {
        validations.validatePkgRoot.mockImplementation(throwError);

        expect(() => buildReleaseEnvironment(options)).toThrow();

        validations.validatePkgRoot.mockRestore();
      });
    });

    describe('and the detected test runner is invalid', () => {
      beforeAll(() => mockTestRunner('test'));

      it('throws an error', () => {
        validations.validateTestRunner.mockImplementation(throwError);

        expect(() => buildReleaseEnvironment(options)).toThrow();

        validations.validateTestRunner.mockRestore();
      });
    });
  });

  describe('when lerna is the detected client', () => {
    const options = baseOptions;
    beforeAll(() => client.publishClient.mockReturnValue('lerna'));

    describe('and lerna was bootstrapped', () => {
      it('does not throw an error', () => {
        expect(() => buildReleaseEnvironment(options)).not.toThrow();
      });
    });

    describe('and lerna was not bootstrapped', () => {
      it('throws an error', () => {
        validations.validateLerna.mockImplementation(throwError);

        expect(() => buildReleaseEnvironment(options)).toThrow();

        validations.validateLerna.mockRestore();
      });
    });
  });
});

describe('loadReleaseConfig', () => {
  describe('when the default configPath is passed', () => {
    describe('and .release.yml is present in the root pkg directory', () => {
      it('reads the custom release config from the file', () => {
        const MOCKED_FILES = ['.release.yml'];

        require('fs').__setMockFiles(MOCKED_FILES);
        require('fs').__setReadFileSyncReturnValue(
          DEFAULT_CONFIG_PATH,
          'file contents'
        );
        config.readReleaseConfig.mockReturnValue('configuration');

        loadReleaseConfig({ configPath: DEFAULT_CONFIG_PATH });

        expect(config.readReleaseConfig).toHaveBeenCalledWith('file contents');
      });
    });

    describe('and .release.yml is not present in the root pkg directory', () => {
      it('loads the default configuration', () => {
        require('fs').__setMockFiles([]);

        loadReleaseConfig({ configPath: DEFAULT_CONFIG_PATH });

        expect(config.buildReleaseConfig).toHaveBeenCalled();
      });
    });
  });

  describe('when a non-default configPath is passed', () => {
    describe('and the config file is present in the file system', () => {
      beforeAll(() => {
        const MOCKED_FILES = ['.pre-release.yml', '/path/.release.yml'];

        require('fs').__setMockFiles(MOCKED_FILES);
        require('fs').__setReadFileSyncReturnValue('.pre-release.yml', 'a');
        require('fs').__setReadFileSyncReturnValue('/path/.release.yml', 'b');
      });

      it('reads the release config from a relative path', () => {
        const fileExistsSpy = jest.spyOn(require('fs'), 'existsSync');

        loadReleaseConfig({ configPath: '.pre-release.yml' });

        expect(config.readReleaseConfig).toHaveBeenCalledWith('a');
        expect(fileExistsSpy).toHaveBeenCalledWith(
          path.resolve(process.env.PWD, '.pre-release.yml')
        );
      });

      it('reads the release config from an absolute path', () => {
        const fileExistsSpy = jest.spyOn(require('fs'), 'existsSync');

        loadReleaseConfig({ configPath: '/path/.release.yml' });

        expect(config.readReleaseConfig).toHaveBeenCalledWith('b');
        expect(fileExistsSpy).toHaveBeenCalledWith('/path/.release.yml');
      });
    });

    describe('and the config file is not present in the file system', () => {
      it('throws an error', () => {
        require('fs').__setMockFiles([]);

        expect(() => {
          loadReleaseConfig({ configPath: '.pre-release.yml' });
        }).toThrow();
      });
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
