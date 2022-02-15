{
  const reservedMap = {
    'ARRAY': true,
    'ALTER': true,
    'ALL': true,
    'ADD': true,
    'AND': true,
    'AS': true,
    'ASC': true,

    'BETWEEN': true,
    'BY': true,

    'CALL': true,
    'CASE': true,
    'CREATE': true,
    'CROSS': true,
    'CONTAINS': true,
    'CURRENT_DATE': true,
    'CURRENT_TIME': true,
    'CURRENT_TIMESTAMP': true,
    'CURRENT_USER': true,

    'DELETE': true,
    'DESC': true,
    'DISTINCT': true,
    'DROP': true,

    'ELSE': true,
    'END': true,
    'EXISTS': true,
    'EXPLAIN': true,

    'FALSE': true,
    'FROM': true,
    'FULL': true,
    'FOR': true,

    'GROUP': true,

    'HAVING': true,

    'IN': true,
    'INNER': true,
    'INSERT': true,
    'INTO': true,
    'IS': true,

    'JOIN': true,
    'JSON': true,

    'KEY': true,

    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,
    'LOW_PRIORITY': true, // for lock table

    'NOT': true,
    'NULL': true,

    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'PARTITION': true,
    'PIVOT': true,

    'RECURSIVE': true,
    'RENAME': true,
    'READ': true, // for lock table
    'RIGHT': true,

    'SELECT': true,
    'SESSION_USER': true,
    'SET': true,
    'SHOW': true,
    'SYSTEM_USER': true,

    'TABLE': true,
    'THEN': true,
    'TRUE': true,
    'TRUNCATE': true,
    'TYPE': true,   // reserved (MySQL)

    'UNION': true,
    'UPDATE': true,
    'USING': true,

    'VALUES': true,

    'WINDOW': true,
    'WITH': true,
    'WHEN': true,
    'WHERE': true,
    'WRITE': true, // for lock table

    'GLOBAL': true,
    'SESSION': true,
    'LOCAL': true,
    'PERSIST': true,
    'PERSIST_ONLY': true,
    'UNNEST': true,
  };

  const DATA_TYPES = {
    'BOOL': true,
    'BYTE': true,
    'DATE': true,
    'DATETIME': true,
    'FLOAT64': true,
    'INT64': true,
    'NUMERIC': true,
    'STRING': true,
    'TIME': true,
    'TIMESTAMP': true,
    'ARRAY': true,
    'STRUCT': true,
  }

  function createUnaryExpr(op, e) {
    return {
      type: 'unary_expr',
      operator: op,
      expr: e
    };
  }

  function createBinaryExpr(op, left, right) {
    return {
      type: 'binary_expr',
      operator: op,
      left: left,
      right: right
    };
  }

  function isBigInt(numberStr) {
    const previousMaxSafe = BigInt(Number.MAX_SAFE_INTEGER)
    const num = BigInt(numberStr)
    if (num < previousMaxSafe) return false
    return true
  }

  function createList(head, tail, po = 3) {
    const result = [head];
    for (let i = 0; i < tail.length; i++) {
      delete tail[i][po].tableList
      delete tail[i][po].columnList
      result.push(tail[i][po]);
    }
    return result;
  }

  function createBinaryExprChain(head, tail) {
    let result = head;
    for (let i = 0; i < tail.length; i++) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3]);
    }
    return result;
  }

  function queryTableAlias(tableName) {
    const alias = tableAlias[tableName]
    if (alias) return alias
    if (tableName) return tableName
    return null
  }

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

  function refreshColumnList(columnList) {
    const columns = columnListTableAlias(columnList)
    columnList.clear()
    columns.forEach(col => columnList.add(col))
  }

  const cmpPrefixMap = {
    '+': true,
    '-': true,
    '*': true,
    '/': true,
    '>': true,
    '<': true,
    '!': true,
    '=': true,

    //between
    'B': true,
    'b': true,
    //for is or in
    'I': true,
    'i': true,
    //for like
    'L': true,
    'l': true,
    //for not
    'N': true,
    'n': true
  };

  // used for dependency analysis
  let varList = [];

  const tableList = new Set();
  const columnList = new Set();
  const tableAlias = {};
}

start
  = __ n:(multiple_stmt / query_statement) {
    return n
  }

multiple_stmt
  = head:query_statement tail:(__ SEMICOLON __ query_statement)+ {
      const cur = [head && head.ast || head];
      for (let i = 0; i < tail.length; i++) {
        if(!tail[i][3] || tail[i][3].length === 0) continue;
        cur.push(tail[i][3] && tail[i][3].ast || tail[i][3]);
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: cur
      }
    }

query_statement
  = query_expr
  / s:('(' __ select_stmt __ ')') {
      return {
        ...s[2],
        parentheses: true,
      }
    }

query_expr
  = cte:with_clause? __
  s:union_stmt __
  o:order_by_clause?  __
  l:limit_clause? __
  se:SEMICOLON? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'bigquery',
        with: cte,
        select: s && s.ast,
        orderby: o,
        limit: l,
        parentheses: s && s.parentheses || false,
      }
    }
  }

set_op
  = u:KW_UNION __ s:(KW_ALL / KW_DISTINCT)? {
    return s ? `union ${s.toLowerCase()}` : 'union'
  }
  / u:('INTERSECT'i / 'EXCEPT'i) __ s:KW_DISTINCT {
    return `${u.toLowerCase()} ${s.toLowerCase()}`
  }

union_stmt
  = union_stmt_nake
  / s:('(' __ union_stmt_nake __ ')') {
      return {
        ...s[2],
        parentheses: true
      }
    }

