import { columnsToSQL } from './column'
import { arrayStructTypeToSQL, hasVal, toUpper } from './util'

function arrayStructValueToSQL(expr) {
  const { type, columns } = expr
  switch (toUpper(type)) {
    case 'STRUCT':
      return `(${columnsToSQL(columns)})`
    case 'ARRAY':
      return `[${columns.map(col => `(${columnsToSQL(col)})`).filter(hasVal).join(', ')}]`
    default:
      return ''
  }
}

function arrayStructExprToSQL(expr) {
  const { definition, type } = expr
  const result = [toUpper(type)]
  if (typeof definition === 'object') {
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
