(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./alter", "./expr", "./index-definition", "./column", "./constrain", "./func", "./tables", "./union", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./alter"), require("./expr"), require("./index-definition"), require("./column"), require("./constrain"), require("./func"), require("./tables"), require("./union"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.alter, global.expr, global.indexDefinition, global.column, global.constrain, global.func, global.tables, global.union, global.util);
    global.create = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _alter, _expr, _indexDefinition, _column, _constrain, _func, _tables, _union, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.createDefinitionToSQL = createDefinitionToSQL;
  _exports.createToSQL = createToSQL;
  function createDefinitionToSQL(definition) {
    if (!definition) return [];
    const {
      resource
    } = definition;
    switch (resource) {
      case 'column':
        return (0, _column.columnDefinitionToSQL)(definition);
      case 'index':
        return (0, _indexDefinition.indexDefinitionToSQL)(definition);
      case 'constraint':
        return (0, _constrain.constraintDefinitionToSQL)(definition);
      case 'sequence':
        return [(0, _util.toUpper)(definition.prefix), (0, _expr.exprToSQL)(definition.value)].filter(_util.hasVal).join(' ');
      default:
        throw new Error(`unknown resource = ${resource} type`);
    }
  }
  function createTableToSQL(stmt) {
    const {
      type,
      keyword,
      table,
      like,
      as,
      temporary,
      if_not_exists: ifNotExists,
      create_definitions: createDefinition,
      table_options: tableOptions,
      ignore_replace: ignoreReplace,
      query_expr: queryExpr
    } = stmt;
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(temporary), (0, _util.toUpper)(keyword), (0, _util.toUpper)(ifNotExists), (0, _tables.tablesToSQL)(table)];
    if (like) {
      const {
        type: likeType,
        table: likeTable
      } = like;
      const likeTableName = (0, _tables.tablesToSQL)(likeTable);
      sql.push((0, _util.toUpper)(likeType), likeTableName);
      return sql.filter(_util.hasVal).join(' ');
    }
    if (createDefinition) {
      sql.push(`(${createDefinition.map(createDefinitionToSQL).join(', ')})`);
    }
    if (tableOptions) {
      sql.push(tableOptions.map(_tables.tableOptionToSQL).join(' '));
    }
    sql.push((0, _util.toUpper)(ignoreReplace), (0, _util.toUpper)(as));
    if (queryExpr) sql.push((0, _union.unionToSQL)(queryExpr));
    return sql.filter(_util.hasVal).join(' ');
  }
  function createTriggerToSQL(stmt) {
    const {
      constraint,
      constraint_kw: constraintKw,
      deferrable,
      events,
      execute,
      for_each: forEach,
      from,
      location,
      keyword,
      type,
      table,
      when
    } = stmt;
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(constraintKw), (0, _util.toUpper)(keyword), (0, _util.identifierToSql)(constraint), (0, _util.toUpper)(location)];
    const event = (0, _util.triggerEventToSQL)(events);
    sql.push(event, 'ON', (0, _tables.tableToSQL)(table));
    if (from) sql.push('FROM', (0, _tables.tableToSQL)(from));
    sql.push(...(0, _util.commonKeywordArgsToSQL)(deferrable), ...(0, _util.commonKeywordArgsToSQL)(forEach));
    if (when) sql.push((0, _util.toUpper)(when.type), (0, _expr.exprToSQL)(when.cond));
    sql.push((0, _util.toUpper)(execute.keyword), (0, _func.funcToSQL)(execute.expr));
    return sql.filter(_util.hasVal).join(' ');
  }
  function createExtensionToSQL(stmt) {
    const {
      extension,
      from,
      if_not_exists: ifNotExists,
      keyword,
      schema,
      type,
      with: withName,
      version
    } = stmt;
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(keyword), (0, _util.toUpper)(ifNotExists), (0, _util.literalToSQL)(extension), (0, _util.toUpper)(withName), (0, _util.commonOptionConnector)('SCHEMA', _util.literalToSQL, schema), (0, _util.commonOptionConnector)('VERSION', _util.literalToSQL, version), (0, _util.commonOptionConnector)('FROM', _util.literalToSQL, from)];
    return sql.filter(_util.hasVal).join(' ');
  }
  function createIndexToSQL(stmt) {
    const {
      concurrently,
      filestream_on: fileStream,
      keyword,
      include,
      index_columns: indexColumns,
      index_type: indexType,
      index_using: indexUsing,
      index,
      on,
      index_options: indexOpt,
      algorithm_option: algorithmOpt,
      lock_option: lockOpt,
      on_kw: onKw,
      table,
      tablespace,
      type,
      where,
      with: withExpr,
      with_before_where: withBeforeWhere
    } = stmt;
    const withIndexOpt = withExpr && `WITH (${(0, _indexDefinition.indexOptionListToSQL)(withExpr).join(', ')})`;
    const includeColumns = include && `${(0, _util.toUpper)(include.keyword)} (${include.columns.map(col => (0, _util.identifierToSql)(col)).join(', ')})`;
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(indexType), (0, _util.toUpper)(keyword), (0, _util.toUpper)(concurrently), (0, _util.identifierToSql)(index), (0, _util.toUpper)(onKw), (0, _tables.tableToSQL)(table), ...(0, _indexDefinition.indexTypeToSQL)(indexUsing), `(${(0, _util.columnOrderListToSQL)(indexColumns)})`, includeColumns, (0, _indexDefinition.indexOptionListToSQL)(indexOpt).join(' '), (0, _alter.alterExprToSQL)(algorithmOpt), (0, _alter.alterExprToSQL)(lockOpt), (0, _util.commonOptionConnector)('TABLESPACE', _util.literalToSQL, tablespace)];
    if (withBeforeWhere) {
      sql.push(withIndexOpt, (0, _util.commonOptionConnector)('WHERE', _expr.exprToSQL, where));
    } else {
      sql.push((0, _util.commonOptionConnector)('WHERE', _expr.exprToSQL, where), withIndexOpt);
    }
    sql.push((0, _util.commonOptionConnector)('ON', _expr.exprToSQL, on), (0, _util.commonOptionConnector)('FILESTREAM_ON', _util.literalToSQL, fileStream));
    return sql.filter(_util.hasVal).join(' ');
  }
  function createSequenceToSQL(stmt) {
    const {
      type,
      keyword,
      sequence,
      temporary,
      if_not_exists: ifNotExists,
      create_definitions: createDefinition
    } = stmt;
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(temporary), (0, _util.toUpper)(keyword), (0, _util.toUpper)(ifNotExists), (0, _tables.tablesToSQL)(sequence)];
    if (createDefinition) sql.push(createDefinition.map(createDefinitionToSQL).join(' '));
    return sql.filter(_util.hasVal).join(' ');
  }
  function createDatabaseToSQL(stmt) {
    const {
      type,
      keyword,
      database,
      if_not_exists: ifNotExists,
      create_definitions: createDefinition
    } = stmt;
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(keyword), (0, _util.toUpper)(ifNotExists), (0, _util.columnIdentifierToSql)(database)];
    if (createDefinition) sql.push(createDefinition.map(_tables.tableOptionToSQL).join(' '));
    return sql.filter(_util.hasVal).join(' ');
  }
  function createViewToSQL(stmt) {
    const {
      algorithm,
      columns,
      definer,
      keyword,
      replace,
      select,
      sql_security: sqlSecurity,
      type,
      view,
      with: withClause
    } = stmt;
    const {
      db,
      view: name
    } = view;
    const viewName = [(0, _util.identifierToSql)(db), (0, _util.identifierToSql)(name)].filter(_util.hasVal).join('.');
    const sql = [(0, _util.toUpper)(type), (0, _util.toUpper)(replace), algorithm && `ALGORITHM = ${(0, _util.toUpper)(algorithm)}`, definer && `DEFINER = ${definer}`, sqlSecurity && `SQL SECURITY ${(0, _util.toUpper)(sqlSecurity)}`, (0, _util.toUpper)(keyword), viewName, columns && `(${columns.map(_util.columnIdentifierToSql).join(', ')})`, 'AS', (0, _union.unionToSQL)(select), (0, _util.toUpper)(withClause)];
    return sql.filter(_util.hasVal).join(' ');
  }
  function createToSQL(stmt) {
    const {
      keyword
    } = stmt;
    let sql = '';
    switch (keyword.toLowerCase()) {
      case 'table':
        sql = createTableToSQL(stmt);
        break;
      case 'trigger':
        sql = createTriggerToSQL(stmt);
        break;
      case 'extension':
        sql = createExtensionToSQL(stmt);
        break;
      case 'index':
        sql = createIndexToSQL(stmt);
        break;
      case 'sequence':
        sql = createSequenceToSQL(stmt);
        break;
      case 'database':
        sql = createDatabaseToSQL(stmt);
        break;
      case 'view':
        sql = createViewToSQL(stmt);
        break;
      default:
        throw new Error(`unknown create resource ${keyword}`);
    }
    return sql;
  }
});