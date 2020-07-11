import { columnsToSQL } from './column'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { limitToSQL } from './limit'
import { tablesToSQL } from './tables'
import { commonOptionConnector, hasVal } from './util'

function deleteToSQL(stmt) {
  const clauses = ['DELETE']
  const { columns, from, table, where, orderby, limit } = stmt
  const columnInfo = columnsToSQL(columns, from)
  clauses.push(columnInfo)
  if (Array.isArray(table)) {
    if (!(table.length === 1 && table[0].addition === true)) clauses.push(tablesToSQL(table))
  }
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'))
  clauses.push(limitToSQL(limit))
  return clauses.filter(hasVal).join(' ')
}

export {
  deleteToSQL,
}
