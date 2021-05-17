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

function showToSQL(showExpr) {
  const { suffix, keyword } = showExpr
  let str = ''
  switch (keyword) {
    case 'events':
      str = showEventToSQL(showExpr)
      break
    default:
      break
  }
  const result = ['SHOW', toUpper(suffix), toUpper(keyword), str]
  return result.filter(hasVal).join(' ')
}

export {
  showToSQL,
}
