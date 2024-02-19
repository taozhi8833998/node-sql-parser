import { exprToSQL, varToSQL } from './expr'
import { limitToSQL } from './limit'
import { tableToSQL, tablesToSQL } from './tables'
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
  let { keyword } = showExpr
  const { suffix } = showExpr
  let str = ''
  switch (toUpper(keyword)) {
    case 'BINLOG':
      str = showEventToSQL(showExpr)
      break
    case 'CHARACTER':
    case 'COLLATION':
      str = showLikeAndWhereToSQL(showExpr)
      break
    case 'COLUMNS':
    case 'INDEXES':
    case 'INDEX':
      str = commonOptionConnector('FROM', tablesToSQL, showExpr.from)
      break
    case 'GRANTS':
      str = showGrantsForUser(showExpr)
      break
    case 'CREATE':
      str = commonOptionConnector('', tableToSQL, showExpr[suffix])
      break
    case 'VAR':
      str = varToSQL(showExpr.var)
      keyword = ''
      break
    default:
      break
  }
  return ['SHOW', toUpper(keyword), toUpper(suffix), str].filter(hasVal).join(' ')
}

export {
  showToSQL,
}
