const fs = require('fs/promises')
const path = require('path')
const { readFile } = require('../common')
const config = require('../config')

const AT_IMPORT_REGEX = /@import\s* '([^']*)';?/g
const getPegFilePath = (importSyntax) => {
  const importRegex = /@import\s* '([^']*)';?/
  if (!importRegex.test(importSyntax)) {
    console.warn(`${importSyntax} is not in correct format`)
    return
  }
  const pegFilePath = importSyntax.match(importRegex)?.[1]
  return path.resolve(__dirname, '../../pegjs', pegFilePath)
}

const renderPegjs = async (grammar) => {
  if (!AT_IMPORT_REGEX.test(grammar)) return grammar
  const importGrammars = Array.from(new Set(grammar.match(AT_IMPORT_REGEX)))
  for (const importGrammar of importGrammars) {
    const pegFilePath = getPegFilePath(importGrammar)
    if (!pegFilePath) continue
    const content = await readFile(pegFilePath)
    grammar = grammar.replaceAll(importGrammar, () => content)
  }
  return grammar
}

const render = async () => {
  return await Promise.all(config.dialects.map(async dialect => {
    const content = await readFile(path.resolve(__dirname, `../../pegjs/${dialect}.pegjs`))
    const source = await renderPegjs(content)
    return await fs.writeFile(path.resolve(__dirname, `../../pegjs/${dialect}-build.pegjs`), source, { encoding: 'utf8' })
  }))
}

exports.render = render
