import { hasVal, literalToSQL, toUpper } from './util'

function transactionToSQL(stmt) {
  const { expr: { action, keyword, modes } } = stmt
  const result = [literalToSQL(action), toUpper(keyword)]
  if (modes) result.push(modes.map(literalToSQL).join(', '))
  return result.filter(hasVal).join(' ')
}

export {
  transactionToSQL,
}
