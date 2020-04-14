import { ListenOptions, Server } from 'net'
import { createServer as serve, IncomingMessage, ServerResponse } from 'http'
import { isObject } from 'util'

import { lookup } from './hooks'

import { create, resolve ,destroy,RequestContext } from './context'

export function redirect(uri: string): void
export function redirect(uri: string, code?: number): void {
  const { res } = resolve()

  res.writeHead(code || 301, { 'Location': uri });
  res.end();
}

export type ErrorHandler = (
  error: Error,
  ctx: RequestContext
) => Promise<void> | void

let errorhandler: ErrorHandler = fail

export function onErrorHandler(handler: ErrorHandler) {
  errorhandler = handler
}

export function fail(error: Error, ctx: RequestContext) {
  ctx.status = 500
  ctx.type = 'text/plan'
  ctx.body = error.stack

  return respond(ctx)
}

/** 响应请求内容
 *
 * @param ctx 当前请求上下文
 */
export function respond(ctx: RequestContext) {
  const { status, type, body } = ctx

  ctx.res.writeHead(status || 200, {
    'Content-Type': type || 'text/plain',
  })
  ctx.res.end(isObject(body) || Array.isArray(body) ? JSON.stringify(body) : body)
}

/** 请求监听函数
 *
 * @param req http 模块的 IncomingMessage 对象
 * @param res http 模块的 ServerResponse
 */
export async function requestListener(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // 创建请求上下文
  const ctx = create(req, res)

  try {
    // 开始递归处理
    await lookup(ctx)
    await respond(ctx)
  } catch (err) {
    errorhandler(err, ctx)
  } finally {
    destroy()
  }
}

/** 创建服务 */
export function createServer(): Server {
  return serve(requestListener)
}

/** 监听端口号
 *
 * @param port                   端口号
 * @param hostname               主机名称
 * @param backlog                指定待连接队列的最大长度
 * @param callback               回调函数
 */
export function listen(
  port?: number,
  hostname?: string,
  backlog?: number,
  callback?: () => void
): Server

/** 监听端口号
 *
 * @param port                   端口号
 * @param hostname               主机名称
 * @param callback               回调函数
 */
export function listen(
  port?: number,
  hostname?: string,
  callback?: () => void
): Server

/** 监听端口号
 *
 * @param port                   端口号
 * @param backlog                指定待连接队列的最大长度
 * @param callback               回调函数
 */
export function listen(
  port?: number,
  backlog?: number,
  callback?: () => void
): Server

/** 监听端口号
 *
 * @param port                   端口号
 * @param callback               回调函数
 */
export function listen(port?: number, callback?: () => void): Server

/** 监听端口号
 *
 * @param path                   路径
 * @param backlog                指定待连接队列的最大长度
 * @param callback               回调函数
 */
export function listen(
  path: string,
  backlog?: number,
  callback?: () => void
): Server

/** 监听端口号
 *
 * @param path                   路径
 * @param callback               回调函数
 */
export function listen(path: string, callback?: () => void): Server

/** 监听端口号
 *
 * @param options                监听配置
 * @param callback               回调函数
 */
export function listen(options: ListenOptions, callback?: () => void): Server
export function listen(...args: any[]): Server {
  return createServer().listen(...args)
}
