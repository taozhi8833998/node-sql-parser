import { exprToSQL } from './expr'
import { hasVal } from './util'
import { overToSQL } from './over'

function aggrToSQL(expr) {
  /** @type {Object} */
  const { args, over } = expr
  let str = exprToSQL(args.expr)
  const fnName = expr.name
  const overStr = overToSQL(over)
  if (fnName === 'COUNT' && args.distinct) str = `DISTINCT ${str}`
  return [`${fnName}(${str})`, overStr].filter(hasVal).join(' ')
}

export {
  aggrToSQL,
}
