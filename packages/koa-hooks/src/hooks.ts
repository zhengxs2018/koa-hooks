/** 请求钩子
 *
 *  @module Hooks
 */

import { get } from './core/runtime'
import { RequestContext } from './core/context'

import { SeriesTask, runTasks } from './lib/tasks'

/** 请求中间件 */
export type RequestMiddleware = SeriesTask<RequestContext>

/** 中间件 */
export const middlewares: RequestMiddleware[] = []

/**
 * 添加中间件
 *
 * @param fn      回调函数
 */
export function use(fn: RequestMiddleware): void {
  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function!')
  }

  middlewares.push(fn)
}

/** 每次请求结束时执行
 *
 * @param fn  回调函数
 */
export function useEffect(_callback: () => void | Promise<void>): void {
  // get('callbacks').push(callback)
}

/** 从当前 runtime 中取出请求上下文
 *
 * @returns 当前请求上下文
 */
export function useContext<Key extends keyof RequestContext>(): RequestContext

/** 从当前 runtime 中取出请求上下文
 *
 * @param key 允许通过字段直接获取上下文中的某个值
 *
 * @returns 指定的值
 */
export function useContext<Key extends keyof RequestContext>(
  key: Key
): RequestContext[Key]

/** 从当前 runtime 中取出请求上下文
 *
 * @param key 允许通过字段直接获取上下文中的某个值
 *
 * @returns 当前请求上下文或指定的值
 */
export function useContext<Key extends keyof RequestContext>(
  key?: Key
): RequestContext | RequestContext[Key] {
  const ctx = get('context')
  return key ? ctx[key] : ctx
}

/** 递归调用中间件
 *
 * @private
 *
 * @param ctx     当前请求上下文
 */
export function lookup(ctx: RequestContext) {
  return runTasks(middlewares, ctx)
}
