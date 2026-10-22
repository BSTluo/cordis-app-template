# 创建 Cordis 应用

## 1. 推荐方式：使用 Cordis 脚手架

从零创建 Cordis 应用时，优先使用官方脚手架：

```powershell
yarn create cordis
```

脚手架会生成基础的 `package.json`、Cordis 配置、TypeScript 配置和构建配置。命令执行过程中的项目名称、模板或其他选项以当前脚手架版本提供的交互提示为准。

创建完成后进入项目目录并安装依赖：

```powershell
cd <项目目录>
yarn install
```

然后执行构建和启动验证：

```powershell
yarn build
yarn dev
```

本文后续章节用于解释脚手架生成的文件，以及在已有项目中手动调整配置的场景。通常不需要从空目录逐项手工创建这些文件。

## 2. 环境准备

建议使用当前项目锁定或兼容的 Node.js 版本，并启用 Corepack 管理 Yarn。开始前确认：

```powershell
node --version
yarn --version
```

当前项目使用 Yarn workspaces。安装依赖：

```powershell
yarn install
```

## 3. 应用目录结构

推荐的 Cordis 应用结构如下：

```text
cordis-app/
├── app.yml
├── cordis.yml
├── package.json
├── tsconfig.base.json
├── tsconfig.json
├── yakumo.yml
├── client/
├── data/
├── docs/
└── external/
    └── my-plugin/
        ├── package.json
        ├── tsconfig.json
        ├── src/
        └── client/
```

根项目负责运行应用和管理 workspace，插件包保持独立，便于单独构建和发布。

## 4. 配置 package.json

根 `package.json` 至少需要声明 workspace、运行脚本和 Cordis/Yakumo 依赖：

```json
{
  "workspaces": ["external/*", "packages/*"],
  "scripts": {
    "build": "yakumo build",
    "dev": "cross-env NODE_ENV=development NODE_OPTIONS=\"--import tsx --import @cordisjs/unyaml\" cordis run",
    "start": "cordis run"
  }
}
```

当前仓库还支持多层嵌套 workspace，因此 `workspaces` 中包含多个 `external/*` 派生路径。

## 5. 配置 cordis.yml

`cordis.yml` 用于加载 CLI 和应用编排插件。当前项目的配置如下：

```yaml
- name: '@cordisjs/plugin-cli'
  config:
    name: cordis
- name: '@cordisjs/plugin-cli-cordis'
  config:
    path: ./app.yml
    daemon:
      enabled: true
    prelude:
      - name: '@cordisjs/plugin-env'
      - name: '@cordisjs/plugin-logger-console'
```

`@cordisjs/plugin-cli` 提供命令行入口，`@cordisjs/plugin-cli-cordis` 负责读取并运行 `app.yml`。`prelude` 中的插件会在应用配置加载前准备环境变量和控制台日志。

## 6. 配置 app.yml

`app.yml` 用于声明应用实际加载的插件及其配置。插件名称通常对应 npm 包名，插件配置位于 `config` 节点或插件专用字段中。

新增插件时，先确认插件已经安装到当前 workspace，再将插件加入 `app.yml`。不要只修改前端菜单或本地状态来模拟插件安装，最终加载状态必须由 Cordis Loader 和运行时确认。

## 7. 配置 TypeScript

插件的 TypeScript 配置需要与当前 Cordis 类型声明匹配。当前项目插件通常使用：

```json
{
  "extends": "../../tsconfig.base",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "lib",
    "module": "esnext",
    "moduleResolution": "bundler"
  },
  "include": ["src"]
}
```

`moduleResolution: bundler` 是当前 Cordis 4.x 类型声明场景下的重要兼容设置。详情见[版本兼容性](./cordis-version-compatibility.md)。

## 8. 配置 Yakumo

当前仓库的 `yakumo.yml`：

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

这会让每个符合 workspace 规则的包按顺序执行 TypeScript、后端打包和前端构建。

## 9. 启动和验证

先构建：

```powershell
yarn build
```

开发模式：

```powershell
yarn dev
```

生产模式：

```powershell
yarn start
```

验证重点：

1. Cordis CLI 能够启动。
2. `app.yml` 中声明的插件能被发现。
3. 插件依赖的服务已经存在或被正确声明为可选依赖。
4. WebUI 插件的 `dist/manifest.json` 和资源已经生成。
5. 运行日志没有模块解析、依赖缺失或 Entry 路径错误。

## 10. 已有项目中增加配置的顺序

1. 先确认项目是否由 `yarn create cordis` 生成，或使用了兼容的 Cordis 模板。
2. 阅读并确认现有 `package.json`、`cordis.yml`、`app.yml` 和 `yakumo.yml`。
3. 安装需要的 Cordis 官方插件。
4. 创建最小运行时插件。
5. 执行 `yarn build`。
6. 启动 `yarn dev` 并确认日志。
7. 再增加数据库、HTTP、Loader 或 WebUI 能力。

对于当前仓库，不要重新运行脚手架覆盖现有配置；应直接在现有 workspace 中新增或修改插件包。

## 11. 使用仓库模板创建插件

在仓库根目录运行：

```powershell
yarn setup
```

按提示选择普通插件、注册页面插件、服务插件或带服务和注册页面的插件，再输入小写 kebab-case 插件名 `my-plugin`、完整包名 `cordis-plugin-my-plugin`，或带命名空间的包名 `@my-scope/cordis-plugin-my-plugin`。脚手架模板保存在仓库的 `scripts/templates` 中，不需要在 `external` 里保留模板插件。脚手架会在 `external/my-plugin` 创建 workspace 插件包；包名会标准化为 `cordis-plugin-my-plugin` 或保留命名空间的 `@my-scope/cordis-plugin-my-plugin`。页面插件使用唯一的 `/my-plugin` 路由。已有同名目录不会被覆盖。

创建后可以检查生成的入口和配置，按需填写业务逻辑，再执行 `yarn build` 验证。
脚手架自身可通过 `yarn test:setup` 运行测试。
