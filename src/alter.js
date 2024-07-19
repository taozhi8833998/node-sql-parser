import { columnDefinitionToSQL, columnRefToSQL } from './column'
import { createDefinitionToSQL } from './create'
import { indexTypeAndOptionToSQL } from './index-definition'
import { tablesToSQL, tableToSQL } from './tables'
import { exprToSQL } from './expr'
import { selectToSQL } from './select'
import { dataTypeToSQL, hasVal, toUpper, identifierToSql, literalToSQL } from './util'

function alterExprToSQL(expr) {
  if (!expr) return ''
  const {
    action,
    create_definitions: createDefinition,
    if_not_exists: ifNotExists, keyword,
    if_exists: ifExists,
    old_column: oldColumn,
    prefix,
    resource,
    symbol,
    suffix,
  } = expr
  let name = ''
  let dataType = []
  switch (resource) {
    case 'column':
      dataType = [columnDefinitionToSQL(expr)]
      break
    case 'index':
      dataType = indexTypeAndOptionToSQL(expr)
      name = expr[resource]
      break
    case 'table':
    case 'schema':
      name = identifierToSql(expr[resource])
      break
    case 'aggregate':
    case 'function':
    case 'domain':
    case 'type':
      name = identifierToSql(expr[resource])
      break
    case 'algorithm':
    case 'lock':
    case 'table-option':
      name = [symbol, toUpper(expr[resource])].filter(hasVal).join(' ')
      break
    case 'constraint':
      name = identifierToSql(expr[resource])
      dataType = [createDefinitionToSQL(createDefinition)]
      break
    case 'key':
      name = identifierToSql(expr[resource])
      break
    default:
      name = [symbol, expr[resource]].filter(val => val !== null).join(' ')
      break
  }
  const alterArray = [
    toUpper(action),
    toUpper(keyword),
    toUpper(ifNotExists),
    toUpper(ifExists),
    oldColumn && columnRefToSQL(oldColumn),
    toUpper(prefix),
    name && name.trim(),
    dataType.filter(hasVal).join(' '),
    suffix && `${toUpper(suffix.keyword)} ${columnRefToSQL(suffix.expr)}`,
  ]
  return alterArray.filter(hasVal).join(' ')
}

function alterTableToSQL(stmt) {
  const { type, table, if_exists, prefix, expr = [] } = stmt
  const action = toUpper(type)
  const tableName = tablesToSQL(table)
  const exprList = expr.map(exprToSQL)
  const result = [action, 'TABLE', toUpper(if_exists), literalToSQL(prefix), tableName, exprList.join(', ')]
  return result.filter(hasVal).join(' ')
}

function alterViewToSQL(stmt) {
  const { type, columns, attributes, select, view, with: withExpr } = stmt
  const action = toUpper(type)
  const viewName = tableToSQL(view)
  const result = [action, 'VIEW', viewName]
  if (columns) result.push(`(${columns.map(columnRefToSQL).join(', ')})`)
  if (attributes) result.push(`WITH ${attributes.map(toUpper).join(', ')}`)
  result.push('AS', selectToSQL(select))
  if (withExpr) result.push(toUpper(withExpr))
  return result.filter(hasVal).join(' ')
}
function alterArgsToSQL(arg) {
  const defaultSQL = arg.default && [toUpper(arg.default.keyword), exprToSQL(arg.default.value)].join(' ')
  return [toUpper(arg.mode), arg.name, dataTypeToSQL(arg.type), defaultSQL].filter(hasVal).join(' ')
}

function alterSchemaToSQL(stmt) {
  const { expr, keyword, schema, type } = stmt
  const result = [toUpper(type), toUpper(keyword), identifierToSql(schema), alterExprToSQL(expr)]
  return result.filter(hasVal).join(' ')
}

function alterDomainTypeToSQL(stmt) {
  const { expr, keyword, name, type } = stmt
  const result = [
    toUpper(type),
    toUpper(keyword),
    [identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'),
    alterExprToSQL(expr),
  ]
  return result.filter(hasVal).join(' ')
}

function alterFunctionToSQL(stmt) {
  const { args, expr, keyword, name, type } = stmt
  const result = [
    toUpper(type),
    toUpper(keyword),
    [
      [identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'),
      args && `(${args.expr ? args.expr.map(alterArgsToSQL).join(', ') : ''})`,
    ].filter(hasVal).join(''),
    alterExprToSQL(expr),
  ]
  return result.filter(hasVal).join(' ')
}

function alterAggregateToSQL(stmt) {
  const { args, expr, keyword, name, type } = stmt
  const { expr: argsExpr, orderby } = args
  const result = [
    toUpper(type),
    toUpper(keyword),
    [
      [identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'),
      `(${argsExpr.map(alterArgsToSQL).join(', ')}${orderby ? [' ORDER', 'BY', orderby.map(alterArgsToSQL).join(', ')].join(' ') : ''})`,
    ].filter(hasVal).join(''),
    alterExprToSQL(expr),
  ]
  return result.filter(hasVal).join(' ')
}

function alterToSQL(stmt) {
  const { keyword = 'table' } = stmt
  switch (keyword) {
    case 'aggregate':
      return alterAggregateToSQL(stmt)
    case 'table':
      return alterTableToSQL(stmt)
    case 'schema':
      return alterSchemaToSQL(stmt)
    case 'domain':
    case 'type':
      return alterDomainTypeToSQL(stmt)
    case 'function':
      return alterFunctionToSQL(stmt)
    case 'view':
      return alterViewToSQL(stmt)
  }
}

export {
  alterArgsToSQL,
  alterToSQL,
  alterExprToSQL,
}
