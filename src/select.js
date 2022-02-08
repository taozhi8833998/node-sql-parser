import { exprToSQL, getExprListSQL, orderOrPartitionByToSQL, varToSQL } from './expr'
import { columnRefToSQL, columnsToSQL } from './column'
import { limitToSQL } from './limit'
import { withToSQL } from './with'
import { tablesToSQL } from './tables'
import { hasVal, commonOptionConnector, connector, topToSQL, toUpper } from './util'

function distinctToSQL(distinct) {
  if (!distinct) return
  if (typeof distinct === 'string') return distinct
  const { type, columns } = distinct
  const result = [toUpper(type)]
  if (columns) result.push(`(${columns.map(columnRefToSQL).join(', ')})`)
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
      result.push(intoType, exprToSQL(expr))
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

function selectToSQL(stmt) {
  const {
    as_struct_val: asStructVal,
    columns,
    distinct,
    from,
    for_sys_time_as_of: forSystem = {},
    for_update: forUpdate,
    groupby,
    having,
    into = {},
    limit,
    options,
    orderby,
    parentheses_symbol: parentheses,
    top,
    window: windowInfo,
    with: withInfo,
    where,
  } = stmt
  const clauses = [withToSQL(withInfo), 'SELECT', toUpper(asStructVal)]
  clauses.push(topToSQL(top))
  if (Array.isArray(options)) clauses.push(options.join(' '))
  clauses.push(distinctToSQL(distinct), columnsToSQL(columns, from))
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
  clauses.push(connector('GROUP BY', getExprListSQL(groupby).join(', ')))
  clauses.push(commonOptionConnector('HAVING', exprToSQL, having))
  clauses.push(commonOptionConnector('WINDOW', exprToSQL, windowInfo))
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'))
  clauses.push(limitToSQL(limit))
  clauses.push(toUpper(forUpdate))
  if (position === 'end') clauses.push(intoSQL)
  const sql = clauses.filter(hasVal).join(' ')
  return parentheses ? `(${sql})` : sql
}

export {
  selectIntoToSQL,
  selectToSQL,
}
