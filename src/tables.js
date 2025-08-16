import { binaryToSQL } from './binary'
import { columnRefToSQL } from './column'
import { exprToSQL } from './expr'
import { valuesToSQL } from './insert'
import { intervalToSQL } from './interval'
import { commonOptionConnector, commonTypeValue, dataTypeToSQL, hasVal, identifierToSql, literalToSQL, toUpper } from './util'

function unnestToSQL(unnestExpr) {
  const { type, as, expr, with_offset: withOffset } = unnestExpr
  const result = [
    `${toUpper(type)}(${expr && exprToSQL(expr) || ''})`,
    commonOptionConnector('AS', typeof as === 'string' ? identifierToSql : exprToSQL, as),
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
      result.push(toUpper(prefix), toUpper(keyword), parentheses ? `(${expr.map(indexItem => identifierToSql(indexItem)).join(', ')})` : `= ${identifierToSql(expr)}`)
      break
    default:
      result.push(exprToSQL(expr))
  }
  return result.filter(hasVal).join(' ')
}

function tableTumbleArgsToSQL(param, expr) {
  const { name, symbol } = param
  return [toUpper(name), symbol, expr].filter(hasVal).join(' ')
}
function tableTumbleToSQL(tumble) {
  if (!tumble) return ''
  const { data: tableInfo, timecol, offset, size } = tumble
  const fullTableName = [identifierToSql(tableInfo.expr.db), identifierToSql(tableInfo.expr.schema), identifierToSql(tableInfo.expr.table)].filter(hasVal).join('.')
  const timeColSQL = `DESCRIPTOR(${columnRefToSQL(timecol.expr)})`
  const result = [`TABLE(TUMBLE(TABLE ${tableTumbleArgsToSQL(tableInfo, fullTableName)}`, tableTumbleArgsToSQL(timecol, timeColSQL)]
  const sizeSQL = tableTumbleArgsToSQL(size, intervalToSQL(size.expr))
  if (offset && offset.expr) result.push(sizeSQL, `${tableTumbleArgsToSQL(offset, intervalToSQL(offset.expr))}))`)
  else result.push(`${sizeSQL}))`)
  return result.filter(hasVal).join(', ')
}

function temporalTableOptionToSQL(stmt) {
  const { keyword } = stmt
  const result = []
  switch (keyword) {
    case 'as':
      result.push('AS', 'OF', exprToSQL(stmt.of))
      break
    case 'from_to':
      result.push('FROM', exprToSQL(stmt.from), 'TO', exprToSQL(stmt.to))
      break
    case 'between_and':
      result.push('BETWEEN', exprToSQL(stmt.between), 'AND', exprToSQL(stmt.and))
      break
    case 'contained':
      result.push('CONTAINED', 'IN', exprToSQL(stmt.in))
      break
  }
  return result.filter(hasVal).join(' ')
}

function temporalTableToSQL(stmt) {
  if (!stmt) return
  const { keyword, expr } = stmt
  return [toUpper(keyword), temporalTableOptionToSQL(expr)].filter(hasVal).join(' ')
}

function generateVirtualTable(stmt) {
  const { keyword, type, generators } = stmt
  const generatorSQL = generators.map(generator => commonTypeValue(generator).join(' ')).join(', ')
  return `${toUpper(keyword)}(${toUpper(type)}(${generatorSQL}))`
}

function jsonTableOnClauseToSQL(onClause, clauseType) {
  const { type, value } = onClause

  switch (type) {
    case 'null':
      return `NULL ON ${clauseType}`
    case 'default':
      return `DEFAULT ${literalToSQL(value)} ON ${clauseType}`
    case 'error':
      return `ERROR ON ${clauseType}`
    default:
      return ''
  }
}

function jsonTableColumnToSQL(column) {
  const { type, name, datatype, path, on_empty, on_error, columns } = column

  switch (type) {
    case 'ordinality':
      return `${identifierToSql(name)} FOR ORDINALITY`

    case 'column':
      const result = [identifierToSql(name)]
      if (datatype) {
        result.push(dataTypeToSQL(datatype))
      }
      result.push('PATH', literalToSQL(path))

      if (on_empty) {
        result.push(jsonTableOnClauseToSQL(on_empty, 'EMPTY'))
      }
      if (on_error) {
        result.push(jsonTableOnClauseToSQL(on_error, 'ERROR'))
      }

      return result.join(' ')

    case 'exists':
      const existsResult = [identifierToSql(name)]
      if (datatype) {
        existsResult.push(dataTypeToSQL(datatype))
      }
      existsResult.push('EXISTS PATH', literalToSQL(path))
      return existsResult.join(' ')

    case 'nested':
      const nestedResult = ['NESTED PATH', literalToSQL(path), 'COLUMNS']
      if (columns && columns.length > 0) {
        const columnsList = columns.map(jsonTableColumnToSQL).join(', ')
        nestedResult.push(`(${columnsList})`)
      }
      return nestedResult.join(' ')

    default:
      return ''
  }
}

