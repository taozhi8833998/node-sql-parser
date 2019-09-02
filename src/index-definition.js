import { literalToSQL, identifierToSql } from './util'

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
  switch (upperType) {
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
    default:
      break
  }
  return indexOptArray.join(' ')
}

function indexDefinitionToSQL(indexDefinition) {
  const {
    index_type: indexType,
    index_option: indexOptions,
    definition,
  } = indexDefinition
  const dataType = []
  dataType.push(indexTypeToSQL(indexType))
  if (definition && definition.length) dataType.push(`(${definition.map(col => identifierToSql(col)).join(', ')})`)
  dataType.push(indexOptionToSQL(indexOptions))
  return dataType.filter(hasVal => hasVal).join(' ')
}

export {
  indexDefinitionToSQL,
  indexTypeToSQL,
  indexOptionToSQL,
}
