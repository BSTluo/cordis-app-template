# 开发 Cordis WebUI 插件

## 1. 架构概览

带页面的 Cordis 插件由两部分组成：

- **后端入口**：由 Cordis Loader 加载，声明服务依赖、插件配置，并将前端 Entry 注册给 WebUI 服务。
- **前端入口**：由 `@cordisjs/client` 加载，在浏览器侧注册路由、菜单和页面组件。

前后端的 `Context` 不同：后端 Context 属于 Cordis 服务端运行时；前端 Context 属于浏览器客户端插件运行时。不要把后端对象直接传入浏览器，也不要假设前端 Context 可以访问后端服务实例。

## 2. 插件包配置

参照 `external/progress/package.json`：

- `main` / `types` 指向 `lib/` 后端构建产物。
- `exports["./client"]` 暴露前端入口。
- `files` 发布 `lib` 和 `dist`。
- `peerDependencies` 声明 Cordis 和 WebUI 兼容范围。
- `cordis.public` 声明对外公开的前端资源目录。

具体字段和 Loader/WebUI 的解释以目标版本的包源码与类型为准。

## 3. 后端 Entry 注册

当前示例 `external/progress/src/index.ts`：

```ts
export const name = 'progress'
export const inject = ['webui']

export function apply(ctx: Context) {
  ctx.webui.addEntry({
    baseUrl: import.meta.url,
    source: '../client/index.ts',
    manifest: '../dist/manifest.json',
    routes: ['/progress'],
  })
}
```

字段用途（以当前示例配置为依据）：

- `baseUrl`：Entry 相对路径解析的基准 URL。
- `source`：客户端 TypeScript 入口。
- `manifest`：客户端构建生成的 manifest 文件。
- `routes`：该 Entry 可能注册的前端路由范围。

需要确保相对路径以插件包发布后的目录布局仍然成立，并将前端源文件和构建产物纳入 npm 包。

## 4. 前端入口与路由

当前示例 `external/progress/client/index.ts`：

```ts
import { Context } from '@cordisjs/client'
import Page from './page.vue'

export default (ctx: Context) => {
  ctx.client.router.page({
    name: 'cordis Harness',
    path: '/progress',
    component: Page,
  })
}
```

前端默认导出函数由客户端加载。页面路径应在插件和宿主范围内唯一，名称应清晰；插件停用或卸载后应由宿主/客户端生命周期移除相关路由与资源。

## 5. 页面和资源

页面可使用 Vue 单文件组件以及当前客户端构建支持的资源导入方式。建议：

- 页面按需加载，避免影响宿主首屏。
- 处理加载中、失败和无权限状态。
- 事件监听、定时器和订阅应随页面卸载释放。
- 前端不保存服务器密钥或长期凭据。
- 所有敏感操作由后端鉴权，前端显示状态不能代替后端授权。

本仓库项目要求 API 请求遵守 Token 规则：除登录等少数接口外，大部分请求应带登录返回的 Token；401/403 时安全重登录或提示用户，不要将 Token 输出到日志。

## 6. 构建和宿主接入

在根目录运行：

```powershell
yarn build
```

构建完成后检查 `external/progress/dist/manifest.json` 及其引用资源。之后确认：

1. 插件包在 workspace 中可被 Loader 发现。
2. 宿主加载了 WebUI 和对应 Loader WebUI 能力。
3. 插件的 `inject` 所需服务已提供。
4. Entry 的 `source` 与 `manifest` 路径正确。
5. `/progress` 路由可访问，刷新页面后仍能正常解析。

如果宿主替换了官方 WebUI，仍需兼容 Cordis 原生 Loader、Entry 和客户端注册契约；不要仅依赖自定义前端菜单状态作为插件注册事实。

## 7. 示例文件

- 后端入口：[`external/progress/src/index.ts`](../external/progress/src/index.ts)
- 客户端入口：[`external/progress/client/index.ts`](../external/progress/client/index.ts)
- 插件包配置：[`external/progress/package.json`](../external/progress/package.json)
- 页面组件：`external/progress/client/page.vue`

当前样例含有用于开发的占位配置描述，发布前应替换为准确的配置说明。