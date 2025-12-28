import { arrayIndexToSQL, columnOffsetToSQL } from './column'
import { collateToSQL } from './collate'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
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
  const { target: targets, expr: expression, keyword, symbol, as: alias, offset, parentheses: outParentheses, collate } = expr
  let prefix = columnOffsetToSQL({ expr: expression, offset })
  const result = []
  for (let i = 0, len = targets.length; i < len; ++i) {
    const target = targets[i]
    const { angle_brackets: angleBrackets, length, dataType, parentheses, quoted, scale, suffix: dataTypeSuffix, expr: targetExpr } = target
    let str = targetExpr ? exprToSQL(targetExpr) : ''
    if (length != null) str = scale ? `${length}, ${scale}` : length
    if (parentheses) str = `(${str})`
    if (angleBrackets) str = `<${str}>`
    if (dataTypeSuffix && dataTypeSuffix.length) str += ` ${dataTypeSuffix.map(literalToSQL).join(' ')}`
    let symbolChar = '::'
    let suffix = ''
    const targetResult = []
    if (symbol === 'as') {
      if (i === 0) prefix = `${toUpper(keyword)}(${prefix}`
      suffix = ')'
      symbolChar = ` ${symbol.toUpperCase()} `
    }
    if (i === 0) targetResult.push(prefix)
    const arrayDimension = arrayDimensionToSymbol(target)
    targetResult.push(symbolChar, quoted, dataType, quoted, arrayDimension, str, suffix)
    result.push(targetResult.filter(hasVal).join(''))
  }
  const collateStr = collateToSQL(collate)
  if (alias) result.push(` AS ${identifierToSql(alias)}`)
  const sql = [result.filter(hasVal).join(''), collateStr].filter(hasVal).join(' ')
  return outParentheses ? `(${sql})` : sql
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

function funcArgToSQL(argExpr) {
  const { name, symbol, expr } = argExpr.value
  return [name, symbol, exprToSQL(expr)].filter(hasVal).join(' ')
}

function withinGroupToSQL(stmt) {
  if (!stmt) return ''
  const { type, keyword, orderby } = stmt
  return [toUpper(type), toUpper(keyword), `(${orderOrPartitionByToSQL(orderby, 'order by')})`].filter(hasVal).join(' ')
}

function funcToSQL(expr) {
  const { args, array_index, collate, name, args_parentheses, parentheses, within_group: withinGroup, over, suffix } = expr
  const overStr = overToSQL(over)
  const withinGroupStr = withinGroupToSQL(withinGroup)
  const suffixStr = exprToSQL(suffix)
  const collateStr = collateToSQL(collate)
  const funcName = [literalToSQL(name.schema), name.name.map(literalToSQL).join('.')].filter(hasVal).join('.')
  if (!args) return [funcName, collateStr, withinGroupStr, overStr].filter(hasVal).join(' ')
  const separator = expr.separator || ', '
  let fromPosition = 0
  if (toUpper(funcName) === 'TRIM') {
    for (let i = 0, len = args.value.length; i < len; ++i) {
      const arg = args.value[i]
      if (arg.type === 'origin' && arg.value === 'from') {
        fromPosition = i
        break
      }
    }
  }
  let str = [funcName]
  str.push(args_parentheses === false ? ' ' : '(')
  const argsList = exprToSQL(args)
  if (Array.isArray(separator)) {
    let argsSQL = argsList[0]
    for (let i = 1, len = argsList.length; i < len; ++i) {
      argsSQL = [argsSQL, argsList[i]].join(` ${exprToSQL(separator[i - 1])} `)
    }
    str.push(argsSQL)
  } else if (toUpper(funcName) === 'TRIM' && fromPosition > 0) {
    str.push([argsList.slice(0, fromPosition + 1).join(' '), argsList.slice(fromPosition + 1).join(', ')].join(' '))
  } else {
    str.push(argsList.join(separator))
  }
  if (args_parentheses !== false) str.push(')')
  str.push(arrayIndexToSQL(array_index))
  str = [str.join(''), suffixStr, collateStr].filter(hasVal).join(' ')
  return [parentheses ? `(${str})` : str, withinGroupStr, overStr].filter(hasVal).join(' ')
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
  funcArgToSQL,
  funcToSQL,
  jsonObjectArgToSQL,
  lambdaToSQL,
  tablefuncFunToSQL,
}
