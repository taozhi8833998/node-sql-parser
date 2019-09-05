import { exprToSQL } from './expr'

function caseToSQL(expr) {
  const res = ['CASE']
  const conditions = expr.args

  if (expr.expr) res.push(exprToSQL(expr.expr))

  for (let i = 0, len = conditions.length; i < len; ++i) {
    res.push(conditions[i].type.toUpperCase())
    if (conditions[i].cond) {
      res.push(exprToSQL(conditions[i].cond))
      res.push('THEN')
    }
    res.push(exprToSQL(conditions[i].result))
  }

  res.push('END')

  return res.join(' ')
}

export {
  caseToSQL,
}
