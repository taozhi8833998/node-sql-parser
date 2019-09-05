
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
    type, keyword, table, like, as, temporary,
    if_not_exists: ifNotExists,
    create_definitions: createDefinition,
    table_options: tableOptions,
    ignore_replace: ignoreReplace,
    query_expr: queryExpr,
  } = stmt
  const sql = [toUpper(type), toUpper(temporary), toUpper(keyword), toUpper(ifNotExists), tablesToSQL(table)]
  if (like) {
    const { type: likeType, table: likeTable } = like
    const likeTableName = tablesToSQL(likeTable)
    sql.push(toUpper(likeType), likeTableName)
    return sql.filter(hasVal).join(' ')
  }
  if (createDefinition) {
    sql.push(`(${createDefinition.map(createDefinitionToSQL).join(', ')})`)
  }
  if (tableOptions) {
    sql.push(tableOptions.map(tableOptionToSQL).join(' '))
  }
  sql.push(toUpper(ignoreReplace), toUpper(as))
  if (queryExpr) sql.push(unionToSQL(queryExpr))
  return sql.filter(hasVal).join(' ')
}

export {
  createToSQL,
}
