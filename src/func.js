import { exprToSQL } from './expr'

function castToSQL(expr) {
  const str = expr.target.length ? `(${expr.target.length})` : ''
  if (expr.symbol === 'as') {
    return `CAST(${exprToSQL(expr.expr)} ${expr.symbol.toUpperCase()} ${expr.target.dataType}${str})`
  }
  return `${exprToSQL(expr.expr)}${expr.symbol.toUpperCase()}${expr.target.dataType}${str}`
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
