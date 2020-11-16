import { series, runTasks, seriesSync, runSyncTasks } from '../../src/index'

describe('series.spec.ts', () => {
  it('series.pipeline(string)', async () => {
    const task = series<string>(
      (value, next) => next(`${value} + js`),
      (value) => `${value} + css`
    )

    expect(await task('html')).toEqual('html + js + css')
  })

  it('series.pipeline.abort(string)', async () => {
    const task = series<string>(
      async (value, next) => next(`${value} + js`),
      async (value, next) => next(`${value} + css`),
      (value) => `${value} + vue`, // 学不动了，break
      async (value, next) => `${await next(value)} + react`,
      async (value, next) => `${await next(value)} + angular`
    )

    expect(await task('html')).toEqual('html + js + css + vue')
  })

  it('series.multiple.pipeline(string)', async () => {
    const tasks = [
      seriesSync<string>(
        (value, next) => next(`${value} + js`),
        (value, next) => next(`${value} + css`)
      ),
      series<string>(
        async (value, next) => `${await next(value)} + angular`,
        async (value, next) => `${await next(value)} + react`
      ),
      (value: string) => `${value} + vue`
    ]

    expect(await runTasks(tasks, 'html')).toEqual('html + js + css + vue + react + angular')
  })

  it('series.pipeline.sync(string)', () => {
    const task = seriesSync<string>(
      (value, next) => next(`${value} + js`),
      (value: string) => `${value} + css`
    )

    expect(task('html')).toEqual('html + js + css')
  })

  it('series.pipeline.sync.abort(string)', () => {
    const task = seriesSync<string>(
      (value, next) => next(`${value} + js`),
      (value, next) => next(`${value} + css`),
      (value) => `${value} + vue`, // 学不动了，break
      (value, next) => `${next(value)} + react`,
      (value, next) => `${next(value)} + angular`
    )

    expect(task('html')).toEqual('html + js + css + vue')
  })

  it('series.multiple.pipeline.sync(string)', () => {
    const tasks = [
      seriesSync<string>(
        (value, next) => next(`${value} + js`),
        (value, next) => next(`${value} + css`)
      ),
      seriesSync<string>(
        (value, next) => `${next(value)} + angular`,
        (value, next) => `${next(value)} + react`
      ),
      (value: string) => `${value} + vue`
    ]

    expect(runSyncTasks(tasks, 'html')).toEqual('html + js + css + vue + react + angular')
  })
})
