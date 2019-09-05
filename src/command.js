import { identifierToSql, hasVal } from './util'
import { exprToSQL } from './expr'
import { tablesToSQL, tableToSQL } from './tables'

function dropToSQL(stmt) {
  const clauses = ['DROP TABLE', tablesToSQL(stmt.table)]
  return clauses.join(' ')
}

function truncateToSQL(stmt) {
  const clauses = ['TRUNCATE', stmt.keyword, tablesToSQL(stmt.table)]
  return clauses.filter(hasVal).join(' ')
}

function renameToSQL(stmt) {
  const { type, table } = stmt
  const clauses = []
  const prefix = `${type && type.toUpperCase()} TABLE`
  if (table) {
    for (const tables of table) {
      const renameInfo = tables.map(tableToSQL)
      clauses.push(renameInfo.join(' TO '))
    }
  }
  return `${prefix} ${clauses.join(', ')}`
}

function useToSQL(stmt) {
  const { type, db } = stmt
  const action = type && type.toUpperCase()
  const database = identifierToSql(db)
  return `${action} ${database}`
}

function callToSQL(stmt) {
  const type = 'CALL'
  const storeProcessCall = exprToSQL(stmt.expr)
  return `${type} ${storeProcessCall}`
}

function setVarToSQL(stmt) {
  const { expr } = stmt
  const action = 'SET'
  const val = exprToSQL(expr)
  return `${action} ${val}`
}

export {
  dropToSQL,
  truncateToSQL,
  renameToSQL,
  useToSQL,
  callToSQL,
  setVarToSQL,
}
