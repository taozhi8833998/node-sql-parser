import { literalToSQL, toUpper, connector, dataTypeToSQL } from './util'
import { alterExprToSQL } from './alter'
import { aggrToSQL } from './aggregation'
import { assignToSQL } from './assign'
import { binaryToSQL } from './binary'
import { caseToSQL } from './case'
import { columnRefToSQL } from './column'
import { castToSQL, extractFunToSQL, funcToSQL } from './func'
import { intervalToSQL } from './interval'
import { selectToSQL } from './select'
import { showToSQL } from './show'
import { arrayStructExprToSQL } from './array-struct'
import { unionToSQL } from './union'
import { namedWindowExprListToSQL, windowFuncToSQL } from './window'

const exprToSQLConvertFn = {
  alter       : alterExprToSQL,
  aggr_func   : aggrToSQL,
  window_func : windowFuncToSQL,
  'array'     : arrayStructExprToSQL,
  assign      : assignToSQL,
  binary_expr : binaryToSQL,
  case        : caseToSQL,
  cast        : castToSQL,
  column_ref  : columnRefToSQL,
  datatype    : dataTypeToSQL,
  extract     : extractFunToSQL,
  function    : funcToSQL,
  interval    : intervalToSQL,
  show        : showToSQL,
  struct      : arrayStructExprToSQL,
  'window'    : namedWindowExprListToSQL,
}

function varToSQL(expr) {
  const { prefix = '@', name, members, keyword } = expr
  const val = []
  if (keyword) val.push(keyword)
  const varName = members && members.length > 0 ? `${name}.${members.join('.')}` : name
  val.push(`${prefix || ''}${varName}`)
  return val.join(' ')
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
  const space = (operator === '-' || operator === '+') ? '' : ' '
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
      expressions = expr.map(info => `${exprToSQL(info.expr)} ${info.type}`)
      break
    case 'PARTITION BY':
      expressions = expr.map(info => `${exprToSQL(info.expr)}`)
      break
    default:
      expressions = expr.map(info => `${exprToSQL(info.expr)}`)
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
