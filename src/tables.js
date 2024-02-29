import { binaryToSQL } from './binary'
import { columnRefToSQL } from './column'
import { exprToSQL } from './expr'
import { valuesToSQL } from './insert'
import { intervalToSQL } from './interval'
import { commonOptionConnector, hasVal, identifierToSql, literalToSQL, toUpper } from './util'

function unnestToSQL(unnestExpr) {
  const { type, as, expr, with_offset: withOffset } = unnestExpr
  const result = [
    `${toUpper(type)}(${expr && exprToSQL(expr) || ''})`,
    commonOptionConnector('AS', identifierToSql, as),
    commonOptionConnector(
      toUpper(withOffset && withOffset.keyword),
      identifierToSql,
      withOffset && withOffset.as
    ),
  ]
  return result.filter(hasVal).join(' ')
}

function pivotOperatorToSQL(operator) {
  const { as, column, expr, in_expr, type } = operator
  const result = [
    exprToSQL(expr),
    'FOR',
    columnRefToSQL(column),
    binaryToSQL(in_expr),
  ]
  const sql = [`${toUpper(type)}(${result.join(' ')})`]
  if (as) sql.push('AS', identifierToSql(as))
  return sql.join(' ')
}

function operatorToSQL(operator) {
  if (!operator) return
  const { type } = operator
  switch (type) {
    case 'pivot':
    case 'unpivot':
      return pivotOperatorToSQL(operator)
    default:
      return ''
  }
}

function tableHintToSQL(tableHintExpr) {
  if (!tableHintExpr) return
  const { keyword, expr, index, index_columns, parentheses, prefix } = tableHintExpr
  const result = []
  switch (keyword.toLowerCase()) {
    case 'forceseek':
      result.push(toUpper(keyword), `(${identifierToSql(index)}`, `(${index_columns.map(exprToSQL).filter(hasVal).join(', ')}))`)
      break
    case 'spatial_window_max_cells':
      result.push(toUpper(keyword), '=', exprToSQL(expr))
      break
    case 'index':
      result.push(toUpper(prefix), toUpper(keyword), parentheses ? `(${expr.map(identifierToSql).join(', ')})` : `= ${identifierToSql(expr)}`)
      break
    default:
      result.push(exprToSQL(expr))
  }
  return result.filter(hasVal).join(' ')
}

function tableTumbleToSQL(tumble) {
  if (!tumble) return ''
  const { data: tableInfo, timecol, size } = tumble
  const fullTableName = [identifierToSql(tableInfo.db), identifierToSql(tableInfo.table)].filter(hasVal).join('.')
  const result = ['TABLE(TUMBLE(TABLE', fullTableName, `DESCRIPTOR(${columnRefToSQL(timecol)})`, `${intervalToSQL(size)}))`]
  return result.filter(hasVal).join(' ')
}

function tableToSQL(tableInfo) {
  if (toUpper(tableInfo.type) === 'UNNEST') return unnestToSQL(tableInfo)
  const { table, db, as, expr, operator, prefix: prefixStr, schema, server, suffix, tablesample, table_hint } = tableInfo
  const serverName = identifierToSql(server)
  const database = identifierToSql(db)
  const schemaStr = identifierToSql(schema)
  let tableName = table && identifierToSql(table)
  if (expr) {
    const exprType = expr.type
    switch (exprType) {
      case 'values':
        const { parentheses, values, prefix } = expr
        const valueSQL = [parentheses && '(', '', parentheses && ')']
        let valuesExpr = valuesToSQL(values)
        if (prefix) valuesExpr = valuesExpr.split('(').slice(1).map(val => `${toUpper(prefix)}(${val}`).join('')
        valueSQL[1] = `VALUES ${valuesExpr}`
        tableName = valueSQL.filter(hasVal).join('')
        break
      case 'tumble':
        tableName = tableTumbleToSQL(expr)
        break
      default:
        tableName = exprToSQL(expr)
    }
  }
  tableName = [toUpper(prefixStr), tableName, toUpper(suffix)].filter(hasVal).join(' ')
  let str = [serverName, database, schemaStr, tableName].filter(hasVal).join('.')
  if (tableInfo.parentheses) str = `(${str})`
  const result = [str]
  if (tablesample) {
    const tableSampleSQL = ['TABLESAMPLE', exprToSQL(tablesample.expr), literalToSQL(tablesample.repeatable)].filter(hasVal).join(' ')
    result.push(tableSampleSQL)
  }
  result.push(commonOptionConnector('AS', identifierToSql, as), operatorToSQL(operator))
  if (table_hint) result.push(toUpper(table_hint.keyword), `(${table_hint.expr.map(tableHintToSQL).filter(hasVal).join(', ')})`)
  return result.filter(hasVal).join(' ')
}

/**
 * @param {Array} tables
 * @return {string}
 */
function tablesToSQL(tables) {
  if (!tables) return ''
  if (!Array.isArray(tables)) {
    const { expr, parentheses } = tables
    const sql = tablesToSQL(expr)
    if (parentheses) return `(${sql})`
    return sql
  }
  const baseTable = tables[0]
  const clauses = []
  if (baseTable.type === 'dual') return 'DUAL'
  clauses.push(tableToSQL(baseTable))
  for (let i = 1; i < tables.length; ++i) {
    const joinExpr = tables[i]
    const { on, using, join } = joinExpr
    const str = []
    str.push(join ? ` ${toUpper(join)}` : ',')
    str.push(tableToSQL(joinExpr))
    str.push(commonOptionConnector('ON', exprToSQL, on))
    if (using) str.push(`USING (${using.map(identifierToSql).join(', ')})`)
    clauses.push(str.filter(hasVal).join(' '))
  }
  return clauses.filter(hasVal).join('')
}

function tableOptionToSQL(tableOption) {
  const { keyword, symbol, value } = tableOption
  const sql = [keyword.toUpperCase()]
  if (symbol) sql.push(symbol)
  let val = value
  switch (keyword) {
    case 'partition by':
    case 'default collate':
      val = exprToSQL(value)
      break
    case 'options':
      val = `(${value.map(tableOptionItem => [tableOptionItem.keyword, tableOptionItem.symbol, exprToSQL(tableOptionItem.value)].join(' ')).join(', ')})`
      break
    case 'cluster by':
      val = value.map(exprToSQL).join(', ')
      break
  }
  sql.push(val)
  return sql.join(' ')
}

export {
  operatorToSQL,
  tableHintToSQL,
  tableTumbleToSQL,
  tablesToSQL,
  tableOptionToSQL,
  tableToSQL,
  unnestToSQL,
}
