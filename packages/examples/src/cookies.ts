import Cookies from 'cookies'

import { useContext, memo } from '@zhengxs/koa-hooks'

export type { ICookies as Cookies } from 'cookies'

const keys = ['koa-hooks-examples']

export const useCookies = memo<Cookies>(() => {
  const ctx = useContext()

  return new Cookies(ctx.req, ctx.res, {
    keys: keys,
    secure: false,
  })
})
