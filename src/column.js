import { exprToSQL } from './expr'
import { tablesToSQL } from './tables'
import {
  autoIncreatementToSQL,
  columnRefToSQL,
  commonTypeValue,
  commentToSQL,
  hasVal,
  identifierToSql,
  toUpper,
} from './util'

function columnDataType(definition) {
  const { dataType, length, suffix, scale } = definition || {}
  let result = dataType
  if (length) {
    result += `(${[length, scale].filter(hasVal).join(', ')})`
  }
  if (suffix && suffix.length) result += ` ${suffix.join(' ')}`
  return result
}

function columnReferenceDefinitionToSQL(referenceDefinition) {
  const reference = []
  if (!referenceDefinition) return reference
  const {
    definition,
    keyword,
    match,
    table,
    on_delete: onDelete,
    on_update: onUpdate,
  } = referenceDefinition
  reference.push(keyword.toUpperCase())
  reference.push(tablesToSQL(table))
  reference.push(`(${definition.map(identifierToSql).join(', ')})`)
  reference.push(toUpper(match))
  reference.push(...commonTypeValue(onDelete))
  reference.push(...commonTypeValue(onUpdate))
  return reference.filter(hasVal)
}

function columnOption(definition) {
  const columnOpt = []
  const {
    nullable, comment, collate, storage,
    default_val: defaultOpt,
    auto_increment: autoIncrement,
    unique_or_primary: uniquePrimary,
    column_format: columnFormat,
    reference_definition: referenceDefinition,
  } = definition

  columnOpt.push(toUpper(nullable && nullable.value))
  if (defaultOpt) {
    const { type, value } = defaultOpt
    columnOpt.push(type.toUpperCase(), exprToSQL(value))
  }
  columnOpt.push(autoIncreatementToSQL(autoIncrement), toUpper(uniquePrimary), commentToSQL(comment))
  columnOpt.push(...commonTypeValue(collate))
  columnOpt.push(...commonTypeValue(columnFormat))
  columnOpt.push(...commonTypeValue(storage))
  columnOpt.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  return columnOpt.filter(hasVal).join(' ')
}

function columnDefinitionToSQL(columnDefinition) {
  const column = []
  const name = columnRefToSQL(columnDefinition.column)
  const dataType = columnDataType(columnDefinition.definition)
  column.push(name)
  column.push(dataType)
  const columnOpt = columnOption(columnDefinition)
  column.push(columnOpt)
  return column.filter(hasVal).join(' ')
}

/**
 * Stringify column expressions
 *
 * @param {Array} columns
 * @return {string}
 */
function columnsToSQL(columns, tables) {
  if (!columns) return
  if (columns === '*') return columns
  const baseTable = Array.isArray(tables) && tables[0]
  let isDual = false
  if (baseTable && baseTable.type === 'dual') isDual = true
  const result = []
  const {
    expr_list: exprList,
    star,
    type,
  } = columns
  result.push(star, toUpper(type))
  const exprListArr = exprList || columns
  const columnsStr = exprListArr
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
  result.push(`${type && '(' || ''}${columnsStr}${type && ')' || ''}`)
  return result.filter(hasVal).join(' ')
}


export {
  columnDefinitionToSQL,
  columnsToSQL,
  columnDataType,
  columnReferenceDefinitionToSQL,
}
