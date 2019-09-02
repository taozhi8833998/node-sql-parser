import has from 'has'
import { columnsToSQL } from './column'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'

function deleteToSQL(stmt) {
  const clauses = ['DELETE']
  const { columns, from, table, where } = stmt
  const columnInfo = columnsToSQL(columns, from)
  // if (columns === '*') clauses.push('*')
  if (columnInfo) clauses.push(columnInfo)

  if (Array.isArray(table)) {
    if (!(table.length === 1 && table[0].addition === true)) clauses.push(tablesToSQL(table))
  }
  if (Array.isArray(from)) clauses.push('FROM', tablesToSQL(from))
  if (has(stmt, 'where') && where !== null) clauses.push(`WHERE ${exprToSQL(where)}`)

  return clauses.join(' ')
}

export {
  deleteToSQL,
}
