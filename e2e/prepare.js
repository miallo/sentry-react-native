const replace = require("replace-in-file");
const util = require("util");

const patch = require("./patch");

const exec = util.promisify(require("child_process").exec);
const copyFile = util.promisify(require("fs").copyFile);
const rmdir = util.promisify(require("fs").rmdir);

const logStdOut = ({ stdout }) => console.log(stdout);

const main = async () => {
  const version = process.argv[2];

  console.log(`Starting with version ${version}.`);

  await exec(`react-native init app --version=react-native@${version}`).then(
    logStdOut
  );

  const appCwd = `${__dirname}/app`;

  await exec(`yarn add appium wd`, { cwd: appCwd }).then(logStdOut);
  await exec(`yalc add @sentry/react-native`, { cwd: appCwd }).then(logStdOut);

  await patch(version);

  await exec("npx patch-package", {
    cwd: appCwd,
  }).then(logStdOut);
  await copyFile(`${__dirname}/Podfile`, `${__dirname}/app/ios/Podfile`);
  await exec("pod install", { cwd: `${__dirname}/app/ios` }).then(logStdOut);
  await copyFile(`${__dirname}/App.js`, `${__dirname}/app/App.js`);
};

main();