union_stmt_nake
  = head:select_stmt tail:(__ set_op? __ select_stmt)* {
      let cur = head
      for (let i = 0; i < tail.length; i++) {
        cur._next = tail[i][3]
        cur.union = tail[i][1]
        cur = cur._next
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: head
      }
    }
select_stmt
  = select_stmt_nake
  / s:('(' __ select_stmt __ ')') {
      return {
        ...s[2],
        parentheses_symbol: true
      }
    }

with_clause
  = KW_WITH __ head:cte_definition tail:(__ COMMA __ cte_definition)* {
      return createList(head, tail);
    }

cte_definition
  = name:(literal_string / ident_name) __ KW_AS __ LPAREN __ stmt:union_stmt __ RPAREN {
    if (typeof name === 'string') name = { type: 'default', value: name }
    return { name, stmt };
  }

select_stmt_nake
  = __ cte:with_clause? __ KW_SELECT ___
    sv:struct_value? __
    d:(KW_ALL / KW_DISTINCT)? __
    c:column_clause     __
    f:from_clause?      __
    fs:for_sys_time_as_of? __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
    o:order_by_clause?  __
    l:limit_clause? __
    win:window_clause? {
      if(Array.isArray(f)) f.forEach(info => info.table && tableList.add(`select::${info.db}::${info.table}`));
      return {
          type: 'select',
          as_struct_val: sv,
          distinct: d,
          columns: c,
          from: f,
          for_sys_time_as_of: fs,
          where: w,
          with: cte,
          groupby: g,
          having: h,
          orderby: o,
          limit: l,
          window:win,
      };
  }

for_sys_time_as_of
  = 'FOR'i __ 'SYSTEM_TIME'i __ 'AS'i __ 'OF'i __ e:expr {
    return {
      keyword: 'for system_time as of',
      expr: e
    }
  }
struct_value
  = a:KW_AS __ k:(KW_STRUCT / KW_VALUE) {
    return `${a[0].toLowerCase()} ${k.toLowerCase()}`
  }

expr_alias
  = e:expr __ alias:alias_clause? {
      return { expr: e, as:alias };
    }

column_clause
  = STAR __ k:('EXCEPT'i / 'REPLACE'i) __ LPAREN __ c:columns_list __ RPAREN {
    columnList.add('select::null::(.*)')
    return {
      expr_list: c,
      parentheses: true,
      star: '*',
      type: k.toLowerCase(),
    }
  }
  / head: (KW_ALL / (STAR !ident_start) / STAR) tail:(__ COMMA __ column_list_item)* __ COMMA? {
      columnList.add('select::null::(.*)');
      if (tail && tail.length > 0) {
        head[0] = {
          expr: {
            type: 'column_ref',
            table: null,
            column: '*'
          },
          as: null
        };
        return createList(head[0], tail);
      }
      return head[0];
    }
  / c:columns_list __ COMMA? {
    return c
  }

columns_list
  = head:column_list_item tail:(__ COMMA __ column_list_item)* {
      return createList(head, tail);
    }

column_offset_expr
  = n:expr __ LBRAKE __ t:(KW_OFFSET / KW_ORDINAL) __ LPAREN __ l:literal_numeric __ RPAREN __ RBRAKE {
    return {
      expr: n,
      offset: `[${t}(${l.value})]`
    }
  }

column_list_item
  = tbl:STAR {
      columnList.add('select::null::(.*)');
      return {
        expr: {
          type: 'column_ref',
          table: null,
          column: '*'
        },
        as: null
      };
    }
  / tbl:ident __ DOT pro:((column_offset_expr / ident) __ DOT)? __ STAR {
      columnList.add(`select::${tbl}::(.*)`)
      let column = '*'
      const mid = pro && pro[0]
      if (typeof mid === 'string') column = `${mid}.*`
      if (mid && mid.expr && mid.offset) column = { ...mid, suffix: '.*' }
      return {
        expr: {
          type: 'column_ref',
          table: tbl,
          column,
        },
        as: null
      }
    }
  / c:column_offset_expr __ as:alias_clause? {
    return {
        expr: {
          type: 'column_ref',
          table: null,
          column: c
        },
        as: as
      }
  }
  / expr_alias

alias_clause
  = KW_AS __ i:alias_ident { return i; }
  / KW_AS? __ i:ident { return i; }

from_unnest_item
  = 'UNNEST'i __ LPAREN __ a:expr? __ RPAREN __ alias:alias_clause? __ wf:with_offset? {
    return {
      type: 'unnest',
      expr: a,
      parentheses: true,
      as:alias,
      with_offset: wf,
    }
  }

from_clause
  = KW_FROM __ l:table_ref_list __ op:pivot_operator? {
    if (l[0]) l[0].operator = op
    return l
  }

pivot_operator
  = KW_PIVOT __ LPAREN __ a:aggr_func_list __ 'FOR'i __ c:column_ref __ i:in_op_right __ RPAREN __ as:alias_clause? {
    i.operator = '='
    return {
      'type': 'pivot',
      'expr': a,
      column: c,
      in_expr: i,
      as,
    }
  }

with_offset
  = KW_WITH __ KW_OFFSET __ alias:alias_clause? {
    return {
      keyword: 'with offset as',
      as: alias
    }
  }
table_to_list
  = head:table_to_item tail:(__ COMMA __ table_to_item)* {
      return createList(head, tail);
    }

table_to_item
  = head:table_name __ KW_TO __ tail: (table_name) {
      return [head, tail]
    }

