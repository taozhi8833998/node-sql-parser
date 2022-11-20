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
    global.assign = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.assignToSQL = assignToSQL;
  function assignToSQL(expr) {
    /** @type {Object} */
    const {
      left,
      right,
      symbol,
      keyword
    } = expr;
    left.keyword = keyword;
    const leftVar = (0, _expr.exprToSQL)(left);
    const rightVal = (0, _expr.exprToSQL)(right);
    return `${leftVar} ${symbol} ${rightVal}`;
  }
});