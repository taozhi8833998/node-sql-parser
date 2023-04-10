import { columnToSQL, columnRefToSQL, columnOrderToSQL } from './column'

// const escapeMap = {
//   '\0'   : '\\0',
//   '\''   : '\\\'',
//   '"'    : '\\"',
//   '\b'   : '\\b',
//   '\n'   : '\\n',
//   '\r'   : '\\r',
//   '\t'   : '\\t',
//   '\x1a' : '\\Z',
//   // '\\'   : '\\\\',
// }

const CHARS_ESCAPE_MAP = {
  '\0'   : '\\0',
  '\b'   : '\\b',
  '\t'   : '\\t',
  '\n'   : '\\n',
  '\r'   : '\\r',
  '\x1a' : '\\Z',
  '"'    : '\\"',
  '\''   : '\\\'',
  '\\'   : '\\\\',
}
const ID_GLOBAL_REGEXP = /`/g
const QUAL_GLOBAL_REGEXP = /\./g
const CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g

const DEFAULT_OPT = {
  database : PARSER_NAME || 'mysql',
  type     : 'table',
}

let parserOpt = DEFAULT_OPT

function commonOptionConnector(keyword, action, opt) {
  if (!opt) return
  if (!keyword) return action(opt)
  return `${keyword.toUpperCase()} ${action(opt)}`
}

function connector(keyword, str) {
  if (!str) return
  return `${keyword.toUpperCase()} ${str}`
}

/**
 * @param {(Array|boolean|string|number|null)} value
 * @return {Object}
 */
function createValueExpr(value) {
  const type = typeof value
  if (Array.isArray(value)) return { type: 'expr_list', value: value.map(createValueExpr) }
  if (value === null) return { type: 'null', value: null }
  switch (type) {
    case 'boolean':
      return { type: 'bool', value }
    case 'string':
      return { type: 'string', value }
    case 'number':
      return { type: 'number', value }
    default:
      throw new Error(`Cannot convert value "${type}" to SQL`)
  }
}

/**
 * @param operator
 * @param left
 * @param right
 * @return {Object}
 */
function createBinaryExpr(operator, left, right) {
  const expr = { operator, type: 'binary_expr' }
  expr.left = left.type ? left : createValueExpr(left)
  if (operator === 'BETWEEN' || operator === 'NOT BETWEEN') {
    expr.right = {
      type  : 'expr_list',
      value : [createValueExpr(right[0]), createValueExpr(right[1])],
    }
    return expr
  }
  expr.right = right.type ? right : createValueExpr(right)
  return expr
}

/**
 * Replace param expressions
 *
 * @param {Object} ast    - AST object
 * @param {Object} keys   - Keys = parameter names, values = parameter values
 * @return {Object}     - Newly created AST object
 */
function replaceParamsInner(ast, keys) {
  Object.keys(ast)
    .filter(key => {
      const value = ast[key]
      return Array.isArray(value) || (typeof value === 'object' && value !== null)
    })
    .forEach(key => {
      const expr = ast[key]
      if (!(typeof expr === 'object' && expr.type === 'param')) return replaceParamsInner(expr, keys)
      if (typeof keys[expr.value] === 'undefined') throw new Error(`no value for parameter :${expr.value} found`)
      ast[key] = createValueExpr(keys[expr.value])
      return null
    })

  return ast
}

function escape(str) {
  if (str === null) {
    return 'NULL'
  }
  switch (typeof str) {
    case 'boolean':
      return (str) ? 'true' : 'false'
    case 'number':
      return String(str) + ''
    case 'object':
      if (Buffer.isBuffer(str)) {
        return bufferToString(str)
      } else if (typeof str.toSqlString === 'function') {
        return String(str.toSqlString())
      }
      return objectToValues(str)
    default:
      return escapeString(str)
  }
}

function escapeString(val) {
  let chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0
  let escapedVal = ''
  let match

  while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]]
    chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex
  }

  if (chunkIndex === 0) {
    // Nothing was escaped
    return String(val)
  }

  if (chunkIndex < val.length) {
    return String(escapedVal + val.slice(chunkIndex))
  }

  return String(escapedVal)
}

function bufferToString(buffer) {
  return 'X' + escapeString(buffer.toString('hex'))
}


function escapeId(val) {
  if (Array.isArray(val)) {
    let sql = ''
    for (let i = 0; i < val.length; i++) {
      sql += (i === 0 ? '' : ', ') + escapeId(val[i])
    }
    return sql
  }
  return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``').replace(QUAL_GLOBAL_REGEXP, '`.`') + '`'
}

