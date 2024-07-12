import { selectToSQL } from './select'
import { toUpper } from './util'

function explainToSQL(stmt) {
  const { type, expr } = stmt
  return [toUpper(type), selectToSQL(expr)].join(' ')
}

export {
  explainToSQL,
}
