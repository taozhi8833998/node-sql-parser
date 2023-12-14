import { constraintDefinitionToSQL } from './constrain'
import { exprToSQL } from './expr'
import { castToSQL } from './func'
import { tablesToSQL } from './tables'
import {
  autoIncrementToSQL,
  columnIdentifierToSql,
  commonOptionConnector,
  commonTypeValue,
  commentToSQL,
  getParserOpt,
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
    array_index, arrows = [], as, collate, column, db, isDual, schema, table, parentheses, properties,
    suffix, order_by, subFields = [],
  } = expr
  let str = column === '*' ? '*' : columnOffsetToSQL(column, isDual)
  const prefix = [schema, db, table].filter(hasVal).map(val => `${identifierToSql(val)}`).join('.')
  if (prefix) str = `${prefix}.${str}`
  if (array_index) {
    str = `${str}[${literalToSQL(array_index.index)}]`
    if (array_index.property) str = `${str}.${literalToSQL(array_index.property)}`
  }
  str = [str, ...subFields].join('.')
  const result = [
    str,
    commonOptionConnector('AS', exprToSQL, as),
    arrows.map((arrow, index) => commonOptionConnector(arrow, literalToSQL, properties[index])).join(' '),
  ]
  if (collate) result.push(commonTypeValue(collate).join(' '))
  result.push(toUpper(suffix))
  result.push(toUpper(order_by))
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
    on_action: onAction,
  } = referenceDefinition
  reference.push(toUpper(keyword))
  reference.push(tablesToSQL(table))
  reference.push(definition && `(${definition.map(col => exprToSQL(col)).join(', ')})`)
  reference.push(toUpper(match))
  onAction.map(onRef => reference.push(toUpper(onRef.type), exprToSQL(onRef.value)))
  return reference.filter(hasVal)
}

function columnOption(definition) {
  const columnOpt = []
  const {
    nullable, character_set: characterSet, check, comment, collate, storage,
    default_val: defaultOpt,
    auto_increment: autoIncrement,
    unique: uniqueKey,
    primary_key: primaryKey,
    column_format: columnFormat,
    reference_definition: referenceDefinition,
  } = definition

  columnOpt.push(toUpper(nullable && nullable.value))
  if (defaultOpt) {
    const { type, value } = defaultOpt
    columnOpt.push(type.toUpperCase(), exprToSQL(value))
  }
  const { database } = getParserOpt()
  columnOpt.push(constraintDefinitionToSQL(check))
  columnOpt.push(autoIncrementToSQL(autoIncrement), toUpper(primaryKey), toUpper(uniqueKey), commentToSQL(comment))
  columnOpt.push(...commonTypeValue(characterSet))
  if (database !== 'sqlite') columnOpt.push(...commonTypeValue(collate))
  columnOpt.push(...commonTypeValue(columnFormat))
  columnOpt.push(...commonTypeValue(storage))
  columnOpt.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  return columnOpt.filter(hasVal).join(' ')
}

function columnOrderToSQL(columnOrder) {
  const { column, collate, nulls, opclass, order_by } = columnOrder
  const result = [
    exprToSQL(typeof column === 'string' ? { type: 'column_ref', table: columnOrder.table, column } : columnOrder),
    commonOptionConnector(collate && collate.type, identifierToSql, collate && collate.value),
    opclass,
    toUpper(order_by),
    toUpper(nulls),
  ]
  return result.filter(hasVal).join(' ')
}

function generatedExpressionToSQL(generated) {
  if (!generated) return
  const result = [toUpper(generated.value), `(${exprToSQL(generated.expr)})`, toUpper(generated.storage_type)]
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
  const generated = generatedExpressionToSQL(columnDefinition.generated)
  column.push(generated)
  return column.filter(hasVal).join(' ')
}

function asToSQL(asStr) {
  if (!asStr) return ''
  return ['AS', /^(`?)[a-z_][0-9a-z_]*(`?)$/i.test(asStr) ? identifierToSql(asStr) : columnIdentifierToSql(asStr)].join(' ')
}

function fullTextSearchToSQL(expr) {
  const { against, as, columns, match, mode } = expr
  const matchExpr = [toUpper(match), `(${columns.map(col => columnRefToSQL(col)).join(', ')})`].join(' ')
  const againstExpr = [toUpper(against), ['(', exprToSQL(expr.expr), mode && ` ${literalToSQL(mode)}`, ')'].filter(hasVal).join('')].join(' ')
  return [matchExpr, againstExpr, asToSQL(as)].filter(hasVal).join(' ')
}

function columnToSQL(column, isDual) {
  const { expr, type } = column
  if (type === 'cast') return castToSQL(column)
  if (isDual) expr.isDual = isDual
  let str = exprToSQL(expr)
  const { expr_list: exprList } = column
  if (exprList) {
    const result = [str]
    const columnsStr = exprList.map(col => columnToSQL(col, isDual)).join(', ')
    result.push([toUpper(type), type && '(', columnsStr, type && ')'].filter(hasVal).join(''))
    return result.filter(hasVal).join(' ')
  }
  if (expr.parentheses && Reflect.has(expr, 'array_index')) str = `(${str})`
  if (expr.array_index && expr.type !== 'column_ref') str = `${str}[${literalToSQL(expr.array_index.index)}]`
  return [str, asToSQL(column.as)].filter(hasVal).join(' ')
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
  return columns.map(col => columnToSQL(col, isDual)).join(', ')
}

export {
  columnDefinitionToSQL,
  columnRefToSQL,
  columnToSQL,
  columnsToSQL,
  columnDataType,
  columnOrderToSQL,
  columnReferenceDefinitionToSQL,
  fullTextSearchToSQL,
}