table_ref_list
  = head:table_base
    tail:table_ref* {
      tail.unshift(head);
      tail.forEach(tableInfo => {
        const { table, as } = tableInfo
        tableAlias[table] = table
        if (as) tableAlias[as] = table
        refreshColumnList(columnList)
      })
      return tail;
    }

table_ref
  = __ COMMA __ t:table_base { return t; }
  / __ t:table_join { return t; }


table_join
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
      t.join = op;
      t.on   = expr;
      return t;
    }
  / op:join_op __ LPAREN __ stmt:union_stmt __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
    stmt.parentheses = true;
    return {
      expr: stmt,
      as: alias,
      join: op,
      on: expr
    };
  }

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = t:table_name __ alias:alias_clause? {
      if (t.type === 'var') {
        t.as = alias;
        return t;
      } else {
        return {
          db: t.db,
          table: t.table,
          as: alias
        };
      }
    }
  / LPAREN __ stmt:union_stmt __ RPAREN __ alias:alias_clause? {
      stmt.parentheses = true;
      return {
        expr: stmt,
        as: alias
      };
    }
  / from_unnest_item

join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { return 'FULL JOIN'; }
  / k:KW_CROSS __ KW_JOIN { return `${k[0].toUpperCase()} JOIN`; }
  / k:KW_INNER? __ KW_JOIN { return k ? `${k[0].toUpperCase()} JOIN` : 'JOIN'; }

table_name
  = project:ident dt:(__ DOT __ ident) tail:(__ DOT __ ident) {
      const obj = { db: null, table: project };
      if (tail !== null) {
        obj.db = `${project}.${dt[3]}`;
        obj.table = tail[3];
      }
      return obj;
    }
  / dt:ident tail:(__ DOT __ ident)? {
      const obj = { db: null, table: dt };
      if (tail !== null) {
        obj.db = dt;
        obj.table = tail[3];
      }
      return obj;
    }

on_clause
  = KW_ON __ e:or_and_where_expr { return e; }

where_clause
  = KW_WHERE __ e:or_and_where_expr { return e; }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list { return e.value; }

having_clause
  = KW_HAVING __ e:expr { return e; }

window_clause
  = KW_WINDOW __ l:named_window_expr_list {
    return {
      keyword: 'window',
      type: 'window',
      expr: l,
    }
  }

named_window_expr_list
  = head:named_window_expr tail:(__ COMMA __ named_window_expr)* {
      return createList(head, tail);
    }

named_window_expr
  = nw:ident_name __ KW_AS __ anw:as_window_specification {
    return {
      name: nw,
      as_window_specification: anw,
    }
  }

as_window_specification
  = n:ident_name { return n }
  / LPAREN __ ws:window_specification? __ RPAREN {
    return {
      window_specification: ws,
      parentheses: true
    }
  }

window_specification
  = n:ident? __
  bc:partition_by_clause? __
  l:order_by_clause? __
  w:window_frame_clause? {
    return {
      name: n,
      partitionby: bc,
      orderby: l,
      window_frame_clause: w
    }
  }

window_frame_clause
  = 'RANGE'i __ KW_BETWEEN 'UNBOUNDED'i __ 'PRECEDING'i __ KW_AND __ 'CURRENT'i __ 'ROW' {
    return 'range between unbounded preceding and current row'
  }
  / kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    // => string
    return `rows ${s.value}`
  }
  / KW_ROWS __ KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:window_frame_following {
    // => string
    return `rows between ${p.value} and ${f.value}`
  }

window_frame_following
  = s:window_frame_value __ 'FOLLOWING'i  {
    // => string
    s.value += ' FOLLOWING'
    return s
  }
  / window_frame_current_row

window_frame_preceding
  = s:window_frame_value __ 'PRECEDING'i  {
    // => string
    s.value += ' PRECEDING'
    return s
  }
  / window_frame_current_row

window_frame_current_row
  = 'CURRENT'i __ 'ROW'i {
    // => { type: 'single_quote_string'; value: string }
    return { type: 'single_quote_string', value: 'current row' }
  }

window_frame_value
  = s:'UNBOUNDED'i {
    // => literal_string
    return { type: 'single_quote_string', value: s.toUpperCase() }
  }
  / literal_numeric

partition_by_clause
  = KW_PARTITION __ KW_BY __ bc:column_clause { return bc; }

order_by_clause
  = KW_ORDER __ KW_BY __ l:order_by_list { return l; }

order_by_list
  = head:order_by_element tail:(__ COMMA __ order_by_element)* {
      return createList(head, tail);
    }

order_by_element
  = e:expr __ d:(KW_DESC / KW_ASC)? {
    const obj = { expr: e, type: 'ASC' };
    if (d === 'DESC') obj.type = 'DESC';
    return obj;
  }

number_or_param
  = literal_numeric
  / param

limit_clause
  = KW_LIMIT __ i1:(number_or_param) __ tail:((COMMA / KW_OFFSET) __ number_or_param)? {
      const res = [i1];
      if (tail) res.push(tail[2]);
      return {
        seperator: tail && tail[0] && tail[0].toLowerCase() || '',
        value: res
      };
    }

/**
 * here only use `additive_expr` to support 'col1 = col1+2'
 * if you want to use lower operator, please use '()' like below
 * 'col1 = (col2 > 3)'
 */

expr_list
  = head:expr tail:(__ COMMA __ expr)* {
      const el = { type: 'expr_list' };
      el.value = createList(head, tail);
      return el;
    }

expr
  = struct_expr
  / logic_operator_expr // support concatenation operator || and &&
  / or_expr
  / unary_expr
  / union_stmt
  / array_expr