function objectToValues(obj) {
  let sql = ''

  for (const key in obj) {
    const val = obj[key]

    if (typeof val === 'function') {
      continue
    }

    sql += (sql.length === 0 ? '' : ', ') + escapeId(key) + ' = ' + escape(val)
  }

  return sql
}

function getParserOpt() {
  return parserOpt
}

function setParserOpt(opt) {
  parserOpt = opt
}

function topToSQL(opt) {
  if (!opt) return
  const { value, percent, parentheses } = opt
  const val = parentheses ? `(${value})` : value
  const prefix = `TOP ${val}`
  if (!percent) return prefix
  return `${prefix} ${percent.toUpperCase()}`
}

function columnIdentifierToSql(ident) {
  const { database } = getParserOpt()
  if (!ident) return
  switch (database && database.toLowerCase()) {
    case 'postgresql':
    case 'db2':
      return `"${ident}"`
    case 'transactsql':
      return `[${ident}]`
    case 'mysql':
    case 'mariadb':
    case 'bigquery':
    default:
      return `\`${ident}\``
  }
}

function identifierToSql(ident, isDual) {
  const { database } = getParserOpt()
  if (isDual === true) return `'${ident}'`
  if (!ident) return
  switch (database && database.toLowerCase()) {
    case 'mysql':
    case 'mariadb':
    case 'sqlite':
      return `\`${ident}\``
    case 'postgresql':
      return `"${ident}"`
    case 'transactsql':
      return `[${ident}]`
    case 'bigquery':
    case 'db2':
      return ident
    default:
      return `\`${ident}\``
  }
}

function commonTypeValue(opt) {
  const result = []
  if (!opt) return result
  const { type, symbol, value } = opt
  result.push(type.toUpperCase())
  if (symbol) result.push(symbol)
  result.push(value.toUpperCase())
  return result
}

function toUpper(val) {
  if (!val) return
  return val.toUpperCase()
}

function hasVal(val) {
  return val
}

function literalToSQL(literal) {
  if (!literal) return
  let { prefix } = literal
  const { type, parentheses, suffix, value } = literal
  let str = value
  switch (type) {
    case 'backticks_quote_string':
      str = `\`${escape(value)}\``
      break
    case 'string':
      str = `'${escape(value)}'`
      break
    case 'regex_string':
      str = `r"${escape(value)}"`
      break
    case 'hex_string':
      str = `X'${escape(value)}'`
      break
    case 'full_hex_string':
      str = `0x${escape(value)}`
      break
    case 'natural_string':
      str = `N'${escape(value)}'`
      break
    case 'bit_string':
      str = `b'${escape(value)}'`
      break
    case 'double_quote_string':
      str = `"${escape(value)}"`
      break
    case 'single_quote_string':
      str = `'${value}'`
      break
    case 'boolean':
    case 'bool':
      str = value ? 'TRUE' : 'FALSE'
      break
    case 'null':
      str = 'NULL'
      break
    case 'star':
      str = '*'
      break
    case 'param':
      str = `${prefix || ':'}${value}`
      prefix = null
      break
    case 'origin':
      str = value.toUpperCase()
      break
    case 'date':
    case 'datetime':
    case 'time':
    case 'timestamp':
      str = `${type.toUpperCase()} '${value}'`
      break
    case 'var_string':
      str = `N'${escape(value)}'`
      break
    default:
      break
  }
  const result = []
  if (prefix) result.push(toUpper(prefix))
  result.push(str)
  if (suffix) result.push(typeof suffix === 'object' && suffix.collate ? commonTypeValue(suffix.collate).join(' ') : toUpper(suffix))
  str = result.join(' ')
  return parentheses ? `(${str})` : str
}

