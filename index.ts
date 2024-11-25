#!/usr/bin/env node

/* eslint-disable import/no-extraneous-dependencies */
import { Command } from 'commander'
import prompts from 'prompts'
import type { InitialReturnValue } from 'prompts'
import { validateNpmName } from './helpers/validate-pkg'
import { blue, bold, cyan, green, red, yellow } from 'picocolors'
import { basename, resolve } from 'node:path'
import packageJson from './package.json'
import { existsSync } from 'node:fs'
import { isFolderEmpty } from './helpers/is-folder-empty'
import { CreateProject } from './create-app'

let projectPath: string = ''

const handleSigTerm = () => process.exit(0)

process.on('SIGINT', handleSigTerm)
process.on('SIGTERM', handleSigTerm)

const onPromptState = (state: {
  value: InitialReturnValue
  aborted: boolean
  exited: boolean
}) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h')
    process.stdout.write('\n')
    process.exit(1)
  }
}

const program = new Command(packageJson.name)
  .version(
    packageJson.version,
    '-v, --version',
    'Output the current version of create-next-app.'
  )
  .argument('[directory]')
  .usage('[directory] [options]')
  .helpOption('-h, --help', 'Display this help message.')
  .option('-e, --express', 'Initialize as a express project. (default)')
  .option('--disable-git', `Skip initializing a git repository.`)
  .action((name) => {
    // Commander does not implicitly support negated options. When they are used
    // by the user they will be interpreted as the positional argument (name) in
    // the action handler. See https://github.com/tj/commander.js/pull/1355
    if (name && !name.startsWith('--no-')) {
      projectPath = name
    }
  })
  .allowUnknownOption()
  .parse(process.argv)

const opts = program.opts()
const { args } = program

async function run(): Promise<void> {
  // const conf = new Conf({ projectName: 'init-nodemon-ts' })

  if (typeof projectPath === 'string') {
    projectPath = projectPath.trim()
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: 'text',
      name: 'path',
      message: 'What is your project named?',
      initial: 'my-app',
      validate: (name) => {
        const validation = validateNpmName(basename(resolve(name)))
        if (validation.valid) {
          return true
        }
        return 'Invalid project name: ' + validation.problems[0]
      },
    })

    if (typeof res.path === 'string') {
      projectPath = res.path.trim()
    }
  }

  if (!projectPath) {
    console.log(
      '\nPlease specify the project directory:\n' +
      `  ${cyan(opts.name())} ${green('<project-directory>')}\n` +
      'For example:\n' +
      `  ${cyan(opts.name())} ${green('my-next-app')}\n\n` +
      `Run ${cyan(`${opts.name()} --help`)} to see all options.`
    )
    process.exit(1)
  }

  const appPath = resolve(projectPath)
  const appName = basename(appPath)

  const validation = validateNpmName(appName)
  if (!validation.valid) {
    console.error(
      `Could not create a project called ${red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    )

    validation.problems.forEach((p) =>
      console.error(`    ${red(bold('*'))} ${p}`)
    )
    process.exit(1)
  }

  if (existsSync(appPath) && !isFolderEmpty(appPath, appName)) {
    process.exit(1)
  }

  const preferences = ({ projectName: 'init-nodemon-ts', express: false }) as Record<
    string,
    boolean | string
  >

  const defaults: typeof preferences = {
    template: 'empty',
    disableGit: false,
  }

  const getPrefOrDefault = (field: string) =>
    preferences[field] ?? defaults[field]

  if (typeof opts.express === 'undefined') {
    const { template } = await prompts(
      {
        type: 'select',
        name: 'template',
        message: `Which template would you like to use?`,
        choices: [
          { title: 'Empty', value: 'empty' },
          { title: 'Express', value: 'express' },
        ],
        initial: 0
      },
      {
        /**
         * User inputs Ctrl+C or Ctrl+D to exit the prompt. We should close the
         * process and not write to the file system.
         */
        onCancel: () => {
          console.error('Exiting.')
          process.exit(1)
        },
      }
    )

    opts.template = template
  }

  try {
    CreateProject(projectPath, opts.template, opts.disableGit)
  } catch (reason) {

  }
}

run().then().catch()