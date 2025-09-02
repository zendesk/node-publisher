const { npmClient, publishClient } = require('./');
const { isYarnBerry } = require('../yarn');

jest.mock('fs');

jest.mock('../yarn');

describe('npmClient', () => {
  beforeEach(() => {
    require('fs').__setMockFiles([]);

    isYarnBerry.mockImplementation(() => false);
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

  describe('when yarn.lock found', () => {
    const MOCKED_FILES = ['yarn.lock'];

    describe('and yarn version is 1', () => {
      it('returns yarn', () => {
        require('fs').__setMockFiles(MOCKED_FILES);

        expect(npmClient).not.toThrow();
        expect(npmClient()).toBe('yarn');
      });
    });

    describe('and yarn version is 4', () => {
      beforeEach(() => {
        isYarnBerry.mockImplementation(() => true);
      });

      it('returns yarn berry', () => {
        require('fs').__setMockFiles(MOCKED_FILES);

        expect(npmClient).not.toThrow();
        expect(npmClient()).toBe('yarn-berry');
      });
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

describe('publishClient', () => {
  beforeEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when lerna.json is found', () => {
    const MOCKED_FILES = ['lerna.json'];

    it('returns lerna', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(publishClient).not.toThrow();
      expect(publishClient()).toBe('lerna');
    });
  });

  describe('when lerna.json is not found', () => {
    const MOCKED_FILES = ['yarn.lock'];

    it('returns the npm client', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(publishClient).not.toThrow();
      expect(publishClient()).toBe('yarn');
    });
  });
});
