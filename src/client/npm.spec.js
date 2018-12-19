const { publish } = require('./npm');

describe('publish', () => {
  describe('without preid', () => {
    const options = {
      nextVersion: 'patch',
      preid: undefined,
      execCommand: jest.fn()
    };

    it('publishes new version without a prerelease tag', () => {
      expect(() => publish(options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe('npm version patch');
      expect(options.execCommand.mock.calls[1][0]).toBe('npm publish');
    });
  });

  describe('with preid', () => {
    const options = {
      nextVersion: 'major',
      preid: 'alpha',
      execCommand: jest.fn()
    };

    it('publishes new version with a prerelease tag', () => {
      expect(() => publish(options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe(
        'npm version major --preid=alpha'
      );
      expect(options.execCommand.mock.calls[1][0]).toBe('npm publish');
    });
  });
});
