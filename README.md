# React.js hooks + koa.js 风格的轻量级 web 框架

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

React.js hooks + koa.js 风格的轻量级 web 框架。

## 安装

koa-hooks requires node v10 or higher for ES2015 and async function support.

```bash
$ npm install @zhengxs/koa-hooks --save
```

## 示例代码

**hello,world**

```javascript
import { useCallback, listen } from '@zhengxs/koa-hooks'

useCallback(async ctx => {
  ctx.body = `hello,world`
})

listen(8080, () => {
  console.log('Liston http://127.0.0.1:8080')
})
```

**路由匹配 和 重定向**

```javascript
import { Server } from 'http'

import { useCallback, useRouteMatch, redirect, urlFor, listen } from '@zhengxs/koa-hooks'

useRouteMatch('product.detail', '/api/product/:id', ctx => {
  ctx.status = 200
  ctx.type = 'application/json'
  ctx.body = ctx.params
})

useRouteMatch('/api/user/info', () => {
  console.log('用户未登陆，跳转到登陆页')
  redirect(urlFor('login'))
})

useRouteMatch('login', '/login', ctx => {
  ctx.body = 'This login page.'
})

useCallback(ctx => {
  ctx.body = `hello,world`
})

listen(8080, function onReady(this: Server) {
  console.log('Liston http://127.0.0.1:8080')
})

```

## 启动项目

你需要安装 [node.js][node.js] 的版本为 `nodejs >= 8.0`。

克隆此仓库后运行:

```shell
# 安装依赖，推荐使用 yarn 安装
$ npm install

# 启动示例工程
$ npm run dev
```

在 `package.json` 文件的 `scripts` 部分还有一些其他脚本可用.

## 版本发布

```bash
# 更新版本号，内置代码检查
$ npm version <new_version|major|minor|patch>

# 发布代码包，自动代码
$ npm publish
```

可使用 `npm version --help` 查看帮助信息

## 感谢

感谢这些开源贡献给予的灵感，以下排名不分先后。

- And more

[node.js]: https://nodejs.org/
