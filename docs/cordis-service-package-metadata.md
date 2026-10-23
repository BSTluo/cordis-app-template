# Cordis Service package.json 元数据规范

本文说明插件 package.json 中 `cordis.service` 元数据的用途与配置方式。Agent 和开发者在创建或使用 Cordis Service 时，必须按本规范检查并维护插件清单。

## 字段语义

服务声明放在 `package.json` 的 `cordis.service` 下：

- `required`：插件运行所必需的服务名数组。
- `optional`：插件可以使用、但运行时允许缺失的服务名数组。
- `implements`：此插件提供/实现的服务名数组。

这些是插件元数据中的依赖/能力声明，不会代替源码中的依赖注入或服务注册。插件实际使用服务仍须遵循 Cordis 注入和服务契约；新增或变更字段时，应以项目当前锁定版本的类型、源码及官方包元数据复核语义。

## 配置示例

使用数据库服务的插件应把实际注入的服务声明为必需依赖。例如本项目 `scripts/templates/database/src/index.ts` 注入 `database` 与 `model`，故其清单应配置：

```json
{
  "cordis": {
    "service": {
      "required": ["database", "model"]
    }
  }
}
```

若服务只在特定功能启用时使用，且插件能在服务缺失时正常运行，可列入 `optional`。提供 Service 的插件应使用 `implements` 声明其提供的服务名。不要把使用的服务写入 `implements`。

## 当前项目已核对的证据

- `@cordisjs/plugin-database@4.1.1` 的 package.json 使用 `cordis.service.implements: ["model"]`，表示该包提供 `model` 服务。
- `@cordisjs/plugin-database-webui@0.5.0` 使用 `cordis.service.required: ["model", "webui"]`，表示其依赖这两个服务。
- 本项目数据库模板源码的 `inject` 为 `['database', 'model']`；对应生成的插件是服务使用方，元数据应声明 `required: ["database", "model"]`。

验证状态：已针对当前 node_modules 安装版本核对包元数据与模板源码；升级 Cordis 或相关插件后，应重新确认兼容性。

## 实施要求

1. 创建插件、增加 Service 使用或调整注入依赖时，先查阅本规范，并核对实际的 `inject`、服务注册名称及提供方契约。
2. 同步修改插件 `package.json` 的 `cordis.service`，使 `required`、`optional`、`implements` 与真实依赖/实现一致。
3. 只在确实可容错缺失时将服务列入 `optional`；不可把必需依赖误标为可选。
4. 新增或改变服务配置结论时，更新本文件的证据、适用版本和验证状态，并在 `docs/README.md` 保持导航可达。
5. 运行时跨插件调用仍必须通过 Cordis Service 注入和契约，不得直接导入其他插件实现。
