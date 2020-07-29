import { toUpper, hasVal } from './util'
import { exprToSQL } from './expr'

function intervalToSQL(intervalExpr) {
  const { expr, unit } = intervalExpr
  const result = ['INTERVAL', exprToSQL(expr), toUpper(unit)]
  return result.filter(hasVal).join(' ')
}

export {
  intervalToSQL,
}
