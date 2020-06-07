const utils = require('../package');
const { VALID_TEST_RUNNERS } = require('../constants');
const {
  validateNodeVersion,
  validatePkgRoot,
  validateTestRunner,
  validateLerna,
  isGitProject,
  nvmrcExists,
  hasBuildScript,
  hasCiScript
} = require('./');

jest.mock('fs');
jest.mock('child_process');
jest.mock('../package');

describe('validateNodeVersion', () => {
  beforeEach(() => {
    require('fs').__setMockFiles(['.nvmrc']);
    require('fs').__setReadFileSyncReturnValue('.nvmrc', 'v12.18.0');
    require('child_process').__permitCommands(['node']);
  });

  describe('with incorrect Node version', () => {
    beforeEach(() => {
      require('child_process').__setReturnValues({
        'node -v': 'v10.16.0',
      });
    });

    it('throws an error', () => {
      expect(validateNodeVersion).toThrow();
    });
  });

  describe('with correct Node version', () => {
    beforeEach(() => {
      require('child_process').__setReturnValues({
        'node -v': 'v12.18.0',
      });
    });

    it('does not throw an error', () => {
      expect(validateNodeVersion).not.toThrow();
    });
  });
});

describe('validatePkgRoot', () => {
  beforeEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when not run from the root of the package', () => {
    const MOCKED_FILES = ['not_package.json'];

    it('throws an error', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(validatePkgRoot).toThrow(
        'Run this script from the root of your package.'
      );
    });
  });

  describe('when run from the root of the package', () => {
    const MOCKED_FILES = ['package.json'];

    it('returns', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(validatePkgRoot).not.toThrow();
    });
  });
});

describe('validateTestRunner', () => {
  describe('when test runner is defined', () => {
    const testRunner = 'travis';

    it('does not throw an error', () => {
      expect(() => validateTestRunner(testRunner)).not.toThrow();
    });
  });

  describe('when test runner is undefined', () => {
    const testRunner = undefined;

    it('throws an error', () => {
      expect(() => validateTestRunner(testRunner)).toThrow();
    });
  });
});

describe('validateLerna', () => {
  describe('when lerna was bootstrapped', () => {
    const MOCKED_FILES = ['lerna.json'];

    it('does not throw an error', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(validateLerna).not.toThrow();
    });
  });

  describe('when lerna was not bootstrapped', () => {
    it('throws an error', () => {
      require('fs').__setMockFiles([]);

      expect(validateLerna).toThrow();
    });
  });
});

describe('isGitProject', () => {
  afterEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when .git directory exists', () => {
    const MOCKED_FILES = ['.git'];

    it('returns true', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(isGitProject()).toBe(true);
    });
  });

  describe('when .git directory does not exist', () => {
    it('returns false', () => {
      expect(isGitProject()).toBe(false);
    });
  });
});

describe('nvmrcExists', () => {
  afterEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when .nvmrc file exists', () => {
    const MOCKED_FILES = ['.nvmrc'];

    it('returns true', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(nvmrcExists()).toBe(true);
    });
  });

  describe('when .nvmrc file does not exist', () => {
    it('returns false', () => {
      expect(nvmrcExists()).toBe(false);
    });
  });
});

describe('hasBuildScript', () => {
  describe('when a build script is defined in package.json', () => {
    it('returns false', () => {
      utils.packageJson.mockReturnValue({ scripts: { build: 'webpack' } });

      expect(hasBuildScript()).toBe(true);
    });
  });

  describe('when a build script is not defined in package.json', () => {
    it('returns false', () => {
      utils.packageJson.mockReturnValue({ scripts: {} });

      expect(hasBuildScript()).toBe(false);
    });
  });

  describe('when scripts are not defined in package.json', () => {
    it('returns false', () => {
      utils.packageJson.mockReturnValue({});

      expect(hasBuildScript()).toBe(false);
    });
  });
});

describe('hasCiScript', () => {
  for (const testRunner of VALID_TEST_RUNNERS) {
    describe(`when a ${testRunner} script is defined in package.json`, () => {
      it('returns true', () => {
        utils.packageJson.mockReturnValue({
          scripts: { ci: 'eslint && jest' }
        });

        expect(hasCiScript()).toBe(true);
      });
    });
  }

  describe('when a valid test runner script is not defined in package.json', () => {
    it('returns false', () => {
      utils.packageJson.mockReturnValue({ scripts: {} });

      expect(hasCiScript()).toBe(false);
    });
  });

  describe('when scripts are not defined in package.json', () => {
    it('returns false', () => {
      utils.packageJson.mockReturnValue({});

      expect(hasCiScript()).toBe(false);
    });
  });
});
