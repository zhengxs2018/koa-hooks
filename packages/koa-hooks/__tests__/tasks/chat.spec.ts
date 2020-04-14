import {
  series,
  parallel,
  SeriesTaskHandler,
  ParallelTaskHandler,
} from '../../src/tasks'

interface User {
  nickname: string
}

interface Group {
  name: string
}

interface Message<To, Form = To> {
  id?: string
  content: string
  from: Form
  to: To
}

interface UserMessage extends Message<User> {
  type: 'user'
}

interface UserSendToGroupMessage extends Message<Group, User> {
  type: 'group'
}

interface TaskContext {
  process: { sort: number; message: string }[]
  message: UserMessage | UserSendToGroupMessage
}

const sort = (pre: { sort: number }, next: { sort: number }) => {
  return pre.sort - next.sort
}

const saveMessageToStore: SeriesTaskHandler<TaskContext> = (ctx, next) => {
  const { message, process } = ctx

  // 生成消息 id
  message.id = Date.now().toString()

  // 添加处理结果
  process.push({
    sort: -1,
    message: `${message.type === 'user' ? '私聊' : '群'}消息保存成功`,
  })

  return next(ctx)
}

const sendMsgToSocket: ParallelTaskHandler<TaskContext> = (ctx) => {
  const { message, process } = ctx

  // 添加处理结果
  process.push({
    sort: 0,
    message: `${message.type === 'user' ? '私聊' : '群'}消息发送成功`,
  })
}

const pushMsgToWeChat: ParallelTaskHandler<TaskContext> = (ctx) => {
  const { message, process } = ctx
  const receiver =
    message.type === 'user' ? message.to.nickname : message.to.name
  const sender = message.from.nickname

  process.push({
    sort: 1,
    message: `已将${sender}发送到${receiver}的消息通知推送给微信`,
  })
}

const pushMsgToDingTalk: ParallelTaskHandler<TaskContext> = (ctx) => {
  const { message, process } = ctx
  const receiver =
    message.type === 'user' ? message.to.nickname : message.to.name
  const sender = message.from.nickname

  process.push({
    sort: 2,
    message: `已将${sender}发送到${receiver}的消息通知推送给钉钉`,
  })
}

describe('chat.spec.ts', () => {
  it('chat.send.to.user(Message)', async () => {
    const sendToUser = series<TaskContext>(
      saveMessageToStore,
      parallel(sendMsgToSocket, pushMsgToDingTalk, pushMsgToWeChat)
    )

    const { message, process } = await sendToUser({
      message: {
        type: 'user',
        content: '',
        from: { nickname: '张三' },
        to: { nickname: '李四' },
      },
      process: [],
    })

    expect(typeof message.id).toEqual('string')
    expect(process.sort(sort)).toEqual([
      { message: '私聊消息保存成功', sort: -1 },
      { message: '私聊消息发送成功', sort: 0 },
      { message: '已将张三发送到李四的消息通知推送给微信', sort: 1 },
      { message: '已将张三发送到李四的消息通知推送给钉钉', sort: 2 },
    ])
  })

  it('chat.send.to.group(Message)', async () => {
    const sendToGroup = series<TaskContext>(
      saveMessageToStore,
      parallel(sendMsgToSocket, pushMsgToDingTalk, pushMsgToWeChat)
    )

    const { message, process } = await sendToGroup({
      message: {
        type: 'group',
        content: '',
        from: { nickname: '张三' },
        to: { name: '前端线下面基群' },
      },
      process: [],
    })

    expect(typeof message.id).toEqual('string')
    expect(process.sort(sort)).toEqual([
      { message: '群消息保存成功', sort: -1 },
      { message: '群消息发送成功', sort: 0 },
      { message: '已将张三发送到前端线下面基群的消息通知推送给微信', sort: 1 },
      { message: '已将张三发送到前端线下面基群的消息通知推送给钉钉', sort: 2 },
    ])
  })
})
