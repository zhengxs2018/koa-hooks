export const container: Map<string, any> = new Map()

export function provide(id: string, value: any) {
  container.set(id, value)
}

export function inject<T>(name: string): T {
  if (container.has(name)) {
    return container.get(name)
  }

  throw new Error('name')
}
