const { resolve, join } = require('path')
const { readdirSync, statSync, existsSync } = require('fs')

const { prompt } = require('inquirer')
const concurrently = require('concurrently')

const rootPath = resolve(__dirname, '..')

const tsnd = resolve(rootPath, 'node_modules/.bin/ts-node-dev')

const examplesDirt = resolve(rootPath, 'packages/examples')
const examples = readdirSync(examplesDirt).reduce((examples, name) => {
  const baseDir = join(examplesDirt, name)
  const pkgFile = join(baseDir, 'package.json')

  if (statSync(baseDir).isDirectory() && isFile(pkgFile)) {
    const pkg = require(pkgFile)

    examples[name] = {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      script: resolve(baseDir, pkg.main),
    }
  }

  return examples
}, {})

const opts = {
  notify: false,
  clear: true,
  respawn: true,
  dedupe: true,
  transpileOnly: true,
  interval: 1200,
  debounce: 1000,
}

async function main() {
  const answers = await prompt([
    {
      name: 'name',
      type: 'list',
      message: `Please select a examples:`,
      choices: Object.keys(examples).reduce((choices, name) => {
        const app = examples[name]

        return choices.concat({
          name: app.description,
          short: `${app.name} v${app.version}`,
          value: name,
        })
      }, []),
    },
    {
      name: 'inspect',
      type: 'confirm',
      message: 'Enable node inspect?',
    },
  ])

  const app = examples[answers.name]

  await concurrently([
    'npm:watch',
    run({
      name: app.name,
      inspect: answers.inspect,
      script: app.script,
    }),
  ])
}

main()

function isFile(filename) {
  return existsSync(filename) && statSync(filename).isFile()
}

function run({ name, inspect, script }) {
  const args = [
    '--interval 1200',
    '--debounce 1000',
    '--respawn',
    '--clear',
    '--transpileOnly',
    '--no-notify',
    '--dedupe',
    script,
  ]

  if (inspect) {
    args.unshift('--inspect')
  }

  return { name, command: `${tsnd} ${args.join(' ')}` }
}
