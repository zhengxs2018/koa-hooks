import { METHODS } from 'http'
import { parse, URLSearchParams } from 'url'

import { match, compile, PathFunction } from 'path-to-regexp'

import { use, RequestMiddleware } from './hooks'

/** 命名路由规则 */
const namedRoutes: Record<string, PathFunction> = {}

export type URLForOptions = {
  query: string | Record<string | number, any>
}

/** 根据路由名称和参数返回路由地址
 *
 * @param name         路由名称
 * @param params       路由参数
 */
export function urlFor(
  name: string,
  params?: Record<string, any>,
  options?: URLForOptions
): string {
  const query = options?.query

  const uri = namedRoutes[name](params || {})
  if (query) {
    return `${uri}?${new URLSearchParams(query).toString()}`
  }

  return uri
}

/** 使用路由匹配
 *
 * @param path         匹配路径
 * @param callback     回调函数
 */
export function route(path: string, callback: RequestMiddleware): void

/** 使用路由匹配
 *
 * @param name         路由名称
 * @param path         匹配路径
 * @param callback     回调函数
 */
export function route(
  name: string,
  path: string,
  callback: RequestMiddleware
): void

/** 使用路由匹配
 *
 * @param method       请求方法
 * @param path         匹配路径
 * @param callback     回调函数
 */
export function route(
  method: string,
  path: string,
  callback: RequestMiddleware
): void

/** 使用路由匹配
 *
 * @param name         路由名称
 * @param method       请求方法
 * @param path         匹配路径
 * @param callback     回调函数
 */
export function route(
  name: string,
  method: string,
  path: string,
  callback: RequestMiddleware
): void
export function route() {
  const [name, method, path, callback] = normalizeArgs(Array.from(arguments))

  // 命名路由
  if (typeof name === 'string') {
    namedRoutes[name] = compile(path)
  }

  const route = match(path)

  use((ctx, next) => {
    const req = ctx.req

    if (req.method == method) {
      const url = parse(req.url || '/')
      const result = route(url.pathname || '/')

      if (result) {
        ctx.query = url.query
        ctx.params = result.params

        return callback(ctx, next)
      }
    }

    return next()
  })
}

/** 格式参数
 *
 * @private
 *
 * @param name         路由名称
 * @param method       请求方法
 * @param path         匹配路径
 * @param callback     回调函数
 */
function normalizeArgs(
  args: any[]
): [string | null, string, string, RequestMiddleware] {
  if (args.length === 4) {
    const [name, method, path, callback] = args
    return [name, method.toUpperCase(), path, callback]
  }

  if (args.length === 3) {
    const [nameOrMethod, path, callback] = args
    const method = nameOrMethod.toUpperCase()

    if (METHODS.indexOf(method) > -1) {
      return [null, method, path, callback]
    } else {
      return [nameOrMethod, 'GET', path, callback]
    }
  }

  if (args.length === 2) {
    const [path, callback] = args
    return [null, 'GET', path, callback]
  }

  throw new Error(`Route options 'path' and 'callback' required`)
}
