const fs = require('fs/promises')
const path = require('path')
const peggy = require('peggy')
const { readFile } = require('../common')
const config = require('../config')

const generate = async () => {
  // Ensure output directory exists
  const outputDir = path.resolve(__dirname, '../../lib/parser')
  await fs.mkdir(outputDir, { recursive: true })

  return await Promise.all(config.dialects.map(async dialect => {
    const source = await readFile(path.resolve(__dirname, `../../pegjs/${dialect}-build.pegjs`))
    const parser = peggy.generate(source, {
      output                : 'source',
      format                : 'commonjs',
      disableRecursionCheck : process.argv.includes('--fast'),
    })
    return await fs.writeFile(path.resolve(outputDir, `${dialect}.js`), parser)
  }))
}

exports.generate = generate
