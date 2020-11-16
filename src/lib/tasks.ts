import { flatten } from './util'

export type TaskResult<T> = T | Promise<T>
export type Next<T> = (value?: T) => TaskResult<any>
export type ParallelTask<T> = (value: T) => TaskResult<any>
export type Task<T> = (value: T, next: Next<T>) => TaskResult<any>

export type SyncNext<T> = (value: T) => T
export type SyncParallelTask<T> = (value: T) => T
export type SyncSeriesTask<T> = (value: T, next: SyncNext<T>) => T
export type SyncTask<T> = (value: T, next: SyncNext<T>) => T

/** 串行任务处理函数 */
export type SeriesTask<T> = (value: T, next: Next<T>) => TaskResult<any>

/** 串行任务队列管理
 *
 * @param tasks 任务队列
 *
 * @returns 可执行函数
 */
export function series<T = any>(
  ...handlers: (SeriesTask<T> | SeriesTask<T>[])[]
): (value: T, next?: Next<T>) => TaskResult<any> {
  const tasks = flatten<SeriesTask<T>>(handlers)
  return async (value, next) => runTasks<T>(tasks.concat(next || []), value)
}

/** 执行串行任务列表
 *
 * @param tasks 任务队列
 * @param initialValue 初始值
 */
export async function runTasks<T = any>(tasks: SeriesTask<T>[], initialValue?: T): Promise<T> {
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
        const currentValue = await task(perviousValue, dispatch.bind(null, i + 1))
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
  ...handlers: (ParallelTask<T> | ParallelTask<T>[])[]
): (value: T, next?: Next<T>) => TaskResult<any> {
  const tasks = flatten<ParallelTask<T>>(handlers)

  return async function run(value, next): Promise<T> {
    await Promise.all(tasks.map((task) => task(value)))

    if (typeof next === 'function') {
      const result = await next(value)
      return result === undefined ? value : result
    }

    return value
  }
}

export function seriesSync<T = any>(
  ...handlers: (SyncTask<T> | SyncTask<T>[])[]
): (value: T, next?: SyncNext<T>) => any {
  const tasks = flatten<SyncSeriesTask<T>>(handlers)
  return (value, next) => runSyncTasks<T>(tasks.concat(next || []), value)
}

export function runSyncTasks<T = any>(tasks: SyncSeriesTask<T>[], initialValue?: T): T {
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
