import { alterArgsToSQL, alterExprToSQL } from './alter'
import { exprToSQL } from './expr'
import { indexDefinitionToSQL, indexOptionListToSQL, indexTypeToSQL } from './index-definition'
import { columnDefinitionToSQL, columnRefToSQL } from './column'
import { grantUserOrRoleToSQL } from './command'
import { constraintDefinitionToSQL } from './constrain'
import { funcToSQL } from './func'
import { tablesToSQL, tableOptionToSQL, tableToSQL } from './tables'
import { setToSQL } from './update'
import { multipleToSQL, unionToSQL } from './union'
import {
  columnIdentifierToSql,
  columnOrderListToSQL,
  commonOptionConnector,
  commonKeywordArgsToSQL,
  commentToSQL,
  commonTypeValue,
  dataTypeToSQL,
  toUpper,
  hasVal,
  identifierToSql,
  triggerEventToSQL,
  literalToSQL,
} from './util'

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
    or_replace: orReplace,
    query_expr: queryExpr,
  } = stmt
  const sql = [toUpper(type), toUpper(orReplace), toUpper(temporary), toUpper(keyword), toUpper(ifNotExists), tablesToSQL(table)]
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
    definer, for_each: forEach, keyword,
    execute: triggerBody,
    type, table, if_not_exists: ife,
    temporary, trigger, events: triggerEvents,
    order: triggerOrder, time: triggerTime, when,
  } = stmt
  const sql = [
    toUpper(type), toUpper(temporary), definer, toUpper(keyword),
    toUpper(ife), tableToSQL(trigger),
    toUpper(triggerTime),
    triggerEvents.map(event => {
      const eventStr = [toUpper(event.keyword)]
      const { args } = event
      if (args) eventStr.push(toUpper(args.keyword), args.columns.map(columnRefToSQL).join(', '))
      return eventStr.join(' ')
    }),
    'ON', tableToSQL(table), toUpper(forEach && forEach.keyword), toUpper(forEach && forEach.args),
    triggerOrder && `${toUpper(triggerOrder.keyword)} ${identifierToSql(triggerOrder.trigger)}`,
    commonOptionConnector('WHEN', exprToSQL, when),
    toUpper(triggerBody.prefix),
  ]
  switch (triggerBody.type) {
    case 'set':
      sql.push(commonOptionConnector('SET', setToSQL, triggerBody.expr))
      break
    case 'multiple':
      sql.push(multipleToSQL(triggerBody.expr.ast))
      break
  }
  sql.push(toUpper(triggerBody.suffix))
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
    or,
    type, table,
    when,
  } = stmt
  const sql = [toUpper(type), toUpper(or), toUpper(constraintKw), toUpper(keyword), identifierToSql(constraint), toUpper(location)]
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
    algorithm, columns, definer, if_not_exists: ifNotExists, keyword,
    recursive, replace, select, sql_security: sqlSecurity,
    temporary, type, view, with: withClause, with_options: withOptions,
  } = stmt
  const { db, view: name } = view
  const viewName = [identifierToSql(db), identifierToSql(name)].filter(hasVal).join('.')
  const sql = [
    toUpper(type),
    toUpper(replace),
    toUpper(temporary),
    toUpper(recursive),
    algorithm && `ALGORITHM = ${toUpper(algorithm)}`,
    definer,
    sqlSecurity && `SQL SECURITY ${toUpper(sqlSecurity)}`,
    toUpper(keyword),
    toUpper(ifNotExists),
    viewName,
    columns && `(${columns.map(columnIdentifierToSql).join(', ')})`,
    withOptions && ['WITH', `(${withOptions.map(withOpt => commonTypeValue(withOpt).join(' ')).join(', ')})`].join(' '),
    'AS',
    unionToSQL(select),
    toUpper(withClause),
  ]
  return sql.filter(hasVal).join(' ')
}

function createDomainToSQL(stmt) {
  const {
    as, domain, type, keyword, target,
    create_definitions: createDefinition,
  } = stmt
  const sql = [
    toUpper(type),
    toUpper(keyword),
    [identifierToSql(domain.schema), identifierToSql(domain.name)].filter(hasVal).join('.'),
    toUpper(as),
    dataTypeToSQL(target),
  ]
  if (createDefinition && createDefinition.length > 0) {
    const definitionSQL = []
    for (const definition of createDefinition) {
      const definitionType = definition.type
      switch (definitionType) {
        case 'collate':
          definitionSQL.push(commonTypeValue(definition).join(' '))
          break
        case 'default':
          definitionSQL.push(toUpper(definitionType), exprToSQL(definition.value))
          break
        case 'constraint':
          definitionSQL.push(constraintDefinitionToSQL(definition))
          break
      }
    }
    sql.push(definitionSQL.filter(hasVal).join(' '))
  }
  return sql.filter(hasVal).join(' ')
}

function createTypeToSQL(stmt) {
  const { as, create_definitions: createDefinition, keyword, name, resource, type } = stmt
  const sql = [
    toUpper(type),
    toUpper(keyword),
    [identifierToSql(name.schema), identifierToSql(name.name)].filter(hasVal).join('.'),
    toUpper(as),
    toUpper(resource),
  ]
  if (createDefinition) {
    const definitionSQL = []
    switch (resource) {
      case 'enum':
        definitionSQL.push(exprToSQL(createDefinition))
        break
    }
    sql.push(definitionSQL.filter(hasVal).join(' '))
  }
  return sql.filter(hasVal).join(' ')
}

