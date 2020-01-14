import { hasVal } from './util'
import { orderOrPartitionByToSQL } from './expr'

function overToSQL(over) {
  if (!over) return
  const { partitionby, orderby } = over
  const partition = orderOrPartitionByToSQL(partitionby, 'partition by')
  const order = orderOrPartitionByToSQL(orderby, 'order by')
  return `OVER (${[partition, order].filter(hasVal).join(' ')})`
}

export {
  overToSQL,
}
