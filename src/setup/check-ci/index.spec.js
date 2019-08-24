const { checkCiStep } = require('./');
const validations = require('../../utils/validations');
const utils = require('../utils');

jest.mock('../../utils/validations');
jest.mock('../utils');

describe('checkCiStep', () => {
  afterEach(() => utils.warn.mockClear());

  it('warns the user if a CI script is missing', () => {
    validations.hasCiScript.mockReturnValue(false);

    checkCiStep();

    expect(utils.warn).toHaveBeenCalledTimes(1);
  });

  it('does not warn the user if a CI script is defined', () => {
    validations.hasCiScript.mockReturnValue(true);

    checkCiStep();

    expect(utils.warn).not.toHaveBeenCalled();
  });
});
