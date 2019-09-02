import has from 'has'
import { exprToSQL, getExprListSQL } from './expr'
import { columnsToSQL } from './column'
import { withToSql } from './with'
import { tablesToSQL } from './tables'

/**
 * @param {Object}      stmt
 * @param {?Array}      stmt.with
 * @param {?Array}      stmt.options
 * @param {?string}     stmt.distinct
 * @param {?Array|string}   stmt.columns
 * @param {?Array}      stmt.from
 * @param {?Object}     stmt.where
 * @param {?Array}      stmt.groupby
 * @param {?Object}     stmt.having
 * @param {?Array}      stmt.orderby
 * @param {?Array}      stmt.limit
 * @return {string}
 */
function selectToSQL(stmt) {
  const clauses = ['SELECT']

  if (has(stmt, 'with') && Array.isArray(stmt.with)) clauses.unshift(withToSql(stmt.with))
  if (has(stmt, 'options') && Array.isArray(stmt.options)) clauses.push(stmt.options.join(' '))
  if (has(stmt, 'distinct') && stmt.distinct !== null) clauses.push(stmt.distinct)

  if (stmt.columns === '*') clauses.push('*')
  else clauses.push(columnsToSQL(stmt.columns, stmt.from))

  // FROM + joins
  if (Array.isArray(stmt.from)) clauses.push('FROM', tablesToSQL(stmt.from))

  if (has(stmt, 'where') && stmt.where !== null) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)
  if (Array.isArray(stmt.groupby) && stmt.groupby.length > 0) clauses.push('GROUP BY', getExprListSQL(stmt.groupby).join(', '))
  if (has(stmt, 'having') && stmt.having !== null) clauses.push(`HAVING ${exprToSQL(stmt.having)}`)

  if (Array.isArray(stmt.orderby) && stmt.orderby.length > 0) {
    const orderExpressions = stmt.orderby.map(expr => `${exprToSQL(expr.expr)} ${expr.type}`)
    clauses.push('ORDER BY', orderExpressions.join(', '))
  }

  if (Array.isArray(stmt.limit)) clauses.push('LIMIT', stmt.limit.map(exprToSQL))

  return clauses.join(' ')
}

export {
  selectToSQL,
}
