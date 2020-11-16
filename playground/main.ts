import { parse } from 'qs'

import { use, route, redirect, urlFor, listen } from '../src/index'

import { useSession } from './plugins/session'

route('product.detail', '/api/product/:id', (ctx) => {
  ctx.statusCode = 200
  ctx.body = {
    query: parse(ctx.query),
    params: ctx.params
  }
})

route('/api/user/info', (ctx) => {
  const sess = useSession()
  const userId = sess.userId

  // 用户未登陆就重定向到登陆页
  if (userId === null || userId === undefined) {
    return redirect(urlFor('login'))
  }

  ctx.statusCode = 200
  ctx.body = {
    userId: userId,
    nickname: '张三'
  }
})

route('POST', '/login', (ctx) => {
  const sess = useSession()

  // 写入用户 id
  sess.userId = 1

  ctx.body = { code: 200, message: 'ok' }
})

route('login', '/login', (ctx) => {
  ctx.body = 'This is login page'
})

route('/view', (ctx) => {
  const sess = useSession()

  sess.view = sess.view || 0

  const link = urlFor(
    'product.detail',
    { id: 1 },
    {
      query: '?sort=createAt'
    }
  )

  ctx.statusCode = 500
  ctx.body = { view: sess.view++, link }
})

use((ctx) => {
  ctx.body = `hello,world`
})

listen(8081, function onReady() {
  console.log('Liston http://127.0.0.1:8081')
})
