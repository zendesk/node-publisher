const { isGitRepo, gitBranches, releaseBranchStep } = require('./');
const utils = require('../utils');

jest.mock('fs');
jest.mock('child_process');
jest.mock('../utils');

require('child_process').__permitCommands(['git']);

describe('isGitRepo', () => {
  afterEach(() => {
    require('fs').__setMockFiles([]);
  });

  describe('when .git directory exists', () => {
    const MOCKED_FILES = ['.git'];

    it('returns true', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(isGitRepo()).toBe(true);
    });
  });

  describe('when .git directory does not exist', () => {
    it('returns false', () => {
      expect(isGitRepo()).toBe(false);
    });
  });
});

describe('gitBranches', () => {
  describe('when the first branch is the current branch', () => {
    const rawBranches = `* abc-branch-xyz
    master
    my-branch-123`;

    it('returns the git branches correctly', () => {
      require('child_process').__setReturnValues({
        'git branch': rawBranches
      });

      expect(gitBranches()).toEqual([
        'abc-branch-xyz',
        'master',
        'my-branch-123'
      ]);
    });
  });

  describe('when the second branch is the current branch', () => {
    const rawBranches = `abc-branch-xyz
    * master
    my-branch-123`;

    it('returns the git branches correctly', () => {
      require('child_process').__setReturnValues({
        'git branch': rawBranches
      });

      expect(gitBranches()).toEqual([
        'abc-branch-xyz',
        'master',
        'my-branch-123'
      ]);
    });
  });
});

describe('releaseBranchStep', () => {
  let MOCKED_FILES = [];

  beforeEach(() => require('fs').__setMockFiles(MOCKED_FILES));
  afterEach(() => {
    utils.ask.mockClear();
    utils.addScript.mockClear();
  });
  afterAll(() => require('fs').__setMockFiles([]));

  describe('when root is not a git directory', () => {
    it('throws an error', async () => {
      const error =
        'This is not a Git repository. Run `git init` before running this setup.';

      await expect(releaseBranchStep()).rejects.toThrow(error);
    });

    it('does not ask for the release branch', async () => {
      try {
        await releaseBranchStep();
      } catch (_) {
        expect(utils.ask).not.toHaveBeenCalled();
      }
    });

    it('does not add a release script to package.json', async () => {
      try {
        await releaseBranchStep();
      } catch (_) {
        expect(utils.addScript).not.toHaveBeenCalled();
      }
    });
  });

  describe('when root is a git directory', () => {
    beforeAll(() => {
      MOCKED_FILES = ['.git'];
    });

    it('does not throw an error', async () => {
      await expect(releaseBranchStep()).resolves.not.toThrow();
    });

    it('asks for the release branch', async () => {
      await releaseBranchStep();

      expect(utils.ask).toHaveBeenCalledTimes(1);
    });

    it('adds a release script to package.json', async () => {
      await releaseBranchStep();

      expect(utils.addScript).toHaveBeenCalledTimes(1);
    });
  });
});
