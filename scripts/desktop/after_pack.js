const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isMac = process.platform === 'darwin';

module.exports = async (context) => {
  if (!isMac || context.electronPlatformName !== 'darwin') {
    return;
  }

  const hasSigningIdentity = Boolean(process.env.CSC_NAME || process.env.APPLE_SIGN_IDENTITY);

  if (hasSigningIdentity) {
    return;
  }

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);

  if (!fs.existsSync(appPath)) {
    throw new Error(`Packaged app not found at ${appPath}`);
  }

  execFileSync(
    'codesign',
    ['--force', '--deep', '--sign', '-', appPath],
    { stdio: 'inherit' },
  );
};
