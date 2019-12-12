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

function lockUnlockToSQL(stmt) {
  const {
    type,
    keyword,
    tables,
    lock_mode: lockMode,
    nowait,
  } = stmt
  const result = [type.toUpperCase()]
  if (keyword) result.push(keyword.toUpperCase())
  if (type.toUpperCase() === 'UNLOCK') {
    return result.join(' ')
  }
  const tableStmt = []
  for (const tableInfo of tables) {
    const { table, lock_type: lockType } = tableInfo
    const tableInfoTemp = [tableToSQL(table)]
    if (lockType) {
      const { prefix, type: typeInner, suffix } = lockType
      const lockTypeInfo = []
      if (prefix) lockTypeInfo.push(prefix.toUpperCase())
      lockTypeInfo.push(typeInner.toUpperCase())
      if (suffix) lockTypeInfo.push(suffix.toUpperCase())
      tableInfoTemp.push(lockTypeInfo.join(' '))
    }
    tableStmt.push(tableInfoTemp.join(' '))
  }
  result.push(tableStmt.join(', '))
  if (lockMode) {
    const { mode } = lockMode
    result.push(mode.toUpperCase())
  }
  if (nowait) result.push(nowait.toUpperCase())
  return result.join(' ')
}

export {
  dropToSQL,
  truncateToSQL,
  renameToSQL,
  useToSQL,
  callToSQL,
  setVarToSQL,
  lockUnlockToSQL,
}
