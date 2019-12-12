#!/usr/bin/env node
const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const CWD = process.cwd();

/**
 * 
 * @param {!string} path 
 */
const getPackageJson = async (path = 'package.json') => {
    try {
        return JSON.parse(await fsPromises.readFile(path, { encoding: 'utf8' }));
    }
    catch (err) {
        return null;
    }
}

/**
 * 
 * @param {!string} runScriptName 
 */
const errorLog = (str) => {
    console.log('\x1b[31m%s\x1b[0m', str);
}

/**
 * 
 * @param {!string} runScriptName 
 */
const consoleNoPackageJSONError = (runScriptName) => {
    errorLog(`Error: No package.json with script ${runScriptName}  up the folders tree from ${CWD}!`);
}

const { argv } = process;
if (argv.length < 3) {
    errorLog("Error: no script selected!");
    return 1;
}

let runScriptName = argv[2];
let finalScriptToRun = `npm run ${runScriptName} ${argv.length > 3 ? argv.slice(3).join(' ') : ''}`;


(async () => {
    let currentWorkFolder = CWD;
    process.env.orig_cwd = CWD;
    let parentFolder = path.dirname(currentWorkFolder);
    while (parentFolder != currentWorkFolder) {
        let packageJSONObject = await getPackageJson(`${parentFolder}\\package.json`);
        if (packageJSONObject) {
            let { scripts } = packageJSONObject;
            if (scripts && scripts[runScriptName]) {
                child_process.execSync(finalScriptToRun, { stdio: [0, 1, 2], cwd: parentFolder });
                return 0;
            }
        }
        currentWorkFolder = parentFolder;
        parentFolder = path.dirname(currentWorkFolder);
    }
    consoleNoPackageJSONError(runScriptName);
})();
