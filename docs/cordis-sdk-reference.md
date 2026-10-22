# Cordis 官方 SDK 与插件参考

本页按用途整理当前项目使用的 Cordis 生态包。这里的“SDK”是方便阅读的总称，具体包可能是运行时核心、官方插件、客户端库或 Yakumo 扩展，并非都属于独立 SDK。

> 包的版本、API 和维护状态会变化。请同时查看 npm 元数据、目标版本的类型声明和对应仓库。Cordiverse 项目索引：[github.com/cordiverse](https://github.com/cordiverse)。

## 核心运行时

| 包/概念 | 用途 | 备注 |
|---|---|---|
| [`cordis`](https://github.com/cordiverse/cordis) | 插件化运行时、Context、服务和生命周期 | 当前项目使用 `^4.0.0-rc.10`；rc API 可能变化 |
| `Context` | 插件的运行上下文和服务访问入口 | 插件开发从 Context 与生命周期入手 |
| Service / inject | 声明、注册和注入运行时能力 | 按目标版本类型定义确认精确写法 |

## Yakumo 构建工具

| 包 | 用途 | 当前项目 |
|---|---|---|
| [`yakumo`](https://github.com/cordiverse/yakumo) | workspace 管理和任务流水线 | `^3.2.1` |
| [`yakumo-tsc`](https://github.com/cordiverse/yakumo) | TypeScript 检查/声明构建扩展 | `^3.0.1` |
| [`yakumo-esbuild`](https://github.com/cordiverse/yakumo) | esbuild 后端构建扩展 | `^3.0.2` |
| `@cordisjs/client/yakumo` | 客户端 Entry 的 Yakumo 构建扩展 | 由 `@cordisjs/client` 提供，当前 `^0.8.2` |

Yakumo 官方 README 还列出其他扩展，例如 `yakumo-mocha`；具体可用扩展以官方仓库为准。

## 客户端和 WebUI

| 包 | 用途 | 当前项目 |
|---|---|---|
| [`@cordisjs/client`](https://github.com/cordiverse/cordis) | 浏览器客户端 Context、路由和 Entry 加载 | `^0.8.2` |
| `@cordisjs/plugin-webui` | 服务端 WebUI Entry 管理和页面承载能力 | `^0.8.2` |
| `@cordisjs/plugin-loader-webui` | Loader 的 WebUI 管理接口 | `^0.10.1` |
| `@cordisjs/plugin-webui-sso` | WebUI 与 SSO 集成 | `^0.2.6` |
| `@cordisjs/plugin-server-webui` | Server 与 WebUI 集成 | `^0.5.0` |
| `@cordisjs/plugin-http-webui` | HTTP 与 WebUI 集成 | `^0.5.0` |

客户端侧的 Context 与服务端 Context 是不同运行时。页面注册可参考 [`external/progress/client/index.ts`](../external/progress/client/index.ts)，后端 Entry 注册可参考 [`external/progress/src/index.ts`](../external/progress/src/index.ts)。

## 应用基础插件

| 包 | 用途 | 当前项目版本 |
|---|---|---|
| `@cordisjs/plugin-cli` | CLI 命令入口 | `^1.1.2` |
| `@cordisjs/plugin-cli-cordis` | Cordis 应用配置和启动编排 | `^1.0.5` |
| `@cordisjs/plugin-env` | 环境变量加载 | `^1.0.1` |
| `@cordisjs/plugin-logger-console` | 控制台日志 | `^1.0.0` |
| `@cordisjs/plugin-hmr` | 开发热重载 | `^1.1.0` |
| `@cordisjs/plugin-timer` | 定时器服务 | `^1.1.3` |
| `@cordisjs/plugin-include` | 插件包含/加载辅助能力 | `^1.1.0` |
| `@cordisjs/plugin-loader` | 插件加载和管理 | `^1.0.0-rc.7` |

## 数据、网络与服务端

| 包 | 用途 | 当前项目版本 |
|---|---|---|
| `@cordisjs/plugin-database` | 数据库抽象 | `^4.1.1` |
| `@cordisjs/plugin-database-sqlite` | SQLite 实现 | `^5.1.1` |
| `@cordisjs/plugin-http` | HTTP 客户端/服务能力 | `^1.5.2` |
| `@cordisjs/plugin-http-socks` | SOCKS 代理支持 | `^1.0.0` |
| `@cordisjs/plugin-server` | HTTP 服务端 | `^1.7.0` |
| `@cordisjs/plugin-server-acl` | 服务端访问控制 | `^1.0.1` |
| `@cordisjs/plugin-server-proxy` | 代理集成 | `^1.2.1` |

## 认证、管理和可观测性

| 包 | 用途 | 当前项目版本 |
|---|---|---|
| `@cordisjs/plugin-sso` | 单点登录基础能力 | `^0.2.3` |
| `@cordisjs/plugin-sso-oauth` | OAuth 登录 | `^0.2.3` |
| `@cordisjs/plugin-sso-password` | 密码认证 | `^0.2.2` |
| `@cordisjs/plugin-sso-server` | 服务端 SSO 支持 | `^0.2.2` |
| `@cordisjs/plugin-database-webui` | 数据库 WebUI | `^0.5.0` |
| `@cordisjs/plugin-logger-webui` | 日志 WebUI | `^0.6.1` |
| `@cordisjs/plugin-insight` | 运行状态/洞察 | `^4.5.1` |
| `@cordisjs/plugin-market` | 插件市场能力 | `^0.5.1` |
| `@cordisjs/plugin-notifier` | 通知能力 | `^0.8.0` |
| `@cordisjs/plugin-group` | 用户/群组相关能力 | `^1.0.0` |
| `cordis-plugin-cron` | Cron 定时任务生态插件 | `^0.1.0` |

表中版本取自当前根 `package.json`，不代表最新版本或彼此无条件兼容。各包可能由不同仓库维护，应通过包元数据和 README 确认来源与 API。

## 如何选择能力

1. 优先判断该能力属于 Cordis 核心服务还是插件。
2. 在宿主 `app.yml` 中加载服务提供插件。
3. 在插件 `inject` 中声明依赖。
4. 通过类型定义确认可调用 API。
5. 在 `peerDependencies` 中约束宿主需要提供的包版本。
6. 对客户端能力确认其是否由 WebUI Entry 支持，不要在 Node.js 后端导入浏览器专用模块。

## 实战示例：数据库建模与 CRUD

以下示例对应当前项目安装的 `@cordisjs/plugin-database` API。先确保宿主加载了数据库抽象插件和一个 driver（当前项目使用 SQLite）：

```yaml
- name: '@cordisjs/plugin-database'
- name: '@cordisjs/plugin-database-sqlite'
```

数据库模型由插件通过 TypeScript module augmentation 声明，表结构和迁移由数据库模型 API 管理，而不是在每次插件启动时直接执行 SQL 建表。

### 1. 声明表结构

在插件后端入口或独立的模型文件中声明表：

```ts
import { Context } from 'cordis'
import type {} from '@cordisjs/plugin-database'

declare module '@cordisjs/plugin-database' {
	interface Tables {
		todo: Todo
	}
}

interface Todo {
	id: number
	title: string
	done: boolean
}

export function apply(ctx: Context) {
	ctx.model.extend('todo', {
		id: 'unsigned',
		title: 'string(255)',
		done: 'boolean',
	}, {
		primary: 'id',
		autoInc: true,
	})
}
```

`ctx.model` 和 `ctx.database` 都由 database 插件扩展到 Cordis Context；当前模型声明使用 `ctx.model.extend()`。字段类型可使用 database 的字段定义，具体可选类型以已安装版本 `@cordisjs/plugin-database/lib/model.d.ts` 为准。

### 2. 创建和读取

```ts
const row = await ctx.database.create('todo', {
	title: '写插件文档',
	done: false,
})

const all = await ctx.database.get('todo', {})
const pending = await ctx.database.get('todo', { done: false })
const one = await ctx.database.get('todo', { id: row.id })
```

`get()` 返回数组；即使条件理论上只匹配一条，也要处理空数组。

### 3. 更新

```ts
await ctx.database.set('todo', { id: row.id }, {
	title: '完成插件文档',
	done: true,
})

const updated = await ctx.database.setOne('todo', { id: row.id }, {
	done: true,
})
```

`set()` 返回写入结果，`setOne()` 返回更新后的行或 `undefined`。更新条件要尽可能使用主键或唯一键，避免意外批量更新。

### 4. 删除行

```ts
const result = await ctx.database.remove('todo', { id: row.id })
```

在 Web API 或管理命令中执行删除前应做权限校验，并验证调用者对目标数据有操作权限。

### 5. 事务

```ts
await ctx.database.withTransaction(async (database) => {
	const todo = await database.create('todo', {
		title: '事务内创建',
		done: false,
	})

	await database.set('todo', { id: todo.id }, { done: true })
})
```

事务回调中的操作应使用传入的 `database` 对象，确保属于同一事务。

### 6. 表结构演进与删除表

为已发布插件增加字段时，应使用 database migration，不能简单地在生产库删除并重建表。当前 API 支持：

```ts
ctx.model.migrate('todo', {
	note: 'text',
}, async (database) => {
	// 迁移期间需要的数据修正写在这里。
	// 具体 migration 调度方式应与应用当前 database driver/版本配置一致。
})
```

数据库类也提供 `drop('todo')` 和 `dropAll()`，但它们会破坏性地删除表。通常**不要**把它们放在插件正常启动路径中。仅在明确的数据重置、测试清理或一次性管理操作中使用，并先备份数据、确认环境和权限：

```ts
// 危险操作示例：会删除 todo 表及其数据。
await ctx.database.drop('todo')
```

生产环境表结构升级应优先采用可前滚、可审计的 migration；删除用户数据应设计单独的管理员命令和二次确认。

## 实战示例：插件配置 Schema

插件的 `Config` schema 用于校验配置、提供默认值和描述。当前模板采用 `schemastery`：

```ts
import { Context } from 'cordis'
import Schema from 'schemastery'

export interface Config {
	interval: number
	enabled: boolean
	endpoint?: string
}

export const Config: Schema<Config> = Schema.object({
	interval: Schema.number().default(60).min(1).description('轮询间隔（秒）'),
	enabled: Schema.boolean().default(true).description('是否启用'),
	endpoint: Schema.string().role('url').description('可选服务地址'),
})

export function apply(ctx: Context, config: Config) {
	ctx.logger('demo').info('enabled=%s, interval=%d', config.enabled, config.interval)
}
```

要点：

- 导出的 `Config` schema 会被 Cordis 插件系统用于配置校验。
- TypeScript `Config` 类型应与 schema 字段一致。
- 为选项配置清晰默认值和描述，避免无效或含糊配置。
- 密钥字段应使用目标管理 UI 支持的敏感字段能力；不要写入日志。
- 当前应用配置格式和 schema 支持的扩展方法以实际管理插件版本为准。

## 实战示例：注册 WebUI Page

### 后端注册 Entry

```ts
import { Context } from 'cordis'
import type {} from '@cordisjs/plugin-webui'

export const name = 'demo'
export const inject = ['webui']

export function apply(ctx: Context) {
	ctx.webui.addEntry({
		baseUrl: import.meta.url,
		source: '../client/index.ts',
		manifest: '../dist/manifest.json',
		routes: ['/demo'],
	})
}
```

### 客户端注册页面

```ts
import { Context } from '@cordisjs/client'
import Page from './page.vue'

export default (ctx: Context) => {
	ctx.client.router.page({
		name: '示例页面',
		path: '/demo',
		component: Page,
	})
}
```

后端 Entry 的 `source` 用于开发模式加载源文件，`manifest` 用于生产模式加载构建后的模块；`routes` 提供路由匹配/加载反馈信息。确保入口文件与 manifest 都被发布。对应的仓库实例如 [`external/progress`](../external/progress)。

## 实战示例：创建 Cordis Service

当能力需要被多个插件共享，或需要由 Cordis 生命周期管理时，可以实现 Service。示例使用当前 `cordis` API：

```ts
import { Context, Service } from 'cordis'

declare module 'cordis' {
	interface Context {
		greeting: Greeting
	}
}

class Greeting extends Service {
	static inject = ['logger']

	constructor(ctx: Context) {
		super(ctx, 'greeting')
	}

	say(name: string) {
		this.ctx.logger('greeting').info('Hello, %s!', name)
	}
}

export const name = 'greeting-provider'
export const provide = ['greeting']
export const inject = ['greeting']

export function apply(ctx: Context) {
	ctx.plugin(Greeting)
	ctx.greeting.say('Cordis')
}
```

`Service` 子类通过 `ctx.plugin(Greeting)` 安装，并使用 `provide` 声明提供的服务名；消费者通过 `inject` 声明依赖，再使用类型扩展后的 `ctx.greeting`。如果需要初始化/释放资源，可按当前版本 Service API 实现静态 `Service.init` 生命周期钩子，并确保返回的清理函数负责释放资源。Service API 仍可能随 Cordis 版本演进，升级时请复核类型定义。

## 实战示例：HTTP 中间件

HTTP 中间件由 `@cordisjs/plugin-server` 提供。宿主需要加载该插件，使用者声明 `server` 注入：

```ts
import { Context } from 'cordis'
import type {} from '@cordisjs/plugin-server'

export const name = 'request-timing'
export const inject = ['server']

export function apply(ctx: Context) {
	ctx.server.use(async (req, res, next) => {
		const startedAt = Date.now()
		await next()
		ctx.logger('request-timing').info(
			'%s %s completed in %dms',
			req.method,
			req.url,
			Date.now() - startedAt,
		)
	})
}
```

`use()` 注册全局中间件并返回一个移除函数。中间件通常要 `await next()` 让后续中间件/路由继续执行；若有意终止请求，则应按 `@cordisjs/plugin-server` 的 `Response` 类型正确返回响应。不要在全局中间件中读取或记录密码、Token 等敏感内容。

路由处理器也采用中间件签名，例如 `ctx.server.get('/health', async (req, res) => ...)`；精确响应 API 以当前版本 `@cordisjs/plugin-server/lib` 声明为准。

## 官方资料入口

- [Cordis GitHub](https://github.com/cordiverse/cordis)
- [Yakumo GitHub](https://github.com/cordiverse/yakumo)
- [Cordiverse GitHub 组织](https://github.com/cordiverse)
- [Cordis npm 组织](https://www.npmjs.com/org/cordisjs)
- [Cordis Primer（文档仍在建设中）](https://deepseek-harness.github.io/deepseek-harness/reference/cordis-primer)
