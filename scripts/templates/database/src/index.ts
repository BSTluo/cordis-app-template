import { Context } from 'cordis'
import type {} from '@cordisjs/plugin-database'

export const name = 'template'
export const inject = ['database', 'model']

interface TemplateRecord {
  id: number
  name: string
  createdAt: Date
}

declare module '@cordisjs/plugin-database' {
  interface Tables {
    template_record: TemplateRecord
  }
}

export function apply(ctx: Context) {
  ctx.model.extend('template_record', {
    id: 'unsigned',
    name: 'string(255)',
    createdAt: 'timestamp',
  }, {
    primary: 'id',
    autoInc: true,
  })

  // 等 Database Service 完成 schema 准备后执行数据库操作。
  void ctx.database.prepared().then(async () => {
    const record = await ctx.database.create('template_record', {
      name: 'example',
      createdAt: new Date(),
    })
    ctx.logger.info('Created template record %d', record.id)
  }).catch((error) => {
    ctx.logger.error('Database plugin operation failed', error)
  })
}
