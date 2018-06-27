const { npmClient, detectClient } = require('./');

jest.mock('fs');

describe('npmClient', () => {
  beforeEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when client cannot be detected', () => {
    const MOCKED_FILES = [];

    it('throws an error', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(npmClient).toThrow();
    });
  });

  describe('when package-lock.json found', () => {
    const MOCKED_FILES = ['package-lock.json'];

    it('returns npm', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(npmClient).not.toThrow();
      expect(npmClient()).toBe('npm');
    });
  });

  describe('when both package-lock.json and yarn.lock are found', () => {
    const MOCKED_FILES = ['package-lock.json', 'yarn.lock'];

    it('returns yarn', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(npmClient).not.toThrow();
      expect(npmClient()).toBe('yarn');
    });
  });
});

describe('detectClient', () => {
  beforeEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when lerna.json is found', () => {
    const MOCKED_FILES = ['lerna.json'];

    it('returns lerna', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(detectClient).not.toThrow();
      expect(detectClient()).toBe('lerna');
    });
  });

  describe('when lerna.json is not found', () => {
    const MOCKED_FILES = ['yarn.lock'];

    it('returns the npm client', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(detectClient).not.toThrow();
      expect(detectClient()).toBe('yarn');
    });
  });
});
