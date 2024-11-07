import { exprToSQL } from './expr'
import { hasVal, toUpper } from './util'

function assignToSQL(expr) {
  /** @type {Object} */
  const { left, right, symbol, keyword } = expr
  left.keyword = keyword
  const leftVar = exprToSQL(left)
  const rightVal = exprToSQL(right)
  return [leftVar, toUpper(symbol), rightVal].filter(hasVal).join(' ')
}

export {
  assignToSQL,
}
