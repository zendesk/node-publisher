const {
  validatePkgRoot,
  validateVersion,
  validateLerna,
  isBuildDefined
} = require('./');

jest.mock('fs');

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

describe('validateVersion', () => {
  describe('when lerna is the detected publish client', () => {
    const env = { publishClient: 'lerna' };
    const version = null;

    it('does not throw an error', () => {
      expect(() => validateVersion(version, env)).not.toThrow();
    });
  });

  describe('when lerna is not the detected publish client', () => {
    const env = { publishClient: 'yarn' };

    describe('and version is valid', () => {
      const version = 'patch';

      it('does not throw an error', () => {
        expect(() => validateVersion(version, env)).not.toThrow();
      });
    });

    describe('and version is not valid', () => {
      const version = 'prepatch';

      it('throws an error', () => {
        expect(() => validateVersion(version, env)).toThrow();
      });
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

describe('isBuildDefined', () => {
  describe('when build is defined in package.json', () => {
    const mockPkg = {
      scripts: {
        build: 'babel'
      }
    };

    it('returns true', () => {
      expect(isBuildDefined(mockPkg)).toBeTruthy();
    });
  });

  describe('when build is not defined in package.json', () => {
    const mockPkg = {};

    it('returns false', () => {
      expect(isBuildDefined(mockPkg)).toBeFalsy();
    });
  });
});
