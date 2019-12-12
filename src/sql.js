import { unionToSQL, multipleToSQL } from './union'

const surportedTypes = ['select', 'delete', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'use', 'alter', 'set', 'create', 'lock', 'unlock']

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
  return unionToSQL(ast)
}
