import { alterToSQL } from './alter'
import { analyzeToSQL, attachToSQL } from './analyze'
import { createToSQL } from './create'
import { selectToSQL } from './select'
import { deleteToSQL } from './delete'
import { updateToSQL } from './update'
import { insertToSQL } from './insert'
import {
  callToSQL,
  commonCmdToSQL,
  deallocateToSQL,
  declareToSQL,
  descToSQL,
  executeToSQL,
  forLoopToSQL,
  grantAndRevokeToSQL,
  ifToSQL,
  useToSQL,
  raiseToSQL,
  renameToSQL,
  setVarToSQL,
  lockUnlockToSQL,
} from './command'
import { execToSQL } from './exec'
import { orderOrPartitionByToSQL } from './expr'
import { limitToSQL } from './limit'
import { procToSQL } from './proc'
import { transactionToSQL } from './transaction'
import { showToSQL } from './show'
import { hasVal, toUpper } from './util'

const typeToSQLFn = {
  alter       : alterToSQL,
  analyze     : analyzeToSQL,
  attach      : attachToSQL,
  create      : createToSQL,
  select      : selectToSQL,
  deallocate  : deallocateToSQL,
  delete      : deleteToSQL,
  exec        : execToSQL,
  execute     : executeToSQL,
  for         : forLoopToSQL,
  update      : updateToSQL,
  if          : ifToSQL,
  insert      : insertToSQL,
  drop        : commonCmdToSQL,
  truncate    : commonCmdToSQL,
  replace     : insertToSQL,
  declare     : declareToSQL,
  use         : useToSQL,
  rename      : renameToSQL,
  call        : callToSQL,
  desc        : descToSQL,
  set         : setVarToSQL,
  lock        : lockUnlockToSQL,
  unlock      : lockUnlockToSQL,
  show        : showToSQL,
  grant       : grantAndRevokeToSQL,
  revoke      : grantAndRevokeToSQL,
  proc        : procToSQL,
  raise       : raiseToSQL,
  transaction : transactionToSQL,
}

function unionToSQL(stmt) {
  if (!stmt) return ''
  const fun = typeToSQLFn[stmt.type]
  const { _parentheses, _orderby, _limit } = stmt
  const res = [_parentheses && '(', fun(stmt)]
  while (stmt._next) {
    const nextFun = typeToSQLFn[stmt._next.type]
    const unionKeyword = toUpper(stmt.set_op)
    res.push(unionKeyword, nextFun(stmt._next))
    stmt = stmt._next
  }
  res.push(_parentheses && ')', orderOrPartitionByToSQL(_orderby, 'order by'), limitToSQL(_limit))
  return res.filter(hasVal).join(' ')
}

function multipleToSQL(stmt) {
  const res = []
  for (let i = 0, len = stmt.length; i < len; ++i) {
    const astInfo = stmt[i] && stmt[i].ast ? stmt[i].ast : stmt[i]
    let sql = unionToSQL(astInfo)
    if (i === len - 1 && astInfo.type === 'transaction') sql = `${sql} ;`
    res.push(sql)
  }
  return res.join(' ; ')
}

export {
  unionToSQL,
  multipleToSQL,
}
