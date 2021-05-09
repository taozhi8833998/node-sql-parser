import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { hasVal } from './util'
import { overToSQL } from './over'

function windowSumCountToSQL(expr) {
  /** @type {Object} */
  const { args, over, orderby } = expr
  let str = args.expr ? exprToSQL(args.expr) : ''
  const fnName = expr.name
  const overStr = overToSQL(over)
  // if (args.distinct) str = `DISTINCT ${str}` // cant occur in window fn context
  if (orderby) str = `${str} ${orderOrPartitionByToSQL(orderby, 'order by')}`
  return [`${fnName}(${str})`, overStr].filter(hasVal).join(' ')
}

function isConsiderNullsInArgs(fnName) {
  // position of IGNORE/RESPECT NULLS varies by function
  switch (fnName) {
    case 'NTH_VALUE':
    case 'LEAD':
    case 'LAG':
      return false
    default:
      return true
  }
}

function constructArgsList(expr) {
  const { args, name, consider_nulls = '' } = expr
  const argsList = args ? exprToSQL(args).join(', ') : ''
  // cover Syntax from FN_NAME(...args [RESPECT NULLS]) [RESPECT NULLS]
  if (isConsiderNullsInArgs(name)) {
    return [
      name,
      '(',
      argsList,
      // if consider nulls we need a space
      consider_nulls && ' ',
      consider_nulls,
      ')',
    ].filter(hasVal).join('')
  }

  return [
    name,
    '(',
    argsList,
    ')',
    // if consider nulls we need a space
    consider_nulls && ' ',
    consider_nulls,
  ].filter(hasVal).join('')
}

function funcToSQL(expr) {
  const { over } = expr
  const str = constructArgsList(expr)
  const overStr = overToSQL(over)
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
