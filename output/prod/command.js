(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./alter", "./column", "./create", "./util", "./expr", "./tables"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./alter"), require("./column"), require("./create"), require("./util"), require("./expr"), require("./tables"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.alter, global.column, global.create, global.util, global.expr, global.tables);
    global.command = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _alter, _column, _create, _util, _expr, _tables) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.callToSQL = callToSQL;
  _exports.commonCmdToSQL = commonCmdToSQL;
  _exports.declareToSQL = declareToSQL;
  _exports.descToSQL = descToSQL;
  _exports.lockUnlockToSQL = lockUnlockToSQL;
  _exports.renameToSQL = renameToSQL;
  _exports.setVarToSQL = setVarToSQL;
  _exports.useToSQL = useToSQL;
  function callToSQL(stmt) {
    const type = 'CALL';
    const storeProcessCall = (0, _expr.exprToSQL)(stmt.expr);
    return `${type} ${storeProcessCall}`;
  }
  function commonCmdToSQL(stmt) {
    const {
      type,
      keyword,
      name,
      prefix
    } = stmt;
    const clauses = [(0, _util.toUpper)(type), (0, _util.toUpper)(keyword), (0, _util.toUpper)(prefix)];
    switch (keyword) {
      case 'table':
        clauses.push((0, _tables.tablesToSQL)(name));
        break;
      case 'procedure':
        clauses.push((0, _util.identifierToSql)(name));
        break;
      case 'index':
        clauses.push((0, _column.columnRefToSQL)(name), 'ON', (0, _tables.tableToSQL)(stmt.table), stmt.options && stmt.options.map(_alter.alterExprToSQL).filter(_util.hasVal).join(' '));
        break;
      default:
        break;
    }
    return clauses.filter(_util.hasVal).join(' ');
  }
  function descToSQL(stmt) {
    const {
      type,
      table
    } = stmt;
    const action = (0, _util.toUpper)(type);
    return `${action} ${(0, _util.identifierToSql)(table)}`;
  }
  function renameToSQL(stmt) {
    const {
      type,
      table
    } = stmt;
    const clauses = [];
    const prefix = `${type && type.toUpperCase()} TABLE`;
    if (table) {
      for (const tables of table) {
        const renameInfo = tables.map(_tables.tableToSQL);
        clauses.push(renameInfo.join(' TO '));
      }
    }
    return `${prefix} ${clauses.join(', ')}`;
  }
  function useToSQL(stmt) {
    const {
      type,
      db
    } = stmt;
    const action = (0, _util.toUpper)(type);
    const database = (0, _util.identifierToSql)(db);
    return `${action} ${database}`;
  }
  function setVarToSQL(stmt) {
    const {
      expr
    } = stmt;
    const action = 'SET';
    const val = (0, _expr.exprToSQL)(expr);
    return `${action} ${val}`;
  }
  function pgLock(stmt) {
    const {
      lock_mode: lockMode,
      nowait
    } = stmt;
    const lockInfo = [];
    if (lockMode) {
      const {
        mode
      } = lockMode;
      lockInfo.push(mode.toUpperCase());
    }
    if (nowait) lockInfo.push(nowait.toUpperCase());
    return lockInfo;
  }
  function lockUnlockToSQL(stmt) {
    const {
      type,
      keyword,
      tables
    } = stmt;
    const result = [type.toUpperCase(), (0, _util.toUpper)(keyword)];
    if (type.toUpperCase() === 'UNLOCK') return result.join(' ');
    const tableStmt = [];
    for (const tableInfo of tables) {
      const {
        table,
        lock_type: lockType
      } = tableInfo;
      const tableInfoTemp = [(0, _tables.tableToSQL)(table)];
      if (lockType) {
        const lockKeyList = ['prefix', 'type', 'suffix'];
        tableInfoTemp.push(lockKeyList.map(key => (0, _util.toUpper)(lockType[key])).filter(_util.hasVal).join(' '));
      }
      tableStmt.push(tableInfoTemp.join(' '));
    }
    result.push(tableStmt.join(', '), ...pgLock(stmt));
    return result.filter(_util.hasVal).join(' ');
  }
  function declareToSQL(stmt) {
    const {
      type,
      declare
    } = stmt;
    const result = [(0, _util.toUpper)(type)];
    const info = declare.map(dec => {
      const {
        at,
        name,
        as,
        prefix,
        definition,
        keyword
      } = dec;
      const declareInfo = [`${at}${name}`, (0, _util.toUpper)(as)];
      switch (keyword) {
        case 'variable':
          declareInfo.push((0, _column.columnDataType)(prefix));
          if (definition) declareInfo.push('=', (0, _expr.exprToSQL)(definition));
          break;
        case 'cursor':
          declareInfo.push((0, _util.toUpper)(prefix));
          break;
        case 'table':
          declareInfo.push((0, _util.toUpper)(prefix), `(${definition.map(_create.createDefinitionToSQL).join(', ')})`);
          break;
        default:
          break;
      }
      return declareInfo.filter(_util.hasVal).join(' ');
    }).join(', ');
    result.push(info);
    return result.join(' ');
  }
});