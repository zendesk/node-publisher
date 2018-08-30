const { buildReleaseConfig } = require('./');

jest.mock('fs');

describe('buildReleaseConfig', () => {
  describe('when build script is defined in package.json', () => {
    const mockPkg = {
      scripts: {
        build: './build'
      }
    };

    describe('and npm is the detected npm client', () => {
      const MOCKED_FILES = ['package-lock.json', 'package.json'];

      it('returns a configuration with the build step', () => {
        require('fs').__setMockFiles(MOCKED_FILES);
        require('fs').__setReadFileSyncReturnValue(
          'package.json',
          JSON.stringify(mockPkg)
        );

        const config = buildReleaseConfig();

        expect(config.prepare[config.prepare.length - 1]).toBe('npm install');
        expect(config.test[0]).toBe('npm run travis');
        expect(config.build[0]).toBe('npm run build');
      });
    });

    describe('and yarn is the detected npm client', () => {
      const MOCKED_FILES = ['yarn.lock', 'package.json'];

      it('returns a configuration with the build step', () => {
        require('fs').__setMockFiles(MOCKED_FILES);
        require('fs').__setReadFileSyncReturnValue(
          'package.json',
          JSON.stringify(mockPkg)
        );

        const config = buildReleaseConfig();

        expect(config.prepare[config.prepare.length - 1]).toBe('yarn install');
        expect(config.test[0]).toBe('yarn travis');
        expect(config.build[0]).toBe('yarn build');
      });
    });
  });

  describe('when build script is not defined in package.json', () => {
    const MOCKED_FILES = ['yarn.lock', 'package.json'];
    const mockPkg = {
      scripts: {}
    };

    it('returns a configuration without the build step', () => {
      require('fs').__setMockFiles(MOCKED_FILES);
      require('fs').__setReadFileSyncReturnValue(
        'package.json',
        JSON.stringify(mockPkg)
      );

      const config = buildReleaseConfig();

      expect(config.build).toBeUndefined();
    });
  });
});
