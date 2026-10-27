# Cordis 插件开发文档

本目录面向 Cordis 应用开发者和插件作者，说明如何创建应用、开发插件、构建 WebUI、调试并发布插件。

Cordis 和 Yakumo 均属于 [cordiverse](https://github.com/cordiverse) 生态：

- [Cordis](https://github.com/cordiverse/cordis)：运行时与插件编排框架。
- [Yakumo](https://github.com/cordiverse/yakumo)：面向多 workspace 和嵌套 workspace 的构建工具。
- [Cordis npm 组织](https://www.npmjs.com/org/cordisjs)：官方插件和客户端包。

> Cordis 当前仍在活跃开发中。本文档以当前仓库配置和已验证示例为基础；具体 API 仍应以目标版本的类型定义、源码和变更记录为准。

> 本页是 GitHub 仓库中的文档索引。运行 `yarn docs` 可用 VitePress 预览完整文档站点，其首页为 [`index.md`](./index.md)。

## 推荐阅读顺序

1. [创建 Cordis 应用](./cordis-application-setup.md)
2. [开发运行时插件](./cordis-plugin-runtime.md)
3. [开发 WebUI 插件](./cordis-plugin-webui.md)
4. [Yakumo 构建与本地调试](./cordis-build-and-debug.md)
5. [发布 Cordis 插件](./cordis-plugin-publishing.md)
6. [官方 SDK 与插件参考](./cordis-sdk-reference.md)
7. [版本兼容性](./cordis-version-compatibility.md)
8. [Cordis Service package.json 元数据规范](./cordis-service-package-metadata.md)
9. [知识沉淀与文档维护](./guide/knowledge-capture.md)
10. [常见问题排查](./troubleshooting.md)

SDK 参考页除包清单外，还提供可参考当前项目版本的具体示例：数据库建模、CRUD、事务和表删除，插件配置 Schema，WebUI Page 注册，Cordis Service，以及 HTTP 中间件。

## 当前项目基线

本仓库是一个 Yarn workspaces 管理的 Cordis 应用：

- 插件包位于 `external/*`。
- 插件后端源码位于 `src/`，构建到 `lib/`。
- WebUI 前端源码位于 `client/`，资源构建到 `dist/`。
- 根构建命令为 `yarn build`，实际执行 `yakumo build`。
- `yakumo.yml` 的构建流水线为 `tsc → esbuild → client`。
- 插件骨架通过 `yarn setup` 从 `scripts/templates/` 生成到 `external/`。
- 若仓库包含具体示例插件，可在对应插件文档中查看；当前文档示例路径以实际工作区内容为准。

当前版本基线以根目录 `package.json` 为准，主要包括：

- `cordis: ^4.0.0-rc.7`
- `@cordisjs/client: ^0.8.2`
- `yakumo: ^3.2.1`
- `yakumo-tsc: ^3.0.1`
- `yakumo-esbuild: ^3.0.2`

## 快速命令

```powershell
yarn install
yarn build
yarn dev
yarn start
```

`yarn dev` 运行开发模式，`yarn start` 运行应用。插件开发时应先执行 `yarn build`，确认后端和前端产物都已经生成，再启动应用验证。

## 示例索引

- 运行时入口：[external/progress/src/index.ts](../external/progress/src/index.ts)
- 前端入口：[external/progress/client/index.ts](../external/progress/client/index.ts)
- 插件包配置：[external/progress/package.json](../external/progress/package.json)
- 插件脚手架模板位于 `scripts/templates/`，通过 `yarn setup` 生成到 `external/`。
- 根构建配置见仓库根目录的 `yakumo.yml`。
