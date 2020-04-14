import { Server } from 'http'

import {
  useCallback,
  useRouteMatch,
  redirect,
  urlFor,
  listen,
} from '@zhengxs/koa-hooks'

useRouteMatch('product.detail', '/api/product/:id', (ctx) => {
  ctx.status = 200
  ctx.type = 'application/json'
  ctx.body = ctx.params
})

useRouteMatch('/api/user/info', () => {
  // 可定重定向
  redirect(urlFor('login'))
})

useRouteMatch('login', '/login', (ctx) => {
  ctx.body = 'This login page.'
})

useCallback((ctx) => {
  ctx.body = `hello,world`
})

listen(8080, function onReady(this: Server) {
  console.log('Liston http://127.0.0.1:8080')
})
