module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:vue/essential'
  ],
  plugins: [
    'vue'
  ],
  rules: {
  },
  "overrides": [{
    "files": ["*.vue"],
    "rules": {
      "indent": "off"
    }
  }]
}