parentheses_list_expr
  = head:parentheses_expr tail:(__ COMMA __ parentheses_expr)* {
      return createList(head, tail);
    }

parentheses_expr
  = LPAREN __ c:column_clause __ RPAREN {
    return c
  }

array_expr
  = LBRAKE __ c:column_clause __ RBRAKE {
    return {
      array_path: c,
      type: 'array',
      keyword: '',
      parentheses: true
    }
  }
  / s:(array_type / KW_ARRAY)? LBRAKE __ c:literal_list __ RBRAKE {
    return {
      definition: s,
      array_path: c.map(l => ({ expr: l, as: null })),
      type: 'array',
      keyword: s && 'array',
      parentheses: true
    }
  }
  / s:(array_type / KW_ARRAY)? __ (LBRAKE / LPAREN) __ c:(parentheses_list_expr / expr) __ (RBRAKE / RPAREN) {
    return {
      definition: s,
      expr_list: c,
      type: 'array',
      keyword: s && 'array',
      parentheses: true
    }
  }

struct_expr
  = s:(struct_type / KW_STRUCT) __ LPAREN __ c:column_clause __ RPAREN {
    return {
      definition: s,
      expr_list: c,
      type: 'struct',
      keyword: s && 'struct',
      parentheses: true
    }
  }

logic_operator_expr
  = head:primary tail:(__ LOGIC_OPERATOR __ primary)+ {
    return createBinaryExprChain(head, tail);
  }

unary_expr
  = op: additive_operator tail: (__ primary)+ {
    return createUnaryExpr(op, tail[0][1]);
  }

or_and_where_expr
	= head:expr tail:(__ (KW_AND / KW_OR / COMMA) __ expr)* {
    let result = head;
    let seperator = ''
    for (let i = 0; i < tail.length; i++) {
      if (tail[i][1] === ',') {
        seperator = ','
        if (!Array.isArray(result)) result = [result]
        result.push(tail[i][3])
      } else {
        result = createBinaryExpr(tail[i][1], result, tail[i][3]);
      }
    }
    if (seperator === ',') {
      const el = { type: 'expr_list' };
      el.value = result
      return el
    }
    return result;
  }


or_expr
  = head:and_expr tail:(___ KW_OR __ and_expr)* {
      return createBinaryExprChain(head, tail);
    }

and_expr
  = head:not_expr tail:(___ KW_AND __ not_expr)* {
      return createBinaryExprChain(head, tail);
    }

//here we should use `NOT` instead of `comparision_expr` to support chain-expr
not_expr
  = comparison_expr
  / exists_expr
  / (KW_NOT / "!" !"=") __ expr:not_expr {
      return createUnaryExpr('NOT', expr);
    }

comparison_expr
  = left:additive_expr __ rh:comparison_op_right? {
      if (rh === null) return left;
      else if (rh.type === 'arithmetic') return createBinaryExprChain(left, rh.tail);
      else return createBinaryExpr(rh.op, left, rh.right);
    }
  / literal_string
  / column_ref

exists_expr
  = op:exists_op __ LPAREN __ stmt:union_stmt __ RPAREN {
    stmt.parentheses = true;
    return createUnaryExpr(op, stmt);
  }

exists_op
  = nk:(KW_NOT __ KW_EXISTS) { return nk[0] + ' ' + nk[2]; }
  / KW_EXISTS

comparison_op_right
  = arithmetic_op_right
  / in_op_right
  / between_op_right
  / is_op_right
  / like_op_right

arithmetic_op_right
  = l:(__ arithmetic_comparison_operator __ additive_expr)+ {
      return { type: 'arithmetic', tail: l };
    }

arithmetic_comparison_operator
  = ">=" / ">" / "<=" / "<>" / "<" / "=" / "!="

is_op_right
  = KW_IS __ right:additive_expr {
      return { op: 'IS', right: right };
    }
  / (KW_IS __ KW_NOT) __ right:additive_expr {
      return { op: 'IS NOT', right: right };
  }

between_op_right
  = op:between_or_not_between_op __  begin:additive_expr __ KW_AND __ end:additive_expr {
      return {
        op: op,
        right: {
          type: 'expr_list',
          value: [begin, end]
        }
      };
    }

between_or_not_between_op
  = nk:(KW_NOT __ KW_BETWEEN) { return nk[0] + ' ' + nk[2]; }
  / KW_BETWEEN

like_op
  = nk:(KW_NOT __ KW_LIKE) { return nk[0] + ' ' + nk[2]; }
  / KW_LIKE

in_op
  = nk:(KW_NOT __ KW_IN) { return nk[0] + ' ' + nk[2]; }
  / KW_IN

like_op_right
  = op:like_op __ right:(literal / comparison_expr) {
      return { op: op, right: right };
    }

in_op_right
  = op:in_op __ LPAREN  __ l:expr_list __ RPAREN {
      return { op: op, right: l };
    }
  / op:in_op __ e:(literal_string) {
      return { op: op, right: e };
    }

additive_expr
  = head:multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

multiplicative_expr
  = head:primary
    tail:(__ multiplicative_operator  __ primary)* {
      return createBinaryExprChain(head, tail)
    }

multiplicative_operator
  = "*" / "/" / "%"

primary
  = cast_expr
  / literal
  / aggr_func
  / func_call
  / case_expr
  / interval_expr
  / column_ref
  / param
  / LPAREN __ list:or_and_where_expr __ RPAREN {
        list.parentheses = true;
        return list;
    }

