'use strict'

const has = require('has')

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

const surportedTypes = ['select', 'delete', 'update', 'insert']

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

let exprToSQLConvertFn = {}
let typeToSQLFn = {}

function exprToSQL(exprOrigin) {
  const expr = exprOrigin
  if (exprOrigin.ast) {
    const { ast } = expr
    Reflect.deleteProperty(expr, ast)
    for (const key of Object.keys(ast)) {
      expr[key] = ast[key]
    }
  }
  return exprToSQLConvertFn[expr.type] ? exprToSQLConvertFn[expr.type](expr) : literalToSQL(expr)
}

function aggrToSQL(expr) {
  /** @type {Object} */
  const { args } = expr
  let str = exprToSQL(args.expr)
  const fnName = expr.name

  if (fnName === 'COUNT') {
    if (has(args, 'distinct') && args.distinct !== null) str = `DISTINCT ${str}`
  }

  return `${fnName}(${str})`
}

function binaryToSQL(expr) {
  let { operator } = expr
  let rstr = exprToSQL(expr.right)

  if (Array.isArray(rstr)) {
    if (operator === '=') operator = 'IN'
    if (operator === '!=') operator = 'NOT IN'
    if (operator === 'BETWEEN' || operator === 'NOT BETWEEN') rstr = `${rstr[0]} AND ${rstr[1]}`
    else rstr = `(${rstr.join(', ')})`
  }

  const str = `${exprToSQL(expr.left)} ${operator} ${rstr}`

  return expr.parentheses ? `(${str})` : str
}

function caseToSQL(expr) {
  const res = ['CASE']
  const conditions = expr.args

  if (expr.expr) res.push(exprToSQL(expr.expr))

  for (let i = 0, len = conditions.length; i < len; ++i) {
    res.push(conditions[i].type.toUpperCase())
    if (conditions[i].cond) {
      res.push(exprToSQL(conditions[i].cond))
      res.push('THEN')
    }
    res.push(exprToSQL(conditions[i].result))
  }

  res.push('END')

  return res.join(' ')
}

function castToSQL(expr) {
  const str = expr.target.length ? `(${expr.target.length})` : ''
  return `CAST(${exprToSQL(expr.expr)} AS ${expr.target.dataType}${str})`
}

function columnRefToSQL(expr) {
  let str = expr.column === '*' ? '*' : identifierToSql(expr.column, expr.isDual)
  if (has(expr, 'table') && expr.table !== null) str = `${identifierToSql(expr.table)}.${str}`
  return expr.parentheses ? `(${str})` : str
}

function getExprListSQL(exprList) {
  return exprList.map(exprToSQL)
}

function funcToSQL(expr) {
  const str = `${expr.name}(${exprToSQL(expr.args).join(', ')})`
  return expr.parentheses ? `(${str})` : str
}

/**
 * Stringify column expressions
 *
 * @param {Array} columns
 * @return {string}
 */
function columnsToSQL(columns, tables) {
  if (!columns) return
  const baseTable = Array.isArray(tables) && tables[0]
  let isDual = false
  if (baseTable && baseTable.type === 'dual') isDual = true
  return columns
    .map(column => {
      const { expr } = column
      if (isDual) expr.isDual = isDual
      let str = exprToSQL(expr)
      if (column.as !== null) {
        str = `${str} AS `
        if (column.as.match(/^[a-z_][0-9a-z_]*$/i)) str = `${str}${identifierToSql(column.as)}`

        else str = `${str}\`${column.as}\``
      }

      return str
    })
    .join(', ')
}

/**
 * @param {Array} tables
 * @return {string}
 */
