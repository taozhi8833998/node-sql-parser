import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { hasVal } from './util'
import { overToSQL } from './over'

function windowSumCountToSQL(expr) {
  /** @type {Object} */
  const { args, over, orderby } = expr
  let str = args.expr ? exprToSQL(args.expr) : ''
  const fnName = expr.name
  const overStr = overToSQL(over)
  if (args.distinct) str = `DISTINCT ${str}`
  if (orderby) str = `${str} ${orderOrPartitionByToSQL(orderby, 'order by')}`
  return [`${fnName}(${str})`, overStr].filter(hasVal).join(' ')
}

function considerNullPosition(fnName) {
  switch (fnName) {
    case 'NTH_VALUE':
    case 'LEAD':
    case 'LAG':
      return 'AFTER'
    default:
      return 'BEFORE'
  }
}

function funcToSQL(expr) {
  const { args, name, orderby, over, consider_nulls } = expr
  let argsList = args ? exprToSQL(args).join(', ') : ''
  if (consider_nulls && considerNullPosition(name) === 'BEFORE') {
    argsList = `${argsList} ${consider_nulls}`
  }
  let str = `${name}(${argsList})`
  if (consider_nulls && considerNullPosition(name) === 'AFTER') {
    str = `${str} ${consider_nulls}`
  }
  const overStr = overToSQL(over)
  if (args && args.distinct) str = `DISTINCT ${str}`
  if (orderby) str = `${str} ${orderOrPartitionByToSQL(orderby, 'order by')}`
  return [str, overStr].filter(hasVal).join(' ')
}
function windowFuncToSQL(expr) {
  switch (expr.name) {
    case 'SUM':
    case 'COUNT':
    case 'MIN':
    case 'MAX':
    case 'AVG':
      return windowSumCountToSQL(expr)
    default:
      return funcToSQL(expr)
  }
}

export {
  windowFuncToSQL,
}
