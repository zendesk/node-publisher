const { validVersion } = require('../utils');
const { publish } = require('./lerna');

jest.mock('fs');

describe('publish', () => {
  const options = {
    validVersion,
    execCommand: jest.fn()
  };

  describe('when lerna was not bootstrapped', () => {
    const MOCKED_FILES = ['not_lerna.json'];

    it('throws an error', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(() => publish(options)).toThrow(
        'Lerna configuration could not be found. Make sure to bootstrap lerna first.'
      );
    });
  });

  describe('when lerna was bootstrapped', () => {
    const MOCKED_FILES = ['lerna.json'];

    it('publishes new version', () => {
      require('fs').__setMockFiles(MOCKED_FILES);

      expect(() => publish(options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe('lerna publish');
    });
  });
});
