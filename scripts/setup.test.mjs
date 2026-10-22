import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { cp, mkdir, mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test, { after, before } from 'node:test'
import { createPlugin, normalizePluginName } from './setup.mjs'

const repositoryRoot = resolve(import.meta.dirname, '..')
const workspaceRoot = await mkdtemp(join(tmpdir(), 'cordis-setup-'))

before(async () => {
  const templateRoot = join(workspaceRoot, 'external')
  await mkdir(templateRoot)
  for (const template of ['normal', 'page', 'service', 'page-service', 'database']) {
    await cp(join(repositoryRoot, 'scripts', 'templates', template), join(templateRoot, template), {
      recursive: true,
      filter: (path) => !path.split(/[\\/]/).some((part) =>
        ['node_modules', 'lib', 'dist', '.tsbuildinfo', 'tsconfig.tsbuildinfo'].includes(part)),
    })
  }
  await cp(join(repositoryRoot, 'scripts', 'templates', 'page', 'client'), join(templateRoot, 'page-service', 'client'), {
    recursive: true,
  })
})

after(async () => {
  await rm(workspaceRoot, { recursive: true, force: true })
})

async function readGenerated(name, path) {
  return readFile(join(workspaceRoot, 'external', name, path), 'utf8')
}

test('creates all plugin types with unique names and matching page routes', async () => {
  const variants = [
    { name: 'plain-sample', type: 'normal', page: false, service: false },
    { name: 'page-sample', type: 'page', page: true, service: false },
    { name: 'service-sample', type: 'service', page: false, service: true },
    { name: 'page-service-sample', type: 'page-service', page: true, service: true },
    { name: 'database-sample', type: 'database', page: false, service: false, database: true },
  ]

  for (const variant of variants) {
    await createPlugin({ ...variant, workspaceRoot })
    const manifest = JSON.parse(await readGenerated(variant.name, 'package.json'))
    const source = await readGenerated(variant.name, 'src/index.ts')

    assert.equal(manifest.name, `cordis-plugin-${variant.name}`)
    assert.equal(manifest.peerDependencies['@cordisjs/plugin-database'] !== undefined, variant.database ?? false)
    assert.equal(existsSync(join(workspaceRoot, 'external', variant.name, 'entry.mjs')), true)
    assert.equal(source.includes("export const name = '" + variant.name + "'"), true)
    assert.equal(existsSync(join(workspaceRoot, 'external', variant.name, 'client', 'index.ts')), variant.page)
    assert.equal((await readdir(join(workspaceRoot, 'external', variant.name, 'src'))).includes('service.ts'), variant.service)

    if (variant.page) {
      const clientSource = await readGenerated(variant.name, 'client/index.ts')
      assert.match(clientSource, new RegExp(`path: '/cordis/${variant.name}'`))
      assert.match(source, new RegExp(`routes: \\['/cordis/${variant.name}'\\]`))
    }
    if (variant.service) {
      assert.match(source, /ctx\.plugin\(/)
      assert.doesNotMatch(source, /TemplateServeice/)
      assert.doesNotMatch(await readGenerated(variant.name, 'src/service.ts'), /TemplateServeice/)
    }
    if (variant.database) {
      assert.deepEqual(JSON.parse(await readGenerated(variant.name, 'package.json')).peerDependenciesMeta?.['@cordisjs/plugin-database'], undefined)
      assert.match(source, /export const inject = \['database', 'model'\]/)
      assert.match(source, /ctx\.model\.extend\(/)
      assert.match(source, /ctx\.database\.prepared\(\)/)
      assert.match(source, /declare module '@cordisjs\/plugin-database'/)
    }
  }
})

test('rejects unsafe names, unknown types, and existing output directories', async () => {
  await assert.rejects(createPlugin({ name: '../escape', type: 'normal', workspaceRoot }), /kebab-case/)
  await assert.rejects(createPlugin({ name: 'unknown-type', type: 'other', workspaceRoot }), /Unknown plugin type/)
  await assert.rejects(createPlugin({ name: 'cordis-plugin-plain-sample', type: 'normal', workspaceRoot }), /already exists/)
})

test('normalizes plain, prefixed, and scoped package names', async () => {
  assert.deepEqual(normalizePluginName('sample-plugin'), {
    slug: 'sample-plugin',
    packageName: 'cordis-plugin-sample-plugin',
  })
  assert.deepEqual(normalizePluginName('cordis-plugin-sample-plugin'), {
    slug: 'sample-plugin',
    packageName: 'cordis-plugin-sample-plugin',
  })
  assert.deepEqual(normalizePluginName('@my-scope/cordis-plugin-sample-plugin'), {
    slug: 'sample-plugin',
    packageName: '@my-scope/cordis-plugin-sample-plugin',
  })

  const prefixedTarget = await createPlugin({
    name: 'cordis-plugin-prefixed-sample',
    type: 'normal',
    workspaceRoot,
  })
  assert.equal(prefixedTarget, join(workspaceRoot, 'external', 'prefixed-sample'))
  assert.equal(
    JSON.parse(await readGenerated('prefixed-sample', 'package.json')).name,
    'cordis-plugin-prefixed-sample',
  )

  const scopedTarget = await createPlugin({
    name: '@my-scope/cordis-plugin-scoped-sample',
    type: 'normal',
    workspaceRoot,
  })
  assert.equal(scopedTarget, join(workspaceRoot, 'external', 'scoped-sample'))
  assert.equal(
    JSON.parse(await readGenerated('scoped-sample', 'package.json')).name,
    '@my-scope/cordis-plugin-scoped-sample',
  )
})

test('rejects invalid package prefixes and scoped names', () => {
  assert.throws(() => normalizePluginName('cordis-plugin-'), /kebab-case/)
  assert.throws(() => normalizePluginName('@my-scope/sample-plugin'), /kebab-case/)
  assert.throws(() => normalizePluginName('@MyScope/cordis-plugin-sample-plugin'), /kebab-case/)
})
