import { resolve } from './context'

/** 在当前请求过程中缓存回调函数的返回值
 *
 * @param callback 回调函数
 */
export function memo<Result, Args = any>(callback: () => Result) {
  return (...args: Args[]): Result => {
    const cache = resolve().cache
    const condition = { callback, args }

    if (!cache.has(condition)) {
      cache.set(condition, callback())
    }

    return cache.get(condition)
  }
}
