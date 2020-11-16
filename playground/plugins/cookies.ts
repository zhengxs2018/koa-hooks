import Cookies from 'cookies'

import { useContext, memo } from '../../src/index'

const keys = ['koa-hooks-examples']

export const useCookies = memo<Cookies>(() => {
  const ctx = useContext()

  return new Cookies(ctx.req, ctx.res, {
    keys: keys,
    secure: false
  })
})
