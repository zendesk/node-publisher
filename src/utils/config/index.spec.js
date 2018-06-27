const { buildReleaseConfig } = require('./');

jest.mock('fs');

describe('buildReleaseConfig', () => {
  describe('when npm is the detected npm client', () => {
    const MOCKED_FILES = ['package-lock.json'];

    it('returns the correct configuration', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      const config = buildReleaseConfig();

      expect(config.prepare[config.prepare.length - 1]).toBe('npm install');
      expect(config.test[0]).toBe('npm run travis');
      expect(config.build[0]).toBe('npm run build');
    });
  });

  describe('when yarn is the detected npm client', () => {
    const MOCKED_FILES = ['yarn.lock'];

    it('returns the correct configuration', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      const config = buildReleaseConfig();

      expect(config.prepare[config.prepare.length - 1]).toBe('yarn install');
      expect(config.test[0]).toBe('yarn travis');
      expect(config.build[0]).toBe('yarn build');
    });
  });
});
