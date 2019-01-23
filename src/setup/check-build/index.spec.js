const { checkBuildStep } = require('./');
const validations = require('../../utils/validations');
const utils = require('../utils');

jest.mock('../../utils/validations');
jest.mock('../utils');

describe('checkBuildStep', () => {
  afterEach(() => utils.warn.mockClear());

  it('warns the user if a CI script is missing', () => {
    validations.hasBuildScript.mockReturnValue(false);

    checkBuildStep();

    expect(utils.warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn the user if a CI script is defined', () => {
    validations.hasBuildScript.mockReturnValue(true);

    checkBuildStep();

    expect(utils.warn).not.toHaveBeenCalled();
  });
});
