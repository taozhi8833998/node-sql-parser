import { columnRefToSQL } from './column'
import { exprToSQL } from './expr'
import { commonOptionConnector, identifierToSql, literalToSQL } from './util'

/**
 * @param {Array<Object>} withExpr
 */
function withToSQL(withExpr) {
  if (!withExpr || withExpr.length === 0) return
  const isRecursive = withExpr[0].recursive ? 'RECURSIVE ' : ''
  const withExprStr = withExpr.map(cte => {
    const { name, stmt, columns } = cte
    const column = Array.isArray(columns) ? `(${columns.map(columnRefToSQL).join(', ')})` : ''
    const expr = commonOptionConnector(stmt.type === 'values' ? 'VALUES' : '', exprToSQL, stmt)
    return `${name.type === 'default' ? identifierToSql(name.value) : literalToSQL(name)}${column} AS (${expr})`
  }).join(', ')

  return `WITH ${isRecursive}${withExprStr}`
}

export {
  withToSQL,
}
