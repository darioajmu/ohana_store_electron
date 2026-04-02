const { notarize } = require('@electron/notarize');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isMac = process.platform === 'darwin';

const signRubyRuntime = (appOutDir, appName, identity) => {
  const appPath = path.join(appOutDir, `${appName}.app`);
  const resourcesPath = path.join(appPath, 'Contents', 'Resources');
  const runtimePath = path.join(resourcesPath, 'ruby-runtime');

  if (!fs.existsSync(runtimePath)) {
    return;
  }

  const signTarget = (targetPath) => {
    execFileSync(
      'codesign',
      [
        '--force',
        '--sign',
        identity,
        '--timestamp',
        '--options',
        'runtime',
        targetPath,
      ],
      { stdio: 'inherit' },
    );
  };

  const walk = (currentPath) => {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const absolutePath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      if (
        absolutePath.endsWith('.dylib') ||
        absolutePath.endsWith('.bundle') ||
        path.dirname(absolutePath).endsWith(path.join('ruby-runtime', 'bin'))
      ) {
        signTarget(absolutePath);
      }
    }
  };

  walk(runtimePath);
  signTarget(appPath);
};

module.exports = async (context) => {
  if (!isMac) {
    return;
  }

  const { appOutDir, packager, electronPlatformName } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const identity = process.env.CSC_NAME || process.env.APPLE_SIGN_IDENTITY;

  if (identity) {
    signRubyRuntime(appOutDir, packager.appInfo.productFilename, identity);
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log('Skipping notarization because APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, or APPLE_TEAM_ID is missing.');
    return;
  }

  await notarize({
    appBundleId: packager.appInfo.id,
    appPath: path.join(appOutDir, `${packager.appInfo.productFilename}.app`),
    appleId,
    appleIdPassword,
    teamId,
  });
};
