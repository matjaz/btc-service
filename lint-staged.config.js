export default {
    "src/**/*.js": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "examples/**/*.js": [
      "prettier --write"
    ],

    "package.json": ["prettier --write"],
    "src/**/*.ts": () => "tsc --noEmit",
  };
