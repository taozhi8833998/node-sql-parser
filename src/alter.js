import { columnDefinitionToSQL, columnRefToSQL } from './column'
import { createDefinitionToSQL } from './create'
import { indexTypeAndOptionToSQL } from './index-definition'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { hasVal, toUpper, identifierToSql } from './util'

function alterToSQL(stmt) {
  const { type, table, expr = [] } = stmt
  const action = toUpper(type)
  const tableName = tablesToSQL(table)
  const exprList = expr.map(exprToSQL)
  const result = [action, 'TABLE', tableName, exprList.join(', ')]
  return result.filter(hasVal).join(' ')
}

function alterExprToSQL(expr) {
  if (!expr) return ''
  const {
    action,
    create_definitions: createDefinition,
    first_after: firstAfter,
    if_not_exists: ifNotExists,keyword,
    old_column: oldColumn,
    prefix,
    resource,
    symbol,
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
      name = identifierToSql(expr[resource])
      break
    case 'algorithm':
    case 'lock':
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
      break
  }
  const alterArray = [
    toUpper(action),
    toUpper(keyword),
    toUpper(ifNotExists),
    oldColumn && columnRefToSQL(oldColumn),
    toUpper(prefix),
    name,
    dataType.filter(hasVal).join(' '),
    firstAfter && `${toUpper(firstAfter.keyword)} ${columnRefToSQL(firstAfter.column)}`,
  ]
  return alterArray.filter(hasVal).join(' ')
}

export {
  alterToSQL,
  alterExprToSQL,
}
