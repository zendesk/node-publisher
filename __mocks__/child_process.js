'use strict';

const childProcess = jest.genMockFromModule('child_process');

let allowedCommands = [];
const __permitCommands = commands => {
  allowedCommands = commands;
};

let returnValues = {};
const __setReturnValues = retValues => {
  returnValues = retValues;
};

const execSync = jest.fn().mockImplementation(execCommand => {
  const isAllowed =
    allowedCommands.filter(cmd => execCommand.startsWith(cmd)).length > 0;

  if (!isAllowed) {
    throw new Error();
  }

  if (returnValues[execCommand]) {
    return returnValues[execCommand];
  }
});

childProcess.__permitCommands = __permitCommands;
childProcess.__setReturnValues = __setReturnValues;
childProcess.execSync = execSync;

module.exports = childProcess;
