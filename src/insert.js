import { tablesToSQL } from './tables'
import { exprToSQL } from './expr'
import { columnRefToSQL } from './column'
import { identifierToSql, commonOptionConnector, hasVal, toUpper, returningToSQL, literalToSQL } from './util'
import { selectToSQL } from './select'
import { setToSQL } from './update'

/**
 * @param {Array} values
 * @return {string}
 */
function valuesToSQL(values) {
  if (values.type === 'select') return selectToSQL(values)
  const clauses = values.map(exprToSQL)
  return `(${clauses.join('), (')})`
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
  const clauses = [toUpper(type), toUpper(prefix), tablesToSQL(table), partitionToSQL(partition)]
  if (Array.isArray(columns)) clauses.push(`(${columns.map(literalToSQL).join(', ')})`)
  clauses.push(commonOptionConnector(Array.isArray(values) ? 'VALUES' : '', valuesToSQL, values))
  clauses.push(commonOptionConnector('ON CONFLICT', conflictToSQL, conflict))
  clauses.push(commonOptionConnector('SET', setToSQL, set))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(returningToSQL(returning))
  clauses.push(commonOptionConnector(keyword, setToSQL, duplicateSet))
  return clauses.filter(hasVal).join(' ')
}

export {
  conflictToSQL,
  insertToSQL,
  valuesToSQL,
}
