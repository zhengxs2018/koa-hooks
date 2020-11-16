import { existsSync, statSync, writeFileSync, WriteFileOptions } from 'fs'

import { dirname } from 'path'

import mkdirp from 'mkdirp'

export function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory()
}

export function isFile(path: string): boolean {
  return existsSync(path) && statSync(path).isFile()
}

export function writeFile(filename: string, data: string, options?: WriteFileOptions): void {
  mkdirp.sync(dirname(filename))

  writeFileSync(filename, data, options)
}

export default module.exports
