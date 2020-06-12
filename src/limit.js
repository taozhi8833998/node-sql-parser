import { connector, toUpper, hasVal } from './util'
import { exprToSQL } from './expr'

function composePrefixValSuffix(stmt) {
  if (!stmt) return []
  return [toUpper(stmt.prefix), exprToSQL(stmt.value), toUpper(stmt.suffix)]
}

function fetchOffsetToSQL(stmt) {
  const { fetch, offset } = stmt
  const result = [...composePrefixValSuffix(offset), ...composePrefixValSuffix(fetch)]
  return result.filter(hasVal).join(' ')
}

function limitOffsetToSQL(limit) {
  const { seperator, value } = limit
  return connector('LIMIT', value.map(exprToSQL).join(`${seperator === 'offset' ? ' ' : ''}${toUpper(seperator)} `))
}

function limitToSQL(limit) {
  if (!limit) return ''
  if (limit.fetch) return fetchOffsetToSQL(limit)
  return limitOffsetToSQL(limit)
}

export {
  limitToSQL,
}
