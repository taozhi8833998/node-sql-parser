import { exprToSQL } from './expr'
import { literalToSQL } from './util'

/**
 * @param {Array<Object>} withExpr
 */
function withToSQL(withExpr) {
  if (!withExpr || withExpr.length === 0) return
  const isRecursive = withExpr[0].recursive ? 'RECURSIVE ' : ''
  const withExprStr = withExpr.map(cte => {
    const { name, stmt, columns } = cte
    const column = Array.isArray(columns) ? `(${columns.join(', ')})` : ''
    return `${literalToSQL(name)}${column} AS (${exprToSQL(stmt)})`
  }).join(', ')

  return `WITH ${isRecursive}${withExprStr}`
}

export {
  withToSQL,
}
