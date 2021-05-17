import { exprToSQL } from './expr'
import { limitToSQL } from './limit'
import { tablesToSQL } from './tables'
import { commonOptionConnector, hasVal, literalToSQL, toUpper } from './util'

function showEventToSQL(showEventExpr) {
  const { in: inClause, from , limit } = showEventExpr
  return [
    commonOptionConnector('IN', literalToSQL, inClause && inClause.right),
    commonOptionConnector('FROM', tablesToSQL, from),
    limitToSQL(limit),
  ].filter(hasVal).join(' ')
}

function showLikeAndWhereToSQL(showCharacterSetExpr) {
  const { expr } = showCharacterSetExpr
  if (!expr) return
  const { op } = expr
  if (toUpper(op) === 'LIKE') return commonOptionConnector('LIKE', literalToSQL, expr.right)
  return commonOptionConnector('WHERE', exprToSQL, expr)
}

function showGrantsForUser(showGrantsForExpr) {
  const { for: forExpr } = showGrantsForExpr
  if (!forExpr) return
  const { user, host, role_list } = forExpr
  let userAndHost = `'${user}'`
  if (host) userAndHost += `@'${host}'`
  return ['FOR', userAndHost, role_list && 'USING', role_list && role_list.map(role => `'${role}'`).join(', ')].filter(hasVal).join(' ')
}

function showToSQL(showExpr) {
  const { suffix, keyword } = showExpr
  let str = ''
  switch (toUpper(keyword)) {
    case 'BINLOG':
      str = showEventToSQL(showExpr)
      break
    case 'CHARACTER':
    case 'COLLATION':
      str = showLikeAndWhereToSQL(showExpr)
      break
    case 'GRANTS':
      str = showGrantsForUser(showExpr)
      break
    default:
      break
  }
  const result = ['SHOW', toUpper(keyword), toUpper(suffix), str]
  return result.filter(hasVal).join(' ')
}

export {
  showToSQL,
}
