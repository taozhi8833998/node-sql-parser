import { exprToSQL } from './expr'
import { tableToSQL } from './tables'
import { hasVal, toUpper } from './util'

function execVariablesToSQL(stmt) {
  const { name, value } = stmt
  const result = [`@${name}`, '=', exprToSQL(value)]
  return result.filter(hasVal).join(' ')
}

function execToSQL(stmt) {
  const { keyword, module, parameters } = stmt
  const result = [
    toUpper(keyword),
    tableToSQL(module),
    parameters.map(execVariablesToSQL).filter(hasVal).join(', '),
  ]
  return result.filter(hasVal).join(' ')
}

export {
  execToSQL,
}
