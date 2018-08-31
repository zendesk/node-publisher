const { publish } = require('./npm');

describe('publish', () => {
  const options = {
    execCommand: jest.fn()
  };

  it('publishes new version', () => {
    expect(() => publish('patch', options)).not.toThrow();
    expect(options.execCommand.mock.calls[0][0]).toBe('npm version patch');
    expect(options.execCommand.mock.calls[1][0]).toBe('npm publish');
  });
});
