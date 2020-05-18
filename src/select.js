import { exprToSQL, getExprListSQL, orderOrPartitionByToSQL } from './expr'
import { columnsToSQL } from './column'
import { limitToSQL } from './limit'
import { withToSql } from './with'
import { tablesToSQL } from './tables'
import { hasVal, commonOptionConnector, connector, topToSQL, toUpper } from './util'

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
    as_struct_val: asStructVal, columns, distinct, from, for_sys_time_as_of: forSystem = {}, groupby, having, limit, options, orderby, top, window: windowInfo, with: withInfo, where,
  } = stmt
  const clauses = [withToSql(withInfo), 'SELECT', toUpper(asStructVal)]
  clauses.push(topToSQL(top))
  if (Array.isArray(options)) clauses.push(options.join(' '))
  clauses.push(distinct, columnsToSQL(columns, from))
  // FROM + joins
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from))
  const { keyword, expr } = forSystem || {}
  clauses.push(commonOptionConnector(keyword, exprToSQL, expr))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(connector('GROUP BY', getExprListSQL(groupby).join(', ')))
  clauses.push(commonOptionConnector('HAVING', exprToSQL, having))
  clauses.push(commonOptionConnector('WINDOW', exprToSQL, windowInfo))
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'))
  clauses.push(limitToSQL(limit))
  return clauses.filter(hasVal).join(' ')
}

export {
  selectToSQL,
}
