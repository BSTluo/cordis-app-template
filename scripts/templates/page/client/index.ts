import { Context } from '@cordisjs/client'
import Page from './page.vue'

export default (ctx: Context) => {
  ctx.client.router.page({
    name: 'Template',
    path: '/dileader/template',
    component: Page,
  })
}
