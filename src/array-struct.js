import { columnsToSQL } from './column'
import { exprToSQL } from './expr'
import { arrayStructTypeToSQL, hasVal, toUpper } from './util'

function arrayExprListToSQL(expr) {
  const {
    array_path: arrayPath,
    brackets,
    expr_list: exprList,
    parentheses,
  } = expr
  if (!exprList) return `[${columnsToSQL(arrayPath)}]`
  if (Array.isArray(exprList)) return `[${exprList.map(col => `(${columnsToSQL(col)})`).filter(hasVal).join(', ')}]`
  const result = exprToSQL(exprList)
  if (brackets) return `[${result}]`
  return parentheses ? `(${result})` : result
}

function arrayStructValueToSQL(expr) {
  const {
    expr_list: exprList,
    type,
  } = expr
  switch (toUpper(type)) {
    case 'STRUCT':
      return `(${columnsToSQL(exprList)})`
    case 'ARRAY':
      return arrayExprListToSQL(expr)
    default:
      return ''
  }
}

function arrayStructExprToSQL(expr) {
  const { definition, keyword } = expr
  const result = [toUpper(keyword)]
  if (definition && typeof definition === 'object') {
    result.length = 0
    result.push(arrayStructTypeToSQL(definition))
  }
  result.push(arrayStructValueToSQL(expr))
  return result.filter(hasVal).join('')
}

export {
  arrayStructExprToSQL,
  arrayStructValueToSQL,
}
