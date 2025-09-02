const { publish } = require('./yarn-berry');
const { packageJson } = require('../utils/package');

jest.mock('../utils/package');

describe('publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('without preid', () => {
    const options = {
      nextVersion: 'patch',
      preid: undefined,
      execCommand: jest.fn()
    };

    beforeEach(() => {
      packageJson.mockReturnValue({ version: '1.0.1' });
    });

    it('publishes new version using yarn v2+ syntax', () => {
      expect(() => publish(options)).not.toThrow();

      expect(options.execCommand).toHaveBeenNthCalledWith(
        1,
        'yarn version patch'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        2,
        'git add package.json yarn.lock'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        3,
        'git commit -m "v1.0.1"'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        4,
        'git tag "v1.0.1"'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        5,
        'git push origin master --follow-tags'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        6,
        'yarn npm publish'
      );
    });
  });

  describe('with preid', () => {
    const options = {
      nextVersion: 'major',
      preid: 'alpha',
      execCommand: jest.fn()
    };

    beforeEach(() => {
      packageJson.mockReturnValue({ version: '2.0.0-alpha.0' });
    });

    it('publishes new version using yarn v2+ syntax', () => {
      expect(() => publish(options)).not.toThrow();

      expect(options.execCommand).toHaveBeenNthCalledWith(
        1,
        'yarn version major'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        2,
        'git add package.json yarn.lock'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        3,
        'git commit -m "v2.0.0-alpha.0"'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        4,
        'git tag "v2.0.0-alpha.0"'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        5,
        'git push origin master --follow-tags'
      );

      expect(options.execCommand).toHaveBeenNthCalledWith(
        6,
        'yarn npm publish'
      );
    });
  });
});
