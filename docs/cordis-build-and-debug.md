# Yakumo 构建与本地调试

## 1. Yakumo 在项目中的职责

Yakumo 管理 workspace 包并统一执行构建任务。当前仓库在根 `yakumo.yml` 中注册 Yakumo 核心、TypeScript、esbuild 和客户端构建扩展：

```yaml
- name: yakumo
  config:
    pipeline:
      build:
        - tsc
        - esbuild
        - client
      clean:
        - tsc --clean
- name: yakumo-esbuild
- name: yakumo-tsc
- name: '@cordisjs/client/yakumo'
```

构建顺序为：

1. `tsc`：执行 TypeScript 类型检查和声明生成。
2. `esbuild`：构建插件后端 JavaScript。
3. `client`：构建 WebUI 客户端入口、manifest 和静态资源。

## 2. 常用命令

从仓库根目录运行：

```powershell
yarn build
```

该脚本映射到 `yakumo build`。单包或其他 Yakumo 子命令的具体参数可能随 Yakumo 版本变化，可通过当前安装版本的帮助信息确认：

```powershell
yarn yakumo --help
```

清理时使用当前 pipeline 配置支持的 Yakumo 命令，并检查包内是否留下旧的 `lib/` 或 `dist/` 文件，避免误判为新构建产物。

## 3. 插件 TypeScript 配置

Cordis 4.x 当前类型定义场景下，插件通常需要显式指定：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler"
  }
}
```

若使用 `nodenext` 出现 Cordis 类型缺少导出或子模块解析失败，应先检查 TypeScript 实际加载的声明文件和该包的 exports，再按[兼容性说明](./cordis-version-compatibility.md)处理。

## 4. 产物检查

运行时插件通常应生成：

- `lib/index.js`：运行时入口。
- `lib/index.d.ts`：TypeScript 类型声明。

WebUI 插件还应生成：

- `dist/manifest.json`：客户端入口和资源映射。
- `dist/` 下 manifest 引用的 JS、CSS、图片等资源。

命令退出码为 0 不足以证明产物正确。应确认文件实际存在、manifest 指向的文件均存在，并检查 npm 包的 `files` 字段是否包含这些目录。

## 5. 依赖声明与 external

Yakumo/esbuild 的 external 处理会根据插件 `package.json` 中的依赖关系识别 bare import。运行时 import 的包必须正确放入 `dependencies`、`peerDependencies` 或适当的可选依赖声明中。只靠 workspace hoist 让本机能够解析并不够，遗漏依赖可能导致构建缺产物或发布后运行失败。

## 6. 本地开发流程

推荐工作流：

1. 在 `external/` 创建插件包并声明 workspace 包名。
2. 编写 `src/index.ts`，需要页面时同步编写 `client/`。
3. 执行 `yarn build`。
4. 检查 `lib/`、`dist/manifest.json` 和资源。
5. 在 `app.yml` 中加载插件（适用于当前应用配置方式）。
6. 执行 `yarn dev`，观察 Loader 和插件日志。
7. 修改代码后按当前 HMR 配置验证重载；若重载异常，重启应用确认是否只是 HMR 限制。

根项目脚本：

- `yarn dev`：development 环境，加载 `tsx` 和 YAML 支持。
- `yarn start`：通过 Cordis CLI 启动应用。

## 7. 构建故障排查

- **TypeScript 找不到 Cordis 导出**：检查 `moduleResolution`、实际安装版本和声明文件解析结果。
- **提示依赖缺失**：检查包是否在插件 `package.json` 声明，确认其属于运行时依赖还是 peer dependency。
- **没有 `lib/index.js`**：检查 tsc/esbuild 阶段、包的入口配置和 workspace 是否被发现。
- **没有 manifest**：检查客户端入口是否存在、client pipeline 是否执行、客户端构建扩展是否加载。
- **路由加载失败**：核对 Entry `source`、`manifest`、`baseUrl` 和发布文件布局。
- **看似构建成功但运行失败**：用 `npm pack` 检查最终发布文件，并在干净目录安装验证。

更多问题见[排错手册](./troubleshooting.md)。