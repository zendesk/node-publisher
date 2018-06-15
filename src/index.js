const {
  loadReleaseConfig,
  execCommands,
  validVersion,
  execCommand
} = require('./utils');
const { detectClient } = require('./utils/client');

const release = nextVersion => {
  const config = loadReleaseConfig();
  const publishClient = require(`./client/${detectClient()}.js`);

  let failed = false;
  try {
    execCommands(config.prepare);
    execCommands(config.test);
    execCommands(config.build);

    if (config.publish) {
      execCommands(config.publish);
    } else {
      publishClient.publish(nextVersion, {
        validVersion,
        execCommand
      });
    }

    execCommands(config.after_publish);
  } catch (e) {
    console.error(`ERROR: ${e.message}`);
    failed = true;
  }

  if (failed) {
    execCommands(config.after_failure);
    console.log('🔥 Failed to publish new release.');
  } else {
    execCommands(config.changelog);
    execCommands(config.after_success);
    console.log('🤘 Successfully published.');
  }
};

module.exports = release;
