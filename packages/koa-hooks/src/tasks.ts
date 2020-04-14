import { flatten } from './util'

export type TaskResult<T> = T | Promise<T>
export type NextHandler<T> = (value?: T) => TaskResult<any>
export type ParallelTaskHandler<T> = (value: T) => TaskResult<any>
export type TaskHandler<T> = (value: T, next: NextHandler<T>) => TaskResult<any>

export type SyncNextHandler<T> = (value: T) => T
export type SyncParallelTaskHandler<T> = (value: T) => T
export type SyncSeriesTaskHandler<T> = (value: T, next: SyncNextHandler<T>) => T
export type SyncTaskHandler<T> = (value: T, next: SyncNextHandler<T>) => T

/** 串行任务处理函数 */
export type SeriesTaskHandler<T> = (
  value: T,
  next: NextHandler<T>
) => TaskResult<any>

/** 串行任务队列管理
 *
 * @param tasks 任务队列
 *
 * @returns 可执行函数
 */
export function series<T = any>(
  ...handlers: (SeriesTaskHandler<T> | SeriesTaskHandler<T>[])[]
): (value: T, next?: NextHandler<T>) => TaskResult<any> {
  const tasks = flatten<SeriesTaskHandler<T>>(...handlers)
  return async (value, next) => runTasks<T>(tasks.concat(next || []), value)
}

/** 执行串行任务列表
 *
 * @param tasks 任务队列
 * @param initialValue 初始值
 */
export async function runTasks<T = any>(
  tasks: SeriesTaskHandler<T>[],
  initialValue?: T
): Promise<T> {
  let index = -1
  let perviousValue = initialValue as T

  async function dispatch(i: number, value?: T): Promise<T> {
    if (i <= index) {
      return Promise.reject(new Error('next() called multiple times'))
    }

    if (value !== undefined) {
      perviousValue = value
    }

    if (i === tasks.length) {
      return perviousValue
    }

    index = i

    const task = tasks[i]
    if (typeof task === 'function') {
      try {
        const currentValue = await task(
          perviousValue,
          dispatch.bind(null, i + 1)
        )
        if (currentValue !== undefined) {
          perviousValue = currentValue
        }
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return perviousValue
  }

  return dispatch(0)
}

/**
 * 并行任务队列管理
 *
 * @param tasks 任务队列
 *
 * @returns 可执行函数
 */
export function parallel<T = any>(
  handler: ParallelTaskHandler<T> | ParallelTaskHandler<T>[],
  ...handlers: ParallelTaskHandler<T>[]
): TaskHandler<T> {
  const tasks = flatten<ParallelTaskHandler<T>>(handler, ...handlers)

  return async function run(value, next): Promise<T> {
    const result = await runAllTasks(tasks, value)

    if (typeof next === 'function') {
      const rv = await next(result)
      return rv === undefined ? result : rv
    }

    return result
  }
}

/** 运行并行任务列表
 *
 * @param tasks 任务队列
 * @param initialValue 初始值
 */
export async function runAllTasks<T = any>(
  tasks: TaskHandler<T>[],
  initialValue: T
): Promise<T> {
  await Promise.all(tasks.map((task) => task(initialValue, () => void 0)))
  return initialValue
}

export function seriesSync<T = any>(
  ...handlers: (SyncTaskHandler<T> | SyncTaskHandler<T>[])[]
): (value: T, next?: SyncNextHandler<T>) => any {
  const tasks = flatten<SyncSeriesTaskHandler<T>>(...handlers)
  return (value, next) => runSyncTasks<T>(tasks.concat(next || []), value)
}

export function runSyncTasks<T = any>(
  tasks: SyncSeriesTaskHandler<T>[],
  initialValue?: T
): T {
  let index = -1
  let perviousValue = initialValue as T

  function dispatch(i: number, value?: T): T {
    if (i <= index) {
      throw new Error('next() called multiple times')
    }

    if (value !== undefined) {
      perviousValue = value
    }

    if (i === tasks.length) {
      return perviousValue
    }

    index = i

    const task = tasks[i]
    if (typeof task === 'function') {
      const currentValue = task(perviousValue, dispatch.bind(null, i + 1))
      if (currentValue !== undefined) {
        perviousValue = currentValue
      }
    }

    return perviousValue
  }

  return dispatch(0)
}

// 兼容 esm 模块
export default module.exports
