import { v4 as uuid } from 'uuid'

import { memo, useEffect } from '@zhengxs/koa-hooks'

import { useCookies } from './cookies'

export type Session = Record<string, any>

const key = 'sess:id'
const store: Record<string, Session> = {}

function getSessionId(): string {
  const cookies = useCookies()
  const sessId = cookies.get(key)

  if (sessId === undefined) {
    // 生成 uuid
    const sessId = uuid()

    // 写入 cookies
    cookies.set(key, sessId, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    })
    console.log('写入 cookies')

    return sessId
  }

  return sessId
}

function createSession(sessId: string){
  if (store.hasOwnProperty(sessId)) {
    return store[sessId]
  }

  return store[sessId] = {}
}

export const useSession = memo<Session>(() =>{
  const sessId = getSessionId()
  const session = createSession(sessId)

  useEffect(() => {
    store[sessId] = session
  })

  return session
})
