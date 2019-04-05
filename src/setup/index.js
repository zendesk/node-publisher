const childProcess = require('child_process');
const semver = require('semver');
const inquirer = require('inquirer');
const { generateQuestions, askNvmVersion } = require('./questions');
const {
  names: {
    DEFAULT_BRANCH,
    GENERATE_NVMRC,
    NVM_VERSION,
    BUILD_MISSING,
    CI_MISSING
  },
  warnings,
  errors
} = require('./constants');
const { updatePackageJson, generateNvmrcFile, warn } = require('./tasks');
const { versionTransformer } = require('../utils');
const {
  isGitProject,
  isNvmInstalled,
  nvmrcExists,
  hasBuildScript,
  hasCiScript
} = require('../utils/validations');

const gitBranches = () => {
  const rawBranches = childProcess.execSync('git branch').toString();
  const branchesRegex = /^\s*(?:\* )?(.+)/gm;
  const branches = [];

  let match = branchesRegex.exec(rawBranches);
  while (match !== null) {
    branches.push(match[1].trim());
    match = branchesRegex.exec(rawBranches);
  }

  return branches;
};

const validateVersion = version =>
  semver.valid(version) ? true : errors.NVM_VERSION;

const searchForIssues = () => {
  const issues = {};

  if (isGitProject()) {
    issues[DEFAULT_BRANCH] = {
      choices: gitBranches()
    };
  } else {
    throw new Error(errors.WITHOUT_GIT);
  }

  const nvmInstalled = isNvmInstalled();
  if (!nvmInstalled) {
    issues[GENERATE_NVMRC] = true;
  }

  const nvmrcFileExists = nvmrcExists();
  if (!nvmrcFileExists) {
    issues[NVM_VERSION] = {
      default: childProcess
        .execSync('node -v')
        .toString()
        .trim(),
      validate: validateVersion,
      transformer: versionTransformer
    };
  }

  if (!hasBuildScript()) {
    issues[BUILD_MISSING] = true;
  }

  if (!hasCiScript()) {
    issues[CI_MISSING] = true;
  }

  issues.nvmInstalled = () => nvmInstalled;
  issues.nvmrcExists = () => nvmrcFileExists;

  return issues;
};

async function askSetupQuestions(issues) {
  let questions = generateQuestions(issues);
  const answers = await inquirer.prompt(questions);

  if (!issues.nvmrcExists()) {
    if (
      issues.nvmInstalled() ||
      (!issues.nvmInstalled() && answers[GENERATE_NVMRC] === true)
    ) {
      questions = [askNvmVersion(issues[NVM_VERSION])];
      const secondRoundAnswers = await inquirer.prompt(questions);

      answers[NVM_VERSION] = secondRoundAnswers[NVM_VERSION];
    }
  }

  return answers;
}

const run = (issues, answers) => {
  if (answers[GENERATE_NVMRC] === false || answers[CI_MISSING] === false) {
    return warn(warnings.CUSTOM_CONFIG);
  }

  updatePackageJson(answers);

  if (answers[BUILD_MISSING] === true) {
    warn(warnings.BUILD_MISSING);
  }

  if (issues[CI_MISSING] === true) {
    warn(warnings.CI_MISSING);
  }

  if (!issues.nvmrcExists()) {
    generateNvmrcFile(answers[NVM_VERSION]);
    if (!issues.nvmInstalled()) {
      warn(warnings.NVM_NOT_INSTALLED);
    }
  }
};

module.exports = {
  gitBranches,
  validateVersion,
  searchForIssues,
  askSetupQuestions,
  run
};
