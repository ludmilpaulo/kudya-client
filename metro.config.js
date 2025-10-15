const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Hermes
config.transformer = {
  ...config.transformer,
  hermesParser: true,
};

// Fix for TurboModule issues
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
};

module.exports = config;
