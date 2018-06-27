const command = require('./index');

jest.mock('child_process');

describe('execCommand', () => {
  const PERMIT_COMMANDS = ['echo', 'ls', 'cd'];

  describe('when command fails to be executed', () => {
    it('throws an error', () => {
      require('child_process').__permitCommands(PERMIT_COMMANDS);

      expect(() => command.exec('myCommand --some-arg')).toThrow(
        'Execution of command `myCommand --some-arg` failed.'
      );
    });
  });

  describe('when command is successfully executed', () => {
    it('returns', () => {
      require('child_process').__permitCommands(PERMIT_COMMANDS);

      expect(() => command.exec('echo "Something"')).not.toThrow();
    });
  });
});
