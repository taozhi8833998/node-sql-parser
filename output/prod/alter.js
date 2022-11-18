(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./column", "./create", "./index-definition", "./tables", "./expr", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./column"), require("./create"), require("./index-definition"), require("./tables"), require("./expr"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.column, global.create, global.indexDefinition, global.tables, global.expr, global.util);
    global.alter = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _column, _create, _indexDefinition, _tables, _expr, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.alterExprToSQL = alterExprToSQL;
  _exports.alterToSQL = alterToSQL;
  function alterToSQL(stmt) {
    const {
      type,
      table,
      expr = []
    } = stmt;
    const action = (0, _util.toUpper)(type);
    const tableName = (0, _tables.tablesToSQL)(table);
    const exprList = expr.map(_expr.exprToSQL);
    const result = [action, 'TABLE', tableName, exprList.join(', ')];
    return result.filter(_util.hasVal).join(' ');
  }
  function alterExprToSQL(expr) {
    if (!expr) return '';
    const {
      action,
      create_definitions: createDefinition,
      first_after: firstAfter,
      if_not_exists: ifNotExists,
      keyword,
      old_column: oldColumn,
      prefix,
      resource,
      symbol
    } = expr;
    let name = '';
    let dataType = [];
    switch (resource) {
      case 'column':
        dataType = [(0, _column.columnDefinitionToSQL)(expr)];
        break;
      case 'index':
        dataType = (0, _indexDefinition.indexTypeAndOptionToSQL)(expr);
        name = expr[resource];
        break;
      case 'table':
        name = (0, _util.identifierToSql)(expr[resource]);
        break;
      case 'algorithm':
      case 'lock':
      case 'table-option':
        name = [symbol, (0, _util.toUpper)(expr[resource])].filter(_util.hasVal).join(' ');
        break;
      case 'constraint':
        name = (0, _util.identifierToSql)(expr[resource]);
        dataType = [(0, _create.createDefinitionToSQL)(createDefinition)];
        break;
      case 'key':
        name = (0, _util.identifierToSql)(expr[resource]);
        break;
      default:
        name = [symbol, expr[resource]].filter(val => val !== null).join(' ');
        break;
    }
    const alterArray = [(0, _util.toUpper)(action), (0, _util.toUpper)(keyword), (0, _util.toUpper)(ifNotExists), oldColumn && (0, _column.columnRefToSQL)(oldColumn), (0, _util.toUpper)(prefix), name && name.trim(), dataType.filter(_util.hasVal).join(' '), firstAfter && `${(0, _util.toUpper)(firstAfter.keyword)} ${(0, _column.columnRefToSQL)(firstAfter.column)}`];
    return alterArray.filter(_util.hasVal).join(' ');
  }
});