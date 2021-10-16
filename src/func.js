import { exprToSQL } from './expr'
import { hasVal, identifierToSql, toUpper } from './util'
import { overToSQL } from './over'

function castToSQL(expr) {
  const { target, expr: expression, symbol, as: alias } = expr
  const { length, dataType, parentheses, scale } = target
  let str = ''
  if (length != null) str = scale ? `${length}, ${scale}` : length
  if (parentheses) str = `(${str})`
  let prefix = exprToSQL(expression)
  let symbolChar = '::'
  let suffix = ''
  if (symbol === 'as') {
    prefix = `CAST(${prefix}`
    suffix = ')'
    symbolChar = ` ${symbol.toUpperCase()} `
  }
  if (alias) suffix += ` AS ${identifierToSql(alias)}`
  return `${prefix}${symbolChar}${dataType}${str}${suffix}`
}

function extractFunToSQL(stmt) {
  const { args, type } = stmt
  const { field, cast_type: castType, source } = args
  const result = [`${toUpper(type)}(${toUpper(field)}`, 'FROM', toUpper(castType), exprToSQL(source)]
  return `${result.filter(hasVal).join(' ')})`
}

function funcToSQL(expr) {
  const { args, name } = expr
  const { parentheses, over } = expr
  const overStr = overToSQL(over)
  if (!args) return [name, overStr].filter(hasVal).join(' ')
  const str = `${name}(${exprToSQL(args).join(', ')})`
  return [parentheses ? `(${str})` : str, overStr].filter(hasVal).join(' ')
}

export {
  castToSQL,
  extractFunToSQL,
  funcToSQL,
}
