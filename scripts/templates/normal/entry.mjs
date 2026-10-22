// NODE_ENV does not activate Node's "development" package export condition.
// Load source with tsx in yarn dev, and the built entry in yarn start.
const entry = process.env.NODE_ENV === 'development'
  ? './src/index.ts'
  : './lib/index.js'
const plugin = await import(entry)

export const name = plugin.name
export const inject = plugin.inject
export const Config = plugin.Config
export const apply = plugin.apply
