(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./column", "./expr", "./limit", "./tables", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./column"), require("./expr"), require("./limit"), require("./tables"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.column, global.expr, global.limit, global.tables, global.util);
    global._delete = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _column, _expr, _limit, _tables, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.deleteToSQL = deleteToSQL;
  function deleteToSQL(stmt) {
    const clauses = ['DELETE'];
    const {
      columns,
      from,
      table,
      where,
      orderby,
      limit
    } = stmt;
    const columnInfo = (0, _column.columnsToSQL)(columns, from);
    clauses.push(columnInfo);
    if (Array.isArray(table)) {
      if (!(table.length === 1 && table[0].addition === true)) clauses.push((0, _tables.tablesToSQL)(table));
    }
    clauses.push((0, _util.commonOptionConnector)('FROM', _tables.tablesToSQL, from));
    clauses.push((0, _util.commonOptionConnector)('WHERE', _expr.exprToSQL, where));
    clauses.push((0, _expr.orderOrPartitionByToSQL)(orderby, 'order by'));
    clauses.push((0, _limit.limitToSQL)(limit));
    return clauses.filter(_util.hasVal).join(' ');
  }
});