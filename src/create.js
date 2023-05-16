import { alterExprToSQL } from './alter'
import { exprToSQL } from './expr'
import { indexDefinitionToSQL, indexOptionListToSQL, indexTypeToSQL } from './index-definition'
import { columnDefinitionToSQL } from './column'
import { constraintDefinitionToSQL } from './constrain'
import { funcToSQL } from './func'
import { tablesToSQL, tableOptionToSQL, tableToSQL } from './tables'
import { setToSQL } from './update'
import { unionToSQL } from './union'
import { columnIdentifierToSql, columnOrderListToSQL, commonOptionConnector, commonKeywordArgsToSQL, toUpper, hasVal, identifierToSql, triggerEventToSQL, literalToSQL } from './util'

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
    case 'sequence':
      return [toUpper(definition.prefix), exprToSQL(definition.value)].filter(hasVal).join(' ')
    default:
      throw new Error(`unknown resource = ${resource} type`)
  }
}

function createTableToSQL(stmt) {
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

function createTriggerToSQL(stmt) {
  const {
    definer,
    for_each: forEach,
    keyword,
    type, table,
    if_not_exists: ife,
    trigger,
    trigger_event: triggerEvent,
    trigger_order: triggerOrder,
    trigger_time: triggerTime,
    trigger_body: triggerBody,
  } = stmt
  const sql = [
    toUpper(type),
    definer,
    toUpper(keyword),
    toUpper(ife),
    identifierToSql(trigger),
    toUpper(triggerTime),
    toUpper(triggerEvent),
    'ON',
    tableToSQL(table),
    toUpper(forEach),
    triggerOrder && `${toUpper(triggerOrder.keyword)} ${identifierToSql(triggerOrder.trigger)}`,
  ]
  switch (triggerBody.type) {
    case 'set':
      sql.push(commonOptionConnector('SET', setToSQL, triggerBody.trigger))
      break
  }
  return sql.filter(hasVal).join(' ')
}

function createConstraintTriggerToSQL(stmt) {
  const {
    constraint, constraint_kw: constraintKw,
    deferrable,
    events, execute,
    for_each: forEach, from,
    location,
    keyword,
    type, table,
    when,
  } = stmt
  const sql = [toUpper(type), toUpper(constraintKw), toUpper(keyword), identifierToSql(constraint), toUpper(location)]
  const event = triggerEventToSQL(events)
  sql.push(event, 'ON', tableToSQL(table))
  if (from) sql.push('FROM', tableToSQL(from))
  sql.push(...commonKeywordArgsToSQL(deferrable), ...commonKeywordArgsToSQL(forEach))
  if (when) sql.push(toUpper(when.type), exprToSQL(when.cond))
  sql.push(toUpper(execute.keyword), funcToSQL(execute.expr))
  return sql.filter(hasVal).join(' ')
}

function createExtensionToSQL(stmt) {
  const {
    extension, from, if_not_exists: ifNotExists,
    keyword, schema, type, with: withName, version,
  } = stmt
  const sql = [
    toUpper(type),
    toUpper(keyword),
    toUpper(ifNotExists),
    literalToSQL(extension),
    toUpper(withName),
    commonOptionConnector('SCHEMA', literalToSQL, schema),
    commonOptionConnector('VERSION', literalToSQL, version),
    commonOptionConnector('FROM', literalToSQL, from),
  ]
  return sql.filter(hasVal).join(' ')
}

function createIndexToSQL(stmt) {
  const {
    concurrently, filestream_on: fileStream, keyword, include, index_columns: indexColumns,
    index_type: indexType, index_using: indexUsing, index, on, index_options: indexOpt, algorithm_option: algorithmOpt, lock_option: lockOpt, on_kw: onKw, table, tablespace, type, where,
    with: withExpr, with_before_where: withBeforeWhere,
  } = stmt
  const withIndexOpt = withExpr && `WITH (${indexOptionListToSQL(withExpr).join(', ')})`
  const includeColumns = include && `${toUpper(include.keyword)} (${include.columns.map(col => identifierToSql(col)).join(', ')})`
  const sql = [
    toUpper(type), toUpper(indexType), toUpper(keyword), toUpper(concurrently),
    identifierToSql(index), toUpper(onKw), tableToSQL(table), ...indexTypeToSQL(indexUsing),
    `(${columnOrderListToSQL(indexColumns)})`, includeColumns, indexOptionListToSQL(indexOpt).join(' '), alterExprToSQL(algorithmOpt), alterExprToSQL(lockOpt),
    commonOptionConnector('TABLESPACE', literalToSQL, tablespace),
  ]
  if (withBeforeWhere) {
    sql.push(withIndexOpt, commonOptionConnector('WHERE', exprToSQL, where))
  } else {
    sql.push(commonOptionConnector('WHERE', exprToSQL, where), withIndexOpt)
  }
  sql.push(commonOptionConnector('ON', exprToSQL, on), commonOptionConnector('FILESTREAM_ON', literalToSQL, fileStream))
  return sql.filter(hasVal).join(' ')
}

function createSequenceToSQL(stmt) {
  const {
    type, keyword, sequence, temporary,
    if_not_exists: ifNotExists,
    create_definitions: createDefinition,
  } = stmt
  const sql = [
    toUpper(type),
    toUpper(temporary),
    toUpper(keyword),
    toUpper(ifNotExists),
    tablesToSQL(sequence),
  ]
  if (createDefinition) sql.push(createDefinition.map(createDefinitionToSQL).join(' '))
  return sql.filter(hasVal).join(' ')
}

function createDatabaseToSQL(stmt) {
  const {
    type, keyword, database,
    if_not_exists: ifNotExists,
    create_definitions: createDefinition,
  } = stmt
  const sql = [
    toUpper(type),
    toUpper(keyword),
    toUpper(ifNotExists),
    columnIdentifierToSql(database),
  ]
  if (createDefinition) sql.push(createDefinition.map(tableOptionToSQL).join(' '))
  return sql.filter(hasVal).join(' ')
}

function createViewToSQL(stmt) {
  const {
    algorithm, columns, definer, keyword,
    replace, select, sql_security: sqlSecurity,
    type, view, with: withClause,
  } = stmt
  const { db, view: name } = view
  const viewName = [identifierToSql(db), identifierToSql(name)].filter(hasVal).join('.')
  const sql = [
    toUpper(type),
    toUpper(replace),
    algorithm && `ALGORITHM = ${toUpper(algorithm)}`,
    definer,
    sqlSecurity && `SQL SECURITY ${toUpper(sqlSecurity)}`,
    toUpper(keyword),
    viewName,
    columns && `(${columns.map(columnIdentifierToSql).join(', ')})`,
    'AS',
    unionToSQL(select),
    toUpper(withClause),
  ]
  return sql.filter(hasVal).join(' ')
}

function createToSQL(stmt) {
  const { keyword } = stmt
  let sql = ''
  switch (keyword.toLowerCase()) {
    case 'table':
      sql = createTableToSQL(stmt)
      break
    case 'trigger':
      sql = stmt.resource === 'constraint' ? createConstraintTriggerToSQL(stmt) : createTriggerToSQL(stmt)
      break
    case 'extension':
      sql = createExtensionToSQL(stmt)
      break
    case 'index':
      sql = createIndexToSQL(stmt)
      break
    case 'sequence':
      sql = createSequenceToSQL(stmt)
      break
    case 'database':
      sql = createDatabaseToSQL(stmt)
      break
    case 'view':
      sql = createViewToSQL(stmt)
      break
    default:
      throw new Error(`unknown create resource ${keyword}`)
  }
  return sql
}

export {
  createToSQL,
  createDefinitionToSQL,
}
