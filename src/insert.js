import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { columnRefToSQL } from './column'
import { identifierToSql, commonOptionConnector, hasVal, toUpper, returningToSQL, literalToSQL } from './util'
import { selectToSQL } from './select'
import { setToSQL } from './update'

/**
 * @param {Array} stmt
 * @return {string}
 */
function valuesToSQL(stmt) {
  const { type } = stmt
  if (type === 'select') return selectToSQL(stmt)
  const values = type === 'values' ? stmt.values : stmt
  const clauses = values.map(value => {
    const sql = exprToSQL(value)
    return [toUpper(value.prefix), `(${sql})`].filter(hasVal).join('')
  })
  return clauses.join(', ')
}

function partitionToSQL(partition) {
  if (!partition) return ''
  const partitionArr = ['PARTITION', '(']
  if (Array.isArray(partition)) {
    partitionArr.push(partition.map(partitionItem => identifierToSql(partitionItem)).join(', '))
  } else {
    const { value } = partition
    partitionArr.push(value.map(exprToSQL).join(', '))
  }
  partitionArr.push(')')
  return partitionArr.filter(hasVal).join('')
}

function conflictTargetToSQL(conflictTarget) {
  if (!conflictTarget) return ''
  const { type } = conflictTarget
  switch (type) {
    case 'column':
      return `(${conflictTarget.expr.map(columnRefToSQL).join(', ')})`
  }
}

function conflictActionToSQL(conflictAction) {
  const { expr, keyword } = conflictAction
  const { type } = expr
  const result = [toUpper(keyword)]
  switch (type) {
    case 'origin':
      result.push(literalToSQL(expr))
      break
    case 'update':
      result.push('UPDATE', commonOptionConnector('SET', setToSQL, expr.set), commonOptionConnector('WHERE', exprToSQL, expr.where))
      break
  }
  return result.filter(hasVal).join(' ')
}

function conflictToSQL(conflict) {
  if (!conflict) return ''
  const { action, target } = conflict
  const result = [conflictTargetToSQL(target), conflictActionToSQL(action)]
  return result.filter(hasVal).join(' ')
}

function insertToSQL(stmt) {
  const {
    table,
    type,
    or: orExpr = [],
    prefix = 'into',
    columns,
    conflict,
    values,
    where,
    on_duplicate_update: onDuplicateUpdate,
    partition,
    returning,
    set,
  } = stmt
  const { keyword, set: duplicateSet } = onDuplicateUpdate || {}
  const clauses = [toUpper(type), orExpr.map(literalToSQL).join(' '), toUpper(prefix), tablesToSQL(table), partitionToSQL(partition)]
  if (Array.isArray(columns)) clauses.push(`(${columns.map(literalToSQL).join(', ')})`)
  clauses.push(commonOptionConnector(values && values.type === 'values' ? 'VALUES' : '', valuesToSQL, values))
  clauses.push(commonOptionConnector('ON CONFLICT', conflictToSQL, conflict))
  clauses.push(commonOptionConnector('SET', setToSQL, set))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(commonOptionConnector(keyword, setToSQL, duplicateSet))
  clauses.push(returningToSQL(returning))
  return clauses.filter(hasVal).join(' ')
}

export {
  conflictToSQL,
  insertToSQL,
  partitionToSQL,
  valuesToSQL,
}
