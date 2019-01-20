const { buildReleaseConfig } = require('./');
const baseEnv = { testRunner: 'travis', branch: 'master' };

describe('buildReleaseConfig', () => {
  describe('when build script is defined in package.json', () => {
    const withBuildEnv = Object.assign({}, baseEnv, { withBuildStep: true });

    describe('and npm is the detected npm client', () => {
      const env = Object.assign({}, withBuildEnv, { npmClient: 'npm' });

      it('returns a configuration with the build step', () => {
        const config = buildReleaseConfig(env);

        expect(config.prepare[config.prepare.length - 1]).toBe('npm install');
        expect(config.test[0]).toBe('npm run travis');
        expect(config.build[0]).toBe('npm run build');
      });
    });

    describe('and yarn is the detected npm client', () => {
      const env = Object.assign({}, withBuildEnv, { npmClient: 'yarn' });

      it('returns a configuration with the build step', () => {
        const config = buildReleaseConfig(env);

        expect(config.prepare[config.prepare.length - 1]).toBe('yarn install');
        expect(config.test[0]).toBe('yarn travis');
        expect(config.build[0]).toBe('yarn build');
      });
    });
  });

  describe('when build script is not defined in package.json', () => {
    const withoutBuildEnv = Object.assign({}, baseEnv, {
      npmClient: 'yarn',
      withBuildStep: false
    });

    it('returns a configuration without the build step', () => {
      const config = buildReleaseConfig(withoutBuildEnv);

      expect(config.build).toBeUndefined();
    });
  });

  describe('when the configured branch is other than master', () => {
    const customBranchEnv = Object.assign({}, baseEnv, {
      npmClient: 'yarn',
      branch: 'my-branch'
    });

    it('returns a configuration with a check ou step to the custom branch', () => {
      const config = buildReleaseConfig(customBranchEnv);

      expect(config.prepare[1]).toBe('git checkout my-branch');
    });
  });
});
