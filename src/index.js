const {
  loadReleaseConfig,
  execCommands,
  currentCommitId,
  rollbackCommit
} = require('./utils');
const command = require('./utils/command');

const release = (options) => {
  const { env } = options;
  const config = loadReleaseConfig(env);
  const publishClient = require(`./client/${env.publishClient}.js`);

  let failed = false;
  let commitId = null;
  try {
    execCommands(config.prepare);
    commitId = currentCommitId();
    execCommands(config.test);
    execCommands(config.build);

    if (config.publish) {
      execCommands(config.publish);
    } else {
      publishClient.publish(Object.assign(
        {}, options, { execCommand: command.exec }
      ));
    }

    execCommands(config.after_publish);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    failed = true;
  }

  if (failed) {
    if (commitId && config.rollback) {
      rollbackCommit(commitId);
    }

    execCommands(config.after_failure);
    console.log('🔥 Failed to publish new release.');
  } else {
    execCommands(config.changelog);
    execCommands(config.after_success);
    console.log('🤘 Successfully published.');
  }
};

module.exports = release;
