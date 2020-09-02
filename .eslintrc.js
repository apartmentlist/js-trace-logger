module.exports = {
  env: {
    // es2021: true,
    node: true,
  },

  extends: [
    // 'standard' // original recommend, but seems not working
    'plugin:@typescript-eslint/recommended',
  ],

  //   files: ['*.ts'],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  plugins: ['@typescript-eslint'],

  rules: {
    '@typescript-eslint/no-explicit-any': 0,
  },
};

// module.exports = {
//   extends: [
//     'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
//   ],

//   parser: '@typescript-eslint/parser', // Specifies the ESLint parser

//   parserOptions: {
//     ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
//     sourceType: 'module', // Allows for the use of imports
//   },

//   rules: {
//     // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
//     // e.g. "@typescript-eslint/explicit-function-return-type": "off",
//   },
// };
