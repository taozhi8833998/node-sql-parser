const fs = require('fs')
const path = require('path')

const GRAMMAR_DIR = path.resolve(__dirname, '../pegjs')
// Every dialect with a grammar at pegjs/<dialect>.pegjs.
const DIALECTS = [
  'athena',
  'bigquery',
  'db2',
  'flinksql',
  'hive',
  'mariadb',
  'mysql',
  'noql',
  'postgresql',
  'redshift',
  'snowflake',
  'sqlite',
  'transactsql',
  'trino',
]
// A whole line of the form: @import 'common/symbol.pegjs';  (leading indent is kept)
const IMPORT_LINE = /^([ \t]*)@import[ \t]+'([^']+)';?[ \t]*$/gm

// Inline every @import'ed fragment. Fragment paths are relative to pegjs/.
const renderGrammar = (source) => source.replace(IMPORT_LINE, (_, indent, file) => {
  const fragment = fs.readFileSync(path.join(GRAMMAR_DIR, file), 'utf8')
  return indent + renderGrammar(fragment)
})

const dialectGrammar = (dialect) => renderGrammar(
  fs.readFileSync(path.join(GRAMMAR_DIR, `${dialect}.pegjs`), 'utf8'),
)

module.exports = { DIALECTS, GRAMMAR_DIR, renderGrammar, dialectGrammar }
