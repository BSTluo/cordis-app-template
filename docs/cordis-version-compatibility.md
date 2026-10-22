# Cordis 版本兼容性

## 1. 当前项目版本基线

以下版本范围来自本仓库根 `package.json`，不是最新版本列表：

| 组件 | 当前声明 |
|---|---|
| `cordis` | `^4.0.0-rc.10` |
| `@cordisjs/client` | `^0.8.2` |
| `@cordisjs/plugin-webui` | `^0.8.2` |
| `@cordisjs/plugin-loader` | `^1.0.0-rc.7` |
| `@cordisjs/plugin-loader-webui` | `^0.10.1` |
| `yakumo` | `^3.2.1` |
| `yakumo-tsc` | `^3.0.1` |
| `yakumo-esbuild` | `^3.0.2` |
| TypeScript | `^5.9.3` |

`^` 表示允许符合 semver 规则的版本更新，但对 `0.x` 和预发布版本应尤其谨慎。实际安装版本以 lockfile/workspace 安装结果为准。

## 2. 版本匹配原则

- Cordis 核心与依赖其内部 API 的官方插件应使用彼此验证过的版本组合。
- WebUI 后端包、Loader WebUI 和 `@cordisjs/client` 应作为一组验证，避免只升级其中一个。
- 插件的 `peerDependencies` 应声明插件真正验证过的范围，而不是照抄宿主版本或写成过宽范围。
- 对 Cordis rc 版本，应在发布说明中标出测试过的 rc 范围，并为版本变化预留迁移空间。
- 升级后至少重新执行类型检查、构建、宿主启动和 WebUI 页面验证。

## 3. TypeScript 模块解析

当前 Cordis 声明文件中存在无扩展名相对导入的情况。使用 `module: nodenext` 时，TypeScript 可能无法按预期加载 Cordis 子模块声明，表现为类型导出缺失、Context 成员不存在等。

当前项目的插件 tsconfig 使用：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

如遇类型问题，先用 `tsc --traceResolution` 检查目标声明和子模块是否实际解析，再确认 `cordis` 版本与 `moduleResolution` 设置。不要通过随意增加 `any` 或深层导入规避 API/类型解析问题。

## 4. 依赖声明和打包兼容

Yakumo/esbuild 会根据包的依赖元数据处理 bare import。每个插件都应在自己的 `package.json` 中声明运行时依赖，即使 Yarn workspace hoist 让本地构建能找到它。发布前使用 `npm pack --dry-run` 检查文件，并在干净目录安装验证。

## 5. 升级检查清单

1. 阅读相关仓库的 release notes、README 和迁移说明。
2. 检查 `package.json` 中 peer dependency 范围。
3. 执行类型检查与 `yarn build`。
4. 检查后端 `lib`、客户端 `dist` 和 manifest。
5. 启动应用验证 Loader、注入服务和生命周期。
6. 验证 WebUI Entry、路由和静态资源。
7. 使用 `npm pack` 检查插件包文件。
8. 更新本页版本表和变更记录。
