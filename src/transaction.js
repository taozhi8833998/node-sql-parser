import { exprToSQL } from './expr'

function transactionToSQL(stmt) {
  const { expr } = stmt
  return exprToSQL(expr)
}

export {
  transactionToSQL,
}
