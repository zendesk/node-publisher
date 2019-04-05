const inquirer = require('inquirer');
const validations = require('../utils/validations');
const { names, warnings } = require('./constants');
const questions = require('./questions');
const tasks = require('./tasks');
const { versionTransformer } = require('../utils');
const {
  gitBranches,
  validateVersion,
  searchForIssues,
  askSetupQuestions,
  run
} = require('./');

jest.mock('child_process');
jest.mock('inquirer');
jest.mock('../utils/validations');
jest.mock('./questions');
jest.mock('./tasks');

require('child_process').__permitCommands(['git', 'node']);

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

describe('validateVersion', () => {
  describe('when version is valid', () => {
    it('returns true', () => {
      expect(validateVersion('9.11.1')).toBe(true);
    });
  });

  describe('when version is invalid', () => {
    it('returns an error message', () => {
      expect(validateVersion('a.b.c')).toBe(
        'The specified version is not a valid semver. Examples of valid semver: 1.2.3, 42.6.7.9.3-alpha, etc.'
      );
    });
  });
});

describe('searchForIssues', () => {
  beforeAll(() => {
    require('child_process').__setReturnValues({
      'git branch': 'master',
      'node -v': 'v9.11.1\n'
    });
  });

  beforeEach(() => {
    validations.isGitProject.mockReturnValue(true);
    validations.isNvmInstalled.mockReturnValue(true);
    validations.nvmrcExists.mockReturnValue(true);
    validations.hasBuildScript.mockReturnValue(true);
    validations.hasCiScript.mockReturnValue(true);
  });

  describe('when project uses git', () => {
    it('contains the default branch issue', () => {
      expect(searchForIssues()).toMatchObject({
        [names.DEFAULT_BRANCH]: { choices: ['master'] }
      });
    });
  });

  describe('when project does not use git', () => {
    it('throws', () => {
      validations.isGitProject.mockReturnValue(false);

      expect(searchForIssues).toThrow();
    });
  });

  describe('when NVM is installed', () => {
    it('does not contain the NVM missing issue', () => {
      expect(searchForIssues()).not.toMatchObject({
        [names.GENERATE_NVMRC]: true
      });
    });
  });

  describe('when NVM is not installed', () => {
    it('contains the NVM missing issue', () => {
      validations.isNvmInstalled.mockReturnValue(false);

      expect(searchForIssues()).toMatchObject({
        [names.GENERATE_NVMRC]: true
      });
    });
  });

  describe('when the .nvmrc file exists', () => {
    it('does not contain the NVM version issue', () => {
      expect(searchForIssues()).not.toMatchObject({
        [names.NVM_VERSION]: {
          default: 'v9.11.1',
          validate: validateVersion,
          transformer: versionTransformer
        }
      });
    });
  });

  describe('when the .nvmrc file does not exist', () => {
    it('contains the NVM version issue', () => {
      validations.nvmrcExists.mockReturnValue(false);

      expect(searchForIssues()).toMatchObject({
        [names.NVM_VERSION]: {
          default: 'v9.11.1',
          validate: validateVersion,
          transformer: versionTransformer
        }
      });
    });
  });

  describe('when the package.json contains a build script', () => {
    it('does not contain the build missing issue', () => {
      expect(searchForIssues()).not.toMatchObject({
        [names.BUILD_MISSING]: true
      });
    });
  });

  describe('when the package.json does not contain a build script', () => {
    it('contains the build missing issue', () => {
      validations.hasBuildScript.mockReturnValue(false);

      expect(searchForIssues()).toMatchObject({
        [names.BUILD_MISSING]: true
      });
    });
  });

  describe('when the package.json contains a valid test runner script', () => {
    it('does not contain the ci missing issue', () => {
      expect(searchForIssues()).not.toMatchObject({
        [names.CI_MISSING]: true
      });
    });
  });

  describe('when the package.json does not contain a valid test runner script', () => {
    it('contains the ci missing issue', () => {
      validations.hasCiScript.mockReturnValue(false);

      expect(searchForIssues()).toMatchObject({
        [names.CI_MISSING]: true
      });
    });
  });
});

