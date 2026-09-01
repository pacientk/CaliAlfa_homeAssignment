const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * FSD path aliases. Kept in sync with the `paths` map in tsconfig.json and the
 * `moduleNameMapper` in jest.config.js — TypeScript resolves types through the first, Jest
 * resolves tests through the second, and Metro resolves the bundle through this one.
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

const aliasPrefixes = Object.keys(alias);

/**
 * `extraNodeModules` cannot express these aliases. Every key here starts with `@`, and Metro
 * reads a leading `@` as an npm scope: it looks up `@ui/tokens` as a whole package name
 * rather than as the prefix `@ui` plus a path, so the mapping never matched and the bundle
 * failed at the first cross-layer import. Rewriting the specifier before handing it back to
 * the default resolver is the mechanism that does work.
 *
 * The loop only fires on an exact prefix match followed by `/` or end of string, so real
 * scoped packages — `@tanstack/react-query`, `@react-navigation/native` — fall through
 * untouched.
 */
const resolveRequest = (context, moduleName, platform) => {
  const prefix = aliasPrefixes.find(
    candidate => moduleName === candidate || moduleName.startsWith(`${candidate}/`),
  );

  if (prefix === undefined) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, alias[prefix] + moduleName.slice(prefix.length), platform);
};

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {
  resolver: { resolveRequest },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
