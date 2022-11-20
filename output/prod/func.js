(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./expr", "./util", "./over"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./expr"), require("./util"), require("./over"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.expr, global.util, global.over);
    global.func = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _util, _over) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.castToSQL = castToSQL;
  _exports.extractFunToSQL = extractFunToSQL;
  _exports.funcToSQL = funcToSQL;
  function arrayDimensionToSymbol(target) {
    if (!target || !target.array) return '';
    switch (target.array) {
      case 'one':
        return '[]';
      case 'two':
        return '[][]';
    }
  }
  function castToSQL(expr) {
    const {
      collate,
      target,
      expr: expression,
      symbol,
      as: alias,
      tail
    } = expr;
    const {
      length,
      dataType,
      parentheses,
      scale,
      suffix: dataTypeSuffix
    } = target;
    let str = '';
    if (length != null) str = scale ? `${length}, ${scale}` : length;
    if (parentheses) str = `(${str})`;
    if (dataTypeSuffix && dataTypeSuffix.length) str += ` ${dataTypeSuffix.join(' ')}`;
    let prefix = (0, _expr.exprToSQL)(expression);
    let symbolChar = '::';
    let suffix = '';
    if (symbol === 'as') {
      prefix = `CAST(${prefix}`;
      suffix = ')';
      symbolChar = ` ${symbol.toUpperCase()} `;
    }
    if (tail) suffix += ` ${tail.operator} ${(0, _expr.exprToSQL)(tail.expr)}`;
    if (alias) suffix += ` AS ${(0, _util.identifierToSql)(alias)}`;
    if (collate) suffix += ` ${(0, _util.commonTypeValue)(collate).join(' ')}`;
    const arrayDimension = arrayDimensionToSymbol(target);
    return `${prefix}${symbolChar}${dataType}${arrayDimension}${str}${suffix}`;
  }
  function extractFunToSQL(stmt) {
    const {
      args,
      type
    } = stmt;
    const {
      field,
      cast_type: castType,
      source
    } = args;
    const result = [`${(0, _util.toUpper)(type)}(${(0, _util.toUpper)(field)}`, 'FROM', (0, _util.toUpper)(castType), (0, _expr.exprToSQL)(source)];
    return `${result.filter(_util.hasVal).join(' ')})`;
  }
  function funcToSQL(expr) {
    const {
      args,
      name,
      args_parentheses
    } = expr;
    const {
      parentheses,
      over,
      collate
    } = expr;
    const collateStr = (0, _util.commonTypeValue)(collate).join(' ');
    const overStr = (0, _over.overToSQL)(over);
    if (!args) return [name, overStr].filter(_util.hasVal).join(' ');
    let separator = ', ';
    if ((0, _util.toUpper)(name) === 'TRIM') separator = ' ';
    let str = [name];
    str.push(args_parentheses === false ? ' ' : '(');
    str.push((0, _expr.exprToSQL)(args).join(separator));
    if (args_parentheses !== false) str.push(')');
    str = str.join('');
    return [parentheses ? `(${str})` : str, collateStr, overStr].filter(_util.hasVal).join(' ');
  }
});