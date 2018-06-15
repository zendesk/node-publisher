'use strict';

const childProcess = jest.genMockFromModule('child_process');

let allowedCommands = [];
const __permitCommands = commands => {
  allowedCommands = commands;
};

const execSync = execCommand => {
  const isAllowed =
    allowedCommands.filter(cmd => execCommand.startsWith(cmd)).length > 0;

  if (!isAllowed) {
    throw new Error();
  }
};

childProcess.__permitCommands = __permitCommands;
childProcess.execSync = execSync;

module.exports = childProcess;
