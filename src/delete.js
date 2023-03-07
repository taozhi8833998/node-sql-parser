import { columnsToSQL } from './column'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { limitToSQL } from './limit'
import { tablesToSQL } from './tables'
import { commonOptionConnector, hasVal } from './util'
import { withToSQL } from './with'

function deleteToSQL(stmt) {
  const { columns, from, table, where, orderby, with: withInfo, limit } = stmt
  const clauses = [withToSQL(withInfo), 'DELETE']
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
