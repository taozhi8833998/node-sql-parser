import { exprToSQL } from './expr'
import { hasVal } from './util'

function binaryToSQL(expr) {
  let { operator } = expr
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
  const str = [exprToSQL(expr.left), operator, rstr].filter(hasVal).join(' ')
  return expr.parentheses ? `(${str})` : str
}

export {
  binaryToSQL,
}
