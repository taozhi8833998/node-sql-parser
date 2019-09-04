
import { indexDefinitionToSQL } from './index-definition'
import { columnDefinitionToSQL } from './column'
import { constraintDefinitionToSQL } from './constrain'
import { tablesToSQL, tableOptionToSQL } from './tables'
import { unionToSQL } from './union'
import { toUpper, hasVal } from './util'

function createDefinitionToSQL(definition) {
  if (!definition) return []
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
    type, keyword, table, like, as,
    temporary,
    if_not_exists: ifNotExists,
    create_definitions: createDefinition,
    table_options: tableOptions,
    ignore_replace: ignoreReplace,
    query_expr: queryExpr,
  } = stmt
  const sql = [toUpper(type), toUpper(temporary), toUpper(keyword), toUpper(ifNotExists)]
  const tableName = tablesToSQL(table)
  sql.push(tableName)
  if (like) {
    const { type: likeType, table: likeTable } = like
    sql.push(toUpper(likeType))
    const likeTableName = tablesToSQL(likeTable)
    sql.push(likeTableName)
    return sql.filter(hasVal).join(' ')
  }
  if (createDefinition) {
    const createDefinitionList = createDefinition.map(createDefinitionToSQL)
    sql.push(`(${createDefinitionList.join(', ')})`)
  }
  if (tableOptions) {
    const tableOptionList = tableOptions.map(tableOptionToSQL)
    sql.push(tableOptionList.join(' '))
  }
  sql.push(toUpper(ignoreReplace))
  sql.push(toUpper(as))
  if (queryExpr) sql.push(unionToSQL(queryExpr))
  return sql.filter(hasVal).join(' ')
}

export {
  createToSQL,
}
