const { publish } = require('./yarn');

describe('publish', () => {
  describe('without preid', () => {
    const options = {
      nextVersion: 'patch',
      preid: undefined,
      execCommand: jest.fn()
    };

    it('publishes new version without a prerelease id', () => {
      expect(() => publish(options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe(
        'yarn publish --new-version patch'
      );
    });
  });

  describe('with preid', () => {
    const options = {
      nextVersion: 'major',
      preid: 'alpha',
      execCommand: jest.fn()
    };

    it('publishes new version without a prerelease id', () => {
      expect(() => publish(options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe(
        'yarn publish --new-version major'
      );
    });
  });
});
