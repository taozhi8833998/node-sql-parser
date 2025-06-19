import { commonOptionConnector, toUpper, hasVal, literalToSQL } from './util'
import { partitionToSQL } from './insert'
import { tableToSQL } from './tables'
import { columnsToSQL } from './column'
import { setToSQL } from './update'

function loadDataFields(expr) {
  if (!expr) return ''
  const { keyword, terminated, enclosed, escaped } = expr
  return [
    toUpper(keyword),
    literalToSQL(terminated),
    literalToSQL(enclosed),
    literalToSQL(escaped),
  ].filter(hasVal).join(' ')
}

function loadDataLines(expr) {
  if (!expr) return ''
  const { keyword, starting, terminated } = expr
  return [
    toUpper(keyword),
    literalToSQL(starting),
    literalToSQL(terminated),
  ].filter(hasVal).join(' ')
}

function loadDataIgnore(expr) {
  if (!expr) return ''
  const { count, suffix } = expr
  return ['IGNORE', literalToSQL(count), suffix].filter(hasVal).join(' ')
}
function loadDataToSQL(expr) {
  if (!expr) return ''
  const { mode, local, file, replace_ignore, table, partition, character_set, column, fields, lines, set, ignore } = expr
  const result = [
    'LOAD DATA',
    toUpper(mode),
    toUpper(local),
    'INFILE',
    literalToSQL(file),
    toUpper(replace_ignore),
    'INTO TABLE',
    tableToSQL(table),
    partitionToSQL(partition),
    commonOptionConnector('CHARACTER SET', literalToSQL, character_set),
    loadDataFields(fields),
    loadDataLines(lines),
    loadDataIgnore(ignore),
    columnsToSQL(column),
    commonOptionConnector('SET', setToSQL, set),
  ]
  return result.filter(hasVal).join(' ')
}

export {
  loadDataToSQL,
}
