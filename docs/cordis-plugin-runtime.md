# 开发 Cordis 运行时插件

## 1. 插件目录

建议从 `external/template` 复制出新插件：

```text
my-plugin/
├── package.json
├── tsconfig.json
├── src/
│   └── index.ts
├── lib/
└── README.md
```

如果插件提供 WebUI，再增加 `client/` 和 `dist/`。

## 2. package.json

一个可发布的运行时插件至少需要声明入口和构建文件：

```json
{
  "name": "@example/cordis-plugin-demo",
  "version": "0.1.0",
  "type": "module",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./lib/index.js"
    }
  },
  "files": ["lib", "README.md"],
  "dependencies": {
    "schemastery": "^3.18.0"
  },
  "peerDependencies": {
    "cordis": "^4.0.0-rc.10"
  }
}
```

运行时真正需要加载的依赖放在 `dependencies`，由宿主提供且需要共享版本的 Cordis 核心或服务通常放在 `peerDependencies`。开发时才需要的工具放在 `devDependencies`。

## 3. 最小插件实现

```ts
import { Context } from 'cordis'

export const name = 'demo'
export const inject = []

export function apply(ctx: Context) {
  ctx.on('ready', () => {
    ctx.logger('demo').info('plugin is ready')
  })
}
```

`name` 是插件自身标识，`inject` 声明插件需要的服务，`apply` 是插件被加载后执行的入口。实际项目中应根据目标 Cordis 版本核对事件和日志 API 的精确类型。

## 4. 服务注入

当前示例 `external/progress/src/index.ts` 使用：

```ts
export const inject = ['webui']

export function apply(ctx: Context, config: Config) {
  ctx.webui.addEntry({
    baseUrl: import.meta.url,
    source: '../client/index.ts',
    manifest: '../dist/manifest.json',
    routes: ['/progress'],
  })
}
```

注入服务的优点是：插件声明自己的运行条件，Cordis 可以在服务缺失时给出明确的依赖关系。可选服务应在 `service` 配置或插件元数据中明确标记，并在代码中处理服务不存在的情况。

## 5. 插件配置

使用 `schemastery` 为配置定义类型、默认值和描述：

```ts
import Schema from 'schemastery'

export interface Config {
  time?: number
}

export const Config: Schema<Config> = Schema.object({
  time: Schema.number().default(0).description('执行间隔'),
})
```

配置 schema 应与运行时行为保持一致。敏感信息不要写入日志；配置保存、校验和权限控制应由宿主服务最终确认。

## 6. 生命周期与资源释放

插件中创建的事件监听、定时器、网络连接和数据库订阅都应绑定到当前 Context 的生命周期。不要把资源挂到全局变量后永久保留，否则插件停用或热重载时会产生重复监听和资源泄漏。

推荐原则：

- 初始化逻辑放在插件加载或服务就绪阶段。
- 只在依赖服务可用后访问该服务。
- 停用插件时释放定时器、订阅和连接。
- 错误要带插件名和操作上下文，避免吞掉异常。
- 对外暴露的类型和方法保持稳定，内部实现可以随版本演进。

## 7. 依赖设计

- `inject` 表达运行时服务依赖。
- `peerDependencies` 表达宿主和插件之间的版本契约。
- `dependencies` 表达插件自身必须携带的运行时库。
- `devDependencies` 只用于构建、类型检查和测试。

不要因为本地 workspace 能够解析某个包，就省略插件 `package.json` 中的运行时依赖声明。Yakumo/esbuild 可能会据此判断依赖是否应该 external 化。

## 8. 最小验证流程

```powershell
yarn build
yarn dev
```

构建后至少检查：

- `lib/index.js` 存在。
- `lib/index.d.ts` 存在。
- 包的 `main` 和 `types` 能解析到上述文件。
- 宿主 `app.yml` 能发现插件。
- 插件依赖的服务已经加载。
