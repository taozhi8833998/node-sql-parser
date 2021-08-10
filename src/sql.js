import { bigQueryToSQL, unionToSQL, multipleToSQL } from './union'

const surportedTypes = ['analyze', 'attach', 'select', 'delete', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'desc', 'use', 'alter', 'set', 'create', 'lock', 'unlock', 'bigquery', 'declare', 'show']

function checkSupported(expr) {
  const ast = expr && expr.ast ? expr.ast : expr
  if (!surportedTypes.includes(ast.type)) throw new Error(`${ast.type} statements not supported at the moment`)
}

export default function toSQL(ast) {
  if (Array.isArray(ast)) {
    ast.forEach(checkSupported)
    return multipleToSQL(ast)
  }
  checkSupported(ast)
  const { type } = ast
  if (type === 'bigquery') return bigQueryToSQL(ast)
  return unionToSQL(ast)
}
