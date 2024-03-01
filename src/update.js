import { tablesToSQL } from './tables'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { columnRefToSQL } from './column'
import { limitToSQL } from './limit'
import { hasVal, commonOptionConnector, returningToSQL } from './util'
import { withToSQL } from './with'

/**
 * @param {Array} sets
 * @return {string}
 */
function setToSQL(sets) {
  if (!sets || sets.length === 0) return ''
  const clauses = []
  for (const set of sets) {
    const column = {}
    const { value } = set
    for (const key in set) {
      if (key === 'value' || key === 'keyword') continue
      if (Object.prototype.hasOwnProperty.call(set, key)) column[key] = set[key]
    }
    const str = columnRefToSQL(column)
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
  const { from, table, set, where, orderby, with: withInfo, limit, returning } = stmt
  const clauses = [
    withToSQL(withInfo),
    'UPDATE',
    tablesToSQL(table),
    commonOptionConnector('SET', setToSQL, set),
    commonOptionConnector('FROM', tablesToSQL, from),
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
