import { Server } from 'http'
import { parse } from 'qs'
import { isNullOrUndefined } from 'util'

import { use, route, redirect, urlFor, listen } from '@zhengxs/koa-hooks'

import { useSession } from './session'

route('product.detail', '/api/product/:id', (ctx) => {
  ctx.status = 200
  ctx.type = 'application/json'
  ctx.body = {
    query: parse(ctx.query),
    params: ctx.params,
  }
})

route('/api/user/info', (ctx) => {
  const sess = useSession()
  const userId = sess.userId

  // 用户未登陆就重定向到登陆页
  if (isNullOrUndefined(userId)) {
    return redirect(urlFor('login'))
  }

  ctx.status = 200
  ctx.type = 'application/json'
  ctx.body = {
    userId: userId,
    nickname: '张三',
  }
})

route('POST', '/login', (ctx) => {
  const sess = useSession()

  // 写入用户 id
  sess.userId = 1

  ctx.status = 200
  ctx.type = 'application/json'
  ctx.body = { code: 200, message: 'ok' }
})

route('login', '/login', (ctx) => {
  ctx.status = 200
  ctx.type = 'text/plan'
  ctx.body = 'This is login page'
})

route('/view', (ctx) => {
  const sess = useSession()

  sess.view = sess.view || 0

  const link = urlFor('product.detail', { id: 1 }, {
    query: '?sort=createAt'
  })

  ctx.status = 200
  ctx.type = 'application/json'
  ctx.body = { view: sess.view++, link }
})

use((ctx) => {
  ctx.body = `hello,world`
})

listen(8080, function onReady(this: Server) {
  console.log('Liston http://127.0.0.1:8080')
})
