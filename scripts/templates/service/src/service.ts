import { Context, Service } from 'cordis'
import { Time } from 'cosmokit'
import Schema from 'schemastery'

declare module 'cordis' {
  interface Context {
    TemplateServeice: TemplateServeice
  }
}

export class TemplateServeice extends Service {
  static name = 'TemplateServeice'
  static inject = []
  
  constructor(public ctx: Context, public config: TemplateServeice.Config) {
    super(ctx, 'TemplateServeice')
  }

  start() {
    // Initialize service resources here.
  }

  stop() {
    // Release service resources here.
  }
}

export namespace TemplateServeice {
  export interface Config {
    endpoint: string
    timeout: number
    ttl: number
  }

  export const Config: Schema<Config> = Schema.object({
    endpoint: Schema.string().role('link').default('https://registry.cordis.io/index.json')
      .description('Service endpoint.'),
    timeout: Schema.number().role('time').default(Time.second * 30)
      .description('Request timeout.'),
    ttl: Schema.number().role('time').default(Time.hour * 12)
      .description('Cache lifetime.'),
  })
}
