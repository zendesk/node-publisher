const fs = require('fs');
const path = require('path');

const publish = ({ execCommand }) => {
  if (fs.existsSync(path.resolve(process.env.PWD, 'lerna.json'))) {
    execCommand('lerna publish');
  } else {
    throw new Error(
      'Lerna configuration could not be found. Make sure to bootstrap lerna first.'
    );
  }
};

module.exports = {
  publish
};