function tablesToSQL(tables) {
  const baseTable = tables[0]
  const clauses = []
  if (baseTable.type === 'dual') return 'DUAL'
  let str = baseTable.table ? identifierToSql(baseTable.table) : exprToSQL(baseTable.expr)

  if (baseTable.db && baseTable.db !== null) str = `${baseTable.db}.${str}`
  if (baseTable.as !== null) str = `${str} AS ${identifierToSql(baseTable.as)}`

  clauses.push(str)

  for (let i = 1; i < tables.length; ++i) {
    const joinExpr = tables[i]

    str = (joinExpr.join && joinExpr.join !== null) ? ` ${joinExpr.join} ` : str = ', '

    if (joinExpr.table) {
      if (joinExpr.db !== null) str = `${str}${joinExpr.db}.`
      str = `${str}${identifierToSql(joinExpr.table)}`
    } else {
      str = `${str}${exprToSQL(joinExpr.expr)}`
    }

    if (joinExpr.as !== null) str = `${str} AS ${identifierToSql(joinExpr.as)}`
    if (has(joinExpr, 'on') && joinExpr.on !== null) str = `${str} ON ${exprToSQL(joinExpr.on)}`
    if (has(joinExpr, 'using')) str = `${str} USING (${joinExpr.using.map(identifierToSql).join(', ')})`

    clauses.push(str)
  }

  return clauses.join('')
}

/**
 * @param {Array<Object>} withExpr
 */
function withToSql(withExpr) {
  const isRecursive = withExpr[0].recursive ? 'RECURSIVE ' : ''
  const withExprStr = withExpr.map(cte => {
    const name = `"${cte.name}"`
    const columns = Array.isArray(cte.columns) ? `(${cte.columns.join(', ')})` : ''

    return `${name}${columns} AS (${exprToSQL(cte.stmt)})`
  }).join(', ')

  return `WITH ${isRecursive}${withExprStr}`
}

/**
 * @param {Array} sets
 * @return {string}
 */
function setToSQL(sets) {
  const baseTable = sets[0]
  const clauses = []
  let str = ''
  if (baseTable.column) str = `\`${baseTable.column}\``
  str = baseTable.value && (str += ` = ${exprToSQL(baseTable.value)}`)

  clauses.push(str)

  for (let i = 1; i < sets.length; ++i) {
    const joinExpr = sets[i]

    if (joinExpr.column) str = `, \`${joinExpr.column}\``
    str = joinExpr.value && (str += ` = ${exprToSQL(joinExpr.value)}`)

    clauses.push(str)
  }

  return clauses.join('')
}

/**
 * @param {Array} values
 * @return {string}
 */
function valuesToSQL(values) {
  const clauses = values.map(exprToSQL)
  return `(${clauses.join('')})`
}

/**
 * @param {Object}      stmt
 * @param {?Array}      stmt.with
 * @param {?Array}      stmt.options
 * @param {?string}     stmt.distinct
 * @param {?Array|string}   stmt.columns
 * @param {?Array}      stmt.from
 * @param {?Object}     stmt.where
 * @param {?Array}      stmt.groupby
 * @param {?Object}     stmt.having
 * @param {?Array}      stmt.orderby
 * @param {?Array}      stmt.limit
 * @return {string}
 */
function selectToSQL(stmt) {
  const clauses = ['SELECT']

  if (has(stmt, 'with') && Array.isArray(stmt.with)) clauses.unshift(withToSql(stmt.with))
  if (has(stmt, 'options') && Array.isArray(stmt.options)) clauses.push(stmt.options.join(' '))
  if (has(stmt, 'distinct') && stmt.distinct !== null) clauses.push(stmt.distinct)

  if (stmt.columns === '*') clauses.push('*')
  else clauses.push(columnsToSQL(stmt.columns, stmt.from))

  // FROM + joins
  if (Array.isArray(stmt.from)) clauses.push('FROM', tablesToSQL(stmt.from))

  if (has(stmt, 'where') && stmt.where !== null) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)
  if (Array.isArray(stmt.groupby)) clauses.push('GROUP BY', getExprListSQL(stmt.groupby).join(', '))
  if (has(stmt, 'having') && stmt.having !== null) clauses.push(`HAVING ${exprToSQL(stmt.having)}`)

  if (Array.isArray(stmt.orderby)) {
    const orderExpressions = stmt.orderby.map(expr => `${exprToSQL(expr.expr)} ${expr.type}`)
    clauses.push('ORDER BY', orderExpressions.join(', '))
  }

  if (Array.isArray(stmt.limit)) clauses.push('LIMIT', stmt.limit.map(exprToSQL))

  return clauses.join(' ')
}

