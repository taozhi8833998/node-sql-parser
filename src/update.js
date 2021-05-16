import { tablesToSQL } from './tables'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { limitToSQL } from './limit'
import { hasVal, identifierToSql, commonOptionConnector, returningToSQL, toUpper } from './util'

/**
 * @param {Array} sets
 * @return {string}
 */
function setToSQL(sets) {
  if (!sets || sets.length === 0) return ''
  const clauses = []
  for (const set of sets) {
    let str = ''
    const { table, column, value, keyword } = set
    str = [table, column].filter(hasVal).map(info => identifierToSql(info)).join('.')
    let prefix = ''
    let suffix = ''
    if (keyword) {
      prefix = `${toUpper(keyword)}(`
      suffix = ')'
    }
    if (value) str = `${str} = ${prefix}${exprToSQL(value)}${suffix}`
    clauses.push(str)
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
