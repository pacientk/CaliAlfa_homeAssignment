/**
 * Asset linking for the React Native CLI. `npx react-native-asset` reads this file, copies
 * the fonts into the iOS target's Copy Bundle Resources phase, and registers them under
 * `UIAppFonts` in Info.plist.
 *
 * Inter is bundled rather than loaded at runtime: the design is set in it, and a font that
 * fails to download falls back to the system face silently.
 */
module.exports = {
  assets: ['./assets/fonts'],
};
