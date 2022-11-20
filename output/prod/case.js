(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./expr"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./expr"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.expr);
    global._case = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.caseToSQL = caseToSQL;
  function caseToSQL(expr) {
    const res = ['CASE'];
    const conditions = expr.args;
    if (expr.expr) res.push((0, _expr.exprToSQL)(expr.expr));
    for (let i = 0, len = conditions.length; i < len; ++i) {
      res.push(conditions[i].type.toUpperCase());
      if (conditions[i].cond) {
        res.push((0, _expr.exprToSQL)(conditions[i].cond));
        res.push('THEN');
      }
      res.push((0, _expr.exprToSQL)(conditions[i].result));
    }
    res.push('END');
    return res.join(' ');
  }
});