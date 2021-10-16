import { hasVal, toUpper } from './util'
import { exprToSQL, orderOrPartitionByToSQL } from './expr'
import { asWindowSpecToSQL } from './window'

function overToSQL(over) {
  if (!over) return
  const {
    as_window_specification: asWindowSpec,
    expr,
    keyword,
    orderby,
    partitionby,
    type,
  } = over
  if (toUpper(type) === 'WINDOW') {
    const windowSQL = asWindowSpecToSQL(asWindowSpec)
    return `OVER ${windowSQL}`
  }
  if (toUpper(type) === 'ON UPDATE') {
    let onUpdate = `${toUpper(type)} ${toUpper(keyword)}`
    const args = exprToSQL(expr)
    if (args) onUpdate = `${onUpdate}(${args.join(', ')})`
    return onUpdate
  }
  const partition = orderOrPartitionByToSQL(partitionby, 'partition by')
  const order = orderOrPartitionByToSQL(orderby, 'order by')
  return `OVER (${[partition, order].filter(hasVal).join(' ')})`
}

export {
  overToSQL,
}
