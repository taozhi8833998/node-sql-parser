import { exprToSQL } from './expr'

/**
 * @param {Array<Object>} withExpr
 */

interface IWithExpr {
  recursive?: boolean,
  name: string,
  columns?: string[],
  stmt: any,
}

const withToSql = (withExpr: IWithExpr[]) => {
  if (!withExpr || withExpr.length === 0) return
  const isRecursive = withExpr[0].recursive ? 'RECURSIVE ' : ''
  const withExprStr = withExpr.map((cte: IWithExpr) => {
    const name = `"${cte.name}"`
    const columns = Array.isArray(cte.columns) ? `(${cte.columns.join(', ')})` : ''
    return `${name}${columns} AS (${exprToSQL(cte.stmt)})`
  }).join(', ')

  return `WITH ${isRecursive}${withExprStr}`
}

export {
  IWithExpr,
  withToSql,
}
