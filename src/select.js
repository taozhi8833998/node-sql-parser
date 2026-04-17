import { exprToSQL, getExprListSQL, orderOrPartitionByToSQL, varToSQL } from './expr'
import { columnsToSQL } from './column'
import { limitToSQL } from './limit'
import { withToSQL } from './with'
import { tablesToSQL } from './tables'
import { hasVal, commonOptionConnector, connector, identifierToSql, topToSQL, toUpper, literalToSQL } from './util'
import { collateToSQL } from './collate'

function distinctToSQL(distinct) {
  if (!distinct) return
  if (typeof distinct === 'string') return distinct
  const { type, columns } = distinct
  const result = [toUpper(type)]
  if (columns) result.push(`(${columns.map(exprToSQL).join(', ')})`)
  return result.filter(hasVal).join(' ')
}

function selectIntoToSQL(into) {
  if (!into) return
  const { position } = into
  if (!position) return
  const { keyword, expr } = into
  const result = []
  const intoType = toUpper(keyword)
  switch (intoType) {
    case 'VAR':
      result.push(expr.map(varToSQL).join(', '))
      break
    default:
      result.push(intoType, typeof expr === 'string' ? identifierToSql(expr) : exprToSQL(expr))
  }
  return result.filter(hasVal).join(' ')
}
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

function forXmlToSQL(stmt) {
  if (!stmt) return
  const { expr, keyword, type } = stmt
  const result = [toUpper(type), toUpper(keyword)]
  if (!expr) return result.join(' ')
  return `${result.join(' ')}(${exprToSQL(expr)})`
}

// T-SQL: render the final OPTION (query_hint [, ...]) clause.
// Returns undefined when there are no hints, so the caller can
// safely filter it out of the assembled SELECT string.
function queryHintsToSQL(hints) {
  if (!Array.isArray(hints) || hints.length === 0) return
  const parts = hints.map(hint => {
    const suffix = hint.value !== undefined && hint.value !== null ? ` ${hint.value}` : ''
    return `${hint.name}${suffix}`
  })
  return `OPTION (${parts.join(', ')})`
}

function selectToSQL(stmt) {
  const {
    as_struct_val: asStructVal,
    columns,
    collate,
    distinct,
    for: forXml,
    from,
    for_sys_time_as_of: forSystem = {},
    locking_read: lockingRead,
    groupby,
    having,
    into = {},
    isolation,
    limit,
    options,
    orderby,
    parentheses_symbol: parentheses,
    qualify,
    query_hints: queryHints,
    top,
    window: windowInfo,
    with: withInfo,
    where,
  } = stmt
  const clauses = [withToSQL(withInfo), 'SELECT', toUpper(asStructVal)]
  if (Array.isArray(options)) clauses.push(options.join(' '))
  clauses.push(distinctToSQL(distinct), topToSQL(top), columnsToSQL(columns, from))
  const { position } = into
  let intoSQL = ''
  if (position) intoSQL = commonOptionConnector('INTO', selectIntoToSQL, into)
  if (position === 'column') clauses.push(intoSQL)
  // FROM + joins
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from))
  if (position === 'from') clauses.push(intoSQL)
  const { keyword, expr } = forSystem || {}
  clauses.push(commonOptionConnector(keyword, exprToSQL, expr))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  if (groupby) {
    clauses.push(connector('GROUP BY', getExprListSQL(groupby.columns).join(', ')))
    clauses.push(getExprListSQL(groupby.modifiers).join(', '))
  }
  clauses.push(commonOptionConnector('HAVING', exprToSQL, having))
  clauses.push(commonOptionConnector('QUALIFY', exprToSQL, qualify))
  clauses.push(commonOptionConnector('WINDOW', exprToSQL, windowInfo))
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'))
  clauses.push(collateToSQL(collate))
  clauses.push(limitToSQL(limit))
  if (isolation) clauses.push(commonOptionConnector(isolation.keyword, literalToSQL, isolation.expr))
  clauses.push(toUpper(lockingRead))
  if (position === 'end') clauses.push(intoSQL)
  clauses.push(forXmlToSQL(forXml))
  clauses.push(queryHintsToSQL(queryHints))
  const sql = clauses.filter(hasVal).join(' ')
  return parentheses ? `(${sql})` : sql
}

export {
  selectIntoToSQL,
  selectToSQL,
}
