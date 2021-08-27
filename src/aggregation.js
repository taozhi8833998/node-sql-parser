import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { hasVal } from './util'
import { overToSQL } from './over'

function aggrToSQL(expr) {
  /** @type {Object} */
  const { args, over, orderby } = expr
  let str = exprToSQL(args.expr)
  const fnName = expr.name
  const overStr = overToSQL(over)
  if (args.distinct) {
    const separator = args.expr.parentheses ? '' : ' '
    str = ['DISTINCT', str].join(separator)
  }
  if (orderby) str = `${str} ${orderOrPartitionByToSQL(orderby, 'order by')}`
  return [`${fnName}(${str})`, overStr].filter(hasVal).join(' ')
}

export {
  aggrToSQL,
}
