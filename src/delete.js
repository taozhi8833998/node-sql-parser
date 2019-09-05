import { columnsToSQL } from './column'
import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { commonOptionConnector, hasVal } from './util'

function deleteToSQL(stmt) {
  const clauses = ['DELETE']
  const { columns, from, table, where } = stmt
  const columnInfo = columnsToSQL(columns, from)
  clauses.push(columnInfo)
  if (Array.isArray(table)) {
    if (!(table.length === 1 && table[0].addition === true)) clauses.push(tablesToSQL(table))
  }
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  return clauses.filter(hasVal).join(' ')
}

export {
  deleteToSQL,
}
