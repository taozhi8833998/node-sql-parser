import has from 'has'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { identifierToSql } from './util'

/**
 * @param {Array} values
 * @return {string}
 */
function valuesToSQL(values) {
  const clauses = values.map(exprToSQL)
  return `(${clauses.join('')})`
}

function insertToSQL(stmt) {
  const clauses = ['INSERT INTO']
  if (has(stmt, 'table')) clauses.push(tablesToSQL(stmt.table))
  if (Array.isArray(stmt.columns)) clauses.push(`(${stmt.columns.map(identifierToSql).join(', ')})`)
  if (Array.isArray(stmt.values)) clauses.push('VALUES', valuesToSQL(stmt.values))
  if (stmt.where) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)

  return clauses.join(' ')
}

export {
  insertToSQL,
}
