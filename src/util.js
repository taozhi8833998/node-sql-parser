import has from 'has'

const escapeMap = {
  '\0'   : '\\0',
  '\''   : '\\\'',
  '"'    : '\\"',
  '\b'   : '\\b',
  '\n'   : '\\n',
  '\r'   : '\\r',
  '\t'   : '\\t',
  '\x1a' : '\\Z',
  '\\'   : '\\\\',
}

/**
 * @param {(Array|boolean|string|number|null)} value
 * @return {Object}
 */
function createValueExpr(value) {
  let expr = {}
  const type = typeof value

  if (Array.isArray(value)) expr = { type: 'expr_list', value: value.map(createValueExpr) }
  else if (type === 'boolean') expr = { type: 'bool', value }
  else if (type === 'string') expr = { type: 'string', value }
  else if (type === 'number') expr = { type: 'number', value }
  else if (value === null) expr = { type: 'null', value: null }
  else throw new Error(`Cannot convert value  "${value}" to SQL`)

  return expr
}

/**
 * @param operator
 * @param left
 * @param right
 * @return {Object}
 */
function createBinaryExpr(operator, left, right) {
  const expr = { operator, type: 'binary_expr' }

  expr.left = left && left.type ? expr.left = left : createValueExpr(left)

  if (operator === 'BETWEEN' || operator === 'NOT BETWEEN') {
    expr.right = {
      type  : 'expr_list',
      value : [createValueExpr(right[0]), createValueExpr(right[1])],
    }
  } else {
    expr.right = right && right.type ? expr.right = right : expr.right = createValueExpr(right)
  }

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
  const res = []

  for (let i = 0, len = str.length; i < len; ++i) {
    let char = str[i]
    const escaped = escapeMap[char]
    if (escaped) char = escaped
    res.push(char)
  }

  return res.join('')
}

function identifierToSql(ident, isDual) {
  if (isDual === true) return `'${ident}'`
  return `\`${ident}\``
}

function literalToSQL(literal) {
  const { type } = literal
  let { value } = literal

  if (type === 'number') {
    /* nothing */
  } else if (type === 'string') value = `'${escape(value)}'`
  else if (type === 'bool') value = value ? 'TRUE' : 'FALSE'
  else if (type === 'null') value = 'NULL'
  else if (type === 'star') value = '*'
  else if (['time', 'date', 'timestamp'].includes(type)) value = `${type.toUpperCase()} '${value}'`
  else if (type === 'param') value = `:${value}`

  return literal.parentheses ? `(${value})` : value
}

function replaceParams(ast, params) {
  return replaceParamsInner(JSON.parse(JSON.stringify(ast)), params)
}

function columnRefToSQL(expr) {
  let str = expr.column === '*' ? '*' : identifierToSql(expr.column, expr.isDual)
  if (has(expr, 'table') && expr.table !== null) str = `${identifierToSql(expr.table)}.${str}`
  return expr.parentheses ? `(${str})` : str
}

function toUpper(val) {
  if (!val) return
  return val.toUpperCase()
}

function hasVal(val) {
  return val
}

function commonTypeValue(opt) {
  const result = []
  if (!opt) return result
  const { type, value } = opt
  result.push(type.toUpperCase())
  result.push(value.toUpperCase())
  return result
}

function commentToSQL(comment) {
  if (!comment) return
  const result = []
  const { keyword, symobl, value } = comment
  result.push(keyword.toUpperCase())
  if (symobl) result.push(symobl)
  result.push(literalToSQL(value))
  return result.join(' ')
}

export {
  commonTypeValue,
  columnRefToSQL,
  commentToSQL,
  createBinaryExpr,
  createValueExpr,
  escape,
  literalToSQL,
  identifierToSql,
  replaceParams,
  hasVal,
  toUpper,
}
