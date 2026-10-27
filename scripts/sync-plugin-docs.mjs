import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const externalRoot = join(root, 'external')
const servicesRoot = join(root, 'docs', 'services')
const generatedRoot = join(servicesRoot, 'plugins')
const sidebarPath = join(servicesRoot, 'sidebar.ts')

async function writeIfChanged(path, content) {
  try {
    if (await readFile(path, 'utf8') === content) return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content)
}

async function findMarkdown(directory) {
  const result = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) result.push(...await findMarkdown(path))
    else if (entry.isFile() && entry.name.endsWith('.md')) result.push(path)
  }
  return result
}

async function syncPluginDocs() {
const plugins = []
for (const entry of await readdir(externalRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const pluginRoot = join(externalRoot, entry.name)
  const docsRoot = join(pluginRoot, 'docs')
  let docs
  try {
    docs = await findMarkdown(docsRoot)
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }
  if (!docs.length) continue

  const manifest = JSON.parse(await readFile(join(pluginRoot, 'package.json'), 'utf8'))
  const targetRoot = join(generatedRoot, entry.name)
  await mkdir(targetRoot, { recursive: true })
  const expectedFiles = new Set()
  for (const file of docs) {
    const destination = join(targetRoot, relative(docsRoot, file))
    expectedFiles.add(destination)
    await writeIfChanged(destination, await readFile(file, 'utf8'))
  }
  const existingFiles = await findMarkdown(targetRoot)
  await Promise.all(existingFiles
    .filter(file => !expectedFiles.has(file))
    .map(file => rm(file, { force: true })))

  const entryDoc = docs.find(file => relative(docsRoot, file) === 'index.md') ?? docs[0]
  const links = docs.map(file => {
    const rel = relative(docsRoot, file).split(sep).join('/')
    const link = `/services/plugins/${entry.name}/${rel.replace(/\.md$/, '')}`
    const title = rel === 'index.md' ? (manifest.description || manifest.name) : rel.replace(/\.md$/, '')
    return { text: title, link }
  })
  plugins.push({ slug: entry.name, name: manifest.name || entry.name, description: manifest.description || entry.name, links, entry: `/services/plugins/${entry.name}/${relative(docsRoot, entryDoc).split(sep).join('/').replace(/\.md$/, '')}` })
}

plugins.sort((a, b) => a.slug.localeCompare(b.slug))
const sidebar = `export const serviceSidebar = ${JSON.stringify(plugins.map(plugin => ({ text: plugin.name, items: plugin.links })), null, 2)}\n`
await writeIfChanged(sidebarPath, sidebar)

const index = [
  '# 项目 Service 使用说明',
  '',
  '各 Service 文档由对应插件维护，以下内容从 `external/*/docs/` 自动汇集生成。请在插件自己的 `docs/` 中更新文档，不要直接编辑本目录下的插件文档产物。',
  '',
  ...plugins.map(plugin => `- [${plugin.description}](${plugin.entry})（\`${plugin.name}\`）`),
  '',
].join('\n')
await writeIfChanged(join(servicesRoot, 'index.md'), index)

console.log(`Synced docs for ${plugins.length} plugin(s).`)
}

await syncPluginDocs()

if (process.argv.includes('--watch')) {
  let timer
  let running = false
  let pending = false

  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      if (running) {
        pending = true
        return
      }
      running = true
      try {
        await syncPluginDocs()
      } catch (error) {
        console.error('[sync-plugin-docs] sync failed:', error)
      } finally {
        running = false
        if (pending) {
          pending = false
          schedule()
        }
      }
    }, 150)
  }

  watch(externalRoot, { recursive: true }, (_event, filename) => {
    if (!filename) return
    const normalized = filename.split(sep).join('/')
    if (normalized.includes('/docs/') && normalized.endsWith('.md')) schedule()
  })

  console.log('[sync-plugin-docs] watching external/*/docs for changes...')

  if (process.argv.includes('--dev')) {
    const vitepress = spawn('vitepress', ['dev', 'docs'], {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    const shutdown = () => {
      vitepress.kill()
      process.exit()
    }
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    vitepress.on('exit', code => process.exit(code ?? 0))
  }
}
