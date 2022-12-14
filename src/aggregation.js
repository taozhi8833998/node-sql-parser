import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { hasVal, literalToSQL } from './util'
import { overToSQL } from './over'

function aggrToSQL(expr) {
  /** @type {Object} */
  const { args, filter, over, orderby, within_group_orderby } = expr
  let str = exprToSQL(args.expr)
  const fnName = expr.name
  const overStr = overToSQL(over)
  if (args.distinct) {
    let separator = ' '
    const distinctSQL = ['DISTINCT', '', str]
    if (args.parentheses) {
      separator = ''
      distinctSQL[1] = '('
      distinctSQL.push(')')
    }
    str = distinctSQL.filter(hasVal).join(separator)
  }
  if (args.orderby) str = `${str} ${orderOrPartitionByToSQL(args.orderby, 'order by')}`
  if (orderby) str = `${str} ${orderOrPartitionByToSQL(orderby, 'order by')}`
  if (args.separator) str = [str, args.separator.keyword, literalToSQL(args.separator.value)].filter(hasVal).join(' ')
  const withinGroup = within_group_orderby ? `WITHIN GROUP (${orderOrPartitionByToSQL(within_group_orderby, 'order by')})` : ''
  const filterStr = filter ? `FILTER (WHERE ${exprToSQL(filter.where)})` : ''
  return [`${fnName}(${str})`, withinGroup, overStr, filterStr].filter(hasVal).join(' ')
}

export {
  aggrToSQL,
}
