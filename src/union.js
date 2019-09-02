'use strict'

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
} from './command'

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
}

function unionToSQL(stmt) {
  const fun = typeToSQLFn[stmt.type]
  const res = [fun(stmt)]
  while (stmt._next) {
    res.push('UNION', fun(stmt._next))
    stmt = stmt._next
  }
  return res.join(' ')
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
  unionToSQL,
  multipleToSQL,
}
