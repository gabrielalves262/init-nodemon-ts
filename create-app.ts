/* eslint-disable import/no-extraneous-dependencies */

import { basename, dirname, join, resolve } from "node:path";
import { isWriteable } from "./helpers/is-writeable";
import { mkdirSync } from "node:fs";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { green, cyan } from 'picocolors'
import { TemplateType } from "./templates/type";
import { installTemplate } from "./templates";
import { tryGitInit } from "./helpers/git";

export async function CreateProject(projectPath: string, template: TemplateType, disableGit: boolean) {
  const root = resolve(projectPath)

  if (!(await isWriteable(dirname(root)))) {
    console.error(
      'The application path is not writable, please check folder permissions and try again.'
    )
    console.error(
      'It is likely you do not have write permissions for this folder.'
    )
    process.exit(1)
  }

  const appName = basename(root)

  mkdirSync(root, { recursive: true })
  if (!isFolderEmpty(root, appName)) {
    process.exit(1)
  }

  const originalDirectory = process.cwd()

  console.log(`Creating a new node project in ${green(root)}.`)
  console.log()

  process.chdir(root)

  await installTemplate({
    appName,
    root,
    template,
    disableGit,
  })

  if (disableGit) {
    console.log('Skipping git initialization.')
    console.log()
  } else if (tryGitInit(root)) {
    console.log('Initialized a git repository.')
    console.log()
  }

  let cdpath: string
  if (join(originalDirectory, appName) === projectPath) {
    cdpath = appName
  } else {
    cdpath = projectPath
  }

  console.log(`${green('Success!')} Created ${appName} at ${projectPath}`)

  console.log()

  console.log('Inside that directory, you can run several commands:')
  console.log()
  console.log(cyan(`  npm run dev`))
  console.log('    Starts the development server.')
  console.log()
  console.log(cyan(`  npm run build`))
  console.log('    Builds the app for production.')
  console.log()
  console.log(cyan(`  npm start`))
  console.log('    Runs the built app in production mode.')
  console.log()
  console.log('We suggest that you begin by typing:')
  console.log()
  console.log(cyan('  cd'), cdpath)
  console.log(`  ${cyan(`npm run dev`)}`)

  console.log()
}