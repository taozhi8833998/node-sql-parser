import { connector, toUpper, hasVal, literalToSQL } from './util'
import { exprToSQL } from './expr'

function composePrefixValSuffix(stmt) {
  if (!stmt) return []
  return [stmt.prefix.map(literalToSQL).join(' '), exprToSQL(stmt.value), stmt.suffix.map(literalToSQL).join(' ')]
}

function fetchOffsetToSQL(stmt) {
  const { fetch, offset } = stmt
  const result = [...composePrefixValSuffix(offset), ...composePrefixValSuffix(fetch)]
  return result.filter(hasVal).join(' ')
}

function limitOffsetToSQL(limit) {
  const { seperator, value } = limit
  if (value.length === 1 && seperator === 'offset') return connector('OFFSET', exprToSQL(value[0]))
  return connector('LIMIT', value.map(exprToSQL).join(`${seperator === 'offset' ? ' ' : ''}${toUpper(seperator)} `))
}

function limitToSQL(limit) {
  if (!limit) return ''
  if (limit.fetch || limit.offset) return fetchOffsetToSQL(limit)
  return limitOffsetToSQL(limit)
}

export {
  limitToSQL,
}
