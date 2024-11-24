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

if (pathname !== '.')
  fs.mkdirSync(pathname, { recursive: true })


if (fs.readdirSync(pathname).length > 0)
  throw new Error('Directory is not empty')

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

let main = ''

const gitignore = ['node_modules', 'dist', '.env']

const devDependencies = ['typescript', 'nodemon', 'ts-node', '@types/node']
const dependencies = ['dotenv']

if (yargs.argv.express) {
  devDependencies.push('@types/express', '@types/cors')
  dependencies.push('express cors')

  main = `import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const { PORT = 3000 } = process.env

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`))
`
  fs.writeFileSync(pathname + '/.env', `PORT=3000`)

} else {
  main = `import 'dotenv/config'

const helloWord = 'Hello World'
console.log(helloWord)`
}


fs.writeFileSync(pathname + '/package.json', package_json)
fs.writeFileSync(pathname + '/tsconfig.json', tsconfig_json)
fs.writeFileSync(pathname + '/nodemon.json', nodemon_json)
fs.writeFileSync(pathname + '/.gitignore', gitignore.join('\n'))

fs.mkdirSync(pathname + '/src')
fs.writeFileSync(pathname + '/src/main.ts', main)

exec(`cd ${pathname} && npm i -D ${devDependencies.join(' ')} && npm i ${dependencies.join(' ')} && git init -b main && git add . && git commit -m "project initialized"`, (error, stdout, stderr) => {
  if (error) {
    console.log(error.message);
    return;
  }
  if (stderr) {
    console.log(stderr);
    return;
  }
  console.log(stdout);
  console.log("")
  console.log("Project initialized successfully")
});