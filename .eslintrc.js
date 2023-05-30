module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    'plugin:react/jsx-runtime',
    'plugin:react/recommended',
    "plugin:react-hooks/recommended",
    "plugin:testing-library/react",
    "plugin:jest/recommended",
    "plugin:jest-dom/recommended",
    'plugin:prettier/recommended',
    'prettier',
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },

  plugins: ["react", "react-hooks", "testing-library", "jest", "jest-dom"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": 0,
    "react/no-children-prop": 0,
    "react/no-unescaped-entities": 0,
    "no-prototype-builtins": 0,
    "no-async-promise-executor": 0
  },
  settings: {
    react: {
      version: "detect"
    }
  }
};
