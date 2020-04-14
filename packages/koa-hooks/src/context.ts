import { IncomingMessage, ServerResponse } from 'http'
import { triggerAsyncId } from 'async_hooks'

/** 请求上下文 */
export interface RequestContext {
  req: IncomingMessage
  res: ServerResponse

  /** 响应类型 */
  type: string

  /** 状态码 */
  status: number

  /** 响应内容 */
  body: any

  [key: string]: any
}

/** 请求上下文映射 */
const contextsMap: Record<number, RequestContext> = {}

/** 创建请求上下文
 *
 * @private
 *
 * @param req http 模块的 IncomingMessage 对象
 * @param res http 模块的 ServerResponse
 */
export function create(req: IncomingMessage, res: ServerResponse) {
  const ctx = Object.create(null)

  ctx.req = req
  ctx.res = res
  ctx.state = {}

  contextsMap[triggerAsyncId()] = ctx

  return ctx
}

/** 获取当前请求上下文
 *
 * @private
 */
export function resolve(): RequestContext {
  const traceId = triggerAsyncId()
  if (contextsMap.hasOwnProperty(traceId)) {
    return contextsMap[traceId]
  }

  throw new TypeError(
    `The request context with ID '${traceId}' has been corrupted`
  )
}

/** 销毁当前请求上下文
 *
 * @private
 */
export function destroy() {
  const traceId = triggerAsyncId()

  if (contextsMap.hasOwnProperty(traceId)) {
    delete contextsMap[traceId]
  }
}

export default module.exports
