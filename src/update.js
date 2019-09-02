import has from 'has'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'


/**
 * @param {Array} sets
 * @return {string}
 */
function setToSQL(sets) {
  if (!sets || sets.length === 0) return ''
  const clauses = []
  for (const set of sets) {
    let str = ''
    const { table, column, value } = set
    if (column) str = table ? `\`${table}\`.\`${column}\`` : `\`${column}\``
    if (value) str = `${str} = ${exprToSQL(value)}`
    clauses.push(str)
  }
  return clauses.join(', ')
}

function updateToSQL(stmt) {
  const clauses = ['UPDATE']

  // cross-table update
  if (has(stmt, 'table') && stmt.table !== null) clauses.push(tablesToSQL(stmt.table))
  if (Array.isArray(stmt.set)) clauses.push('SET', setToSQL(stmt.set))

  if (has(stmt, 'where') && stmt.where !== null) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)

  return clauses.join(' ')
}

export {
  updateToSQL,
}
