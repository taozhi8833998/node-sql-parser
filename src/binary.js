import { exprToSQL } from './expr'
import { hasVal, toUpper } from './util'

function binaryToSQL(expr) {
  let operator = expr.operator || expr.op
  let rstr = exprToSQL(expr.right)
  let isBetween = false
  if (Array.isArray(rstr)) {
    switch (operator) {
      case '=':
        operator = 'IN'
        break
      case '!=':
        operator = 'NOT IN'
        break
      case 'BETWEEN':
      case 'NOT BETWEEN':
        isBetween = true
        rstr = `${rstr[0]} AND ${rstr[1]}`
        break
      default:
        break
    }
    if (!isBetween) rstr = `(${rstr.join(', ')})`
  }
  const escape = expr.right.escape || {}
  const leftPart = Array.isArray(expr.left) ? expr.left.map(exprToSQL).join(', ') : exprToSQL(expr.left)
  const str = [leftPart, operator, rstr, toUpper(escape.type), exprToSQL(escape.value)].filter(hasVal).join(' ')
  const result = [expr.parentheses ? `(${str})` : str]
  return result.join(' ')
}

export {
  binaryToSQL,
}
