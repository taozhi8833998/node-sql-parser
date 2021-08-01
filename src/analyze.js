import { tableToSQL } from './tables'
import { toUpper } from './util'

function analyzeToSQL(stmt) {
  const { type, table } = stmt
  const action = toUpper(type)
  const tableName = tableToSQL(table)
  return [action, tableName].join(' ')
}

export {
  analyzeToSQL,
}
