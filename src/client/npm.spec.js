const { validVersion } = require('../utils');
const { publish } = require('./npm');

describe('publish', () => {
  const options = {
    validVersion,
    execCommand: jest.fn()
  };

  describe('when version is not valid', () => {
    it('throws an error', () => {
      expect(() => publish('preminor', options)).toThrow(
        'Version argument is not supported, use either `major`, `minor` or `patch`'
      );
    });
  });

  describe('when version is valid', () => {
    it('publishes new version', () => {
      expect(() => publish('patch', options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe('npm version patch');
      expect(options.execCommand.mock.calls[1][0]).toBe('npm publish');
    });
  });
});
