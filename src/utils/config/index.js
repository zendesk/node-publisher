const yaml = require('js-yaml');

const readReleaseConfig = str => yaml.safeLoad(str);

const buildReleaseConfig = env => {
  const client = env.npmClient;
  const binPathPrefix = './node_modules/.bin/';
  const scriptRunner = client === 'yarn' ? 'yarn' : 'npm run';

  const config = {
    rollback: true,
    prepare: [
      'git diff-index --quiet HEAD --',
      `git checkout ${env.branch}`,
      'git pull --rebase',
      `[[ -f .nvmrc ]] && ${binPathPrefix}check-node-version --node $(cat .nvmrc)`,
      `${client} install`
    ],
    test: [`${scriptRunner} ${env.testRunner}`],
    build: null,
    after_publish: ['git push --follow-tags origin master:master'],
    changelog: [
      `${binPathPrefix}offline-github-changelog > CHANGELOG.md`,
      'git add CHANGELOG.md',
      'git commit --allow-empty -m "Update changelog"',
      'git push origin master:master'
    ]
  };

  if (env.withBuildStep) {
    config.build = [
      `${scriptRunner} build`,
      'git diff --quiet || git commit -am "Update build file"'
    ];
  } else {
    delete config.build;
  }

  return config;
};

module.exports = {
  readReleaseConfig,
  buildReleaseConfig
};
