import { exprToSQL } from './expr'

/**
 * @param {Array<Object>} withExpr
 */
function withToSql(withExpr) {
  if (!withExpr || withExpr.length === 0) return
  const isRecursive = withExpr[0].recursive ? 'RECURSIVE ' : ''
  const withExprStr = withExpr.map(cte => {
    const name = `"${cte.name}"`
    const columns = Array.isArray(cte.columns) ? `(${cte.columns.join(', ')})` : ''
    return `${name}${columns} AS (${exprToSQL(cte.stmt)})`
  }).join(', ')

  return `WITH ${isRecursive}${withExprStr}`
}

export {
  withToSql,
}
