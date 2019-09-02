import has from 'has'
import { identifierToSql } from './util'
import { exprToSQL } from './expr'

/**
 * @param {Array} tables
 * @return {string}
 */
function tablesToSQL(tables) {
  const baseTable = tables[0]
  const clauses = []
  if (baseTable.type === 'dual') return 'DUAL'
  let str = baseTable.table ? identifierToSql(baseTable.table) : exprToSQL(baseTable.expr)

  if (baseTable.db && baseTable.db !== null) str = `${identifierToSql(baseTable.db)}.${str}`
  if (baseTable.as !== null) str = `${str} AS ${identifierToSql(baseTable.as)}`

  clauses.push(str)

  for (let i = 1; i < tables.length; ++i) {
    const joinExpr = tables[i]

    str = (joinExpr.join && joinExpr.join !== null) ? ` ${joinExpr.join} ` : str = ', '

    if (joinExpr.table) {
      if (joinExpr.db !== null) str = `${str}${identifierToSql(joinExpr.db)}.`
      str = `${str}${identifierToSql(joinExpr.table)}`
    } else {
      str = `${str}${exprToSQL(joinExpr.expr)}`
    }

    if (joinExpr.as !== null) str = `${str} AS ${identifierToSql(joinExpr.as)}`
    if (has(joinExpr, 'on') && joinExpr.on !== null) str = `${str} ON ${exprToSQL(joinExpr.on)}`
    if (has(joinExpr, 'using')) str = `${str} USING (${joinExpr.using.map(identifierToSql).join(', ')})`

    clauses.push(str)
  }

  return clauses.join('')
}

function tableOptionToSQL(tableOption) {
  const { keyword, symbol, value } = tableOption
  const sql = [keyword.toUpperCase()]
  if (symbol) sql.push(symbol)
  sql.push(value)
  return sql.join(' ')
}

export {
  tablesToSQL,
  tableOptionToSQL,
}
