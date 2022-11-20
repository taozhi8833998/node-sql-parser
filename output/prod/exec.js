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
    global.exec = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _tables, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.execToSQL = execToSQL;
  function execVariablesToSQL(stmt) {
    const {
      name,
      value
    } = stmt;
    const result = [`@${name}`, '=', (0, _expr.exprToSQL)(value)];
    return result.filter(_util.hasVal).join(' ');
  }
  function execToSQL(stmt) {
    const {
      keyword,
      module,
      parameters
    } = stmt;
    const result = [(0, _util.toUpper)(keyword), (0, _tables.tableToSQL)(module), parameters.map(execVariablesToSQL).filter(_util.hasVal).join(', ')];
    return result.filter(_util.hasVal).join(' ');
  }
});