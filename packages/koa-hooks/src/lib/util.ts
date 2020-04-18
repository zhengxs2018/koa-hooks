import { format } from 'util'

/** 二维数组扁平化处理
 *
 * @param args  二维数组
 */
export function flatten<T = any>(args: (T | T[])[]): T[] {
  return args.reduce((previous: T[], value) => {
    if (Array.isArray(value)) {
      return previous.concat(flatten(value))
    }
    return previous.concat(value)
  }, [])
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 错误日志输出
 *
 * @param err 错误对象
 */
export function onerror(err: Error) {
  if (!(err instanceof Error))
    throw new TypeError(format('non-error thrown: %j', err))

  const msg = err.stack || err.toString()
  console.error()
  console.error(msg.replace(/^/gm, '  '))
  console.error()
}

export function createError(
  message: string,
  extra?: Record<string, any>
): Error {
  return Object.assign(new Error(message), extra)
}

// 兼容 esm 模块
export default module.exports
