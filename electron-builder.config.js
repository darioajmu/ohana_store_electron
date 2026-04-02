const hasMacSigningIdentity = Boolean(process.env.CSC_NAME || process.env.APPLE_SIGN_IDENTITY);

const config = {
  appId: 'com.ohana.store',
  productName: 'Ohana Store',
  directories: {
    buildResources: 'electron/assets',
    output: 'dist',
  },
  files: ['electron/**/*', 'package.json'],
  extraResources: [
    {
      from: 'frontend/out',
      to: 'frontend-out',
    },
    {
      from: 'app',
      to: 'app-backend/app',
    },
    {
      from: 'bin',
      to: 'app-backend/bin',
    },
    {
      from: 'config',
      to: 'app-backend/config',
    },
    {
      from: 'db',
      to: 'app-backend/db',
    },
    {
      from: 'lib',
      to: 'app-backend/lib',
    },
    {
      from: 'public',
      to: 'app-backend/public',
    },
    {
      from: 'vendor',
      to: 'app-backend/vendor',
    },
    {
      from: 'Gemfile',
      to: 'app-backend/Gemfile',
    },
    {
      from: 'Gemfile.lock',
      to: 'app-backend/Gemfile.lock',
    },
    {
      from: 'Rakefile',
      to: 'app-backend/Rakefile',
    },
    {
      from: 'config.ru',
      to: 'app-backend/config.ru',
    },
    {
      from: 'tmp/desktop-runtime/ruby',
      to: 'ruby-runtime',
    },
    {
      from: 'tmp/desktop-runtime/metadata.json',
      to: 'ruby-runtime-metadata.json',
    },
  ],
  mac: {
    category: 'public.app-category.business',
    artifactName: '${productName}-${version}-${arch}.${ext}',
    gatekeeperAssess: false,
    hardenedRuntime: hasMacSigningIdentity,
    entitlements: hasMacSigningIdentity ? 'electron/entitlements.mac.plist' : undefined,
    entitlementsInherit: hasMacSigningIdentity ? 'electron/entitlements.mac.plist' : undefined,
    identity: hasMacSigningIdentity ? undefined : null,
  },
  afterPack: 'scripts/desktop/after_pack.js',
  afterSign: hasMacSigningIdentity ? 'scripts/desktop/after_sign.js' : undefined,
};

module.exports = config;
