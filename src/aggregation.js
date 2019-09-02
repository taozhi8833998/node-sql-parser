import has from 'has'
import { exprToSQL } from './expr'

function aggrToSQL(expr) {
  /** @type {Object} */
  const { args } = expr
  let str = exprToSQL(args.expr)
  const fnName = expr.name

  if (fnName === 'COUNT') {
    if (has(args, 'distinct') && args.distinct !== null) str = `DISTINCT ${str}`
  }

  return `${fnName}(${str})`
}

export {
  aggrToSQL,
}
