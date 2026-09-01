const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * FSD path aliases. Kept in sync with the `paths` map in tsconfig.json —
 * TypeScript resolves types through that map, Metro resolves modules through this one.
 */
const alias = {
  '@app': path.resolve(__dirname, 'src/app'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@widgets': path.resolve(__dirname, 'src/widgets'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@entities': path.resolve(__dirname, 'src/entities'),
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@ui': path.resolve(__dirname, 'src/shared/ui'),
  '@lib': path.resolve(__dirname, 'src/shared/lib'),
  '@api': path.resolve(__dirname, 'src/shared/api'),
  '@services': path.resolve(__dirname, 'src/shared/services'),
  '@config': path.resolve(__dirname, 'src/shared/config'),
  '@store': path.resolve(__dirname, 'src/shared/store'),
};

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {
  resolver: { extraNodeModules: alias },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
