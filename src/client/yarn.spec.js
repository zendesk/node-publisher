const { publish } = require('./yarn');

describe('publish', () => {
  const options = {
    nextVersion: 'patch',
    execCommand: jest.fn()
  };

  it('publishes new version', () => {
    expect(() => publish(options)).not.toThrow();
    expect(options.execCommand.mock.calls[0][0]).toBe(
      'yarn publish --new-version patch'
    );
  });
});
