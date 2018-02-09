module.exports = {
    extends: "airbnb-base",
    env: {
        browser: true,
    },
    rules: {
        indent: ["error", 4, { "SwitchCase": 1 } ],
        "no-use-before-define": ["error", { "functions": false }],
        "no-plusplus": 0,
        "function-paren-newline": ["error", "consistent"],
        // "no-restricted-syntax;": ["error", { "ForOfStatement": false }],
        "no-restricted-syntax": 0,
        "no-use-before-define": 0,
        "class-methods-use-this": 0,
        "array-callback-return": 0,
    }
};