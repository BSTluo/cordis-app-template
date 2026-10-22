# 常见问题排查

## 1. 找不到 Cordis 导出或 Context 成员

**表现**：TypeScript 报导出不存在，或 `ctx` 上的服务属性无法识别。

**排查**：

1. 确认 workspace 实际解析到的 Cordis 版本。
2. 查看插件 tsconfig 是否使用 `module: esnext` 和 `moduleResolution: bundler`。
3. 使用 TypeScript 的 `--traceResolution` 检查 `cordis` 的子声明文件是否被加载。
4. 确认依赖服务的类型扩展包已安装且与服务实现版本匹配。
5. 避免导入 package exports 未公开的深层路径。

## 2. 构建提示依赖缺失

检查插件自己的 `package.json`。被插件运行时导入的 bare module 应在 `dependencies`、`peerDependencies` 或可选依赖中明确声明。workspace hoist 只能帮助本地解析，不能替代发布元数据。

## 3. 命令成功但缺少 lib 产物

- 检查 Yakumo 是否发现该 workspace 包。
- 检查 `tsc` 和 `esbuild` pipeline 是否执行到该包。
- 检查 TypeScript 输出目录、入口路径和 `package.json` 的 `main`。
- 确认不是旧产物造成误判；清理后重新构建并检查 `lib/index.js`、`lib/index.d.ts`。
- 查看完整构建日志，不能只看退出码。

## 4. 缺少 dist/manifest.json 或前端资源

- 确认 `@cordisjs/client/yakumo` 已加入 `yakumo.yml`。
- 确认插件存在 `client` 入口，且客户端入口配置正确。
- 确认 pipeline 中执行了 `client`。
- 检查客户端构建输出目录和 manifest 文件名。
- 检查 WebUI Entry 的 `source`、`manifest` 和 `baseUrl` 相对关系。

## 5. 插件没有被加载

- 确认插件包已在 workspace 中或已安装。
- 检查应用配置中的包名和配置层级。
- 确认 Loader 已启用并能发现包。
- 检查插件导出的 `name`、`apply` 和依赖声明。
- 检查 `inject` 所需服务是否由宿主加载，且加载顺序合理。
- 查看 Cordis 启动日志中的加载失败和依赖解析信息。

## 6. WebUI 页面或路由不可用

- 确认 WebUI 服务已经注入。
- 确认客户端 Entry 成功加载。
- 检查路由 path 与 Entry `routes` 范围一致。
- 确认 manifest 引用资源均存在且已包含在 npm 包中。
- 检查宿主是否由自定义 UI 替换了官方入口；替换后仍需消费 Cordis WebUI Entry 契约。
- 直接刷新页面测试服务端路由回退和客户端路由解析。

## 7. HMR 不生效

- 确认运行在开发环境并启用了 HMR 插件。
- 确认被修改文件属于 HMR 监听范围。
- 检查依赖插件是否在当前加载配置中。
- 若模块状态不能安全替换，完全重启应用以区分 HMR 问题和插件逻辑问题。

## 8. API 返回 401/403

当前项目约定除登录等少数接口外，大部分 API 请求需要带登录接口返回的 Token。检查客户端是否使用正确的请求头和 Token 生命周期；401/403 时按项目鉴权策略安全重新登录或提示用户。禁止把 Token 输出到日志或存入不安全的持久化位置。

## 9. Windows PowerShell 注意事项

本机环境为 Windows PowerShell 5.1，链式命令使用分号 `;`，不要假设 `&&` 可用。复杂的 `node -e` 引号转义容易进入续行提示，可优先使用短小的 `node -p` 或独立脚本。

## 10. 进一步定位

- 先检查根配置：`package.json`、`cordis.yml`、`app.yml`、`yakumo.yml`。
- 再检查插件配置：`package.json`、`tsconfig.json`、`src/index.ts` 和 `client/index.ts`。
- 最后检查构建产物与打包清单：`lib/`、`dist/`、`npm pack --dry-run`。
- 版本/类型问题见[版本兼容性](./cordis-version-compatibility.md)。
