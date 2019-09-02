import { exprToSQL } from './expr'
import { identifierToSql, columnRefToSQL } from './util'

function columnDataType(definition) {
  const dataType = definition && definition.dataType
  if (definition && definition.length) return `${dataType}(${definition.length})`
  return dataType
}

function columnOption(definition) {
  const columnOpt = []
  const {
    nullable,
    default_val: defaultOpt,
    auto_increment: autoIncrement,
    unique_or_primary: uniquePrimary,
    comment,
  } = definition
  if (nullable) columnOpt.push(nullable.value.toUpperCase())
  if (defaultOpt) {
    const { type, value } = defaultOpt
    columnOpt.push(type.toUpperCase())
    columnOpt.push(exprToSQL(value))
  }
  if (autoIncrement) columnOpt.push(autoIncrement.toUpperCase())
  if (uniquePrimary) columnOpt.push(uniquePrimary.toUpperCase())
  if (comment) {
    const { type, expr } = comment
    columnOpt.push(type.toUpperCase())
    columnOpt.push(exprToSQL(expr))
  }
  return columnOpt.filter(hasVal => hasVal).join(' ')
}

function columnDefinitionToSQL(columnDefinition) {
  const column = []
  const name = columnRefToSQL(columnDefinition.column)
  const dataType = columnDataType(columnDefinition.definition)
  column.push(name)
  column.push(dataType)
  const columnOpt = columnOption(columnDefinition)
  column.push(columnOpt)
  return column.filter(hasVal => hasVal).join(' ')
}

/**
 * Stringify column expressions
 *
 * @param {Array} columns
 * @return {string}
 */
function columnsToSQL(columns, tables) {
  if (!columns) return
  const baseTable = Array.isArray(tables) && tables[0]
  let isDual = false
  if (baseTable && baseTable.type === 'dual') isDual = true
  return columns
    .map(column => {
      const { expr } = column
      if (isDual) expr.isDual = isDual
      let str = exprToSQL(expr)
      if (column.as !== null) {
        str = `${str} AS `
        if (column.as.match(/^[a-z_][0-9a-z_]*$/i)) str = `${str}${identifierToSql(column.as)}`

        else str = `${str}\`${column.as}\``
      }

      return str
    })
    .join(', ')
}


export {
  columnDefinitionToSQL,
  columnsToSQL,
  columnDataType,
}
