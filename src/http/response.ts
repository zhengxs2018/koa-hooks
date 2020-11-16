/** HTTP 响应模块
 *
 *  @module http.response
 */
import assert from 'assert'

import { Stream } from 'stream'
import { STATUS_CODES, ServerResponse } from 'http'
import { format, isNullOrUndefined } from 'util'

import destroy from 'destroy'
import onFinished from 'on-finished'

import { get } from '../core/runtime'
import { RequestContext } from '../core/context'
import { onerror } from '../lib/util'

/** 验证是否有效状态码
 *
 * @param statusCode       http 状态码
 */
export function assertStatusCode(statusCode: number): void {
  assert(Number.isInteger(statusCode), 'status code must be a number')
  assert(statusCode in STATUS_CODES, `invalid status code: ${statusCode}`)
}

/** 检查此类状态码是否为空内容
 *
 * @param res              响应对象
 * @param statusCode       http 状态码
 */
export function isNoContentStatusCode(statusCode: number) {
  return statusCode === 204 || statusCode === 205 || statusCode === 304
}

/** 创建空的响应输出
 *
 * @param res              响应对象
 * @param statusCode       http 状态码
 */
export function makeEmptyResponse(res: ServerResponse, statusCode?: number): void {
  res.statusCode = statusCode ?? 204

  res.removeHeader('Content-Type')
  res.removeHeader('Content-Length')
  res.removeHeader('Transfer-Encoding')

  res.end()
}

/** 创建响应输出
 *
 * @param ctx 当前请求上下文
 */
export function makeResponse(ctx: RequestContext): void {
  if (!ctx.writable) return

  // 获取响应内容
  const data = ctx.body

  // 获取状态码
  const statusCode = ctx.statusCode || ctx.status || (isNullOrUndefined(data) ? 404 : 200)

  // 验证 http 状态码
  assertStatusCode(statusCode)

  const res = ctx.res

  // no content
  if (isNoContentStatusCode(statusCode)) {
    return makeEmptyResponse(res)
  }

  // 设置状态码
  res.statusCode = statusCode

  // 跳过 head 请求
  if ('HEAD' === ctx.req.method) {
    return res.end()
  }

  const isHeadersNoSent = !res.headersSent

  // 空内容
  if (isNullOrUndefined(data)) {
    const message = STATUS_CODES[statusCode] || String(statusCode)

    if (isHeadersNoSent) {
      res.setHeader('Content-Type', 'text/plan')
      res.setHeader('Content-Length', Buffer.byteLength(message))
    }

    return res.end(message)
  }

  // 判断是否已经设置过请求头
  const noType = res.hasHeader('Content-Type') !== true

  // 如果是字符串的内容
  if (typeof data === 'string') {
    if (isHeadersNoSent) {
      if (noType) res.setHeader('Content-Type', ctx.type || 'text/plan')
      res.setHeader('Content-Length', Buffer.byteLength(data))
    }

    return res.end(data, 'utf8')
  }

  if (Buffer.isBuffer(data)) {
    if (isHeadersNoSent) {
      if (noType) res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader('Content-Length', data.length)
    }

    return res.end(data)
  }

  if (data instanceof Stream) {
    if (isHeadersNoSent) {
      if (noType) res.setHeader('Content-Type', 'application/octet-stream')

      res.removeHeader('Content-Length')
    }
    onFinished(res, destroy.bind(null, data))
    data.on('error', onerror)
    return
  }

  const body = JSON.stringify(data)
  if (!res.headersSent) {
    res.setHeader('Content-Type', ctx.type || 'application/json')
    res.setHeader('Content-Length', Buffer.byteLength(body))
  }

  res.end(body, 'utf8')
}

export function errorHandler(err: Error, ctx: RequestContext) {
  if (!ctx.writable) return

  const res = ctx.res
  const isHeadersNoSent = !res.headersSent
  const noType = res.hasHeader('Content-Type') !== true

  let message = null
  if (process.env.NODE_ENV === 'development') {
    message = err instanceof Error ? err.stack : format('non-error thrown: %j', err)
  }

  if (!message) {
    message = STATUS_CODES['500'] || 'server error'
  }

  if (isHeadersNoSent) {
    if (noType) res.setHeader('Content-Type', ctx.type || 'text/plan')
    res.setHeader('Content-Length', Buffer.byteLength(message as string))
  }

  res.statusCode = 500
  res.end(message, 'utf8')
}

/** 请求重定向
 *
 * @param location  重定向位置
 * @param code      http 状态码
 */
export function redirect(location: string, code?: 301 | 302): void {
  const { res } = get('context')
  const statusCode = code || 301

  res.statusCode = statusCode
  res.statusMessage = `Redirect ${statusCode}`

  res.setHeader('Location', location)
  res.end()
}
