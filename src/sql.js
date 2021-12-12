import { bigQueryToSQL, unionToSQL, multipleToSQL } from './union'

const surportedTypes = ['analyze', 'attach', 'select', 'delete', 'exec', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'desc', 'use', 'alter', 'set', 'create', 'lock', 'unlock', 'bigquery', 'declare', 'show', 'replace']

function checkSupported(expr) {
  const ast = expr && expr.ast ? expr.ast : expr
  if (!surportedTypes.includes(ast.type)) throw new Error(`${ast.type} statements not supported at the moment`)
}

function toSQL(ast) {
  if (Array.isArray(ast)) {
    ast.forEach(checkSupported)
    return multipleToSQL(ast)
  }
  checkSupported(ast)
  const { type } = ast
  if (type === 'bigquery') return bigQueryToSQL(ast)
  return unionToSQL(ast)
}

function goToSQL(stmt) {
  if (!stmt || stmt.length === 0) return ''
  const res = [toSQL(stmt.ast)]
  if (stmt.go_next) res.push(stmt.go.toUpperCase(), goToSQL(stmt.go_next))
  return res.filter(sqlItem => sqlItem).join(' ')
}

export default function astToSQL(ast) {
  if (ast.go === 'go') return goToSQL(ast)
  return toSQL(ast)
}
