import { columnToSQL, columnRefToSQL, columnOrderToSQL } from './column'
import { collateToSQL } from './collate'

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

const DEFAULT_OPT = {
  database     : PARSER_NAME || 'mysql',
  type         : 'table',
  trimQuery    : true,
  parseOptions : {
    includeLocations : false,
  },
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
  return str
  // const res = []
  // for (let i = 0, len = str.length; i < len; ++i) {
  //   let char = str[i]
  //   const escaped = escapeMap[char]
  //   if (escaped) char = escaped
  //   res.push(char)
  // }
  // return res.join('')
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
    case 'athena':
    case 'db2':
    case 'postgresql':
    case 'redshift':
    case 'snowflake':
    case 'noql':
    case 'trino':
    case 'sqlite':
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

function identifierToSql(ident, isDual, surround) {
  if (isDual === true) return `'${ident}'`
  if (!ident) return
  if (ident === '*') return ident
  if (surround) return `${surround}${ident}${surround}`
  const { database } = getParserOpt()
  switch (database && database.toLowerCase()) {
    case 'mysql':
    case 'mariadb':
      return `\`${ident}\``
    case 'athena':
    case 'postgresql':
    case 'redshift':
    case 'snowflake':
    case 'trino':
    case 'noql':
    case 'sqlite':
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
  let str = typeof literal === 'object' ? value : literal
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
    case 'unicode_string':
      str = `U&'${escape(value)}'`
      break
    default:
      break
  }
  const result = []
  if (prefix) result.push(toUpper(prefix))
  result.push(str)
  if (suffix) {
    if (typeof suffix === 'string') result.push(suffix)
    if (typeof suffix === 'object') {
      if (suffix.collate) result.push(collateToSQL(suffix.collate))
      else result.push(literalToSQL(suffix))
    }
  }
  str = result.join(' ')
  return parentheses ? `(${str})` : str
}

function commonTypeValue(opt) {
  if (!opt) return []
  const { type, symbol, value } = opt
  return [type.toUpperCase(), symbol, typeof value === 'string' ? value.toUpperCase() : literalToSQL(value)].filter(hasVal)
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
  return [
    'RETURNING',
    columns.map(columnToSQL).filter(hasVal).join(', '),
  ].join(' ')
}

function commonKeywordArgsToSQL(kwArgs) {
  if (!kwArgs) return []
  return [toUpper(kwArgs.keyword), toUpper(kwArgs.args)]
}

function autoIncrementToSQL(autoIncrement) {
  if (!autoIncrement) return
  if (typeof autoIncrement === 'string') {
    const { database } = getParserOpt()
    switch (database && database.toLowerCase()) {
      case 'sqlite':
        return 'AUTOINCREMENT'
      default:
        return 'AUTO_INCREMENT'
    }
  }
  const { keyword, seed, increment, parentheses } = autoIncrement
  let result = toUpper(keyword)
  if (parentheses) result += `(${literalToSQL(seed)}, ${literalToSQL(increment)})`
  return result
}

function columnOrderListToSQL(columnOrderList) {
  if (!columnOrderList) return
  return columnOrderList.map(columnOrderToSQL).filter(hasVal).join(', ')
}

export {
  arrayStructTypeToSQL, autoIncrementToSQL,
  columnOrderListToSQL, commonKeywordArgsToSQL, commonOptionConnector,
  connector, commonTypeValue,commentToSQL, createBinaryExpr,
  createValueExpr, dataTypeToSQL, DEFAULT_OPT, escape, literalToSQL, columnIdentifierToSql,
  getParserOpt, identifierToSql, onPartitionsToSQL, replaceParams, returningToSQL,
  hasVal, setParserOpt, toUpper, topToSQL, triggerEventToSQL,
}
