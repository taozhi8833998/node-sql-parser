import { columnDataType, columnRefToSQL } from './column'
import { createDefinitionToSQL } from './create'
import { commonTypeValue, identifierToSql, hasVal, toUpper, literalToSQL } from './util'
import { exprToSQL } from './expr'
import { tablesToSQL, tableToSQL } from './tables'
import astToSQL from './sql'
import { multipleToSQL } from './union'

function callToSQL(stmt) {
  const type = 'CALL'
  const storeProcessCall = exprToSQL(stmt.expr)
  return `${type} ${storeProcessCall}`
}

function commonCmdToSQL(stmt) {
  const { type, keyword, name, prefix } = stmt
  const clauses = [toUpper(type), toUpper(keyword), toUpper(prefix)]
  switch (keyword) {
    case 'table':
      clauses.push(tablesToSQL(name))
      break
    case 'trigger':
      clauses.push([name[0].schema ? `${identifierToSql(name[0].schema)}.` : '', identifierToSql(name[0].trigger)].filter(hasVal).join(''))
      break
    case 'database':
    case 'schema':
    case 'procedure':
      clauses.push(identifierToSql(name))
      break
    case 'view':
      clauses.push(tablesToSQL(name), stmt.options && stmt.options.map(exprToSQL).filter(hasVal).join(' '))
      break
    case 'index':
      clauses.push(columnRefToSQL(name), ...stmt.table ? ['ON', tableToSQL(stmt.table)] : [], stmt.options && stmt.options.map(exprToSQL).filter(hasVal).join(' '))
      break
    default:
      break
  }
  return clauses.filter(hasVal).join(' ')
}

function descToSQL(stmt) {
  const { type, table } = stmt
  const action = toUpper(type)
  return `${action} ${identifierToSql(table)}`
}

function executeToSQL(stmt) {
  const { type, name, args } = stmt
  const sql = [toUpper(type)]
  const nameWithArgs = [name]
  if (args) nameWithArgs.push(`(${exprToSQL(args).join(', ')})`)
  sql.push(nameWithArgs.join(''))
  return sql.filter(hasVal).join(' ')
}

function forLoopToSQL(stmt) {
  const { type, label, target, query, stmts } = stmt
  const sql = [label, toUpper(type), target, 'IN', multipleToSQL([query]), 'LOOP', multipleToSQL(stmts), 'END LOOP', label]
  return sql.filter(hasVal).join(' ')
}

function raiseToSQL(stmt) {
  const { type, level, raise, using } = stmt
  const sql = [toUpper(type), toUpper(level)]
  if (raise) sql.push([literalToSQL(raise.keyword), raise.type === 'format' && raise.expr.length > 0 && ','].filter(hasVal).join(''), raise.expr.map(exprInfo => exprToSQL(exprInfo)).join(', '))
  if (using) sql.push(toUpper(using.type), toUpper(using.option), using.symbol, using.expr.map(exprInfo => exprToSQL(exprInfo)).join(', '))
  return sql.filter(hasVal).join(' ')
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

function deallocateToSQL(stmt) {
  const { type, keyword, expr } = stmt
  return [toUpper(type), toUpper(keyword), exprToSQL(expr)].filter(hasVal).join(' ')
}

function declareToSQL(stmt) {
  const { type, declare, symbol } = stmt
  const result = [toUpper(type)]
  const info = declare.map(dec => {
    const { at, name, as, constant, datatype, not_null, prefix, definition, keyword } = dec
    const declareInfo = [[at, name].filter(hasVal).join(''), toUpper(as), toUpper(constant)]
    switch (keyword) {
      case 'variable':
        declareInfo.push(columnDataType(datatype), ...commonTypeValue(dec.collate), toUpper(not_null))
        if (definition) declareInfo.push(toUpper(definition.keyword), exprToSQL(definition.value))
        break
      case 'cursor':
        declareInfo.push(toUpper(prefix))
        break
      case 'table':
        declareInfo.push(toUpper(prefix), `(${definition.map(createDefinitionToSQL).join(', ')})`)
        break
      default:
        break
    }
    return declareInfo.filter(hasVal).join(' ')
  }).join(`${symbol} `)
  result.push(info)
  return result.join(' ')
}

function ifToSQL(stmt) {
  const {
    boolean_expr: boolExpr,
    else_expr: elseExpr,
    elseif_expr: elseifExpr,
    if_expr: ifExpr,
    prefix,
    go,
    semicolons,
    suffix,
    type,
  } = stmt
  const result = [toUpper(type), exprToSQL(boolExpr), literalToSQL(prefix), `${astToSQL(ifExpr.ast || ifExpr)}${semicolons[0]}`, toUpper(go)]
  if (elseifExpr) {
    result.push(
      elseifExpr.map(
        elseif => [toUpper(elseif.type), exprToSQL(elseif.boolean_expr), 'THEN', astToSQL(elseif.then.ast || elseif.then), elseif.semicolon].filter(hasVal).join(' ')
      ).join(' ')
    )
  }
  if (elseExpr) result.push('ELSE', `${astToSQL(elseExpr.ast || elseExpr)}${semicolons[1]}`)
  result.push(literalToSQL(suffix))
  return result.filter(hasVal).join(' ')
}

function grantUserOrRoleToSQL(stmt) {
  const { name, host } = stmt
  const result = [literalToSQL(name)]
  if (host) result.push('@', literalToSQL(host))
  return result.join('')
}

function grantAndRevokeToSQL(stmt) {
  const { type, grant_option_for, keyword, objects, on, to_from, user_or_roles, with: withOpt } = stmt
  const result = [toUpper(type), literalToSQL(grant_option_for)]
  const objStr = objects.map(obj => {
    const { priv, columns } = obj
    const privSQL = [exprToSQL(priv)]
    if (columns) privSQL.push(`(${columns.map(columnRefToSQL).join(', ')})`)
    return privSQL.join(' ')
  }).join(', ')
  result.push(objStr)
  if (on) {
    result.push('ON')
    switch (keyword) {
      case 'priv':
        result.push(
          literalToSQL(on.object_type),
          on.priv_level.map(privLevel => [identifierToSql(privLevel.prefix), identifierToSql(privLevel.name)].filter(hasVal).join('.')).join(', ')
        )
        break
      case 'proxy':
        result.push(grantUserOrRoleToSQL(on))
        break
    }
  }
  result.push(toUpper(to_from), user_or_roles.map(grantUserOrRoleToSQL).join(', '))
  result.push(literalToSQL(withOpt))
  return result.filter(hasVal).join(' ')
}

export {
  callToSQL,
  commonCmdToSQL,
  deallocateToSQL,
  declareToSQL,
  descToSQL,
  executeToSQL,
  forLoopToSQL,
  grantAndRevokeToSQL,
  grantUserOrRoleToSQL,
  ifToSQL,
  raiseToSQL,
  renameToSQL,
  useToSQL,
  setVarToSQL,
  lockUnlockToSQL,
}
