(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./util", "./index-definition", "./column"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./util"), require("./index-definition"), require("./column"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.util, global.indexDefinition, global.column);
    global.constrain = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _util, _indexDefinition, _column) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.constraintDefinitionToSQL = constraintDefinitionToSQL;
  function constraintDefinitionToSQL(constraintDefinition) {
    if (!constraintDefinition) return;
    const {
      constraint,
      constraint_type: constraintType,
      enforced,
      index,
      keyword,
      reference_definition: referenceDefinition
    } = constraintDefinition;
    const constraintSQL = [];
    constraintSQL.push((0, _util.toUpper)(keyword));
    constraintSQL.push((0, _util.identifierToSql)(constraint));
    constraintSQL.push((0, _util.toUpper)(constraintType));
    constraintSQL.push((0, _util.identifierToSql)(index));
    constraintSQL.push(...(0, _indexDefinition.indexTypeAndOptionToSQL)(constraintDefinition));
    constraintSQL.push(...(0, _column.columnReferenceDefinitionToSQL)(referenceDefinition));
    constraintSQL.push((0, _util.toUpper)(enforced));
    return constraintSQL.filter(_util.hasVal).join(' ');
  }
});