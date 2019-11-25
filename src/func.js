import { exprToSQL } from './expr'

function castToSQL(expr) {
  const str = expr.target.length ? `(${expr.target.length})` : ''
  let prefix = exprToSQL(expr.expr)
  let symbol = '::'
  let suffix = ''
  if (expr.symbol === 'as') {
    prefix = `CAST(${prefix}`
    suffix = ')'
    symbol = ` ${expr.symbol.toUpperCase()} `
  }
  return `${prefix}${symbol}${expr.target.dataType}${str}${suffix}`
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
