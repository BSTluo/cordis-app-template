# 发布 Cordis 插件

## 1. 发布前检查 package.json

确认包元数据完整且与真实产物一致：

- `name`：使用 npm 上唯一且稳定的包名；组织包需确认组织权限。
- `version`：遵循 SemVer，并避免覆盖已发布版本。
- `type`：ESM 插件通常为 `module`。
- `main`、`types`、`exports`：指向实际生成的后端入口和声明文件。
- `files`：只包含运行所需的 `lib`、`dist`、README、许可证等。
- `dependencies`：插件自身运行必需的依赖。
- `peerDependencies`：由宿主共享、需要约束兼容范围的 Cordis/服务包。
- `devDependencies`：构建、类型检查和测试工具。

带 WebUI 的插件应确保前端入口可被 Entry 加载，manifest 引用的静态资源也进入发布包。当前项目的 `external/progress/package.json` 可作为结构参考，但它使用的 rc 版本范围属于本项目基线，不应原样用于所有新插件。

## 2. 发布前验证

从仓库根目录执行：

```powershell
yarn build
npm pack --dry-run
```

检查：

1. `lib/index.js` 和 `lib/index.d.ts` 存在。
2. WebUI 插件的 manifest 与其引用资源存在。
3. `npm pack --dry-run` 的文件列表不包含 `.env`、缓存、密钥、测试输出或本地临时文件。
4. 包内相对路径与 Entry 中配置的路径一致。
5. README、许可证和必要元数据被包含。
6. 在干净目录中安装打包文件，验证模块导入和 Cordis Loader 加载。

建议在独立临时 workspace 中验证，不要只依赖根仓库 hoist 后的依赖解析结果。

## 3. npm 发布

发布者需要对目标 npm 用户或组织拥有权限。确认登录身份和 registry 后：

```powershell
npm whoami
npm publish
```

发布 scoped 包时，根据组织和包的可见性要求选择正确的访问级别；首次公开发布通常需要显式配置公开访问。不要在文档、仓库或命令历史中记录 npm Token。

发布前提升 `version` 并提交对应变更。若使用预发布版本，采用例如 `0.2.0-rc.1` 的版本号，并明确其 API 可能变化。

## 4. 版本、标签和变更记录

每次发布建议：

1. 更新版本号和 CHANGELOG。
2. 执行构建、测试和打包内容检查。
3. 提交变更并创建匹配版本的 Git tag。
4. 发布 npm 包。
5. 创建 GitHub Release，记录兼容的 Cordis 和 WebUI 范围。
6. 在宿主项目中安装该版本做集成验证。

已发布的 npm 版本不可直接覆盖。发现严重问题时发布修复版本，并按 npm 规则 deprecate 有问题版本；不要将删除版本作为常规回滚策略。

## 5. 兼容性声明

插件 README 和 `peerDependencies` 应明确声明兼容的：

- Cordis 核心版本。
- 插件所依赖的 Cordis 服务提供包版本。
- WebUI/Loader/Client 版本（若使用）。
- Node.js 运行环境（若使用特定运行时能力）。

对 rc 版本应使用经过验证的兼容范围，避免以过宽范围暗示稳定兼容。详见[版本兼容性](./cordis-version-compatibility.md)。

## 6. 安全和发布维护

- 不发布 Token、密码、私钥、真实数据库配置或用户数据。
- 用 `npm pack --dry-run` 检查实际发布清单。
- 不在客户端包中嵌入服务器秘密。
- 限定依赖版本并持续处理安全告警。
- 对有破坏性的配置或数据变更提供迁移说明。
- 维护 README、变更记录和支持版本范围。

## 7. 插件市场和其他分发方式

npm 发布只是包分发，不等于自动进入 Cordis 市场。若目标市场有索引、审核、元数据或签名要求，应以对应市场的官方规则为准。不要把宿主项目的本地插件命名约定误当作 Cordis 全生态发布强制规则。