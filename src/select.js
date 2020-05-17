import { exprToSQL, getExprListSQL, orderOrPartitionByToSQL } from './expr'
import { columnsToSQL } from './column'
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
  const { as_struct_val: asStructVal, with: withInfo, options, distinct, columns, from, where, groupby, having, orderby, limit, top } = stmt
  const clauses = [withToSql(withInfo), 'SELECT', toUpper(asStructVal)]
  clauses.push(topToSQL(top))
  if (Array.isArray(options)) clauses.push(options.join(' '))
  clauses.push(distinct, columnsToSQL(columns, from))
  // FROM + joins
  clauses.push(commonOptionConnector('FROM', tablesToSQL, from))
  clauses.push(commonOptionConnector('WHERE', exprToSQL, where))
  clauses.push(connector('GROUP BY', getExprListSQL(groupby).join(', ')))
  clauses.push(commonOptionConnector('HAVING', exprToSQL, having))
  clauses.push(orderOrPartitionByToSQL(orderby, 'order by'))
  if (limit) {
    const { seperator, value } = limit
    clauses.push(connector('LIMIT', value.map(exprToSQL).join(`${seperator === 'offset' ? ' ' : ''}${seperator.toUpperCase()} `)))
  }
  return clauses.filter(hasVal).join(' ')
}

export {
  selectToSQL,
}
