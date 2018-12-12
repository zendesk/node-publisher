const utils = require('../../utils');
const { NVM_CONFIG_PATH, PACKAGE_JSON_PATH } = require('../../utils/constants');
const {
  buildScripts,
  updatePackageJson,
  generateNvmrcFile,
  warn
} = require('./');

jest.mock('fs');
jest.mock('../../utils');

describe('buildScripts', () => {
  describe('when the default branch is not master', () => {
    const answers = { default_branch: 'my-branch' };

    it('returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release --default-branch=my-branch'
      });
    });
  });

  describe('when the default branch is master', () => {
    const answers = { default_branch: 'master' };

    it('returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release'
      });
    });
  });

  describe('when the default branch is not given', () => {
    const answers = {};

    it('falls back to master branch and returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release'
      });
    });
  });

  describe('when the user wants to generate an empty build script', () => {
    const answers = { build_missing: true };

    it('returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release',
        build: ''
      });
    });
  });

  describe('when the user does not want to generate an empty build script', () => {
    const answers = { build_missing: false };

    it('returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release'
      });
    });
  });

  describe('when the user wants to generate an empty ci script', () => {
    const answers = { ci_missing: true };

    it('returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release',
        ci: ''
      });
    });
  });

  describe('when the user does not want to generate an empty ci script', () => {
    const answers = { ci_missing: false };

    it('returns the expected scripts object', () => {
      expect(buildScripts(answers)).toEqual({
        release: 'node-publisher release'
      });
    });
  });
});

describe('updatePackageJson', () => {
  it('writes to package.json the expected payload', () => {
    utils.packageJson.mockReturnValue({ scripts: {} });
    const mockWriteFileSync = (require('fs').writeFileSync = jest.fn());

    updatePackageJson({});

    const payload = `{
  "scripts": {
    "release": "node-publisher release"
  }
}
`;

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      PACKAGE_JSON_PATH,
      payload,
      'utf-8'
    );
  });
});

describe('generateNvmrcFile', () => {
  it('writes the specified node version to the .nvmrc file', () => {
    const mockWriteFileSync = (require('fs').writeFileSync = jest.fn());

    generateNvmrcFile('9.11.1');

    const payload = `v9.11.1
`;

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      NVM_CONFIG_PATH,
      payload,
      'utf-8'
    );
  });
});

describe('warn', () => {
  it('prepends `WARNING: ` to the message nefore console logging it', () => {
    global.console = { log: jest.fn() };

    warn('nvm not installed');

    expect(console.log).toHaveBeenCalledWith('WARNING: nvm not installed');
    console.log.mockRestore();
  });
});
