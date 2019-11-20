import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { identifierToSql, commonOptionConnector, hasVal } from './util'
import { selectToSQL } from './select'

/**
 * @param {Array} values
 * @return {string}
 */
function valuesToSQL(values) {
  if (values.type === 'select') return selectToSQL(values)
  const clauses = values.map(exprToSQL)
  return `(${clauses.join('),(')})`
}

function insertToSQL(stmt) {
  const { table, columns, values, where } = stmt
  const clauses = ['INSERT INTO', tablesToSQL(table)]
  if (Array.isArray(columns)) clauses.push(`(${columns.map(identifierToSql).join(', ')})`)
  clauses.push(commonOptionConnector(Array.isArray(values) ? 'VALUES' : '', valuesToSQL, values))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  return clauses.filter(hasVal).join(' ')
}

export {
  insertToSQL,
}
