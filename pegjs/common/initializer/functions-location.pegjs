// Common initializer functions shared across SQL dialects
// These functions include location tracking in createBinaryExpr
// Note: This file content is meant to be imported inside { } initializer block

  // Helper function to get location object for AST nodes
  function getLocationObject() {
    if (!options.includeLocations) return {}
    const loc = location()
    // Remove source property added by peggy for backwards compatibility
    return { loc: { start: loc.start, end: loc.end } }
  }

  // Create a unary expression node
  function createUnaryExpr(op, e) {
    return {
      type: 'unary_expr',
      operator: op,
      expr: e
    };
  }

  // Create a binary expression node (with location tracking)
  function createBinaryExpr(op, left, right) {
    return {
      type: 'binary_expr',
      operator: op,
      left: left,
      right: right,
      ...getLocationObject(),
    };
  }

  // Check if a number string represents a BigInt
  function isBigInt(numberStr) {
    const previousMaxSafe = BigInt(Number.MAX_SAFE_INTEGER)
    const num = BigInt(numberStr)
    if (num < previousMaxSafe) return false
    return true
  }

  // Create a list from head and tail pattern (common in PEG grammars)
  function createList(head, tail, po = 3) {
    const result = [head];
    for (let i = 0; i < tail.length; i++) {
      delete tail[i][po].tableList
      delete tail[i][po].columnList
      result.push(tail[i][po]);
    }
    return result;
  }

  // Create a chain of binary expressions
  function createBinaryExprChain(head, tail) {
    let result = head;
    for (let i = 0; i < tail.length; i++) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3]);
    }
    return result;
  }

  // Query table alias from the alias map
  function queryTableAlias(tableName) {
    const alias = tableAlias[tableName]
    if (alias) return alias
    if (tableName) return tableName
    return null
  }

  // Convert column list with table aliases
  function columnListTableAlias(columnList) {
    const newColumnsList = new Set()
    const symbolChar = '::'
    for(let column of columnList.keys()) {
      const columnInfo = column.split(symbolChar)
      if (!columnInfo) {
        newColumnsList.add(column)
        break
      }
      if (columnInfo && columnInfo[1]) columnInfo[1] = queryTableAlias(columnInfo[1])
      newColumnsList.add(columnInfo.join(symbolChar))
    }
    return Array.from(newColumnsList)
  }

  // Refresh column list with updated aliases
  function refreshColumnList(columnList) {
    const columns = columnListTableAlias(columnList)
    columnList.clear()
    columns.forEach(col => columnList.add(col))
  }

  // Comparison prefix map for expression parsing
  const cmpPrefixMap = {
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '>': true,
    '<': true,
    '!': true,
    '=': true,
    // between
    'B': true,
    'b': true,
    // for is or in
    'I': true,
    'i': true,
    // for like
    'L': true,
    'l': true,
    // for not
    'N': true,
    'n': true
  };

