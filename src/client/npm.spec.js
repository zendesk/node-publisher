const { publish } = require('./npm');

describe('publish', () => {
  const options = {
    nextVersion: 'patch',
    execCommand: jest.fn()
  };

  it('publishes new version', () => {
    expect(() => publish(options)).not.toThrow();
    expect(options.execCommand.mock.calls[0][0]).toBe('npm version patch');
    expect(options.execCommand.mock.calls[1][0]).toBe('npm publish');
  });
});
