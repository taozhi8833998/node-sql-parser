import { literalToSQL, toUpper, connector, dataTypeToSQL, hasVal } from './util'
import { alterExprToSQL } from './alter'
import { aggrToSQL } from './aggregation'
import { assignToSQL } from './assign'
import { binaryToSQL } from './binary'
import { caseToSQL } from './case'
import { columnDefinitionToSQL, columnRefToSQL, fullTextSearchToSQL } from './column'
import { anyValueFuncToSQL, castToSQL, extractFunToSQL, flattenFunToSQL, funcToSQL, lambdaToSQL, tablefuncFunToSQL } from './func'
import { intervalToSQL } from './interval'
import { jsonExprToSQL } from './json'
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
  show              : showToSQL,
  struct            : arrayStructExprToSQL,
  tablefunc         : tablefuncFunToSQL,
  tables            : tablesToSQL,
  unnest            : unnestToSQL,
  'window'          : namedWindowExprListToSQL,
}

function varToSQL(expr) {
  const { prefix = '@', name, members, keyword, quoted, suffix } = expr
  const val = []
  if (keyword) val.push(keyword)
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
  return exprToSQLConvertFn[expr.type] ? exprToSQLConvertFn[expr.type](expr) : literalToSQL(expr)
}

function unaryToSQL(unarExpr) {
  const { operator, parentheses, expr } = unarExpr
  const space = (operator === '-' || operator === '+' || operator === '~' || operator === '!') ? '' : ' '
  const str = `${operator}${space}${exprToSQL(expr)}`
  return parentheses ? `(${str})` : str
}

function getExprListSQL(exprList) {
  if (!exprList) return []
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
