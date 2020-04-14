/** 二维数组扁平化处理
 *
 * @param args  二维数组
 */
export function flatten<T = any>(...args: (T | T[])[]): T[] {
  return ([] as T[]).concat(...args)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 兼容 esm 模块
export default module.exports
