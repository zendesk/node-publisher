const { validVersion } = require('../utils');
const { publish } = require('./yarn');

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
      expect(options.execCommand.mock.calls[0][0]).toBe(
        'yarn publish --new-version patch'
      );
    });
  });
});