function deleteToSQL(stmt) {
  const clauses = ['DELETE']
  if (stmt.columns === '*') clauses.push('*')
  else columnsToSQL(stmt.columns, stmt.from) && clauses.push(columnsToSQL(stmt.columns, stmt.from))

  if (Array.isArray(stmt.tables)) clauses.push(tablesToSQL(stmt.tables))
  if (Array.isArray(stmt.from)) clauses.push('FROM', tablesToSQL(stmt.from))

  if (has(stmt, 'where') && stmt.where !== null) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)

  return clauses.join(' ')
}

function updateToSQL(stmt) {
  const clauses = ['UPDATE']
  if (has(stmt, 'table') && stmt.table !== null) clauses.push(identifierToSql(stmt.table, false))
  if (Array.isArray(stmt.tables)) clauses.push(tablesToSQL(stmt.tables))
  if (Array.isArray(stmt.set)) clauses.push('SET', setToSQL(stmt.set))

  if (has(stmt, 'where') && stmt.where !== null) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)

  return clauses.join(' ')
}

function insertToSQL(stmt) {
  const clauses = ['INSERT INTO']
  if (has(stmt, 'table') && stmt.table !== null) clauses.push(identifierToSql(stmt.table, false))
  if (Array.isArray(stmt.tables)) clauses.push(tablesToSQL(stmt.tables))
  if (Array.isArray(stmt.columns)) clauses.push(`(${stmt.columns.map(identifierToSql).join(', ')})`)
  if (Array.isArray(stmt.values)) clauses.push('VALUES', valuesToSQL(stmt.values))
  if (has(stmt, 'where') && stmt.where !== null) clauses.push(`WHERE ${exprToSQL(stmt.where)}`)

  return clauses.join(' ')
}

function unaryToSQL(expr) {
  const str = `${expr.operator} ${exprToSQL(expr.expr)}`
  return expr.parentheses ? `(${str})` : str
}

function unionToSQL(stmt) {
  const fun = typeToSQLFn[stmt.type]
  const res = [fun(stmt)]

  while (stmt._next) {
    res.push('UNION', fun(stmt._next))
    stmt = stmt._next
  }

  return res.join(' ')
}

function multipleToSQL(stmt) {
  const res = []

  for (let i = 0, len = stmt.length; i < len; ++i) {
    let astInfo = stmt[i] && stmt[i].ast
    if (!astInfo) astInfo = stmt[i]
    res.push(unionToSQL(astInfo))
  }
  return res.join(' ; ')
}

exprToSQLConvertFn = {
  aggr_func   : aggrToSQL,
  binary_expr : binaryToSQL,
  case        : caseToSQL,
  cast        : castToSQL,
  column_ref  : columnRefToSQL,
  function    : funcToSQL,
  unary_expr  : unaryToSQL,
  expr_list   : expr => {
    const str = getExprListSQL(expr.value)
    return expr.parentheses ? `(${str})` : str
  },
  select : expr => {
    const str = typeof expr._next === 'object' ? unionToSQL(expr) : selectToSQL(expr)
    return expr.parentheses ? `(${str})` : str
  },
}

typeToSQLFn = {
  select : selectToSQL,
  delete : deleteToSQL,
  update : updateToSQL,
  insert : insertToSQL,
}

function checkSupported(expr) {
  const ast = expr && expr.ast ? expr.ast : expr
  if (!surportedTypes.includes(ast.type)) throw new Error(`${ast.type} statements not supported at the moment`)
}

module.exports = function toSQL(ast) {
  if (Array.isArray(ast)) {
    ast.forEach(checkSupported)
    return multipleToSQL(ast)
  }
  checkSupported(ast)
  return unionToSQL(ast)
}
