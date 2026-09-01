module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // The React Compiler auto-memoises components and hooks. Hand-written
    // React.memo / useMemo / useCallback is banned — see docs/architecture/coding-rules.md.
    'babel-plugin-react-compiler',
    // Reanimated's plugin must stay last.
    'react-native-reanimated/plugin',
  ],
};