interval_expr
  = KW_INTERVAL                    __
    e:expr                       __
    u: interval_unit {
      return {
        type: 'interval',
        expr: e,
        unit: u.toLowerCase(),
      }
    }

case_expr
  = KW_CASE                         __
    condition_list:case_when_then+  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: null,
        args: condition_list
      };
    }
  / KW_CASE                         __
    expr:expr                      __
    condition_list:case_when_then+  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: expr,
        args: condition_list
      };
    }

case_when_then
  = KW_WHEN __ condition:or_and_where_expr __ KW_THEN __ result:expr {
    return {
      type: 'when',
      cond: condition,
      result: result
    };
  }

case_else = KW_ELSE __ result:expr {
    return { type: 'else', result: result };
  }

column_ref
  = tbl:ident __ DOT __ col:column_without_kw {
      columnList.add(`select::${tbl}::${col}`);
      return {
        type: 'column_ref',
        table: tbl,
        column: col
      };
    }
  / col:column {
      columnList.add(`select::null::${col}`);
      return {
        type: 'column_ref',
        table: null,
        column: col
      };
    }

column_list
  = head:column tail:(__ COMMA __ column)* {
      return createList(head, tail);
    }

ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      return name;
    }
  / name:quoted_ident {
      return name;
    }

alias_ident
  = name:ident_name !{
      if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
      return false
    } {
      return name;
    }
  / name:quoted_ident {
      return name;
    }

quoted_ident
  = double_quoted_ident
  / single_quoted_ident
  / backticks_quoted_ident

double_quoted_ident
  = '"' chars:[^"]+ '"' { return chars.join(''); }

single_quoted_ident
  = "'" chars:[^']+ "'" { return chars.join(''); }

backticks_quoted_ident
  = "`" chars:[^`]+ "`" { return `\`${chars.join('')}\``; }

column_without_kw
  = name:column_name {
    return name;
  }
  / quoted_ident

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / quoted_ident

column_name
  =  start:ident_start parts:column_part* { return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* { return start + parts.join(''); }

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_-]

// to support column name like `cf1:name` in hbase
column_part  = [A-Za-z0-9_:]

param
  = l:(':' ident_name) {
      return { type: 'param', value: l[1] };
    }

aggr_func_list
  = head:aggr_func __ as:alias_clause? tail:(__ COMMA __ aggr_func __ alias_clause?)* {
      const el = { type: 'expr_list' };
      el.value = createList(head, tail);
      return el;
  }

aggr_func
  = aggr_fun_count
  / aggr_fun_smma

aggr_fun_smma
  = name:KW_SUM_MAX_MIN_AVG  __ LPAREN __ e:additive_expr __ RPAREN __ bc:over_partition? {
      return {
        type: 'aggr_func',
        name: name,
        args: {
          expr: e
        },
        over: bc,
      };
    }

KW_SUM_MAX_MIN_AVG
  = KW_SUM / KW_MAX / KW_MIN / KW_AVG

on_update_current_timestamp
  = KW_ON __ 'UPDATE'i __ kw:KW_CURRENT_TIMESTAMP __ LPAREN __ l:expr_list? __ RPAREN{
    return {
      type: 'on update',
      keyword: kw,
      parentheses: true,
      expr: l
    }
  }
  / KW_ON __ 'UPDATE'i __ kw:KW_CURRENT_TIMESTAMP {
    return {
      type: 'on update',
      keyword: kw,
    }
  }

over_partition
  = KW_OVER __ aws:as_window_specification {
    return {
      type: 'window',
      as_window_specification: aws,
    }
  }
  / KW_OVER __ LPAREN __ bc:partition_by_clause __ l:order_by_clause? __ RPAREN {
    return {
      partitionby: bc,
      orderby: l
    }
  }
  / on_update_current_timestamp

aggr_fun_count
  = name:KW_COUNT __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
      return {
        type: 'aggr_func',
        name: name,
        args: arg,
        over: bc
      };
    }


count_arg
  = e:star_expr { return { expr: e }; }
  / d:KW_DISTINCT? __ c:column_ref { return { distinct: d, expr: c }; }
  / d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN __ or:order_by_clause? {  return { distinct: d, expr: c, orderby: or, parentheses: true }; }

star_expr
  = "*" { return { type: 'star', value: '*' }; }

func_call
  = extract_func
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
    if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc
      };
    }
  / name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc
      };
    }
  / f:KW_CURRENT_TIMESTAMP __ up:on_update_current_timestamp? {
    return {
        type: 'function',
        name: f,
        over: up
    }
  }

proc_func_name
  = dt:ident tail:(__ DOT __ ident)* {
      let name = dt
      if (tail !== null) {
        tail.forEach(t => name = `${name}.${t[3]}`)
      }
      return name;
    }

scalar_func
  = KW_CURRENT_DATE
  / KW_CURRENT_TIME
  / KW_CURRENT_TIMESTAMP
  / KW_SESSION_USER

extract_filed
  = f:'CENTURY'i / 'DAY'i / 'DECADE'i / 'DOW'i / 'DOY'i / 'EPOCH'i / 'HOUR'i / 'ISODOW'i / 'ISOYEAR'i / 'MICROSECONDS'i / 'MILLENNIUM'i / 'MILLISECONDS'i / 'MINUTE'i / 'MONTH'i / 'QUARTER'i / 'SECOND'i / 'TIMEZONE'i / 'TIMEZONE_HOUR'i / 'TIMEZONE_MINUTE'i / 'WEEK'i / 'YEAR'i {
    return f
  }
