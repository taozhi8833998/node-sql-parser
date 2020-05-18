import { createToSQL } from './create'
import { alterToSQL } from './alter'
import { selectToSQL } from './select'
import { deleteToSQL } from './delete'
import { updateToSQL } from './update'
import { insertToSQL } from './insert'
import {
  dropToSQL,
  truncateToSQL,
  useToSQL,
  renameToSQL,
  callToSQL,
  setVarToSQL,
  lockUnlockToSQL,
} from './command'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { withToSql } from './with'
import { connector } from './util'

const typeToSQLFn = {
  alter    : alterToSQL,
  create   : createToSQL,
  select   : selectToSQL,
  delete   : deleteToSQL,
  update   : updateToSQL,
  insert   : insertToSQL,
  drop     : dropToSQL,
  truncate : truncateToSQL,
  use      : useToSQL,
  rename   : renameToSQL,
  call     : callToSQL,
  set      : setVarToSQL,
  lock     : lockUnlockToSQL,
  unlock   : lockUnlockToSQL,
}

function unionToSQL(stmt) {
  const fun = typeToSQLFn[stmt.type]
  const res = [fun(stmt)]
  while (stmt._next) {
    const unionKeyword = (stmt.union || 'union').toUpperCase()
    res.push(unionKeyword, fun(stmt._next))
    stmt = stmt._next
  }
  return res.join(' ')
}

function bigQueryToSQL(stmt) {
  const { with: withExpr, select, lp, rp, orderby, limit } = stmt
  const result = [withToSql(withExpr), lp, unionToSQL(select), rp]
  // process with, orderby and limit
  result.push(orderOrPartitionByToSQL(orderby, 'order by'))
  if (limit) {
    const { seperator, value } = limit
    result.push(connector('LIMIT', value.map(exprToSQL).join(`${seperator === 'offset' ? ' ' : ''}${seperator.toUpperCase()} `)))
  }
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
