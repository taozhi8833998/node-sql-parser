
import { indexDefinitionToSQL } from './index-definition'
import { columnDefinitionToSQL } from './column'
import { constraintDefinitionToSQL } from './constrain'
import { tablesToSQL, tableOptionToSQL } from './tables'
import { unionToSQL } from './union'

function createDefinitionToSQL(definition) {
  const { resource } = definition
  switch (resource) {
    case 'column':
      return columnDefinitionToSQL(definition)
    case 'index':
      return indexDefinitionToSQL(definition)
    case 'constraint':
      return constraintDefinitionToSQL(definition)
    default:
      throw new Error(`unknow resource = ${resource} type`)
  }
}

function createToSQL(stmt) {
  const {
    type,
    keyword,
    temporary,
    if_not_exists: ifNotExists,
    table,
    like,
    create_definitions: createDefinition,
    table_options: tableOptions,
    ignore_replace: ignoreReplace,
    as,
    query_expr: queryExpr,
  } = stmt
  const action = type.toUpperCase()
  const sql = [action]
  if (temporary) sql.push(temporary.toUpperCase())
  sql.push(keyword.toUpperCase())
  if (ifNotExists) sql.push(ifNotExists.toUpperCase())
  const tableName = tablesToSQL(table)
  sql.push(tableName)
  if (like) {
    const { type: likeType, table: likeTable } = like
    sql.push(likeType.toUpperCase())
    const likeTableName = tablesToSQL(likeTable)
    sql.push(likeTableName)
    return sql.join(' ')
  }
  if (createDefinition) {
    const createDefinitionList = createDefinition.map(createDefinitionToSQL)
    sql.push(`(${createDefinitionList.join(', ')})`)
  }
  if (tableOptions) {
    const tableOptionList = tableOptions.map(tableOptionToSQL)
    sql.push(tableOptionList.join(' '))
  }
  if (ignoreReplace) sql.push(ignoreReplace.toUpperCase())
  if (as) sql.push(as.toUpperCase())
  if (queryExpr) sql.push(unionToSQL(queryExpr))
  return sql.join(' ')
}

export {
  createToSQL,
}
