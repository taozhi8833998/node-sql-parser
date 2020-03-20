import { exprToSQL } from './expr'
import { hasVal } from './util'
import { overToSQL } from './over'

function castToSQL(expr) {
  const { target, expr: expression, symbol } = expr
  const { length, dataType, parentheses, scale } = target
  let str = ''
  if (length) {
    str = scale ? `${length}, ${scale}` : length
  }
  if (parentheses) str = `(${str})`
  let prefix = exprToSQL(expression)
  let symbolChar = '::'
  let suffix = ''
  if (symbol === 'as') {
    prefix = `CAST(${prefix}`
    suffix = ')'
    symbolChar = ` ${symbol.toUpperCase()} `
  }
  return `${prefix}${symbolChar}${dataType}${str}${suffix}`
}

function funcToSQL(expr) {
  const { args, name } = expr
  if (!args) return name
  const { parentheses, over } = expr
  const str = `${name}(${exprToSQL(args).join(', ')})`
  const overStr = overToSQL(over)
  return [parentheses ? `(${str})` : str, overStr].filter(hasVal).join(' ')
}

export {
  castToSQL,
  funcToSQL,
}
