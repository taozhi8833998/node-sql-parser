import { toUpper } from './util'
import { exprToSQL } from './expr'
import { asWindowSpecToSQL } from './window'

function overToSQL(over) {
  if (!over) return
  const { as_window_specification: asWindowSpec, expr, keyword, type } = over
  const upperType = toUpper(type)
  if (upperType === 'WINDOW') return `OVER ${asWindowSpecToSQL(asWindowSpec)}`
  if (upperType === 'ON UPDATE') {
    let onUpdate = `${toUpper(type)} ${toUpper(keyword)}`
    const args = exprToSQL(expr)
    if (args) onUpdate = `${onUpdate}(${args.join(', ')})`
    return onUpdate
  }
  throw new Error('unknown over type')
}

export {
  overToSQL,
}
