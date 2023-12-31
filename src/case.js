import { exprToSQL } from './expr'

function caseToSQL(expr) {
  const res = ['CASE']
  const { args: conditions, expr: exprItem, parentheses } = expr
  if (exprItem) res.push(exprToSQL(exprItem))
  for (let i = 0, len = conditions.length; i < len; ++i) {
    res.push(conditions[i].type.toUpperCase())
    if (conditions[i].cond) {
      res.push(exprToSQL(conditions[i].cond))
      res.push('THEN')
    }
    res.push(exprToSQL(conditions[i].result))
  }
  res.push('END')
  return parentheses ? `(${res.join(' ')})` : res.join(' ')
}

export {
  caseToSQL,
}
