/** 请求上下文
 *
 *  @module Context
 */
import { IncomingMessage, ServerResponse } from 'http'

/** 请求上下文 */
export interface RequestContext {
  /** 当前请求对象 */
  req: IncomingMessage

  /** 当前响应对象 */
  res: ServerResponse

  /** 状态码 */
  statusCode: number

  /** 响应类型 */
  type: string

  /** 响应内容 */
  body?: any

  /** 是否可写 */
  readonly writable: boolean

  /** 请求是否已结束 */
  readonly finished: boolean

  /** 可选属性 */
  [extra: string]: any
}

const context: Partial<RequestContext> = {
  get writable(this: RequestContext) {
    const res = this.res

    if (res.writableEnded || this.finished) return false

    const socket = res.socket
    // There are already pending outgoing res, but still writable
    // https://github.com/nodejs/node/blob/v4.4.7/lib/_http_server.js#L486
    return !socket || socket.writable
  },
  get finished(this: RequestContext) {
    const res = this.res
    return res.writableFinished || res.finished
  },
}

/** 创建请求上下文
 *
 * @param req   当前请求对象
 * @param res   当前响应对象
 *
 * @returns     上下文对象
 */
export function createContext(
  req: IncomingMessage,
  res: ServerResponse
): RequestContext {
  const ctx = Object.create(context)

  ctx.req = req
  ctx.res = res

  return ctx
}
