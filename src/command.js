import { identifierToSql, hasVal, toUpper } from './util'
import { exprToSQL } from './expr'
import { tablesToSQL, tableToSQL } from './tables'

function commonCmdToSQL(stmt) {
  const { type, keyword, name } = stmt
  const clauses = [toUpper(type), toUpper(keyword)]
  switch (keyword) {
    case 'table':
      clauses.push(tablesToSQL(name))
      break
    case 'procedure':
      clauses.push(identifierToSql(name))
      break
    default:
      break
  }
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
  const action = toUpper(type)
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

function pgLock(stmt) {
  const { lock_mode: lockMode, nowait } = stmt
  const lockInfo = []
  if (lockMode) {
    const { mode } = lockMode
    lockInfo.push(mode.toUpperCase())
  }
  if (nowait) lockInfo.push(nowait.toUpperCase())
  return lockInfo
}

function lockUnlockToSQL(stmt) {
  const { type, keyword, tables } = stmt
  const result = [type.toUpperCase(), toUpper(keyword)]
  if (type.toUpperCase() === 'UNLOCK') return result.join(' ')
  const tableStmt = []
  for (const tableInfo of tables) {
    const { table, lock_type: lockType } = tableInfo
    const tableInfoTemp = [tableToSQL(table)]
    if (lockType) {
      const lockKeyList = ['prefix', 'type', 'suffix']
      tableInfoTemp.push(lockKeyList.map(key => toUpper(lockType[key])).filter(hasVal).join(' '))
    }
    tableStmt.push(tableInfoTemp.join(' '))
  }
  result.push(tableStmt.join(', '), ...pgLock(stmt))
  return result.filter(hasVal).join(' ')
}

export {
  commonCmdToSQL,
  renameToSQL,
  useToSQL,
  callToSQL,
  setVarToSQL,
  lockUnlockToSQL,
}
