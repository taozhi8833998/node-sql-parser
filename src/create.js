
import { indexDefinitionToSQL } from './index-definition'
import { columnDefinitionToSQL } from './column'
import { constraintDefinitionToSQL } from './constrain'
import { tablesToSQL, tableOptionToSQL } from './tables'

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
    create_definitions: createDefinition,
    table_options: tableOptions,
    table,
  } = stmt
  const action = type.toUpperCase()
  const sql = [action]
  if (temporary) sql.push(temporary.toUpperCase())
  sql.push(keyword.toUpperCase())
  if (ifNotExists) sql.push(ifNotExists.toUpperCase())
  const tableName = tablesToSQL(table)
  sql.push(tableName)
  if (createDefinition) {
    const createDefinitionList = createDefinition.map(createDefinitionToSQL)
    sql.push(`(${createDefinitionList.join(', ')})`)
  }
  if (tableOptions) {
    const tableOptionList = tableOptions.map(tableOptionToSQL)
    sql.push(tableOptionList.join(', '))
  }
  return sql.join(' ')
}

export {
  createToSQL,
}
