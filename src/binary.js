import { exprToSQL } from './expr'

function binaryToSQL(expr) {
  let { operator } = expr
  let rstr = exprToSQL(expr.right)

  if (Array.isArray(rstr)) {
    if (operator === '=') operator = 'IN'
    if (operator === '!=') operator = 'NOT IN'
    if (operator === 'BETWEEN' || operator === 'NOT BETWEEN') rstr = `${rstr[0]} AND ${rstr[1]}`
    else rstr = `(${rstr.join(', ')})`
  }

  const str = `${exprToSQL(expr.left)} ${operator} ${rstr}`

  return expr.parentheses ? `(${str})` : str
}

export {
  binaryToSQL,
}
