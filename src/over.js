import { hasVal, toUpper } from './util'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { asWindowSpecToSQL } from './window'

function overToSQL(over) {
  if (!over) return
  const { as_window_specification: asWindowSpec, expr, keyword, type, parentheses } = over
  const upperType = toUpper(type)
  if (upperType === 'WINDOW') return `OVER ${asWindowSpecToSQL(asWindowSpec)}`
  if (upperType === 'ON UPDATE') {
    let onUpdate = `${toUpper(type)} ${toUpper(keyword)}`
    const args = exprToSQL(expr) || []
    if (parentheses) onUpdate = `${onUpdate}(${args.join(', ')})`
    return onUpdate
  }
  if (over.partitionby) {
    return ['OVER', `(${orderOrPartitionByToSQL(over.partitionby, 'partition by')}`, `${orderOrPartitionByToSQL(over.orderby, 'order by')})`].filter(hasVal).join(' ')
  }
  throw new Error('unknown over type')
}

export {
  overToSQL,
}