function jsonTableToSQL(jsonTableExpr) {
  const { expr, path, columns } = jsonTableExpr

  const result = ['JSON_TABLE(']
  result.push(exprToSQL(expr))
  result.push(',')
  result.push(literalToSQL(path))
  result.push('COLUMNS')

  if (columns && columns.length > 0) {
    const columnsList = columns.map(jsonTableColumnToSQL).join(', ')
    result.push(`(${columnsList})`)
  }

  result.push(')')

  return result.join(' ')
}

function tableToSQL(tableInfo) {
  if (toUpper(tableInfo.type) === 'UNNEST') return unnestToSQL(tableInfo)
  const { table, db, as, expr, operator, prefix: prefixStr, schema, server, suffix, tablesample, temporal_table, table_hint, surround = {} } = tableInfo
  const serverName = identifierToSql(server, false, surround.server)
  const database = identifierToSql(db, false, surround.db)
  const schemaStr = identifierToSql(schema, false, surround.schema)
  let tableName = table && identifierToSql(table, false, surround.table)
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
      case 'generator':
        tableName = generateVirtualTable(expr)
        break
      case 'json_table':
        tableName = jsonTableToSQL(expr)
        break
      default:
        tableName = exprToSQL(expr)
    }
  }
  tableName = [toUpper(prefixStr), tableName, toUpper(suffix)].filter(hasVal).join(' ')
  const str = [serverName, database, schemaStr, tableName].filter(hasVal).join('.')
  const result = [str]
  if (tablesample) {
    const tableSampleSQL = ['TABLESAMPLE', exprToSQL(tablesample.expr), literalToSQL(tablesample.repeatable)].filter(hasVal).join(' ')
    result.push(tableSampleSQL)
  }
  result.push(temporalTableToSQL(temporal_table), commonOptionConnector('AS', typeof as === 'string' ? identifierToSql : exprToSQL, as), operatorToSQL(operator))
  if (table_hint) result.push(toUpper(table_hint.keyword), `(${table_hint.expr.map(tableHintToSQL).filter(hasVal).join(', ')})`)
  const tableSQL = result.filter(hasVal).join(' ')
  return tableInfo.parentheses ? `(${tableSQL})` : tableSQL
}

/**
 * @param {Array} tables
 * @return {string}
 */
function tablesToSQL(tables) {
  if (!tables) return ''
  if (!Array.isArray(tables)) {
    const { expr, parentheses, joins } = tables
    const sql = tablesToSQL(expr)
    if (parentheses) {
      const leftParentheses = []
      const rightParentheses = []
      const parenthesesNumber = parentheses === true ? 1 : parentheses.length
      let i = 0
      while (i++ < parenthesesNumber) {
        leftParentheses.push('(')
        rightParentheses.push(')')
      }
      const joinsSQL = joins && joins.length > 0 ? tablesToSQL(['', ...joins]) : ''
      return leftParentheses.join('') + sql + rightParentheses.join('') + joinsSQL
    }
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
    const isTables = Array.isArray(joinExpr) || Object.hasOwnProperty.call(joinExpr, 'joins')
    str.push(join ? ` ${toUpper(join)}` : ',')
    str.push(isTables ? tablesToSQL(joinExpr) : tableToSQL(joinExpr))
    str.push(commonOptionConnector('ON', exprToSQL, on))
    if (using) str.push(`USING (${using.map(literalToSQL).join(', ')})`)
    clauses.push(str.filter(hasVal).join(' '))
  }
  return clauses.filter(hasVal).join('')
}

function tableOptionToSQL(tableOption) {
  const { keyword, symbol, value } = tableOption
  const sql = [keyword.toUpperCase()]
  if (symbol) sql.push(symbol)
  let val = literalToSQL(value)
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
  return sql.filter(hasVal).join(' ')
}

export {
  operatorToSQL,
  tableHintToSQL,
  tableTumbleToSQL,
  tablesToSQL,
  tableOptionToSQL,
  tableToSQL,
  unnestToSQL,
  jsonTableToSQL,
}
