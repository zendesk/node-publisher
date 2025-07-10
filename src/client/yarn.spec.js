const { publish } = require('./yarn');

// Mock execSync to control yarn version detection
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

const { execSync } = require('child_process');

describe('publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with yarn v1', () => {
    beforeEach(() => {
      execSync.mockReturnValue('1.22.10');
    });

    describe('without preid', () => {
      const options = {
        nextVersion: 'patch',
        preid: undefined,
        execCommand: jest.fn()
      };

      it('publishes new version using yarn v1 syntax', () => {
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

      it('publishes new version using yarn v1 syntax', () => {
        expect(() => publish(options)).not.toThrow();
        expect(options.execCommand.mock.calls[0][0]).toBe(
          'yarn publish --new-version major'
        );
      });
    });
  });

  describe('with yarn v2+', () => {
    beforeEach(() => {
      execSync.mockReturnValue('4.1.0');
    });

    describe('without preid', () => {
      const options = {
        nextVersion: 'patch',
        preid: undefined,
        execCommand: jest.fn()
      };

      it('publishes new version using yarn v2+ syntax', () => {
        expect(() => publish(options)).not.toThrow();
        expect(options.execCommand.mock.calls[0][0]).toBe(
          'yarn npm publish --tag patch'
        );
      });
    });

    describe('with preid', () => {
      const options = {
        nextVersion: 'major',
        preid: 'alpha',
        execCommand: jest.fn()
      };

      it('publishes new version using yarn v2+ syntax', () => {
        expect(() => publish(options)).not.toThrow();
        expect(options.execCommand.mock.calls[0][0]).toBe(
          'yarn npm publish --tag major'
        );
      });
    });
  });

  describe('when yarn version detection fails', () => {
    beforeEach(() => {
      execSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
    });

    const options = {
      nextVersion: 'patch',
      preid: undefined,
      execCommand: jest.fn()
    };

    it('defaults to yarn v1 syntax', () => {
      expect(() => publish(options)).not.toThrow();
      expect(options.execCommand.mock.calls[0][0]).toBe(
        'yarn publish --new-version patch'
      );
    });
  });
});
