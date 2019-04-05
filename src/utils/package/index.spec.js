const { packageJson } = require('./index');

jest.mock('fs');

describe('packageJson', () => {
  it('returns the package.json as a JSON object', () => {
    require('fs').__setReadFileSyncReturnValue(
      'package.json',
      JSON.stringify({
        scripts: {
          test: 'jest'
        }
      })
    );

    expect(packageJson()).toEqual({
      scripts: {
        test: 'jest'
      }
    });
  });
});
