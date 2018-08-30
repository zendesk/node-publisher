const { publish } = require('./lerna');

describe('publish', () => {
  const options = {
    execCommand: jest.fn()
  };

  it('publishes new version', () => {
    expect(() => publish(options)).not.toThrow();
    expect(options.execCommand.mock.calls[0][0]).toBe('lerna publish');
  });
});
