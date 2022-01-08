import { constraintDefinitionToSQL } from './constrain'
import { exprToSQL } from './expr'
import { castToSQL } from './func'
import { tablesToSQL } from './tables'
import {
  autoIncreatementToSQL,
  columnIdentifierToSql,
  commonOptionConnector,
  commonTypeValue,
  commentToSQL,
  hasVal,
  identifierToSql,
  literalToSQL,
  toUpper,
} from './util'

function columnOffsetToSQL(column, isDual) {
  if (typeof column === 'string') return identifierToSql(column, isDual)
  const { expr, offset, suffix } = column
  return [exprToSQL(expr), offset, suffix].filter(hasVal).join('')
}
function columnRefToSQL(expr) {
  const {
    array_index, arrow, as, collate, column, isDual, schema, table, parentheses, property,
    suffix,
  } = expr
  let str = column === '*' ? '*' : columnOffsetToSQL(column, isDual)
  if (table) str = `${identifierToSql(table)}.${str}`
  if (schema) str = `${identifierToSql(schema)}.${str}`
  if (array_index) {
    str = `${str}[${array_index.number}]`
    if (array_index.property) str = `${str}.${array_index.property.value}`
  }
  const result = [
    str,
    commonOptionConnector('AS', exprToSQL, as),
    commonOptionConnector(arrow, literalToSQL, property),
  ]
  if (collate) result.push(commonTypeValue(collate).join(' '))
  result.push(toUpper(suffix))
  const sql = result.filter(hasVal).join(' ')
  return parentheses ? `(${sql})` : sql
}

function columnDataType(definition) {
  const { dataType, length, suffix, scale, expr } = definition || {}
  let result = dataType
  if (length != null) result += `(${[length, scale].filter(val => val != null).join(', ')})`
  if (suffix && suffix.length) result += ` ${suffix.join(' ')}`
  if (expr) result += exprToSQL(expr)
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
    nullable, character_set: characterSet, check, comment, collate, storage,
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
  columnOpt.push(constraintDefinitionToSQL(check))
  columnOpt.push(autoIncreatementToSQL(autoIncrement), toUpper(uniquePrimary), commentToSQL(comment))
  columnOpt.push(...commonTypeValue(characterSet))
  columnOpt.push(...commonTypeValue(collate))
  columnOpt.push(...commonTypeValue(columnFormat))
  columnOpt.push(...commonTypeValue(storage))
  columnOpt.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  return columnOpt.filter(hasVal).join(' ')
}

function columnOrderToSQL(columnOrder) {
  const { column, collate, nulls, opclass, order } = columnOrder
  const result = [
    exprToSQL(column),
    commonOptionConnector(collate && collate.type, identifierToSql, collate && collate.value),
    opclass,
    toUpper(order),
    toUpper(nulls),
  ]
  return result.filter(hasVal).join(' ')
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

function columnToSQL(column, isDual) {
  const { expr, type } = column
  if (type === 'cast') return castToSQL(column)
  if (isDual) expr.isDual = isDual
  let str = exprToSQL(expr)
  if (expr.parentheses && Reflect.has(expr, 'array_index')) str = `(${str})`
  if (expr.array_index && expr.type !== 'column_ref') str = `${str}[${expr.array_index.number}]`
  if (column.as !== null) {
    str = `${str} AS `
    if (/^(`?)[a-z_][0-9a-z_]*(`?)$/i.test(column.as)) str = `${str}${identifierToSql(column.as)}`
    else str = `${str}${columnIdentifierToSql(column.as)}`
  }
  return str
}

function getDual(tables) {
  const baseTable = Array.isArray(tables) && tables[0]
  if (baseTable && baseTable.type === 'dual') return true
  return false
}
/**
 * Stringify column expressions
 *
 * @param {Array} columns
 * @return {string}
 */
function columnsToSQL(columns, tables) {
  if (!columns || columns === '*') return columns
  const isDual = getDual(tables)
  const result = []
  const { expr_list: exprList, star, type } = columns
  result.push(star, toUpper(type))
  const exprListArr = exprList || columns
  const columnsStr = exprListArr.map(col => columnToSQL(col, isDual)).join(', ')
  result.push([type && '(', columnsStr, type && ')'].filter(hasVal).join(''))
  return result.filter(hasVal).join(' ')
}

export {
  columnDefinitionToSQL,
  columnRefToSQL,
  columnsToSQL,
  columnDataType,
  columnOrderToSQL,
  columnReferenceDefinitionToSQL,
}
