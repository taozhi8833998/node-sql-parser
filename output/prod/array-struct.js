(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./column", "./expr", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./column"), require("./expr"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.column, global.expr, global.util);
    global.arrayStruct = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _column, _expr, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.arrayStructExprToSQL = arrayStructExprToSQL;
  _exports.arrayStructValueToSQL = arrayStructValueToSQL;
  function arrayExprListToSQL(expr) {
    const {
      array_path: arrayPath,
      brackets,
      expr_list: exprList,
      parentheses
    } = expr;
    if (!exprList) return `[${(0, _column.columnsToSQL)(arrayPath)}]`;
    if (Array.isArray(exprList)) return `[${exprList.map(col => `(${(0, _column.columnsToSQL)(col)})`).filter(_util.hasVal).join(', ')}]`;
    const result = (0, _expr.exprToSQL)(exprList);
    if (brackets) return `[${result}]`;
    return parentheses ? `(${result})` : result;
  }
  function arrayStructValueToSQL(expr) {
    const {
      expr_list: exprList,
      type
    } = expr;
    switch ((0, _util.toUpper)(type)) {
      case 'STRUCT':
        return `(${(0, _column.columnsToSQL)(exprList)})`;
      case 'ARRAY':
        return arrayExprListToSQL(expr);
      default:
        return '';
    }
  }
  function arrayStructExprToSQL(expr) {
    const {
      definition,
      keyword
    } = expr;
    const result = [(0, _util.toUpper)(keyword)];
    if (definition && typeof definition === 'object') {
      result.length = 0;
      result.push((0, _util.arrayStructTypeToSQL)(definition));
    }
    result.push(arrayStructValueToSQL(expr));
    return result.filter(_util.hasVal).join('');
  }
});