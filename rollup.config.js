const path = require('path')
const esbuild = require('rollup-plugin-esbuild').default
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const replace = require('@rollup/plugin-replace')
const pkg = require('./package.json')
const { dialects } = require('./gulp/config.json')

const root = __dirname
const srcGlobs = [path.join(root, 'src/**'), path.join(root, 'index.js')]
const UMD_NAME = 'NodeSQLParser'

// Full bundle when dialect is null. Otherwise the bundle only includes the parser
// for that dialect: `./parser.all` (imported by src/parser.js) is replaced with a
// virtual module that exposes only the single pre-generated parser.
const parserVariant = (dialect) => {
  const virtualId = `\0parser-variant:${dialect}`
  const parserAll = path.join(root, 'src', 'parser.js')
  return {
    name: 'parser-variant',
    resolveId(source, importer) {
      if (source === './parser.all' && importer === parserAll) return virtualId
      return null
    },
    load(id) {
      if (id !== virtualId) return null
      const parserFile = path.join(root, 'lib', 'parser', `${dialect}.js`)
      return [
        `import { parse } from ${JSON.stringify(parserFile)}`,
        `export default { ${dialect}: parse }`,
      ].join('\n')
    },
  }
}

const isExternal = (id) => Object.keys(pkg.dependencies || {})
  .some(dep => id === dep || id.startsWith(`${dep}/`))

const createPlugins = (dialect) => [
  replace({
    preventAssignment: true,
    include: srcGlobs,
    values: { PARSER_NAME: dialect ? JSON.stringify(dialect) : 'null' },
  }),
  ...(dialect ? [parserVariant(dialect)] : []),
  nodeResolve({ extensions: ['.js'] }),
  commonjs(),
  esbuild({
    include: srcGlobs,
    target: 'es2017',
  }),
]

// Node bundles: CJS for require(), ESM for import. Dependencies stay external.
const nodeConfig = (name, dialect) => ({
  input: 'index.js',
  external: isExternal,
  plugins: createPlugins(dialect),
  output: [
    { file: `build/${name}.js`, format: 'cjs', exports: 'named', sourcemap: true },
    { file: `build/${name}.mjs`, format: 'es', sourcemap: true },
  ],
})

// Browser bundles: UMD with dependencies inlined, exposed as a global.
const umdConfig = (name, dialect) => ({
  input: 'index.js',
  plugins: createPlugins(dialect),
  output: {
    file: `umd/${name}.umd.js`,
    format: 'umd',
    name: UMD_NAME,
    exports: 'named',
    sourcemap: true,
  },
})

const variants = [
  { name: 'index', dialect: null },
  ...dialects.map(dialect => ({ name: dialect, dialect })),
]

module.exports = [
  ...variants.map(({ name, dialect }) => nodeConfig(name, dialect)),
  ...variants.map(({ name, dialect }) => umdConfig(name, dialect)),
]
