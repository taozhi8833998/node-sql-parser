(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./expr", "./tables", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./expr"), require("./tables"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.expr, global.tables, global.util);
    global.sqlite = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _tables, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.analyzeToSQL = analyzeToSQL;
  _exports.attachToSQL = attachToSQL;
  function analyzeToSQL(stmt) {
    const {
      type,
      table
    } = stmt;
    const action = (0, _util.toUpper)(type);
    const tableName = (0, _tables.tableToSQL)(table);
    return [action, tableName].join(' ');
  }
  function attachToSQL(stmt) {
    const {
      type,
      database,
      expr,
      as,
      schema
    } = stmt;
    return [(0, _util.toUpper)(type), (0, _util.toUpper)(database), (0, _expr.exprToSQL)(expr), (0, _util.toUpper)(as), (0, _util.identifierToSql)(schema)].filter(_util.hasVal).join(' ');
  }
});