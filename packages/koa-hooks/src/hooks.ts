import { SeriesTaskHandler, runTasks } from './tasks'

import { RequestContext, resolve } from './context'

export type RequestHandler = SeriesTaskHandler<RequestContext>

/** 回调数组 */
const callbacks: RequestHandler[] = []

/**
 * 添加请求处理
 *
 * @param fn     请求回调处理函数
 */
export function useCallback(fn: RequestHandler): void {
  if (typeof fn !== 'function') {
    throw new TypeError('middleware must be a function!')
  }

  callbacks.push(fn)
}


/** 获取当前请求上下文 */
export function useContext(): RequestContext {
  return resolve()
}

/** 递归调用回调函数
 *
 * @private
 *
 * @param ctx     当前请求上下文
 */
export function lookup(ctx: RequestContext) {
  return runTasks(callbacks, ctx)
}
