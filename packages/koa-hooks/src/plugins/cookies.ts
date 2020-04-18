import Cookies from 'cookies'

import { memo } from '../core/runtime'
import { useContext } from '../hooks'

const keys = ['koa-hooks-examples']

export const useCookies = memo<Cookies>(() => {
  const ctx = useContext()

  return new Cookies(ctx.req, ctx.res, {
    keys: keys,
    secure: false,
  })
})
