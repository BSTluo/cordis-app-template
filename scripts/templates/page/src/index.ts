import { Context } from 'cordis'
import type {} from '@cordisjs/plugin-webui'
import Schema from 'schemastery';

export const name = 'template'
export const inject = ['webui']


export interface Config {

}

export const Config: Schema<Config> = Schema.object({
  
});


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
}
