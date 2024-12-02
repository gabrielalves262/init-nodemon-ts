import path from "node:path";
import { InstallTemplateArgs } from "./type";
import { cyan } from 'picocolors'
import { copy } from "../helpers/copy";
import fs from "fs/promises";
import os from 'node:os'
import { install } from "../helpers/install";

const devDependencies = ['typescript', 'nodemon', 'ts-node', '@types/node']
const dependencies = ['dotenv', 'picocolors']

const expressDeps = ['express', 'cors', 'envalid', 'bcryptjs', 'jsonwebtoken', 'zod']
const devExpressDeps = ['@types/express', '@types/cors', '@types/jsonwebtoken']

const gitignore = ['node_modules', 'dist', '.env']

/**
 * Install a Next.js internal template to a given `root` directory.
 */
export const installTemplate = async ({
  appName,
  root,
  template,
  disableGit
}: InstallTemplateArgs) => {
  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing project with template:", template, "\n");
  const templatePath = path.join(__dirname, template);
  const copySource = ["**"];

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore": {
          return `.${name}`;
        }
        // README.md is ignored by webpack-asset-relocator-loader used by ncc:
        // https://github.com/vercel/webpack-asset-relocator-loader/blob/e9308683d47ff507253e37c9bcbb99474603192b/src/asset-relocator.js#L227
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  /** Create a package.json for the new project and write it to disk. */
  const packageJson: any = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "nodemon",
      build: "tsc",
      start: `node dist/${template === 'express' ? 'server' : 'main'}.js`
    },
    dependencies: {},
    devDependencies: {},
  };

  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );

  const tsconfigJson: any = {
    compilerOptions: {
      target: "es2022",
      module: "commonjs",
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
      outDir: "./dist",
      rootDir: "./src",
    },
    exclude: [
      "dist",
      "node_modules",
    ]
  }

  await fs.writeFile(
    path.join(root, "tsconfig.json"),
    JSON.stringify(tsconfigJson, null, 2) + os.EOL,
  );

  const nodemonJson: any = {
    watch: ["src"],
    ext: "ts,json",
    ignore: ["src/**/*.spec.ts"],
    exec: `ts-node ./src/${template === 'express' ? 'server' : 'main'}.ts`
  }

  await fs.writeFile(
    path.join(root, "nodemon.json"),
    JSON.stringify(nodemonJson, null, 2) + os.EOL,
  );

  if (!disableGit) {
    await fs.writeFile(
      path.join(root, ".gitignore"),
      gitignore.map((name) => `${name}`).join(os.EOL),
    );
  }



  if (template === 'express') {
    dependencies.push(...expressDeps)
    devDependencies.push(...devExpressDeps)
  }

  console.log("\nInstalling dependencies:");
  for (const dependency in dependencies)
    console.log(`- ${cyan(dependencies[dependency])}`);

  await install(dependencies);

  console.log()

  if (devDependencies) {
    console.log("\nInstalling devDependencies:");
    for (const dependency in devDependencies)
      console.log(`- ${cyan(devDependencies[dependency])}`);
  }

  await install(devDependencies, true);

  console.log();

}