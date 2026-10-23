import { spawn } from 'node:child_process'
import { access, copyFile, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const templateRoot = join(dirname(fileURLToPath(import.meta.url)), 'templates')

const templates = [
  { label: '普通插件', directory: 'normal', type: 'normal' },
  { label: '注册页面的插件', directory: 'page', type: 'page' },
  { label: '服务插件', directory: 'service', type: 'service' },
  { label: '带服务和注册页面的插件', directory: 'page-service', type: 'page-service' },
  { label: '数据库操作插件', directory: 'database', type: 'database' },
]

const ignoredDirectories = new Set(['node_modules', 'lib', 'dist'])
const ignoredFiles = new Set(['.tsbuildinfo', 'tsconfig.tsbuildinfo'])
const pluginSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function normalizePluginName(input) {
  if (typeof input !== 'string') {
    throw new Error('Plugin name must be lowercase kebab-case.')
  }

  const value = input.trim()
  const scopedMatch = value.match(/^@([a-z0-9](?:[a-z0-9._-]*[a-z0-9])?)\/cordis-plugin-(.+)$/)
  if (scopedMatch) {
    const [, namespace, slug] = scopedMatch
    if (!pluginSlugPattern.test(slug)) {
      throw new Error('Plugin name must use lowercase kebab-case after "cordis-plugin-".')
    }
    return { slug, packageName: `@${namespace}/cordis-plugin-${slug}` }
  }

  const slug = value.startsWith('cordis-plugin-')
    ? value.slice('cordis-plugin-'.length)
    : value
  if (!pluginSlugPattern.test(slug)) {
    throw new Error('Use a plugin name, "cordis-plugin-<name>", or "@<namespace>/cordis-plugin-<name>" in lowercase kebab-case.')
  }
  return { slug, packageName: `cordis-plugin-${slug}` }
}

function toServiceClass(name) {
  const parts = name.split('-')
  if (parts.at(-1) === 'service') parts.pop()
  let pascalName = parts
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
  if (!/^[A-Z_$]/.test(pascalName)) pascalName = `Plugin${pascalName}`
  return `${pascalName}Service`
}

function getPageTitle(name) {
  return name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

async function copyTemplate(source, target) {
  const entries = await readdir(source, { withFileTypes: true })
  await mkdir(target, { recursive: true })

  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    const sourcePath = join(source, entry.name)
    const targetPath = join(target, entry.name)
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        await copyTemplate(sourcePath, targetPath)
      }
    } else if (entry.isFile() && !ignoredFiles.has(entry.name)) {
      await copyFile(sourcePath, targetPath)
    }
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

async function customizePackage(target, packageName, includesPage, includesDatabase) {
  const path = join(target, 'package.json')
  const manifest = await readJson(path)
  manifest.name = packageName

  if (!includesPage) {
    delete manifest.exports
    delete manifest.files[0]
    delete manifest.peerDependencies['@cordisjs/plugin-webui']
    delete manifest.peerDependenciesMeta
    delete manifest.devDependencies['@cordisjs/client']
    delete manifest.devDependencies['@cordisjs/plugin-loader-webui']
    delete manifest.devDependencies['@cordisjs/plugin-webui']
  } else {
    delete manifest.peerDependenciesMeta
  }
  if (includesDatabase) {
    manifest.peerDependencies['@cordisjs/plugin-database'] = '^4.1.1'
    manifest.peerDependenciesMeta ??= {}
    delete manifest.peerDependenciesMeta['@cordisjs/plugin-database']
  } else {
    delete manifest.peerDependencies['@cordisjs/plugin-database']
    delete manifest.peerDependenciesMeta?.['@cordisjs/plugin-database']
  }
  await writeJson(path, manifest)
}

async function customizePluginSources(target, name, type) {
  const sourcePath = join(target, 'src', 'index.ts')
  const pagePath = join(target, 'client', 'index.ts')
  const includesPage = type === 'page' || type === 'page-service'
  const includesService = type === 'service' || type === 'page-service'
  const serviceClass = toServiceClass(name)

  if (type === 'normal') {
    await writeFile(sourcePath, `import { Context } from 'cordis'

export const name = '${name}'
export const inject = []

export interface Config {

}

export const Config: Schema<Config> = Schema.object({
  
});


export function apply(ctx: Context, config: Config) {
  // Add plugin logic here.
}
`)
    await rm(join(target, 'src', 'service.ts'), { force: true })
  } else if (type === 'service') {
    const servicePath = join(target, 'src', 'service.ts')
    let serviceSource = await readFile(servicePath, 'utf8')
    serviceSource = serviceSource.replaceAll('TemplateServeice', serviceClass)
    await writeFile(servicePath, serviceSource)
    await writeFile(sourcePath, `import { Context } from 'cordis'
import { ${serviceClass} } from './service'

export const name = '${name}'
export const inject = []

export interface Config {

}

export const Config: Schema<Config> = Schema.object({
  
});

export function apply(ctx: Context, config: Config) {
  ctx.plugin(${serviceClass}, {
    endpoint: 'https://example.com/api',
    timeout: 30_000,
    ttl: 43_200_000,
  })
}
`)
  } else if (type === 'database') {
    let source = await readFile(sourcePath, 'utf8')
    source = source.replace(/export const name = '[^']*'/, `export const name = '${name}'`)
    source = source.replaceAll('template_record', `${name.replaceAll('-', '_')}_record`)
    await writeFile(sourcePath, source)
  } else {
    let source = await readFile(sourcePath, 'utf8')
    source = source
      .replace(/export const name = '[^']*'/, `export const name = '${name}'`)
      .replaceAll('TemplateServeice', serviceClass)
      .replaceAll('/template', `/${name}`)
    await writeFile(sourcePath, source)
  }

  if (includesPage) {
    let clientSource = await readFile(pagePath, 'utf8')
    clientSource = clientSource
      .replace(/name:\s*'[^']*'/, `name: '${getPageTitle(name)}'`)
      .replaceAll('/custom-page', `/${name}`)
      .replaceAll('/template', `/${name}`)
      .replaceAll('Context, icons', 'Context')
    await writeFile(pagePath, clientSource)
  }

  if (type === 'page-service') {
    const servicePath = join(target, 'src', 'service.ts')
    const serviceSource = (await readFile(servicePath, 'utf8')).replaceAll('TemplateServeice', serviceClass)
    await writeFile(servicePath, serviceSource)
  }

}

async function promptForTemplate(rl) {
  stdout.write('选择插件类型：\n')
  templates.forEach((template, index) => stdout.write(`  ${index + 1}. ${template.label}\n`))

  while (true) {
    const answer = (await rl.question(`请输入选项编号 (1-${templates.length}): `)).trim()
    const index = Number(answer) - 1
    if (Number.isInteger(index) && templates[index]) return templates[index]
    stdout.write(`无效选项，请输入 1 到 ${templates.length}。\n`)
  }
}

async function promptForName(rl) {
  while (true) {
    const name = (await rl.question('请输入插件名称 (xxx、cordis-plugin-xxx 或 @namespace/cordis-plugin-xxx): ')).trim()
    try {
      return normalizePluginName(name)
    } catch {
      stdout.write('请输入小写 kebab-case 插件名，可带 cordis-plugin- 前缀或 @namespace/ 作用域。\n')
    }
  }
}

export async function createPlugin({ name, type, workspaceRoot = root }) {
  const { slug, packageName } = normalizePluginName(name)

  const template = templates.find((item) => item.type === type)
  if (!template) throw new Error(`Unknown plugin type: ${type}`)

  const source = join(templateRoot, template.directory)
  const target = join(workspaceRoot, 'external', slug)
  await access(source)
  try {
    await mkdir(target)
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Target directory already exists: external/${name}`)
    }
    throw error
  }

  try {
    await copyTemplate(source, target)
    if (type === 'page-service') {
      await copyTemplate(join(templateRoot, 'page', 'client'), join(target, 'client'))
    }
    await copyFile(join(templateRoot, 'package.json'), join(target, 'package.json'))
    await copyFile(join(templateRoot, 'tsconfig.json'), join(target, 'tsconfig.json'))
    await customizePluginSources(target, slug, type)
    await customizePackage(target, packageName, type === 'page' || type === 'page-service', type === 'database')
  } catch (error) {
    await rm(target, { recursive: true, force: true })
    throw error
  }

  return target
}

export async function runInstall(workspaceRoot = root) {
  await new Promise((resolve, reject) => {
    const child = spawn('yarn', ['install'], { cwd: workspaceRoot, stdio: 'inherit', shell: process.platform === 'win32' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) return resolve()
      reject(new Error(`yarn install failed${signal ? ` (${signal})` : ` with exit code ${code}`}.`))
    })
  })
}

export async function runSetup() {
  if (!stdin.isTTY) {
    throw new Error('yarn setup requires an interactive terminal.')
  }

  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const template = await promptForTemplate(rl)
    const { slug, packageName } = await promptForName(rl)
    const target = await createPlugin({ name: packageName, type: template.type })
    stdout.write(`已创建 ${template.label}: ${target}\n`)
    stdout.write(`包名: ${packageName} (插件目录和路由名: ${slug})\n`)
    stdout.write('正在运行 yarn install，以更新工作区插件链接...\n')
    await runInstall()
    stdout.write('工作区插件链接已更新。\n')
    stdout.write('请检查生成的插件入口，并按需完善业务逻辑。\n')
  } finally {
    rl.close()
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  runSetup().catch((error) => {
    console.error(`插件创建失败：${error.message}`)
    process.exitCode = 1
  })
}
