import { arrayIndexToSQL } from './column'
import { exprToSQL } from './expr'
import { hasVal, identifierToSql, literalToSQL, toUpper } from './util'
import { overToSQL } from './over'

function anyValueFuncToSQL(stmt) {
  const { args, type, over } = stmt
  const { expr, having } = args
  let sql = `${toUpper(type)}(${exprToSQL(expr)}`
  if (having) sql = `${sql} HAVING ${toUpper(having.prefix)} ${exprToSQL(having.expr)}`
  sql = `${sql})`
  const overStr = overToSQL(over)
  return [sql, overStr].filter(hasVal).join(' ')
}

function arrayDimensionToSymbol(target) {
  if (!target || !target.array) return ''
  const { keyword } = target.array
  if (keyword) return toUpper(keyword)
  const { dimension, length } = target.array
  const result = []
  for (let i = 0; i < dimension; i++) {
    result.push('[')
    if (length && length[i]) result.push(literalToSQL(length[i]))
    result.push(']')
  }
  return result.join('')
}

function castToSQL(expr) {
  const { target, expr: expression, keyword, symbol, as: alias, parentheses: outParentheses } = expr
  const { angle_brackets: angleBrackets, length, dataType, parentheses, quoted, scale, suffix: dataTypeSuffix, expr: targetExpr } = target
  let str = targetExpr ? exprToSQL(targetExpr) : ''
  if (length != null) str = scale ? `${length}, ${scale}` : length
  if (parentheses) str = `(${str})`
  if (angleBrackets) str = `<${str}>`
  if (dataTypeSuffix && dataTypeSuffix.length) str += ` ${dataTypeSuffix.map(literalToSQL).join(' ')}`
  let prefix = exprToSQL(expression)
  let symbolChar = '::'
  let suffix = ''
  if (symbol === 'as') {
    prefix = `${toUpper(keyword)}(${prefix}`
    suffix = ')'
    symbolChar = ` ${symbol.toUpperCase()} `
  }
  if (alias) suffix += ` AS ${identifierToSql(alias)}`
  const arrayDimension = arrayDimensionToSymbol(target)
  const result = [prefix, symbolChar, quoted, dataType, quoted, arrayDimension, str, suffix].filter(hasVal).join('')
  return outParentheses ? `(${result})` : result
}

function extractFunToSQL(stmt) {
  const { args, type } = stmt
  const { field, cast_type: castType, source } = args
  const result = [`${toUpper(type)}(${toUpper(field)}`, 'FROM', toUpper(castType), exprToSQL(source)]
  return `${result.filter(hasVal).join(' ')})`
}

function flattenArgToSQL(arg) {
  if (!arg) return ''
  const { type, symbol, value } = arg
  const result = [toUpper(type), symbol, exprToSQL(value)]
  return result.filter(hasVal).join(' ')
}

function jsonObjectArgToSQL(argExpr) {
  const { expr } = argExpr
  const { key, value, on } = expr
  const result = [exprToSQL(key), 'VALUE', exprToSQL(value)]
  if (on) result.push('ON', 'NULL', exprToSQL(on))
  return result.filter(hasVal).join(' ')
}

function flattenFunToSQL(stmt) {
  const { args, type } = stmt
  const keys = ['input', 'path', 'outer', 'recursive', 'mode']
  const argsStr = keys.map(key => flattenArgToSQL(args[key])).filter(hasVal).join(', ')
  return `${toUpper(type)}(${argsStr})`
}

function funcToSQL(expr) {
  const { args, array_index, name, args_parentheses, parentheses, over, suffix } = expr
  const overStr = overToSQL(over)
  const suffixStr = exprToSQL(suffix)
  const funcName = [literalToSQL(name.schema), name.name.map(literalToSQL).join('.')].filter(hasVal).join('.')
  if (!args) return [funcName, overStr].filter(hasVal).join(' ')
  let separator = expr.separator || ', '
  if (toUpper(funcName) === 'TRIM') separator = ' '
  let str = [funcName]
  str.push(args_parentheses === false ? ' ' : '(')
  str.push(exprToSQL(args).join(separator))
  if (args_parentheses !== false) str.push(')')
  str.push(arrayIndexToSQL(array_index))
  str = [str.join(''), suffixStr].filter(hasVal).join(' ')
  return [parentheses ? `(${str})` : str, overStr].filter(hasVal).join(' ')
}

function tablefuncFunToSQL(expr) {
  const { as, name, args } = expr
  const funcName = [literalToSQL(name.schema), name.name.map(literalToSQL).join('.')].filter(hasVal).join('.')
  const result = [`${funcName}(${exprToSQL(args).join(', ')})`, 'AS', funcToSQL(as)]
  return result.join(' ')
}

function lambdaToSQL(stmt) {
  const { args, expr } = stmt
  const { value, parentheses } = args
  const argsList = value.map(exprToSQL).join(', ')
  return [parentheses ? `(${argsList})` : argsList, '->', exprToSQL(expr)].join(' ')
}

export {
  anyValueFuncToSQL,
  arrayDimensionToSymbol,
  castToSQL,
  extractFunToSQL,
  flattenFunToSQL,
  funcToSQL,
  jsonObjectArgToSQL,
  lambdaToSQL,
  tablefuncFunToSQL,
}
