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
    global.aggregation = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _util, _over) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.aggrToSQL = aggrToSQL;
  function aggrToSQL(expr) {
    /** @type {Object} */
    const {
      args,
      over,
      orderby,
      within_group_orderby
    } = expr;
    let str = (0, _expr.exprToSQL)(args.expr);
    const fnName = expr.name;
    const overStr = (0, _over.overToSQL)(over);
    if (args.distinct) {
      let separator = ' ';
      const distinctSQL = ['DISTINCT', '', str];
      if (args.parentheses) {
        separator = '';
        distinctSQL[1] = '(';
        distinctSQL.push(')');
      }
      str = distinctSQL.filter(_util.hasVal).join(separator);
    }
    if (args.orderby) str = `${str} ${(0, _expr.orderOrPartitionByToSQL)(args.orderby, 'order by')}`;
    if (orderby) str = `${str} ${(0, _expr.orderOrPartitionByToSQL)(orderby, 'order by')}`;
    const withinGroup = within_group_orderby ? `WITHIN GROUP (${(0, _expr.orderOrPartitionByToSQL)(within_group_orderby, 'order by')})` : '';
    return [`${fnName}(${str})`, withinGroup, overStr].filter(_util.hasVal).join(' ');
  }
});