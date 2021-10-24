import { tablesToSQL } from './tables'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { limitToSQL } from './limit'
import { hasVal, identifierToSql, commonOptionConnector, returningToSQL } from './util'

/**
 * @param {Array} sets
 * @return {string}
 */
function setToSQL(sets) {
  if (!sets || sets.length === 0) return ''
  const clauses = []
  for (const set of sets) {
    const { table, column, value } = set
    const str = [table, column].filter(hasVal).map(info => identifierToSql(info)).join('.')
    const setItem = [str]
    let val = ''
    if (value) {
      val = exprToSQL(value)
      setItem.push('=', val)
    }
    clauses.push(setItem.filter(hasVal).join(' '))
  }
  return clauses.join(', ')
}

function updateToSQL(stmt) {
  const { table, set, where, orderby, limit, returning } = stmt
  const clauses = [
    'UPDATE',
    tablesToSQL(table),
    commonOptionConnector('SET', setToSQL, set),
    commonOptionConnector('WHERE', exprToSQL, where),
    orderOrPartitionByToSQL(orderby, 'order by'),
    limitToSQL(limit),
    returningToSQL(returning),
  ]
  return clauses.filter(hasVal).join(' ')
}

export {
  updateToSQL,
  setToSQL,
}
