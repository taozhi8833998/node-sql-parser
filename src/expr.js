import { literalToSQL, toUpper, connector, dataTypeToSQL, hasVal } from './util'
import { alterExprToSQL } from './alter'
import { aggrToSQL } from './aggregation'
import { assignToSQL } from './assign'
import { binaryToSQL } from './binary'
import { caseToSQL } from './case'
import { collateToSQL } from './collate'
import { columnDefinitionToSQL, columnRefToSQL, fullTextSearchToSQL } from './column'
import { anyValueFuncToSQL, castToSQL, extractFunToSQL, flattenFunToSQL, funcToSQL, jsonObjectArgToSQL, lambdaToSQL, tablefuncFunToSQL } from './func'
import { intervalToSQL } from './interval'
import { jsonExprToSQL, jsonVisitorExprToSQL } from './json'
import { selectToSQL } from './select'
import { showToSQL } from './show'
import { arrayStructExprToSQL } from './array-struct'
import { tablesToSQL, unnestToSQL } from './tables'
import { unionToSQL } from './union'
import { namedWindowExprListToSQL, windowFuncToSQL } from './window'

const exprToSQLConvertFn = {
  alter             : alterExprToSQL,
  aggr_func         : aggrToSQL,
  any_value         : anyValueFuncToSQL,
  window_func       : windowFuncToSQL,
  'array'           : arrayStructExprToSQL,
  assign            : assignToSQL,
  binary_expr       : binaryToSQL,
  case              : caseToSQL,
  cast              : castToSQL,
  collate           : collateToSQL,
  column_ref        : columnRefToSQL,
  column_definition : columnDefinitionToSQL,
  datatype          : dataTypeToSQL,
  extract           : extractFunToSQL,
  flatten           : flattenFunToSQL,
  fulltext_search   : fullTextSearchToSQL,
  function          : funcToSQL,
  lambda            : lambdaToSQL,
  insert            : unionToSQL,
  interval          : intervalToSQL,
  json              : jsonExprToSQL,
  json_object_arg   : jsonObjectArgToSQL,
  json_visitor      : jsonVisitorExprToSQL,
  show              : showToSQL,
  struct            : arrayStructExprToSQL,
  tablefunc         : tablefuncFunToSQL,
  tables            : tablesToSQL,
  unnest            : unnestToSQL,
  'window'          : namedWindowExprListToSQL,
}

function varToSQL(expr) {
  const { prefix = '@', name, members, quoted, suffix } = expr
  const val = []
  const varName = members && members.length > 0 ? `${name}.${members.join('.')}` : name
  let result = `${prefix || ''}${varName}`
  if (suffix) result += suffix
  val.push(result)
  return [quoted, val.join(' '), quoted].filter(hasVal).join('')
}

exprToSQLConvertFn.var = varToSQL

function exprToSQL(exprOrigin) {
  if (!exprOrigin) return
  const expr = exprOrigin
  if (exprOrigin.ast) {
    const { ast } = expr
    Reflect.deleteProperty(expr, ast)
    for (const key of Object.keys(ast)) {
      expr[key] = ast[key]
    }
  }
  const { type } = expr
  return exprToSQLConvertFn[type] ? exprToSQLConvertFn[type](expr) : literalToSQL(expr)
}

function unaryToSQL(unarExpr) {
  const { operator, parentheses, expr } = unarExpr
  const space = (operator === '-' || operator === '+' || operator === '~' || operator === '!') ? '' : ' '
  const str = `${operator}${space}${exprToSQL(expr)}`
  return parentheses ? `(${str})` : str
}

function getExprListSQL(exprList) {
  if (!exprList) return []
  if (!Array.isArray(exprList)) exprList = [exprList]
  return exprList.map(exprToSQL)
}

exprToSQLConvertFn.expr_list = expr => {
  const str = getExprListSQL(expr.value)
  return expr.parentheses ? `(${str.join(', ')})` : str
}

exprToSQLConvertFn.select = expr => {
  const str = typeof expr._next === 'object' ? unionToSQL(expr) : selectToSQL(expr)
  return expr.parentheses ? `(${str})` : str
}

exprToSQLConvertFn.unary_expr = unaryToSQL

function mapObjectToSQL(mapExpr) {
  const { keyword, expr } = mapExpr
  const exprStr = expr.map(exprItem => [literalToSQL(exprItem.key), literalToSQL(exprItem.value)].join(', ')).join(', ')
  return [toUpper(keyword), `[${exprStr}]`].join('')
}

exprToSQLConvertFn.map_object = mapObjectToSQL

function orderOrPartitionByToSQL(expr, prefix) {
  if (!Array.isArray(expr)) return ''
  let expressions = []
  const upperPrefix = toUpper(prefix)
  switch (upperPrefix) {
    case 'ORDER BY':
      expressions = expr.map(info => [exprToSQL(info.expr), info.type || 'ASC', toUpper(info.nulls)].filter(hasVal).join(' '))
      break
    case 'PARTITION BY':
      expressions = expr.map(info => exprToSQL(info.expr))
      break
    default:
      expressions = expr.map(info => exprToSQL(info.expr))
      break
  }
  return connector(upperPrefix, expressions.join(', '))
}

export {
  exprToSQLConvertFn,
  exprToSQL,
  getExprListSQL,
  varToSQL,
  orderOrPartitionByToSQL,
}
