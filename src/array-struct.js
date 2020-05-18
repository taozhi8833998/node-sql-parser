import { columnsToSQL } from './column'
import { arrayStructTypeToSQL, hasVal, toUpper } from './util'

function arrayStructValueToSQL(expr) {
  const {
    array_path: arrayPath,
    expr_list: exprList,
    type,
  } = expr
  switch (toUpper(type)) {
    case 'STRUCT':
      return `(${columnsToSQL(exprList)})`
    case 'ARRAY':
      if (exprList) return `[${exprList.map(col => `(${columnsToSQL(col)})`).filter(hasVal).join(', ')}]`
      return `[${columnsToSQL(arrayPath)}]`
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
