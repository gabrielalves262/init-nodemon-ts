#!/usr/bin/env node

const yargs = require('yargs')
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');

const pathname = path.resolve(yargs.argv._[0] || './nodemon-ts') 
const projectName = pathname
.split('\\')
.pop()
.replace(/^\.$/, 'nodemon-ts')

if(pathname !== '.'){
  fs.mkdirSync(pathname, { recursive: true })
}

const isEmpty = fs.readdirSync(pathname).length <= 0
if(!isEmpty){
  throw new Error('Directory is not empty')
}


const package_json = `{
  "name": "${projectName}",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/main.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": ""
}`

const tsconfig_json = `{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}`

const nodemon_json = `{
  "watch": ["src"],
  "ext": "ts,json",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node ./src/main.ts"
}`

const gitignore = `node_modules
dist
.env
`


fs.writeFileSync(pathname + '/package.json', package_json)
fs.writeFileSync(pathname + '/tsconfig.json', tsconfig_json)
fs.writeFileSync(pathname + '/nodemon.json', nodemon_json)
fs.writeFileSync(pathname + '/.gitignore', gitignore)

fs.mkdirSync(pathname + '/src')
fs.writeFileSync(pathname + '/src/main.ts', 'console.log("hello world")')

exec(`cd ${pathname} && npm i -D typescript nodemon @types/node ts-node && npm i dotenv && git init -b main && git add . && git commit -m "project initialized"`, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});