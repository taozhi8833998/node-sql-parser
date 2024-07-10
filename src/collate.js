import { exprToSQL } from './expr'
import { hasVal, literalToSQL, toUpper } from './util'

function collateToSQL(stmt) {
  if (!stmt) return
  const { keyword, collate: { name, symbol, value } } = stmt
  const result = [toUpper(keyword)]
  if (!value) result.push(symbol)
  result.push(literalToSQL(name))
  if (value) result.push(symbol)
  result.push(exprToSQL(value))
  return result.filter(hasVal).join(' ')
}

export {
  collateToSQL,
}
