import { Context } from 'cordis'
import type {} from '@cordisjs/plugin-webui'
import { TemplateServeice } from './service'

export * from './service'

export const name = 'template'
export const inject = ['webui']

export function apply(ctx: Context) {
  ctx.webui.addEntry({
    baseUrl: import.meta.url,
    source: '../client/index.ts',
    manifest: '../dist/manifest.json',
    routes: ['/cordis/template'],
  }, {
    title: 'Template',
    summary: 'Template plugin page',
  })

  ctx.plugin(TemplateServeice, {
    endpoint: 'https://example.com/api',
    timeout: 30_000,
    ttl: 43_200_000,
  })
}

