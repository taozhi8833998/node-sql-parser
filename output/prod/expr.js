(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./util", "./alter", "./aggregation", "./assign", "./binary", "./case", "./column", "./func", "./interval", "./select", "./show", "./array-struct", "./union", "./window"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./util"), require("./alter"), require("./aggregation"), require("./assign"), require("./binary"), require("./case"), require("./column"), require("./func"), require("./interval"), require("./select"), require("./show"), require("./array-struct"), require("./union"), require("./window"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.util, global.alter, global.aggregation, global.assign, global.binary, global._case, global.column, global.func, global.interval, global.select, global.show, global.arrayStruct, global.union, global.window);
    global.expr = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _util, _alter, _aggregation, _assign, _binary, _case, _column, _func, _interval, _select, _show, _arrayStruct, _union, _window) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.exprToSQL = exprToSQL;
  _exports.exprToSQLConvertFn = void 0;
  _exports.getExprListSQL = getExprListSQL;
  _exports.orderOrPartitionByToSQL = orderOrPartitionByToSQL;
  _exports.varToSQL = varToSQL;
  const exprToSQLConvertFn = {
    alter: _alter.alterExprToSQL,
    aggr_func: _aggregation.aggrToSQL,
    window_func: _window.windowFuncToSQL,
    'array': _arrayStruct.arrayStructExprToSQL,
    assign: _assign.assignToSQL,
    binary_expr: _binary.binaryToSQL,
    case: _case.caseToSQL,
    cast: _func.castToSQL,
    column_ref: _column.columnRefToSQL,
    datatype: _util.dataTypeToSQL,
    extract: _func.extractFunToSQL,
    fulltext_search: _column.fulltextSearchToSQL,
    function: _func.funcToSQL,
    insert: _union.unionToSQL,
    interval: _interval.intervalToSQL,
    show: _show.showToSQL,
    struct: _arrayStruct.arrayStructExprToSQL,
    'window': _window.namedWindowExprListToSQL
  };
  _exports.exprToSQLConvertFn = exprToSQLConvertFn;
  function varToSQL(expr) {
    const {
      prefix = '@',
      name,
      members,
      keyword,
      suffix
    } = expr;
    const val = [];
    if (keyword) val.push(keyword);
    const varName = members && members.length > 0 ? `${name}.${members.join('.')}` : name;
    let result = `${prefix || ''}${varName}`;
    if (suffix) result += suffix;
    val.push(result);
    return val.join(' ');
  }
  exprToSQLConvertFn.var = varToSQL;
  function exprToSQL(exprOrigin) {
    if (!exprOrigin) return;
    const expr = exprOrigin;
    if (exprOrigin.ast) {
      const {
        ast
      } = expr;
      Reflect.deleteProperty(expr, ast);
      for (const key of Object.keys(ast)) {
        expr[key] = ast[key];
      }
    }
    return exprToSQLConvertFn[expr.type] ? exprToSQLConvertFn[expr.type](expr) : (0, _util.literalToSQL)(expr);
  }
  function unaryToSQL(unarExpr) {
    const {
      operator,
      parentheses,
      expr
    } = unarExpr;
    const space = operator === '-' || operator === '+' ? '' : ' ';
    const str = `${operator}${space}${exprToSQL(expr)}`;
    return parentheses ? `(${str})` : str;
  }
  function getExprListSQL(exprList) {
    if (!exprList) return [];
    return exprList.map(exprToSQL);
  }
  exprToSQLConvertFn.expr_list = expr => {
    const str = getExprListSQL(expr.value);
    return expr.parentheses ? `(${str.join(', ')})` : str;
  };
  exprToSQLConvertFn.select = expr => {
    const str = typeof expr._next === 'object' ? (0, _union.unionToSQL)(expr) : (0, _select.selectToSQL)(expr);
    return expr.parentheses ? `(${str})` : str;
  };
  exprToSQLConvertFn.unary_expr = unaryToSQL;
  function orderOrPartitionByToSQL(expr, prefix) {
    if (!Array.isArray(expr)) return '';
    let expressions = [];
    const upperPrefix = (0, _util.toUpper)(prefix);
    switch (upperPrefix) {
      case 'ORDER BY':
        expressions = expr.map(info => [exprToSQL(info.expr), info.type, (0, _util.toUpper)(info.nulls)].filter(_util.hasVal).join(' '));
        break;
      case 'PARTITION BY':
        expressions = expr.map(info => exprToSQL(info.expr));
        break;
      default:
        expressions = expr.map(info => exprToSQL(info.expr));
        break;
    }
    return (0, _util.connector)(upperPrefix, expressions.join(', '));
  }
});