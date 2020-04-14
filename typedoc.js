module.exports = {
  name: 'koa-hooks',
  mode: 'file',
  gitRevision: 'master',
  readme: 'packages/koa-hooks/README.md',
  out: 'dist-docs',
  // excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
  ignoreCompilerErrors: true,
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/examples/**',
    '**/history/**',
    '**/*.spec.ts',
    '**/tests/**/*.ts',
  ]
  // lernaExclude: ['@zhengxs/koa-hooks-examples'],
}
