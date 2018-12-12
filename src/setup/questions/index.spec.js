const { generateQuestions, askNvmVersion } = require('./');
const { names, messages } = require('../constants');

describe('generateQuestions', () => {
  const baseIssues = {
    [names.DEFAULT_BRANCH]: {
      choices: ['master', 'my-branch']
    },
    nvmInstalled: () => true,
    nvmrcExists: () => true
  };

  const baseQuestions = [
    {
      type: 'list',
      name: names.DEFAULT_BRANCH,
      message: messages.DEFAULT_BRANCH,
      choices: ['master', 'my-branch']
    }
  ];

  it('returns the expected set of questions', () => {
    expect(generateQuestions(baseIssues)).toEqual(baseQuestions);
  });

  describe('when NVM is not installed', () => {
    describe('and .nvmrc file exists', () => {
      const issues = Object.assign({}, baseIssues, {
        nvmInstalled: () => false,
        nvmrcExists: () => true
      });

      it('returns the expected set of questions', () => {
        expect(generateQuestions(issues)).toEqual(baseQuestions);
      });
    });

    describe('and .nvmrc file does not exist', () => {
      const issues = Object.assign({}, baseIssues, {
        nvmInstalled: () => false,
        nvmrcExists: () => false
      });

      it('returns the expected set of questions', () => {
        expect(generateQuestions(issues)).toEqual(
          baseQuestions.concat([
            {
              type: 'confirm',
              name: names.GENERATE_NVMRC,
              message: messages.GENERATE_NVMRC
            }
          ])
        );
      });
    });
  });

  describe('when .nvmrc file is missing', () => {});

  describe('when a build script is missing from the package.json file', () => {
    it('returns the expected set of questions', () => {
      const issues = Object.assign({}, baseIssues, {
        [names.BUILD_MISSING]: true
      });

      expect(generateQuestions(issues)).toEqual(
        baseQuestions.concat([
          {
            type: 'confirm',
            name: names.BUILD_MISSING,
            message: messages.BUILD_MISSING
          }
        ])
      );
    });
  });

  describe('when a ci script is missing from the package.json file', () => {
    it('returns the expected set of questions', () => {
      const issues = Object.assign({}, baseIssues, {
        [names.CI_MISSING]: true
      });

      expect(generateQuestions(issues)).toEqual(
        baseQuestions.concat([
          {
            type: 'confirm',
            name: names.CI_MISSING,
            message: messages.CI_MISSING
          }
        ])
      );
    });
  });
});

describe('askNvmVersion', () => {
  it('returns the expected set of questions', () => {
    const mockValidate = () => {};
    const mockTransformer = () => {};
    const version = {
      default: 'v9.11.1',
      validate: mockValidate,
      transformer: mockTransformer
    };

    expect(askNvmVersion(version)).toEqual({
      type: 'input',
      name: names.NVM_VERSION,
      message: messages.NVM_VERSION,
      default: 'v9.11.1',
      validate: mockValidate,
      transformer: mockTransformer
    });
  });
});
