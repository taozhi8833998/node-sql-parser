import { collateToSQL } from './collate'
import { constraintDefinitionToSQL } from './constrain'
import { exprToSQL } from './expr'
import { arrayDimensionToSymbol, castToSQL } from './func'
import { tablesToSQL } from './tables'
import {
  autoIncrementToSQL,
  columnIdentifierToSql,
  commonOptionConnector,
  commonTypeValue,
  commentToSQL,
  dataTypeToSQL,
  getParserOpt,
  hasVal,
  identifierToSql,
  literalToSQL,
  toUpper,
} from './util'

function columnOffsetToSQL(column, isDual) {
  if (typeof column === 'string') return identifierToSql(column, isDual)
  const { expr, offset, suffix } = column
  const offsetExpr = offset && offset.map(offsetItem => ['[', offsetItem.name, `${offsetItem.name ? '(' : ''}`, literalToSQL(offsetItem.value), `${offsetItem.name ? ')' : ''}`, ']'].filter(hasVal).join('')).join('')
  const result = [exprToSQL(expr), offsetExpr, suffix].filter(hasVal).join('')
  return result
}

function arrayIndexToSQL(arrayIndexList) {
  if (!arrayIndexList || arrayIndexList.length === 0) return ''
  const result = []
  for (const arrayIndex of arrayIndexList) {
    let arrayIndexStr = arrayIndex.brackets ? `[${literalToSQL(arrayIndex.index)}]` : `${arrayIndex.notation}${literalToSQL(arrayIndex.index)}`
    if (arrayIndex.property) arrayIndexStr = `${arrayIndexStr}.${literalToSQL(arrayIndex.property)}`
    result.push(arrayIndexStr)
  }
  return result.join('')
}
function columnRefToSQL(expr) {
  const {
    array_index, as, column, collate, db, isDual, notations = [], options, schema, table, parentheses,
    suffix, order_by, subFields = [],
  } = expr
  let str = column === '*' ? '*' : columnOffsetToSQL(column, isDual)
  const prefix = [db, schema, table].filter(hasVal).map(val => `${typeof val === 'string' ? identifierToSql(val) : exprToSQL(val)}`)
  let prefixStr = prefix[0]
  if (prefixStr) {
    let i = 1
    for (; i < prefix.length; ++i) {
      prefixStr = `${prefixStr}${notations[i] || '.'}${prefix[i]}`
    }
    str = `${prefixStr}${notations[i] || '.'}${str}`
  }
  str = [`${str}${arrayIndexToSQL(array_index)}`, ...subFields].join('.')
  const result = [
    str,
    collateToSQL(collate),
    exprToSQL(options),
    commonOptionConnector('AS', exprToSQL, as),
  ]
  result.push(typeof suffix === 'string' ? toUpper(suffix) : exprToSQL(suffix))
  result.push(toUpper(order_by))
  const sql = result.filter(hasVal).join(' ')
  return parentheses ? `(${sql})` : sql
}

function columnDataType(definition) {
  if (!definition) return
  const { dataType, length, suffix, scale, expr } = definition
  const parentheses = length != null && true || false
  let result = dataTypeToSQL({ dataType, length, suffix, scale, parentheses })
  if (expr) result += exprToSQL(expr)
  if (definition.array) {
    const arrayExpr = arrayDimensionToSymbol(definition)
    const space = /^\[.*\]$/.test(arrayExpr) ? '' : ' '
    result += [space, arrayExpr].join('')
  }
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

function generatedExpressionToSQL(generated) {
  if (!generated) return
  const result = [toUpper(generated.value), `(${exprToSQL(generated.expr)})`, toUpper(generated.storage_type)]
  return result.filter(hasVal).join(' ')
}

function columnOption(definition) {
  const columnOpt = []
  const {
    nullable, character_set: characterSet, check, comment, constraint, collate, storage, using,
    default_val: defaultOpt, generated,
    auto_increment: autoIncrement,
    unique: uniqueKey,
    primary_key: primaryKey,
    column_format: columnFormat,
    reference_definition: referenceDefinition,
  } = definition
  const nullSQL = [toUpper(nullable && nullable.action), toUpper(nullable && nullable.value)].filter(hasVal).join(' ')
  if (!generated) columnOpt.push(nullSQL)
  if (defaultOpt) {
    const { type, value } = defaultOpt
    columnOpt.push(type.toUpperCase(), exprToSQL(value))
  }
  const { database } = getParserOpt()
  if (constraint) columnOpt.push(toUpper(constraint.keyword), literalToSQL(constraint.constraint))
  columnOpt.push(constraintDefinitionToSQL(check))
  columnOpt.push(generatedExpressionToSQL(generated))
  if (generated) columnOpt.push(nullSQL)
  columnOpt.push(autoIncrementToSQL(autoIncrement), toUpper(primaryKey), toUpper(uniqueKey), commentToSQL(comment))
  columnOpt.push(...commonTypeValue(characterSet))
  if (database.toLowerCase() !== 'sqlite') columnOpt.push(exprToSQL(collate))
  columnOpt.push(...commonTypeValue(columnFormat))
  columnOpt.push(...commonTypeValue(storage))
  columnOpt.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  columnOpt.push(commonOptionConnector('USING', exprToSQL, using))
  return columnOpt.filter(hasVal).join(' ')
}

function columnOrderToSQL(columnOrder) {
  const { column, collate, nulls, opclass, order_by } = columnOrder
  const columnExpr = typeof column === 'string' ? { type: 'column_ref', table: columnOrder.table, column } : columnOrder
  columnExpr.collate = null
  const result = [
    exprToSQL(columnExpr),
    exprToSQL(collate),
    opclass,
    toUpper(order_by),
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
  column.push(columnOption(columnDefinition))
  return column.filter(hasVal).join(' ')
}

function asToSQL(asStr) {
  if (!asStr) return ''
  if (typeof asStr === 'object') return ['AS', exprToSQL(asStr)].join(' ')
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
  if (expr.parentheses && Reflect.has(expr, 'array_index') && expr.type !== 'cast') str = `(${str})`
  if (expr.array_index && expr.type !== 'column_ref') {
    str = `${str}${arrayIndexToSQL(expr.array_index)}`
  }
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
  arrayIndexToSQL,
  asToSQL,
  columnDefinitionToSQL,
  columnRefToSQL,
  columnToSQL,
  columnsToSQL,
  columnDataType,
  columnOffsetToSQL,
  columnOrderToSQL,
  columnReferenceDefinitionToSQL,
  fullTextSearchToSQL,
  getDual,
}
