const fs = require('fs')
const peggy = require('peggy')
const { renderGrammar } = require('../scripts/grammar')

// Specs import src/ directly, so the build-time global used by src/ must be defined here.
// null selects the full parser (all dialects), matching the full bundle.
global.PARSER_NAME = null

// src/parser.all.js imports pegjs/<dialect>.pegjs. Compile those grammars the same way
// the rollup build does: expand @import fragments, then generate the parser with peggy.
require.extensions['.pegjs'] = (module, filename) => {
  const grammar = renderGrammar(fs.readFileSync(filename, 'utf8'))
  module.exports = peggy.generate(grammar, { output: 'parser' })
}