extract_func
  = kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ t:(KW_TIMESTAMP / KW_INTERVAL / KW_TIME / KW_DATE)? __ s:expr __ RPAREN {
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          cast_type: t,
          source: s,
        }
    }
  }

cast_expr
  = KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    return {
      type: 'cast',
      expr: e,
      symbol: 'as',
      target: t
    };
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    return {
      type: 'cast',
      expr: e,
      symbol: 'as',
      target: {
        dataType: 'DECIMAL(' + precision + ')'
      }
    };
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
      return {
        type: 'cast',
        expr: e,
        symbol: 'as',
        target: {
          dataType: 'DECIMAL(' + precision + ', ' + scale + ')'
        }
      };
    }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
    return {
      type: 'cast',
      expr: e,
      symbol: 'as',
      target: {
        dataType: s + (t ? ' ' + t: '')
      }
    };
  }

signedness
  = KW_SIGNED
  / KW_UNSIGNED

literal
  = literal_string
  / literal_numeric
  / literal_bool
  / literal_null
  / literal_datetime

literal_list
  = head:literal tail:(__ COMMA __ literal)* {
      return createList(head, tail);
    }

literal_null
  = KW_NULL {
      return { type: 'null', value: null };
    }

literal_not_null
  = KW_NOT_NULL {
    return {
      type: 'not null',
      value: 'not null',
    }
  }

literal_bool
  = KW_TRUE {
      return { type: 'bool', value: true };
    }
  / KW_FALSE {
      return { type: 'bool', value: false };
    }

literal_string
  = r:'R'i? __ ca:("'" single_char* "'") {
      return {
        type: r ? 'regex_string' : 'single_quote_string',
        value: ca[1].join('')
      };
    }
  / r:'R'i? __ ca:("\"" single_quote_char* "\"") {
      return {
        type: r ? 'regex_string' : 'string',
        value: ca[1].join('')
      };
    }

literal_datetime
  = type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("'" single_char* "'") {
      return {
        type: type.toLowerCase(),
        value: ca[1].join('')
      };
    }
  / type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("\"" single_quote_char* "\"") {
      return {
        type: type.toLowerCase(),
        value: ca[1].join('')
      };
    }

