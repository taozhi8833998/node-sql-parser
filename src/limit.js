import { connector, toUpper } from './util'
import { exprToSQL } from './expr'

function limitToSQL(limit) {
  if (!limit) return
  const { seperator, value } = limit
  return connector('LIMIT', value.map(exprToSQL).join(`${seperator === 'offset' ? ' ' : ''}${toUpper(seperator)} `))
}

export {
  limitToSQL,
}
