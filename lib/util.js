'use strict'

const astToSQL = require('./sql')

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

  if (operator === 'BETWEEN') {
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
function replaceParams(ast, keys) {
  Object.keys(ast)
    .filter(key => {
      const value = ast[key]
      return Array.isArray(value) || (typeof value === 'object' && value !== null)
    })
    .forEach(key => {
      const expr = ast[key]

      if (!(typeof expr === 'object' && expr.type === 'param')) return replaceParams(expr, keys)

      if (typeof keys[expr.value] === 'undefined') throw new Error(`no value for parameter :${expr.value} found`)
      ast[key] = createValueExpr(keys[expr.value])
      return null
    })

  return ast
}

module.exports = {
  createBinaryExpr,
  createValueExpr,
  replaceParams : (ast, params) => replaceParams(JSON.parse(JSON.stringify(ast)), params),
  astToSQL,
}