single_quote_char
  = [^"\\\0-\x1F\x7f]
  / escape_char

single_char
  = [^'\\] // remove \0-\x1F\x7f pnCtrl char [^'\\\0-\x1F\x7f]
  / escape_char

escape_char
  = "\\'"  { return "\\'";  }
  / '\\"'  { return '\\"';  }
  / "\\\\" { return "\\\\"; }
  / "\\/"  { return "\\/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
    }
  / "\\" { return "\\"; }

line_terminator
  = [\n\r]

literal_numeric
  = n:number {
      if (n && n.type === 'bigint') return n
      return { type: 'number', value: n };
    }

number
  = int_:int frac:frac exp:exp {
    const numStr = int_ + frac + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int frac:frac {
    const numStr = int_ + frac
    if (isBigInt(int_)) return {
      type: 'bigint',
      value: numStr
    }
    return parseFloat(numStr);
  }
  / int_:int exp:exp {
    const numStr = int_ + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int {
    if (isBigInt(int_)) return {
      type: 'bigint',
      value: int_
    }
    return parseFloat(int_);
  }

int
  = digits
  / digit:digit
  / op:("-" / "+" ) digits:digits { return "-" + digits; }
  / op:("-" / "+" ) digit:digit { return "-" + digit; }

frac
  = "." digits:digits { return "." + digits; }

exp
  = e:e digits:digits { return e + digits; }

digits
  = digits:digit+ { return digits.join(""); }

digit   = [0-9]

hexDigit
  = [0-9a-fA-F]

e
  = e:[eE] sign:[+-]? { return e + (sign !== null ? sign: ''); }


KW_NULL     = "NULL"i       !ident_start
KW_DEFAULT  = "DEFAULT"i    !ident_start
KW_NOT_NULL = "NOT NULL"i   !ident_start
KW_TRUE     = "TRUE"i       !ident_start
KW_TO       = "TO"i         !ident_start
KW_FALSE    = "FALSE"i      !ident_start

KW_DROP     = "DROP"i       !ident_start { return 'DROP'; }
KW_USE      = "USE"i        !ident_start
KW_SELECT   = "SELECT"i     !ident_start
KW_IF_NOT_EXISTS = "IF NOT EXISTS"i !ident_start
KW_RECURSIVE= "RECURSIVE"   !ident_start
KW_IGNORE   = "IGNORE"i     !ident_start
KW_EXPLAIN  = "EXPLAIN"i    !ident_start
KW_PARTITION = "PARTITION"i !ident_start { return 'PARTITION' }

KW_INTO     = "INTO"i       !ident_start
KW_FROM     = "FROM"i       !ident_start
KW_SET      = "SET"i        !ident_start
KW_UNLOCK   = "UNLOCK"i     !ident_start
KW_LOCK     = "LOCK"i       !ident_start

KW_AS       = "AS"i         !ident_start
KW_TABLE    = "TABLE"i      !ident_start { return 'TABLE'; }
KW_TABLES   = "TABLES"i      !ident_start { return 'TABLES'; }
KW_COLLATE  = "COLLATE"i    !ident_start { return 'COLLATE'; }

KW_ON       = "ON"i       !ident_start
KW_LEFT     = "LEFT"i     !ident_start
KW_RIGHT    = "RIGHT"i    !ident_start
KW_FULL     = "FULL"i     !ident_start
KW_INNER    = "INNER"i    !ident_start
KW_CROSS    = "CROSS"i    !ident_start
KW_JOIN     = "JOIN"i     !ident_start
KW_OUTER    = "OUTER"i    !ident_start
KW_OVER     = "OVER"i     !ident_start
KW_UNION    = "UNION"i    !ident_start
KW_VALUE    = "VALUE"i    !ident_start { return 'VALUE' }
KW_VALUES   = "VALUES"i   !ident_start
KW_USING    = "USING"i    !ident_start

KW_WHERE    = "WHERE"i      !ident_start
KW_WITH     = "WITH"i       !ident_start

KW_GROUP    = "GROUP"i      !ident_start
KW_BY       = "BY"i         !ident_start
KW_ORDER    = "ORDER"i      !ident_start
KW_HAVING   = "HAVING"i     !ident_start
KW_WINDOW   = "WINDOW"i  !ident_start
KW_ORDINAL  = "ORDINAL"i !ident_start { return 'ORDINAL' }

KW_LIMIT    = "LIMIT"i      !ident_start
KW_OFFSET   = "OFFSET"i     !ident_start { return 'OFFSET'; }

KW_ASC      = "ASC"i        !ident_start { return 'ASC'; }
KW_DESC     = "DESC"i       !ident_start { return 'DESC'; }

KW_ALL      = "ALL"i        !ident_start { return 'ALL'; }
KW_DISTINCT = "DISTINCT"i   !ident_start { return 'DISTINCT';}

KW_BETWEEN  = "BETWEEN"i    !ident_start { return 'BETWEEN'; }
KW_IN       = "IN"i         !ident_start { return 'IN'; }
KW_IS       = "IS"i         !ident_start { return 'IS'; }
KW_LIKE     = "LIKE"i       !ident_start { return 'LIKE'; }
KW_EXISTS   = "EXISTS"i     !ident_start { return 'EXISTS'; }

KW_NOT      = "NOT"i        !ident_start { return 'NOT'; }
KW_AND      = "AND"i        !ident_start { return 'AND'; }
KW_OR       = "OR"i         !ident_start { return 'OR'; }

KW_COUNT    = "COUNT"i      !ident_start { return 'COUNT'; }
KW_MAX      = "MAX"i        !ident_start { return 'MAX'; }
KW_MIN      = "MIN"i        !ident_start { return 'MIN'; }
KW_SUM      = "SUM"i        !ident_start { return 'SUM'; }
KW_AVG      = "AVG"i        !ident_start { return 'AVG'; }

KW_EXTRACT  = "EXTRACT"i    !ident_start { return 'EXTRACT'; }
KW_CALL     = "CALL"i       !ident_start { return 'CALL'; }

KW_CASE     = "CASE"i       !ident_start
KW_WHEN     = "WHEN"i       !ident_start
KW_THEN     = "THEN"i       !ident_start
KW_ELSE     = "ELSE"i       !ident_start
KW_END      = "END"i        !ident_start

KW_CAST     = "CAST"i       !ident_start

KW_ARRAY     = "ARRAY"i     !ident_start { return 'ARRAY'; }
KW_BYTES     = "BYTES"i     !ident_start { return 'BYTES'; }
KW_BOOL     = "BOOL"i     !ident_start { return 'BOOL'; }
KW_CHAR     = "CHAR"i     !ident_start { return 'CHAR'; }
KW_GEOGRAPHY = "GEOGRAPHY"i     !ident_start { return 'GEOGRAPHY'; }
KW_VARCHAR  = "VARCHAR"i  !ident_start { return 'VARCHAR';}
KW_NUMERIC  = "NUMERIC"i  !ident_start { return 'NUMERIC'; }
KW_DECIMAL  = "DECIMAL"i  !ident_start { return 'DECIMAL'; }
KW_SIGNED   = "SIGNED"i   !ident_start { return 'SIGNED'; }
KW_UNSIGNED = "UNSIGNED"i !ident_start { return 'UNSIGNED'; }
KW_INT_64     = "INT64"i      !ident_start { return 'INT64'; }
KW_ZEROFILL = "ZEROFILL"i !ident_start { return 'ZEROFILL'; }
KW_INTEGER  = "INTEGER"i  !ident_start { return 'INTEGER'; }
KW_JSON     = "JSON"i     !ident_start { return 'JSON'; }
KW_SMALLINT = "SMALLINT"i !ident_start { return 'SMALLINT'; }
KW_STRING = "STRING"i !ident_start { return 'STRING'; }
KW_STRUCT = "STRUCT"i !ident_start { return 'STRUCT'; }
KW_TINYINT  = "TINYINT"i  !ident_start { return 'TINYINT'; }
KW_TINYTEXT = "TINYTEXT"i !ident_start { return 'TINYTEXT'; }
KW_TEXT     = "TEXT"i     !ident_start { return 'TEXT'; }
KW_MEDIUMTEXT = "MEDIUMTEXT"i  !ident_start { return 'MEDIUMTEXT'; }
KW_LONGTEXT  = "LONGTEXT"i  !ident_start { return 'LONGTEXT'; }
KW_BIGINT   = "BIGINT"i   !ident_start { return 'BIGINT'; }
KW_FLOAT_64   = "FLOAT64"i   !ident_start { return 'FLOAT64'; }
KW_DOUBLE   = "DOUBLE"i   !ident_start { return 'DOUBLE'; }
KW_DATE     = "DATE"i     !ident_start { return 'DATE'; }
KW_DATETIME = "DATETIME"i     !ident_start { return 'DATETIME'; }
KW_ROWS     = "ROWS"i     !ident_start { return 'ROWS'; }
KW_TIME     = "TIME"i     !ident_start { return 'TIME'; }
KW_TIMESTAMP= "TIMESTAMP"i!ident_start { return 'TIMESTAMP'; }
KW_TRUNCATE = "TRUNCATE"i !ident_start { return 'TRUNCATE'; }
KW_USER     = "USER"i     !ident_start { return 'USER'; }

KW_CURRENT_DATE     = "CURRENT_DATE"i !ident_start { return 'CURRENT_DATE'; }
KW_ADD_DATE         = "ADDDATE"i !ident_start { return 'ADDDATE'; }
KW_INTERVAL         = "INTERVAL"i !ident_start { return 'INTERVAL'; }
KW_UNIT_YEAR        = "YEAR"i !ident_start { return 'YEAR'; }
KW_UNIT_MONTH       = "MONTH"i !ident_start { return 'MONTH'; }
KW_UNIT_DAY         = "DAY"i !ident_start { return 'DAY'; }
KW_UNIT_HOUR        = "HOUR"i !ident_start { return 'HOUR'; }
KW_UNIT_MINUTE      = "MINUTE"i !ident_start { return 'MINUTE'; }
KW_UNIT_SECOND      = "SECOND"i !ident_start { return 'SECOND'; }
KW_CURRENT_TIME     = "CURRENT_TIME"i !ident_start { return 'CURRENT_TIME'; }
KW_CURRENT_TIMESTAMP= "CURRENT_TIMESTAMP"i !ident_start { return 'CURRENT_TIMESTAMP'; }
KW_SESSION_USER     = "SESSION_USER"i !ident_start { return 'SESSION_USER'; }

KW_GLOBAL         = "GLOBAL"i    !ident_start { return 'GLOBAL'; }
KW_SESSION        = "SESSION"i   !ident_start { return 'SESSION'; }
KW_LOCAL          = "LOCAL"i     !ident_start { return 'LOCAL'; }
KW_PIVOT          = "PIVOT"i   !ident_start { return 'PIVOT'; }
KW_PERSIST        = "PERSIST"i   !ident_start { return 'PERSIST'; }
KW_PERSIST_ONLY   = "PERSIST_ONLY"i   !ident_start { return 'PERSIST_ONLY'; }

// MySQL Alter
KW_ADD     = "ADD"i     !ident_start { return 'ADD'; }
KW_COLUMN  = "COLUMN"i  !ident_start { return 'COLUMN'; }
KW_INDEX   = "INDEX"i  !ident_start { return 'INDEX'; }
KW_KEY     = "KEY"i  !ident_start { return 'KEY'; }
KW_FULLTEXT = "FULLTEXT"i  !ident_start { return 'FULLTEXT'; }
KW_UNIQUE     = "UNIQUE"i  !ident_start { return 'UNIQUE'; }
KW_COMMENT     = "COMMENT"i  !ident_start { return 'COMMENT'; }
KW_CONSTRAINT  = "CONSTRAINT"i  !ident_start { return 'CONSTRAINT'; }
KW_REFERENCES  = "REFERENCES"i  !ident_start { return 'REFERENCES'; }

//special character
DOT       = '.'
COMMA     = ','
STAR      = '*'
LPAREN    = '('
RPAREN    = ')'
LANGLE    = '<'
RANGLE    = '>'
LBRAKE    = '['
RBRAKE    = ']'

SEMICOLON = ';'

OPERATOR_CONCATENATION = '||'
OPERATOR_AND = '&&'
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// separator
__
  = (whitespace / comment)*

___
  = (whitespace / comment)+

comment
  = block_comment
  / line_comment
  / pound_sign_comment

block_comment
  = "/*" (!"*/" char)* "*/"

line_comment
  = "--" (!EOL char)*

pound_sign_comment
  = "#" (!EOL char)*

char = .

interval_unit
  = KW_UNIT_YEAR
  / KW_UNIT_MONTH
  / KW_UNIT_DAY
  / KW_UNIT_HOUR
  / KW_UNIT_MINUTE
  / KW_UNIT_SECOND

whitespace =
  [ \t\n\r]

EOL
  = EOF
  / [\n\r]+

EOF = !.

data_type_list
  = head:data_type_alias tail:(__ COMMA __ data_type_alias)* {
      return createList(head, tail);
    }

data_type_alias
  = n:(n:ident_name !{ return DATA_TYPES[n.toUpperCase()] === true; } {
      return n
    })? __ t:data_type {
    return {
      field_name: n,
      field_type: t,
    }
  }

data_type
  = struct_type
  / array_type
  / character_string_type
  / numeric_type
  / datetime_type
  / bool_byte_geography_type

character_string_type
  = t:KW_STRING { return { dataType: t }; }

numeric_type
  = t:(KW_NUMERIC / KW_INT_64 / KW_FLOAT_64) { return { dataType: t }; }

datetime_type
  = t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) __ LPAREN __ l:[0-9]+ __ RPAREN { return { dataType: t, length: parseInt(l.join(''), 10) }; }
  / t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) { return { dataType: t }; }

bool_byte_geography_type
  = t:(KW_BYTES / KW_BOOL / KW_GEOGRAPHY) { return { dataType: t }; }

array_type
  = t:KW_ARRAY __ LANGLE __ a:data_type_list __ RANGLE {
    return {
      dataType: t,
      definition: a,
      anglebracket: true
    }
  }

struct_type
  = t:KW_STRUCT __ LANGLE __ a:data_type_list __ RANGLE {
    return {
      dataType: t,
      definition: a,
      anglebracket: true
    }
  }