describe('askSetupQuestions', () => {
  let issues;

  beforeAll(() => {
    questions.generateQuestions.mockReturnValue([]);
    questions.askNvmVersion.mockReturnValue([]);
  });

  afterEach(() => inquirer.prompt.mockClear());

  describe('when .nvmrc file exists', () => {
    it('skips the second round of questioning', async () => {
      await askSetupQuestions({
        nvmrcExists: () => true
      });

      expect(inquirer.prompt).toHaveBeenCalledTimes(1);
    });
  });

  describe('when .nvmrc file does not exist', () => {
    beforeEach(() => {
      issues = {
        nvmrcExists: () => false
      };
    });

    describe('and the user does not want a CI script to be generated', () => {
      it('skips the second round of questioning', async () => {
        inquirer.prompt.mockImplementation(async () => ({
          [names.CI_MISSING]: false
        }));

        await askSetupQuestions({
          nvmrcExists: () => true
        });

        expect(inquirer.prompt).toHaveBeenCalledTimes(1);
      });
    });

    describe('and NVM is installed', () => {
      it('proceeds with the second round of questioning', async () => {
        inquirer.prompt.mockImplementation(async () => ({
          [names.NVM_VERSION]: '9.11.1',
          [names.CI_MISSING]: true
        }));

        await askSetupQuestions(
          Object.assign(issues, {
            nvmInstalled: () => true
          })
        );

        expect(inquirer.prompt).toHaveBeenCalledTimes(2);
      });
    });

    describe('and NVM is not installed', () => {
      beforeEach(() => {
        issues = Object.assign(issues, {
          nvmInstalled: () => false
        });
      });

      describe('but the user wants a .nvmrc file anyway', () => {
        it('proceeds with the second round of questioning', async () => {
          inquirer.prompt
            .mockImplementationOnce(async () => ({
              [names.GENERATE_NVMRC]: true,
              [names.CI_MISSING]: true
            }))
            .mockImplementationOnce(async () => ({
              [names.NVM_VERSION]: '9.11.1'
            }));

          await askSetupQuestions(issues);

          expect(inquirer.prompt).toHaveBeenCalledTimes(2);
        });
      });

      describe('and the user does not want a .nvmrc file', () => {
        it('skips the second round of questioning', async () => {
          inquirer.prompt.mockImplementation(async () => ({
            [names.GENERATE_NVMRC]: false,
            [names.CI_MISSING]: true
          }));

          await askSetupQuestions(issues);

          expect(inquirer.prompt).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});

describe('run', () => {
  let issues, answers;

  beforeEach(() => {
    issues = {
      nvmInstalled: () => true,
      nvmrcExists: () => true
    };

    answers = {
      [names.NVM_VERSION]: '9.11.1',
      [names.GENERATE_NVMRC]: true
    };
  });

  afterEach(() => {
    tasks.updatePackageJson.mockClear();
    tasks.generateNvmrcFile.mockClear();
    tasks.warn.mockClear();
  });

  it('updates the package.json file', () => {
    run(issues, answers);

    expect(tasks.updatePackageJson).toHaveBeenCalledTimes(1);
  });

  describe('when a CI script is missing', () => {
    describe('and a user wants to generate one', () => {
      it('warns the user to define her testing procedure under the generated CI script', () => {
        issues = Object.assign(issues, { [names.CI_MISSING]: true });

        run(issues, answers);

        expect(tasks.warn).toHaveBeenCalledTimes(1);
        expect(tasks.warn).toHaveBeenCalledWith(warnings.CI_MISSING);
      });
    });

    describe('and a user does not want to generate one', () => {
      beforeEach(() => {
        answers = { [names.CI_MISSING]: false };
        run(issues, answers);
      });

      it('warns the user to use a custom release process', () => {
        expect(tasks.warn).toHaveBeenCalledTimes(1);
        expect(tasks.warn).toHaveBeenCalledWith(warnings.CUSTOM_CONFIG);
      });

      it('returns', () => {
        expect(tasks.updatePackageJson).not.toHaveBeenCalled();
        expect(tasks.generateNvmrcFile).not.toHaveBeenCalled();
      });
    });
  });

  describe('when .nvmrc exists', () => {
    it('skips any further tasks', () => {
      run(issues, answers);

      expect(tasks.generateNvmrcFile).not.toHaveBeenCalled();
      expect(tasks.warn).not.toHaveBeenCalled();
    });
  });

  describe('when .nvmrc does not exist', () => {
    beforeEach(() => {
      issues = Object.assign(issues, {
        nvmrcExists: () => false
      });
    });

    describe('and NVM is installed', () => {
      beforeEach(() => run(issues, answers));

      it('generates a .nvmrc file', () => {
        expect(tasks.generateNvmrcFile).toHaveBeenCalledTimes(1);
      });

      it('does not warn the user to install NVM', () => {
        expect(tasks.warn).not.toHaveBeenCalled();
      });
    });

    describe('and NVM is not installed', () => {
      beforeEach(() => {
        issues = Object.assign(issues, {
          nvmInstalled: () => false
        });
      });

      describe('but the user wants a .nvmrc file anyway', () => {
        beforeEach(() => run(issues, answers));

        it('generates a .nvmrc file', () => {
          expect(tasks.generateNvmrcFile).toHaveBeenCalledTimes(1);
        });

        it('warns the user to install NVM', () => {
          expect(tasks.warn).toHaveBeenCalledTimes(1);
          expect(tasks.warn).toHaveBeenCalledWith(warnings.NVM_NOT_INSTALLED);
        });
      });

      describe('and the user does not want a .nvmrc file', () => {
        beforeEach(() => {
          answers = { [names.GENERATE_NVMRC]: false };
          run(issues, answers);
        });

        it('warns the user to use a custom release process', () => {
          expect(tasks.warn).toHaveBeenCalledTimes(1);
          expect(tasks.warn).toHaveBeenCalledWith(warnings.CUSTOM_CONFIG);
        });

        it('returns', () => {
          expect(tasks.updatePackageJson).not.toHaveBeenCalled();
          expect(tasks.generateNvmrcFile).not.toHaveBeenCalled();
        });
      });
    });
  });
});
