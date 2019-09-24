import { columnDefinitionToSQL } from './column'
import { indexTypeAndOptionToSQL } from './index-definition'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { hasVal, toUpper } from './util'

function alterToSQL(stmt) {
  const { type, table, expr = [] } = stmt
  const action = type && type.toUpperCase()
  const tableName = tablesToSQL(table)
  const exprList = expr.map(exprToSQL)
  const result = [action, 'TABLE', tableName, exprList.join(', ')]
  return result.filter(hasVal).join(' ')
}

function alterExprToSQL(expr) {
  const {
    action,
    if_not_exists: ifNotExists,
    keyword,
    resource,
  } = expr
  const actionUpper = toUpper(action)
  const keyWordUpper = toUpper(keyword)
  const ifNotExistsUpper = toUpper(ifNotExists)
  let name = ''
  let dataType = ''
  switch (resource) {
    case 'column':
      dataType = columnDefinitionToSQL(expr)
      break
    case 'index':
      dataType = indexTypeAndOptionToSQL(expr)
      dataType = dataType.filter(hasVal).join(' ')
      name = expr[resource]
      break
    default:
      break
  }
  const alterArray = [actionUpper]
  alterArray.push(keyWordUpper)
  alterArray.push(ifNotExistsUpper)
  alterArray.push(name)
  alterArray.push(dataType)
  return alterArray.filter(hasVal).join(' ')
}

export {
  alterToSQL,
  alterExprToSQL,
}
