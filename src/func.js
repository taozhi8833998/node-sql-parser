import { exprToSQL } from './expr'

function castToSQL(expr) {
  const str = expr.target.length ? `(${expr.target.length})` : ''
  return `CAST(${exprToSQL(expr.expr)} AS ${expr.target.dataType}${str})`
}

function funcToSQL(expr) {
  if (!expr.args) return expr.name
  const str = `${expr.name}(${exprToSQL(expr.args).join(', ')})`
  return expr.parentheses ? `(${str})` : str
}

export {
  castToSQL,
  funcToSQL,
}
