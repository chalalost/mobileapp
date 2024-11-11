module.exports = {
  env: {
    browser: true,
    jest: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended'
  ],
  plugins: ['react-hooks'],
  rules: {
    'react/jsx-pascal-case': ['error'],
    'camelcase': ['error'],
    'react/prefer-stateless-function': ['warn'],
    'react/jsx-boolean-value': ['error'],
    'react/self-closing-comp': ['error'],
    'no-console': ['error'],
    'no-debugger': ['off'],
    'semi': 'off',
    '@typescript-eslint/semi': ['error'],
    'quotes': 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    'jsx-quotes': ['error', 'prefer-double'],
    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': ['error'],
    'brace-style': 'off',
    '@typescript-eslint/brace-style': ['error'],
    'no-duplicate-imports': 'off',
    '@typescript-eslint/no-duplicate-imports': ['error'],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'react/jsx-first-prop-new-line': ['error'],
    'react/no-multi-comp': ['error'],
    'react/jsx-wrap-multilines': ['error', {
      'declaration': 'parens-new-line',
      'assignment': 'parens-new-line',
      'return': 'parens-new-line',
      'arrow': 'parens-new-line',
      'condition': 'parens-new-line',
      'logical': 'parens-new-line',
      'prop': 'parens-new-line'
    }]
  },
  ignorePatterns: ['node_modules/'],
};
