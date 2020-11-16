import { ListenOptions, Server } from 'net'
import { createServer, IncomingMessage, ServerResponse } from 'http'

import { onerror } from '../lib/util'

import { init, destroy, teardown } from '../core/runtime'
import { createContext } from '../core/context'

import { lookup } from '../hooks'

import { makeResponse, errorHandler } from './response'

/** 初始化  */
export async function dispatch(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const ctx = createContext(req, res)
  const asyncId = init(ctx)

  try {
    await lookup(ctx)
    await makeResponse(ctx)
  } catch (error) {
    errorHandler(error, ctx)
    onerror(error)
  }

  try {
    await teardown(asyncId)
  } catch (error) {
    onerror(error)
  } finally {
    destroy(asyncId)
  }
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
export function listen(port?: number, hostname?: string, callback?: () => void): Server

/** 监听端口号
 *
 * @param port                   端口号
 * @param backlog                指定待连接队列的最大长度
 * @param callback               回调函数
 */
export function listen(port?: number, backlog?: number, callback?: () => void): Server

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
export function listen(path: string, backlog?: number, callback?: () => void): Server

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
  return createServer(dispatch).listen(...args)
}