function createFunctionReturnsOptToSQL(stmt) {
  if (stmt.dataType) return dataTypeToSQL(stmt)
  return [identifierToSql(stmt.db), identifierToSql(stmt.schema), identifierToSql(stmt.table)].filter(hasVal).join('.')
}

function createFunctionReturnsToSQL(stmt) {
  const { type, keyword, expr } = stmt
  const sql = [
    toUpper(type),
    toUpper(keyword),
    Array.isArray(expr) ? `(${expr.map(columnDefinitionToSQL).join(', ')})` : createFunctionReturnsOptToSQL(expr),
  ]
  return sql.filter(hasVal).join(' ')
}
function createFunctionOptionToSQL(stmt) {
  const { type } = stmt
  switch (type) {
    case 'as':
      return [toUpper(type), stmt.symbol, unionToSQL(stmt.declare), toUpper(stmt.begin), multipleToSQL(stmt.expr), toUpper(stmt.end), stmt.symbol].filter(hasVal).join(' ')
    case 'set':
      return [toUpper(type), stmt.parameter, toUpper(stmt.value && stmt.value.prefix), stmt.value && stmt.value.expr.map(exprToSQL).join(', ')].filter(hasVal).join(' ')
    default:
      return exprToSQL(stmt)
  }
}
function createFunctionToSQL(stmt) {
  const { type, replace, keyword, name, args, returns, options, last } = stmt
  const sql = [toUpper(type), toUpper(replace), toUpper(keyword)]
  const functionName = [identifierToSql(name.schema), name.name].filter(hasVal).join('.')
  const argsSQL = args.map(alterArgsToSQL).filter(hasVal).join(', ')
  sql.push(`${functionName}(${argsSQL})`, createFunctionReturnsToSQL(returns), options.map(createFunctionOptionToSQL).join(' '), last)
  return sql.filter(hasVal).join(' ')
}

function aggregateOptionToSQL(stmt) {
  const { type, symbol, value } = stmt
  const sql = [toUpper(type), symbol]
  switch (toUpper(type)) {
    case 'SFUNC':
      sql.push([identifierToSql(value.schema), value.name].filter(hasVal).join('.'))
      break
    case 'STYPE':
    case 'MSTYPE':
      sql.push(dataTypeToSQL(value))
      break
    default:
      sql.push(exprToSQL(value))
      break
  }
  return sql.filter(hasVal).join(' ')
}
function createAggregateToSQL(stmt) {
  const { type, replace, keyword, name, args, options } = stmt
  const sql = [toUpper(type), toUpper(replace), toUpper(keyword)]
  const functionName = [identifierToSql(name.schema), name.name].filter(hasVal).join('.')
  const argsSQL = `${args.expr.map(alterArgsToSQL).join(', ')}${args.orderby ? [' ORDER', 'BY', args.orderby.map(alterArgsToSQL).join(', ')].join(' ') : ''}`
  sql.push(`${functionName}(${argsSQL})`, `(${options.map(aggregateOptionToSQL).join(', ')})`)
  return sql.filter(hasVal).join(' ')
}
function createUserToSQL(stmt) {
  const {
    attribute, comment, default_role: defaultRole, if_not_exists: ifNotExists, keyword, lock_option: lockOption,
    password_options: passwordOptions, require: requireOption, resource_options: resourceOptions, type, user,
  } = stmt
  const userAuthOptions = user.map(userAuthOption => {
    const { user: userInfo, auth_option } = userAuthOption
    const result = [grantUserOrRoleToSQL(userInfo)]
    if (auth_option) result.push(toUpper(auth_option.keyword), auth_option.auth_plugin, literalToSQL(auth_option.value))
    return result.filter(hasVal).join(' ')
  }).join(', ')
  const sql = [
    toUpper(type),
    toUpper(keyword),
    toUpper(ifNotExists),
    userAuthOptions,
  ]
  if (defaultRole) sql.push(toUpper(defaultRole.keyword), defaultRole.value.map(grantUserOrRoleToSQL).join(', '))
  sql.push(commonOptionConnector(requireOption && requireOption.keyword, exprToSQL, requireOption && requireOption.value))
  if (resourceOptions) sql.push(toUpper(resourceOptions.keyword), resourceOptions.value.map(resourceOption => exprToSQL(resourceOption)).join(' '))
  if (passwordOptions) passwordOptions.forEach(passwordOption => sql.push(commonOptionConnector(passwordOption.keyword, exprToSQL, passwordOption.value)))
  sql.push(literalToSQL(lockOption), commentToSQL(comment), literalToSQL(attribute))
  return sql.filter(hasVal).join(' ')
}
function createToSQL(stmt) {
  const { keyword } = stmt
  let sql = ''
  switch (keyword.toLowerCase()) {
    case 'aggregate':
      sql = createAggregateToSQL(stmt)
      break
    case 'table':
      sql = createTableToSQL(stmt)
      break
    case 'trigger':
      sql = stmt.resource === 'constraint' ? createConstraintTriggerToSQL(stmt) : createTriggerToSQL(stmt)
      break
    case 'extension':
      sql = createExtensionToSQL(stmt)
      break
    case 'function':
      sql = createFunctionToSQL(stmt)
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
    case 'domain':
      sql = createDomainToSQL(stmt)
      break
    case 'type':
      sql = createTypeToSQL(stmt)
      break
    case 'user':
      sql = createUserToSQL(stmt)
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