function replaceParams(ast, params) {
  return replaceParamsInner(JSON.parse(JSON.stringify(ast)), params)
}

function onPartitionsToSQL(expr) {
  const { type, partitions } = expr
  const result = [
    toUpper(type),
    `(${partitions.map(partition => {
      const { type: partitionType } = partition
      if (!(partitionType === 'range')) return literalToSQL(partition)
      const { start, end, symbol } = partition
      return `${literalToSQL(start)} ${toUpper(symbol)} ${literalToSQL(end)}`
    }).join(', ')})`,
  ]
  return result.join(' ')
}

function dataTypeToSQL(expr) {
  const { dataType, length, parentheses, scale, suffix } = expr
  let str = ''
  if (length != null) str = scale ? `${length}, ${scale}` : length
  if (parentheses) str = `(${str})`
  if (suffix && suffix.length) str += ` ${suffix.join(' ')}`
  return `${dataType}${str}`
}

function arrayStructTypeToSQL(expr) {
  if (!expr) return
  const { dataType, definition, anglebracket } = expr
  const dataTypeUpper = toUpper(dataType)
  const isNotArrayOrStruct = dataTypeUpper !== 'ARRAY' && dataTypeUpper !== 'STRUCT'
  if (isNotArrayOrStruct) return dataTypeUpper
  const result = definition && definition.map(field => {
    const {
      field_name: fieldName, field_type: fieldType,
    } = field
    const fieldResult = [fieldName, arrayStructTypeToSQL(fieldType)]
    return fieldResult.filter(hasVal).join(' ')
  }).join(', ')
  return anglebracket ? `${dataTypeUpper}<${result}>` : `${dataTypeUpper} ${result}`
}

function commentToSQL(comment) {
  if (!comment) return
  const result = []
  const { keyword, symbol, value } = comment
  result.push(keyword.toUpperCase())
  if (symbol) result.push(symbol)
  result.push(literalToSQL(value))
  return result.join(' ')
}

function triggerEventToSQL(events) {
  return events.map(event => {
    const { keyword: eventKw, args } = event
    const result = [toUpper(eventKw)]
    if (args) {
      const { keyword: kwArgs, columns } = args
      result.push(toUpper(kwArgs), columns.map(columnRefToSQL).join(', '))
    }
    return result.join(' ')
  }).join(' OR ')
}

function returningToSQL(returning) {
  if (!returning) return ''
  const { columns } = returning
  return ['RETURNING', columns.map(columnToSQL).filter(hasVal).join(', ')].join(' ')
}

function commonKeywordArgsToSQL(kwArgs) {
  if (!kwArgs) return []
  return [toUpper(kwArgs.keyword), toUpper(kwArgs.args)]
}

function autoIncreatementToSQL(autoIncreatement) {
  if (!autoIncreatement || typeof autoIncreatement === 'string') return toUpper(autoIncreatement)
  const { keyword, seed, increment, parentheses } = autoIncreatement
  let result = toUpper(keyword)
  if (parentheses) result += `(${literalToSQL(seed)}, ${literalToSQL(increment)})`
  return result
}

function columnOrderListToSQL(columnOrderList) {
  if (!columnOrderList) return
  return columnOrderList.map(columnOrderToSQL).filter(hasVal).join(', ')
}

export {
  arrayStructTypeToSQL, autoIncreatementToSQL,
  columnOrderListToSQL, commonKeywordArgsToSQL, commonOptionConnector,
  connector, commonTypeValue,commentToSQL, createBinaryExpr,
  createValueExpr, dataTypeToSQL, DEFAULT_OPT, escape, literalToSQL, columnIdentifierToSql,
  identifierToSql, onPartitionsToSQL, replaceParams, returningToSQL,
  hasVal, setParserOpt, toUpper, topToSQL, triggerEventToSQL,
}
