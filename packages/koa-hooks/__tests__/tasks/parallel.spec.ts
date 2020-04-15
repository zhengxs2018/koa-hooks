import { sleep } from '../../src/util'
import { parallel } from '../../src/tasks'

describe('parallel.spec.ts', () => {
  it('parallel.queue({ plugins: string[] })', async () => {
    const task = parallel<{ plugins: string[] }>(
      (ctx) => {
        ctx.plugins.push('plugin:config:loaded')
      },
      async (ctx) => {
        ctx.plugins.push('plugin:manager:loaded')
      }
    )

    expect(await task({ plugins: [] }, () => void 0)).toMatchObject({
      plugins: ['plugin:config:loaded', 'plugin:manager:loaded'],
    })
  })

  it('parallel.queue.override({ todos: string[] })', async () => {
    const task = parallel<{ todos: string[] }>(
      (ctx) => {
        ctx.todos.push('学 vue')
      },
      (ctx) => {
        ctx.todos.push('学 react')
      },
      (ctx) => {
        ctx.todos.push('学 angular')
      }
    )
    const end = () => {
      return { todos: ['学不动了，睡觉'] }
    }

    expect(await task({ todos: [] }, end)).toMatchObject({
      todos: ['学不动了，睡觉'],
    })
  })

  it('parallel.queue.all({ todos: string[] })', async () => {
    type Context = {
      todos: { priority: number; todo: string }[]
    }
    const run = parallel([
      parallel<Context>(
        async (ctx) => {
          await sleep(100)

          ctx.todos.push({
            priority: -1,
            todo: '学语法',
          })
        },
        async (ctx) => {
          await sleep(100)

          ctx.todos.push({
            priority: 0,
            todo: '学设计模式',
          })
        }
      ),
      async (ctx: Context) => {
        await sleep(100)
        ctx.todos.push({
          priority: 4,
          todo: '水群',
        })
      },
      parallel<Context>(
        async (ctx) => {
          await sleep(100)

          ctx.todos.push({
            priority: 1,
            todo: '学 vue',
          })
        },
        async (ctx) => {
          await sleep(100)

          ctx.todos.push({
            priority: 2,
            todo: '学 react',
          })
        },
        async (ctx) => {
          await sleep(100)

          ctx.todos.push({
            priority: 3,
            todo: '学 angular',
          })
        }
      ),
    ])

    const myLearnPlan = await run({
      todos: [],
    })

    myLearnPlan.todos.sort(
      (pre: { priority: number }, next: { priority: number }) => {
        return pre.priority - next.priority
      }
    )

    expect(myLearnPlan.todos).toEqual([
      { priority: -1, todo: '学语法' },
      { priority: 0, todo: '学设计模式' },
      { priority: 1, todo: '学 vue' },
      { priority: 2, todo: '学 react' },
      { priority: 3, todo: '学 angular' },
      { priority: 4, todo: '水群' },
    ])
  })
})
