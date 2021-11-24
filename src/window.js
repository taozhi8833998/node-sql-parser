import { hasVal, toUpper } from './util'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { overToSQL } from './over'

function windowSpecificationToSQL(windowSpec) {
  const {
    name,
    partitionby,
    orderby,
    window_frame_clause: windowFrame,
  } = windowSpec
  const result = [
    name,
    orderOrPartitionByToSQL(partitionby, 'partition by'),
    orderOrPartitionByToSQL(orderby, 'order by'),
    toUpper(windowFrame),
  ]
  return result.filter(hasVal).join(' ')
}

function asWindowSpecToSQL(asWindowSpec) {
  if (typeof asWindowSpec === 'string') return asWindowSpec
  const { window_specification: windowSpec } = asWindowSpec
  return `(${windowSpecificationToSQL(windowSpec)})`
}

function namedWindowExprToSQL(namedWindowExpr) {
  const { name, as_window_specification: asWindowSpec } = namedWindowExpr
  return `${name} AS ${asWindowSpecToSQL(asWindowSpec)}`
}

function namedWindowExprListToSQL(namedWindowExprInfo) {
  const { expr } = namedWindowExprInfo
  return expr.map(namedWindowExprToSQL).join(', ')
}

function isConsiderNullsInArgs(fnName) {
  // position of IGNORE/RESPECT NULLS varies by function
  switch (toUpper(fnName)) {
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
  const isConsidernulls = isConsiderNullsInArgs(name)
  const result = [name, '(', argsList, !isConsidernulls && ')', consider_nulls && ' ', consider_nulls, isConsidernulls && ')']
  return result.filter(hasVal).join('')
}

function windowFuncToSQL(expr) {
  const { over } = expr
  const str = constructArgsList(expr)
  const overStr = overToSQL(over)
  return [str, overStr].filter(hasVal).join(' ')
}

export {
  asWindowSpecToSQL,
  namedWindowExprToSQL,
  namedWindowExprListToSQL,
  windowFuncToSQL,
  windowSpecificationToSQL,
}
