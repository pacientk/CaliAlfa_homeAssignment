/**
 * FSD path aliases. Kept in sync with the `paths` map in tsconfig.json and the
 * `alias` map in metro.config.js — TypeScript resolves types through the first,
 * Metro resolves the bundle through the second, and Jest resolves tests through this.
 */
const moduleNameMapper = {
  '^@app/(.*)$': '<rootDir>/src/app/$1',
  '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
  '^@screens/(.*)$': '<rootDir>/src/screens/$1',
  '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
  '^@features/(.*)$': '<rootDir>/src/features/$1',
  '^@entities/(.*)$': '<rootDir>/src/entities/$1',
  '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  '^@ui/(.*)$': '<rootDir>/src/shared/ui/$1',
  '^@lib/(.*)$': '<rootDir>/src/shared/lib/$1',
  '^@api/(.*)$': '<rootDir>/src/shared/api/$1',
  '^@services/(.*)$': '<rootDir>/src/shared/services/$1',
  '^@store/(.*)$': '<rootDir>/src/shared/store/$1',
};

/**
 * Packages published as untranspiled ES modules, which Jest must transform rather than
 * `require` as-is. The React Native preset whitelists only `react-native` and
 * `@react-native*`; every entry below is a runtime dependency of the app shell that ships
 * `export` syntax in its published output.
 */
const ESM_PACKAGES = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  '@react-navigation',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-reanimated',
  '@shopify/flash-list',
];

module.exports = {
  preset: 'react-native',
  moduleNameMapper,
  transformIgnorePatterns: [`node_modules/(?!(${ESM_PACKAGES.join('|')})/)`],
};
