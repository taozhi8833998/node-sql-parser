import { toUpper } from './util'
import { exprToSQL } from './expr'

function intervalToSQL(intervalExpr) {
  const { expr, unit } = intervalExpr
  return `INTERVAL ${exprToSQL(expr)} ${toUpper(unit)}`
}

export {
  intervalToSQL,
}
