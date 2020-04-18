/** 当前运行状态
 *
 *  @module Runtime
 */
import { triggerAsyncId } from 'async_hooks'

import { ParallelTask } from './tasks'

import { RequestContext } from './context'

export interface Runtime {
  /** 请求上下文 */
  context: RequestContext

  /** 请求结束后触发的回调  */
  callbacks: ParallelTask<void>[]

  /** 临时缓存，请求结束销毁 */
  cache: WeakMap<any, any>
}

/** 当前请求上下文
 *
 * mdn 上介绍说 map 比 object 在频繁增删键值对的场景下表现更好。
 *
 * @see: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map
 */
const map = new Map<number, Runtime>()

/** 初始化状态
 *
 * @param context 请求上下文
 */
export function init(context: RequestContext): number {
  const asyncId = triggerAsyncId()

  map.set(asyncId, {
    context: context,
    callbacks: [],
    cache: new WeakMap(),
  })

  return asyncId
}

export class RuntimeError extends Error {
  code: string = 'RUNTIME_ERROR'
}

/** 获取当前状态 */
export function get<Key extends keyof Runtime>(key: Key): Runtime[Key] {
  const asyncId = triggerAsyncId()
  const runtime = map.get(asyncId)

  if (runtime === undefined) {
    throw new RuntimeError(`The runtime of "${asyncId}" is missing`)
  }

  return runtime[key]
}

/** 缓存回调函数的执行结果
 *
 * @param callback 回调函数
 */
export function memo<Result, Args = any>(
  callback: (...args: any[]) => Result | any
) {
  return (...args: Args[]): Result => {
    const cache = get('cache')
    const condition = { callback, args }

    if (!cache.has(condition)) {
      cache.set(condition, callback(...args))
    }

    return cache.get(condition)
  }
}

/** 清理请求中间过程中产生的回调
 *
 * @private
 *
 * @param ctx     当前请求上下文
 */
export async function teardown(asyncId: number): Promise<void> {
  if (map.has(asyncId)) {
    const runtime = map.get(asyncId) as Runtime
    const callbacks = runtime.callbacks || []
    await Promise.all(callbacks.map((fn) => fn()))
  }
}

/** 销毁当前状态 */
export function destroy(asyncId: number): void {
  if (map.has(asyncId)) map.delete(asyncId)
}

export default module.exports
