import { columnDataType } from './column'
import { indexTypeAndOptionToSQL } from './index-definition'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { hasVal } from './util'

function alterToSQL(stmt) {
  const { type, table, expr = [] } = stmt
  const action = type && type.toUpperCase()
  const tableName = tablesToSQL(table)
  const exprList = expr.map(exprToSQL)
  return `${action} TABLE ${tableName} ${exprList.join(', ')}`
}

function alterExprToSQL(expr) {
  const { action, keyword, resource } = expr
  const actionUpper = action && action.toUpperCase()
  const keyWordUpper = keyword && keyword.toUpperCase()
  const name = expr[resource]
  let dataType = ''
  switch (resource) {
    case 'column':
      dataType = columnDataType(expr.definition)
      break
    case 'index':
      dataType = indexTypeAndOptionToSQL(expr)
      break
    default:
      break
  }
  const alterArray = [actionUpper]
  alterArray.push(keyWordUpper)
  alterArray.push(name)
  alterArray.push(dataType)
  return alterArray.filter(hasVal).join(' ')
}

export {
  alterToSQL,
  alterExprToSQL,
}
