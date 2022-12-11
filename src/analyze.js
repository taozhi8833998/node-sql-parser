import { exprToSQL } from './expr'
import { tableToSQL } from './tables'
import { hasVal, identifierToSql, toUpper } from './util'

function analyzeToSQL(stmt) {
  const { type, table } = stmt
  const action = toUpper(type)
  const tableName = tableToSQL(table)
  return [action, tableName].join(' ')
}

function attachToSQL(stmt) {
  const { type, database, expr, as, schema } = stmt
  return [toUpper(type), toUpper(database), exprToSQL(expr), toUpper(as), identifierToSql(schema)].filter(hasVal).join(' ')
}

export {
  attachToSQL,
  analyzeToSQL,
}
