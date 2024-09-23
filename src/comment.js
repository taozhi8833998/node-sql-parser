import { columnRefToSQL } from './column'
import { hasVal, identifierToSql, literalToSQL, toUpper } from './util'

function commentOptionToSQL(stmt) {
  const { name, type } = stmt
  switch (type) {
    case 'table':
    case 'view':
      const fullTableName = [identifierToSql(name.db), identifierToSql(name.table)].filter(hasVal).join('.')
      return `${toUpper(type)} ${fullTableName}`
    case 'column':
      return `COLUMN ${columnRefToSQL(name)}`
  }
}

function commentIsExprToSQL(stmt) {
  const { keyword, expr } = stmt
  return [toUpper(keyword), literalToSQL(expr)].filter(hasVal).join(' ')
}

function commentOnToSQL(stmt) {
  const { expr, keyword, target, type } = stmt
  const result = [
    toUpper(type),
    toUpper(keyword),
    commentOptionToSQL(target),
    commentIsExprToSQL(expr),
  ]
  return result.filter(hasVal).join(' ')
}

export {
  commentOnToSQL,
}
