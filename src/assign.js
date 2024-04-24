import { exprToSQL } from './expr'
import { hasVal } from './util'

function assignToSQL(expr) {
  /** @type {Object} */
  const { left, right, symbol, keyword } = expr
  left.keyword = keyword
  const leftVar = exprToSQL(left)
  const rightVal = exprToSQL(right)
  return [leftVar, symbol, rightVal].filter(hasVal).join(' ')
}

export {
  assignToSQL,
}
