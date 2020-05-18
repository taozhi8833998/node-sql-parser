import { hasVal, toUpper } from './util'
import { orderOrPartitionByToSQL } from './expr'
import { asWindowSpecToSQL } from './window'

function overToSQL(over) {
  if (!over) return
  const {
    as_window_specification: asWindowSpec,
    orderby,
    partitionby,
    type,
  } = over
  if (toUpper(type) === 'WINDOW') {
    const windowSQL = asWindowSpecToSQL(asWindowSpec)
    return `OVER ${windowSQL}`
  }
  const partition = orderOrPartitionByToSQL(partitionby, 'partition by')
  const order = orderOrPartitionByToSQL(orderby, 'order by')
  return `OVER (${[partition, order].filter(hasVal).join(' ')})`
}

export {
  overToSQL,
}
