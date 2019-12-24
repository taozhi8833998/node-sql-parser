import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { identifierToSql, commonOptionConnector, hasVal, toUpper, returningToSQL } from './util'
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

function partitionToSQL(partition) {
  if (!partition) return ''
  const partitionArr = ['PARTITION', '(']
  if (Array.isArray(partition)) {
    partitionArr.push(partition.map(identifierToSql).join(', '))
  } else {
    const { value } = partition
    partitionArr.push(value.map(exprToSQL).join(', '))
  }
  partitionArr.push(')')
  return partitionArr.filter(hasVal).join('')
}

function insertToSQL(stmt) {
  const {
    table,
    prefix = 'into',
    columns,
    values,
    where,
    partition,
    returning,
  } = stmt
  const clauses = ['INSERT', toUpper(prefix), tablesToSQL(table), partitionToSQL(partition)]
  if (Array.isArray(columns)) clauses.push(`(${columns.map(identifierToSql).join(', ')})`)
  clauses.push(commonOptionConnector(Array.isArray(values) ? 'VALUES' : '', valuesToSQL, values))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(returningToSQL(returning))
  return clauses.filter(hasVal).join(' ')
}

export {
  insertToSQL,
}
