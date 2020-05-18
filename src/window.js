import { hasVal, toUpper } from './util'
import { orderOrPartitionByToSQL } from './expr'

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

export {
  asWindowSpecToSQL,
  namedWindowExprToSQL,
  namedWindowExprListToSQL,
  windowSpecificationToSQL,
}
