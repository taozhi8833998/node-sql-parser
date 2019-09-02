import { literalToSQL, columnRefToSQL } from './util'
import { alterExprToSQL } from './alter'
import { aggrToSQL } from './aggregation'
import { assignToSQL } from './assign'
import { binaryToSQL } from './binary'
import { caseToSQL } from './case'
import { castToSQL, funcToSQL } from './func'
import { intervalToSQL } from './interval'
import { selectToSQL } from './select'
import { unionToSQL } from './union'

const exprToSQLConvertFn = {
  alter       : alterExprToSQL,
  aggr_func   : aggrToSQL,
  assign      : assignToSQL,
  binary_expr : binaryToSQL,
  case        : caseToSQL,
  cast        : castToSQL,
  column_ref  : columnRefToSQL,
  function    : funcToSQL,
  interval    : intervalToSQL,
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

function unaryToSQL(expr) {
  const str = `${expr.operator} ${exprToSQL(expr.expr)}`
  return expr.parentheses ? `(${str})` : str
}

function getExprListSQL(exprList) {
  if (!exprList) return []
  return exprList.map(exprToSQL)
}

exprToSQLConvertFn.expr_list = expr => {
  const str = getExprListSQL(expr.value)
  return expr.parentheses ? `(${str})` : str
}

exprToSQLConvertFn.select = expr => {
  const str = typeof expr._next === 'object' ? unionToSQL(expr) : selectToSQL(expr)
  return expr.parentheses ? `(${str})` : str
}

exprToSQLConvertFn.unary_expr = unaryToSQL

export {
  exprToSQLConvertFn,
  exprToSQL,
  getExprListSQL,
}
