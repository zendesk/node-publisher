const fs = require('fs');
const {
  versionTransformer,
  nvmrcStep,
  NVM_PATH,
  NVM_CONFIG_PATH
} = require('./');
const utils = require('../utils');

jest.mock('fs');
jest.mock('../utils');

describe('versionTransformer', () => {
  describe('when isFinal flag is true', () => {
    const isFinal = true;

    it('returns the version with the "v" prefix', () => {
      expect(versionTransformer('9.11.1', [], { isFinal })).toBe('v9.11.1');
      expect(versionTransformer('v9.11.1', [], { isFinal })).toBe('v9.11.1');
    });
  });

  describe('when isFinal flag is false', () => {
    const isFinal = false;

    it('returns the version as input by the user', () => {
      expect(versionTransformer('9.11.1', [], { isFinal })).toBe('9.11.1');
      expect(versionTransformer('v9.11.1', [], { isFinal })).toBe('v9.11.1');
    });
  });
});

describe('nvmrcStep', () => {
  let MOCKED_FILES = [];

  beforeEach(() => {
    require('fs').__setMockFiles(MOCKED_FILES);
    utils.ask.mockReturnValue('v9.11.0');
  });
  afterEach(() => {
    utils.ask.mockClear();
    fs.writeFileSync.mockClear();
  });
  afterAll(() => require('fs').__setMockFiles([]));

  describe('when .nvmrc file exists', () => {
    beforeAll(() => {
      MOCKED_FILES.push('.nvmrc');
    });

    it('does not ask for the node version', async () => {
      try {
        await nvmrcStep();
      } catch (_) {
        expect(utils.ask).not.toHaveBeenCalled();
      }
    });

    it('does not generate a .nvmrc file', async () => {
      try {
        await nvmrcStep();
      } catch (_) {
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      }
    });
  });

  describe('when .nvmrc file does not exist', () => {
    beforeAll(() => {
      MOCKED_FILES = [NVM_PATH];
    });

    it('asks for the node version', async () => {
      try {
        await nvmrcStep();
      } catch (_) {
        expect(utils.ask).not.toHaveBeenCalledTimes(1);
      }
    });

    it('generates a .nvmrc file', async () => {
      try {
        await nvmrcStep();
      } catch (_) {
        expect(fs.writeFileSync).not.toHaveBeenCalledTimes(1);
        expect(fs.writeFileSync).not.toHaveBeenCalledWith(
          NVM_CONFIG_PATH,
          'v9.11.0',
          'utf-8'
        );
      }
    });
  });
});
