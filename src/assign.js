import { exprToSQL } from './expr'

function assignToSQL(expr) {
  /** @type {Object} */
  const { left, right, symbol, keyword } = expr
  left.keyword = keyword
  const leftVar = exprToSQL(left)
  const rightVal = exprToSQL(right)
  return `${leftVar} ${symbol} ${rightVal}`
}

export {
  assignToSQL,
}
