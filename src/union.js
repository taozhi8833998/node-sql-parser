import { alterToSQL } from './alter'
import { createToSQL } from './create'
import { selectToSQL } from './select'
import { deleteToSQL } from './delete'
import { updateToSQL } from './update'
import { insertToSQL } from './insert'
import {
  callToSQL,
  commonCmdToSQL,
  declareToSQL,
  descToSQL,
  useToSQL,
  renameToSQL,
  setVarToSQL,
  lockUnlockToSQL,
} from './command'
import { execToSQL } from './exec'
import { orderOrPartitionByToSQL } from './expr'
import { limitToSQL } from './limit'
import { showToSQL } from './show'
import { analyzeToSQL, attachToSQL } from './sqlite'
import { withToSQL } from './with'
import { hasVal } from './util'

const typeToSQLFn = {
  alter    : alterToSQL,
  analyze  : analyzeToSQL,
  attach   : attachToSQL,
  create   : createToSQL,
  select   : selectToSQL,
  delete   : deleteToSQL,
  exec     : execToSQL,
  update   : updateToSQL,
  insert   : insertToSQL,
  drop     : commonCmdToSQL,
  truncate : commonCmdToSQL,
  replace  : insertToSQL,
  declare  : declareToSQL,
  use      : useToSQL,
  rename   : renameToSQL,
  call     : callToSQL,
  desc     : descToSQL,
  set      : setVarToSQL,
  lock     : lockUnlockToSQL,
  unlock   : lockUnlockToSQL,
  show     : showToSQL,
}

function unionToSQL(stmt) {
  const fun = typeToSQLFn[stmt.type]
  const res = [fun(stmt)]
  const { _orderby, _limit } = stmt
  while (stmt._next) {
    const unionKeyword = (stmt.union || 'union').toUpperCase()
    res.push(unionKeyword, fun(stmt._next))
    stmt = stmt._next
  }
  res.push(orderOrPartitionByToSQL(_orderby, 'order by'), limitToSQL(_limit))
  return res.filter(hasVal).join(' ')
}

function bigQueryToSQL(stmt) {
  const { with: withExpr, parentheses, select, orderby, limit } = stmt
  const result = [withToSQL(withExpr), parentheses && '(', unionToSQL(select), parentheses && ')']
  // process with, orderby and limit
  result.push(orderOrPartitionByToSQL(orderby, 'order by'), limitToSQL(limit))
  return result.filter(val => val).join(' ')
}

function multipleToSQL(stmt) {
  const res = []
  for (let i = 0, len = stmt.length; i < len; ++i) {
    let astInfo = stmt[i] && stmt[i].ast
    if (!astInfo) astInfo = stmt[i]
    res.push(unionToSQL(astInfo))
  }
  return res.join(' ; ')
}

export {
  bigQueryToSQL,
  unionToSQL,
  multipleToSQL,
}
