const { buildReleaseConfig } = require('./');

describe('buildReleaseConfig', () => {
  describe('when build script is defined in package.json', () => {
    const baseEnv = { testRunner: 'travis', withBuildStep: true };

    describe('and npm is the detected npm client', () => {
      const env = Object.assign({}, baseEnv, { npmClient: 'npm' });

      it('returns a configuration with the build step', () => {
        const config = buildReleaseConfig(env);

        expect(config.prepare[config.prepare.length - 1]).toBe('npm install');
        expect(config.test[0]).toBe('npm run travis');
        expect(config.build[0]).toBe('npm run build');
      });
    });

    describe('and yarn is the detected npm client', () => {
      const env = Object.assign({}, baseEnv, { npmClient: 'yarn' });

      it('returns a configuration with the build step', () => {
        const config = buildReleaseConfig(env);

        expect(config.prepare[config.prepare.length - 1]).toBe('yarn install');
        expect(config.test[0]).toBe('yarn travis');
        expect(config.build[0]).toBe('yarn build');
      });
    });
  });

  describe('when build script is not defined in package.json', () => {
    const env = {
      npmClient: 'yarn',
      testRunner: 'travis',
      withBuildStep: false
    };

    it('returns a configuration without the build step', () => {
      const config = buildReleaseConfig(env);

      expect(config.build).toBeUndefined();
    });
  });
});
