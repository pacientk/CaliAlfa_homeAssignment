module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scope is the FSD layer, the feature, or the component touched.
    'scope-empty': [1, 'never'],
    'body-max-line-length': [0],
  },
};
