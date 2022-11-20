(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./expr", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./expr"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.expr, global.util);
    global.binary = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.binaryToSQL = binaryToSQL;
  function binaryToSQL(expr) {
    let {
      operator
    } = expr;
    let rstr = (0, _expr.exprToSQL)(expr.right);
    let isBetween = false;
    if (Array.isArray(rstr)) {
      switch (operator) {
        case '=':
          operator = 'IN';
          break;
        case '!=':
          operator = 'NOT IN';
          break;
        case 'BETWEEN':
        case 'NOT BETWEEN':
          isBetween = true;
          rstr = `${rstr[0]} AND ${rstr[1]}`;
          break;
        default:
          break;
      }
      if (!isBetween) rstr = `(${rstr.join(', ')})`;
    }
    const escape = expr.right.escape || {};
    const str = [(0, _expr.exprToSQL)(expr.left), operator, rstr, (0, _util.toUpper)(escape.type), (0, _expr.exprToSQL)(escape.value)].filter(_util.hasVal).join(' ');
    return expr.parentheses ? `(${str})` : str;
  }
});