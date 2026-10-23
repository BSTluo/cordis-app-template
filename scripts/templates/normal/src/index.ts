import { Context } from 'cordis'
import Schema from 'schemastery'

export const name = 'template'
export const inject = []

export const Config: Schema<Config> = Schema.object({
  // Define your config schema here
});

export interface Config {
  // Define your config interface here
}

export function apply(ctx: Context, config: Config) {
  // Add plugin logic here.
}
