import { unionToSQL, multipleToSQL } from './union'

const supportedTypes = ['analyze', 'attach', 'select', 'deallocate', 'delete', 'exec', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'desc', 'use', 'alter', 'set', 'create', 'lock', 'unlock', 'declare', 'show', 'replace', 'if', 'grant', 'revoke', 'proc', 'raise', 'execute', 'transaction']

function checkSupported(expr) {
  const ast = expr && expr.ast ? expr.ast : expr
  if (!supportedTypes.includes(ast.type)) throw new Error(`${ast.type} statements not supported at the moment`)
}

function toSQL(ast, asArray) {
  if (Array.isArray(ast)) {
    ast.forEach(checkSupported)
    return multipleToSQL(ast, asArray)
  }
  checkSupported(ast)
  const sql = unionToSQL(ast)
  return asArray ? [sql] : sql
}

function goToSQL(stmt, asArray) {
  if (!stmt || stmt.length === 0) return ''
  const res = [toSQL(stmt.ast, asArray)]
  if (stmt.go_next) res.push(stmt.go.toUpperCase(), goToSQL(stmt.go_next, asArray))
  const filteredRes = res.filter(sqlItem => sqlItem).flat(Infinity)
  return asArray ? filteredRes : filteredRes.join(' ')
}

export default function astToSQL(ast, asArray = false) {
  const sql = ast.go === 'go' ? goToSQL(ast, asArray) : toSQL(ast, asArray)
  return sql
}
