import {
  literalToSQL,
  identifierToSql,
  toUpper,
  hasVal,
  commentToSQL,
} from './util'

function indexTypeToSQL(indexType) {
  if (!indexType) return
  const { keyword, type } = indexType
  return `${keyword.toUpperCase()} ${type.toUpperCase()}`
}

function indexOptionToSQL(indexOpt) {
  if (!indexOpt) return
  const { type, expr, symbol } = indexOpt
  const upperType = type.toUpperCase()
  const indexOptArray = []
  indexOptArray.push(upperType)
  switch (upperType.toUpperCase()) {
    case 'KEY_BLOCK_SIZE':
      if (symbol) indexOptArray.push(symbol)
      indexOptArray.push(literalToSQL(expr))
      break
    case 'BTREE':
    case 'HASH':
      indexOptArray.length = 0
      indexOptArray.push(indexTypeToSQL(indexOpt))
      break
    case 'WITH PARSER':
      indexOptArray.push(expr)
      break
    case 'VISIBLE':
    case 'INVISIBLE':
      break
    case 'COMMENT':
      indexOptArray.shift()
      indexOptArray.push(commentToSQL(indexOpt))
      break
    default:
      break
  }
  return indexOptArray.join(' ')
}

function indexTypeAndOptionToSQL(indexDefinition) {
  const {
    index_type: indexType,
    index_options: indexOptions = [],
    definition,
  } = indexDefinition
  const dataType = []
  dataType.push(indexTypeToSQL(indexType))
  if (definition && definition.length) dataType.push(`(${definition.map(col => identifierToSql(col)).join(', ')})`)
  dataType.push(indexOptions && indexOptions.map(indexOptionToSQL).join(' '))
  return dataType
}

function indexDefinitionToSQL(indexDefinition) {
  const indexSQL = []
  const {
    keyword,
    index,
  } = indexDefinition
  indexSQL.push(toUpper(keyword))
  indexSQL.push(index)
  indexSQL.push(...indexTypeAndOptionToSQL(indexDefinition))
  return indexSQL.filter(hasVal).join(' ')
}

export {
  indexDefinitionToSQL,
  indexTypeToSQL,
  indexOptionToSQL,
  indexTypeAndOptionToSQL,
}
