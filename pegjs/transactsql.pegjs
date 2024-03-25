{
  const reservedMap = {
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
    'NOCHECK': true,

    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'RECURSIVE': true,
    'RENAME': true,
    // 'REPLACE': true,
    'READ': true, // for lock table
    // 'RIGHT': true,

    'SELECT': true,
    'SESSION_USER': true,
    'SET': true,
    'SHOW': true,
    // 'STATUS': true, // reserved (MySQL)
    'SYSTEM_USER': true,

    'TABLE': true,
    'THEN': true,
    'TRUE': true,
    'TRUNCATE': true,
    // 'TYPE': true,   // reserved (MySQL)

    'UNION': true,
    'UPDATE': true,
    'USING': true,

    'VALUES': true,

    'WITH': true,
    'WHEN': true,
    'WHERE': true,
    'WRITE': true, // for lock table

    'GLOBAL': true,
    'SESSION': true,
    'LOCAL': true,
    'PERSIST': true,
    'PERSIST_ONLY': true,
  };

  function getLocationObject() {
    return options.includeLocations ? {loc: location()} : {}
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
  = head:start_item __ tail:(__ KW_GO __ start_item?)* {
    if (!tail || tail.length === 0) return head
    delete head.tableList
    delete head.columnList
    let cur = head
    for (let i = 0; i < tail.length; i++) {
      const item = tail[i][3] || []
      delete item.tableList
      delete item.columnList
      cur.go_next = item
      cur.go = 'go'
      cur = cur.go_next
    }
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: head
      }
  }

start_item
  = __ n:(multiple_stmt) __ SEMICOLON? {
    return n
  }

cmd_stmt
  = drop_stmt
  / create_stmt
  / truncate_stmt
  / rename_stmt
  / call_stmt
  / use_stmt
  / alter_stmt
  / set_stmt
  / lock_stmt
  / unlock_stmt
  / declare_stmt
  / exec_stmt
  / if_else_stmt

create_stmt
  = create_table_stmt
  / create_index_stmt
  / create_db_stmt

alter_stmt
  = alter_table_stmt
  / alter_view_stmt

crud_stmt
  = union_stmt
  / update_stmt
  / replace_insert_stmt
  / insert_no_columns_stmt
  / delete_stmt
  / cmd_stmt
  / proc_stmts

multiple_stmt
  = head:crud_stmt tail:(__ SEMICOLON __ crud_stmt)* {
      const headAst = head && head.ast || head
      const cur = tail && tail.length && tail[0].length >= 4 ? [headAst] : headAst;
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

set_op
  = KW_UNION __ KW_ALL { return 'union all' }
  / KW_UNION { return 'union' }

union_stmt
  = head:select_stmt tail:(__ set_op __ select_stmt)* __ ob: order_by_clause? __ l:limit_clause? {
      let cur = head
      for (let i = 0; i < tail.length; i++) {
        cur._next = tail[i][3]
        cur.set_op = tail[i][1]
        cur = cur._next
      }
      if(ob) head._orderby = ob
      if(l) head._limit = l
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: head
      }
    }

column_order_list
  = head:column_order_item tail:(__ COMMA __ column_order_item)* {
    return createList(head, tail)
  }

column_order_item
  = LBRAKE __ c:column_ref __ RBRAKE __ o:(KW_ASC / KW_DESC) { return {
      ...c,
      order_by: o.toLowerCase()
    }
  }
  / LBRAKE __ c:column_ref __ RBRAKE __ { return c }
  / column_order

column_order
  = c:column_ref __ o:(KW_ASC / KW_DESC) {
    return {
      ...c,
      order_by: o.toLowerCase()
    }
  }
  / column_ref

include_column
  = k:'INCLUDE'i __ LPAREN __ c:column_list __ RPAREN {
    return {
      type: k.toLowerCase(),
      keyword: k.toLowerCase(),
      columns:c,
    }
  }

create_index_stmt
  = a:KW_CREATE __
  kw:(KW_UNIQUE / KW_CLUSTERED / KW_NONCLUSTERED)? __
  t:KW_INDEX __
  n:ident __
  on:KW_ON __
  ta:table_name __
  LPAREN __ cols:column_order_list __ RPAREN __
  i:include_column? __
  w:where_clause? __
  wr:(KW_WITH __ LPAREN __ index_options_list __ RPAREN)? __
  op:on_clause? __
  fo:('FILESTREAM_ON'i __ ident)? {
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          index_type: kw && kw.toLowerCase(),
          keyword: t.toLowerCase(),
          index: n,
          on_kw: on[0].toLowerCase(),
          table: ta,
          index_columns: cols,
          include: i,
          where: w,
          with: wr && wr[4],
          on: op,
          filestream_on: fo && { value: fo[2] },
        }
    }
  }

create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    return createList(head, tail, 1)
  }

if_not_exists_stmt
  = 'IF'i __ KW_NOT __ KW_EXISTS {
    return 'IF NOT EXISTS'
  }

create_db_stmt
  = a:KW_CREATE __
    k:(KW_DATABASE / KW_SCHEME) __
    ife:if_not_exists_stmt? __
    t:ident_name __
    c:create_db_definition? {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'database',
          if_not_exists: ife,
          database: t,
          create_definitions: c,
        }
      }
    }

create_table_stmt
  = a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    c:create_table_definition __
    to:table_options? __
    ir: (KW_IGNORE / KW_REPLACE)? __
    as: KW_AS? __
    qe: union_stmt? {
      if(t) t.forEach(tt => tableList.add(`create::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists: ife,
          table: t,
          ignore_replace: ir && ir[0].toLowerCase(),
          as: as && as[0].toLowerCase(),
          query_expr: qe && qe.ast,
          create_definitions: c,
          table_options: to
        }
      }
    }
  / a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    lt:create_like_table {
      if(t) t.forEach(tt => tableList.add(`create::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists: ife,
          table: t,
          like: lt
        }
      }
    }

create_like_table_simple
  = KW_LIKE __ t: table_ref_list {
    return {
      type: 'like',
      table: t
    }
  }
create_like_table
  = create_like_table_simple
  / LPAREN __ e:create_like_table  __ RPAREN {
      e.parentheses = true;
      return e;
  }

create_table_definition
  = LPAREN __ head:create_definition tail:(__ COMMA __ create_definition)* __ COMMA? __ RPAREN {
      return createList(head, tail);
    }

create_definition
  = create_constraint_definition
  / create_column_definition
  / create_index_definition
  / create_fulltext_spatial_index_definition

column_definition_opt
  = n:(literal_not_null / literal_null) {
    if (n && !n.value) n.value = 'null'
    return { nullable: n }
  }
  / d:default_expr {
    return { default_val: d }
  }
  / ch:create_constraint_check {
    return { check: ch }
  }
  / 'UNIQUE'i __ k:('KEY'i)? {
    const sql = ['unique']
    if (k) sql.push(k)
    return { unique: sql.join(' ').toLowerCase('') }
  }
  / p:('PRIMARY'i)? __ 'KEY'i {
    const sql = []
    if (p) sql.push('primary')
    sql.push('key')
    return { primary_key: sql.join(' ').toLowerCase('') }
  }
  / o:identity_stmt {
    return { auto_increment: o }
  }
  / co:keyword_comment {
    return { comment: co }
  }
  / ca:collate_expr {
    return { collate: ca }
  }
  / cf:column_format {
    return { column_format: cf }
  }
  / s:storage {
    return { storage: s }
  }
  / re:reference_definition {
    return { reference_definition: re }
  }
  / t:create_option_character_set_kw __ s:KW_ASSIGIN_EQUAL? __ v:ident_name {
    return { character_set: { type: t, value: v, symbol: s }}
  }

column_definition_opt_list
  = head:column_definition_opt __ tail:(__ column_definition_opt)* {
    let opt = head
    for (let i = 0; i < tail.length; i++) {
      opt = { ...opt, ...tail[i][1] }
    }
    return opt
  }

create_column_definition
  = c:column_ref __
    d:data_type __
    cdo:column_definition_opt_list? {
      columnList.add(`create::${c.table}::${c.column}`)
      return {
        column: c,
        definition: d,
        resource: 'column',
        ...(cdo || {})
      }
    }
  / c:column_ref __ as:(KW_AS __ expr)? {
    if (as) c.as = as[2]
    return {
      column: c,
      resource: 'column'
    }
  }

identity_stmt
  = ('IDENTITY'i) __ c:(LPAREN __  literal_numeric __ COMMA __ literal_numeric __ RPAREN)? {
    return {
      keyword: 'identity',
      seed:c && c[2],
      increment:c && c[6],
      parentheses:c && true || false,
    }
  }

collate_expr
  = KW_COLLATE __ s:KW_ASSIGIN_EQUAL? __ ca:ident_name {
    return {
      type: 'collate',
      symbol: s,
      value: ca,
    }
  }
column_format
  = k:'COLUMN_FORMAT'i __ f:('FIXED'i / 'DYNAMIC'i / 'DEFAULT'i) {
    return {
      type: 'column_format',
      value: f.toLowerCase()
    }
  }
storage
  = k:'STORAGE'i __ s:('DISK'i / 'MEMORY'i) {
    return {
      type: 'storage',
      value: s.toLowerCase()
    }
  }
default_expr
  = KW_DEFAULT __ ce: (literal / expr) {
    return {
      type: 'default',
      value: ce
    }
  }
declare_var
  = at:KW_VAR__PRE_AT __ name:ident_name __
  as:KW_AS? __
  dt:data_type __
  v:(KW_ASSIGIN_EQUAL __ expr)? {
    return {
      at: '@',
      name,
      as: as && as[0].toLowerCase(),
      datatype: dt,
      keyword: 'variable',
      definition: v && {
        type: 'default',
        keyword: v[0],
        value: v[2]
      }
    }
  }
  / at:KW_VAR__PRE_AT __ name:ident_name __ 'CURSOR'i {
    return {
      at: '@',
      name,
      keyword: 'cursor',
      prefix: 'cursor',
    }
  }
declare_var_list
  = head:declare_var tail:(__ COMMA __ declare_var)* {
      return createList(head, tail);
    }

declare_stmt
  = a:KW_DECLARE __ dl:declare_var_list {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'declare',
        declare: dl,
        symbol: ',',
      }
    }
  }
  / a:KW_DECLARE __ at:KW_VAR__PRE_AT __ name:ident_name __ as:KW_AS? __ KW_TABLE __ t:create_table_definition {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'declare',
        declare: [{
          at: '@',
          name,
          as: as && as[0].toLowerCase(),
          keyword: 'table',
          prefix: 'table',
          definition: t,
        }]
      }
    }
  }

exec_stmt
  = kw:('EXECUTE'i / 'EXEC'i) __ t:table_name __ v:exec_varibale_list? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'exec',
        keyword: kw,
        module: t,
        parameters: v,
      }
    }
  }

exec_varibale_list
  = head:exec_variable tail:(__ COMMA __ exec_variable)* {
      return createList(head, tail);
  }

exec_variable
  = '@'n:ident __ KW_ASSIGIN_EQUAL __ e:expr {
    return {
      type: 'variable',
      name: n,
      value: e,
    }
  }

if_else_stmt
  = 'if'i __ ie:expr __ ia:crud_stmt __ s:SEMICOLON? __ g:KW_GO? __ el:(KW_ELSE __ crud_stmt)? __ es:SEMICOLON?  {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'if',
        keyword: 'if',
        boolean_expr: ie,
        semicolons: [s || '', es || ''],
        go: g,
        if_expr: ia,
        else_expr: el && el[2],
      }
    }
  }

drop_index_opt
  = head:(ALTER_ALGORITHM / ALTER_LOCK) tail:(__ (ALTER_ALGORITHM / ALTER_LOCK))* {
    return createList(head, tail, 1)
  }
if_exists
  = 'if'i __ 'exists'i {
    return 'if exists'
  }
drop_stmt
  = a:KW_DROP __
    r:KW_TABLE __
    ife: if_exists? __
    t:table_ref_list {
      if(t) t.forEach(tt => tableList.add(`${a}::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          prefix: ife,
          name: t
        }
      };
    }
  / a:KW_DROP __
  r:'PROCEDURE'i __
  p:ident {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: a.toLowerCase(),
        keyword: r.toLowerCase(),
        name: p
      }
    }
  }
  / a:KW_DROP __
    r:KW_INDEX __
    i:column_ref __
    KW_ON __
    t:table_name __
    op:drop_index_opt? __ {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          name: i,
          table: t,
          options: op
        }
      };
    }
  / a:KW_DROP __
    r:KW_VIEW __
    ife:if_exists? __
    t:table_ref_list {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          prefix: ife,
          name: t,
        }
      };
    }


truncate_stmt
  = a:KW_TRUNCATE  __
    kw:KW_TABLE? __
    t:table_ref_list {
      if(t) t.forEach(tt => tableList.add(`${a}::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: kw && kw.toLowerCase() || 'table',
          name: t
        }
      };
    }

use_stmt
  = KW_USE  __
    d:ident {
      tableList.add(`use::${d}::null`);
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'use',
          db: d
        }
      };
    }
view_attribute
  = 'ENCRYPTION'i / 'SCHEMABINDING'i / 'VIEW_METADATA'i

view_attribute_list
  = head:view_attribute tail:(__ COMMA __ view_attribute)* {
    return createList(head, tail)
  }

view_with
  = KW_WITH __ "CHECK"i __ "OPTION"i {
    return 'with check option'
  }

alter_view_stmt
  = KW_ALTER  __
    KW_VIEW __
    t:table_name __
    c:(LPAREN __ column_ref_list __ RPAREN)? __
    w:(KW_WITH __ view_attribute_list)? __
    KW_AS __ s:select_stmt_nake __
    e:view_with? {
      if (t && t.length > 0) t.forEach(table => tableList.add(`alter::${table.db}::${table.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword: 'view',
          view: t,
          columns: c && c[2],
          attributes: w && w[2],
          select: s,
          with: e
        }
      };
    }

alter_table_stmt
  = KW_ALTER  __
    KW_TABLE __
    t:table_ref_list __
    e:alter_action_list {
      if (t && t.length > 0) t.forEach(table => tableList.add(`alter::${table.db}::${table.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword: 'table',
          table: t,
          expr: e
        }
      };
    }

alter_action_list
  = head:alter_action tail:(__ COMMA __ alter_action)* {
      return createList(head, tail);
    }

alter_action
  = ALTER_ADD_CONSTRAINT
  / ALTER_DROP_CONSTRAINT
  / ALTER_ENABLE_CONSTRAINT
  / ALTER_DISABLE_CONSTRAINT
  / ALTER_ADD_COLUMN
  / ALTER_DROP_COLUMN
  / ALTER_ADD_INDEX_OR_KEY
  / ALTER_ADD_FULLETXT_SPARITAL_INDEX
  / ALTER_RENAME_TABLE
  / ALTER_ALGORITHM
  / ALTER_LOCK

ALTER_ADD_COLUMN
  = a: (KW_ADD / KW_ALTER) __
    kc:KW_COLUMN? __
    cd:create_column_definition {
      return {
        action: a.toLowerCase(),
        ...cd,
        keyword: kc,
        resource: 'column',
        type: 'alter',
      }
    }

ALTER_DROP_COLUMN
  = KW_DROP __
    kc:KW_COLUMN? __
    c:column_ref {
      return {
        action: 'drop',
        column: c,
        keyword: kc,
        resource: 'column',
        type: 'alter',
      }
    }

ALTER_ADD_INDEX_OR_KEY
  = KW_ADD __
    id:create_index_definition
     {
      return {
        action: 'add',
        type: 'alter',
        ...id,
      }
    }

ALTER_RENAME_TABLE
  = KW_RENAME __
  kw:(KW_TO / KW_AS)? __
  tn:ident {
    return {
      action: 'rename',
      type: 'alter',
      resource: 'table',
      keyword: kw && kw[0].toLowerCase(),
      table: tn
    }
  }

ALTER_ALGORITHM
  = "ALGORITHM"i __ s:KW_ASSIGIN_EQUAL? __ val:("DEFAULT"i / "INSTANT"i / "INPLACE"i / "COPY"i) {
    return {
      type: 'alter',
      keyword: 'algorithm',
      resource: 'algorithm',
      symbol: s,
      algorithm: val
    }
  }

ALTER_LOCK
  = "LOCK"i __ s:KW_ASSIGIN_EQUAL? __ val:("DEFAULT"i / "NONE"i / "SHARED"i / "EXCLUSIVE"i) {
    return {
      type: 'alter',
      keyword: 'lock',
      resource: 'lock',
      symbol: s,
      lock: val
    }
  }

ALTER_ADD_CONSTRAINT
  = KW_ADD __ c:create_constraint_definition {
      return {
        action: 'add',
        create_definitions: c,
        resource: 'constraint',
        type: 'alter',
      }
    }

ALTER_DROP_CONSTRAINT
  = KW_DROP __ kc:KW_CONSTRAINT __ c:ident_name {
      return {
        action: 'drop',
        constraint: c,
        keyword: kc.toLowerCase(),
        resource: 'constraint',
        type: 'alter',
      }
    }

ALTER_ENABLE_CONSTRAINT
  = KW_WITH __ 'CHECK'i __ 'CHECK'i __ KW_CONSTRAINT __ c:ident_name {
      return {
        action: 'with',
        constraint: c,
        keyword: 'check check constraint',
        resource: 'constraint',
        type: 'alter',
      }
    }

ALTER_DISABLE_CONSTRAINT
  = 'NOCHECK'i __ KW_CONSTRAINT __ c:ident_name {
      return {
        action: 'nocheck',
        keyword: 'constraint',
        constraint: c,
        resource: 'constraint',
        type: 'alter',
      }
    }

create_index_definition
  = kc:(KW_INDEX / KW_KEY) __
    c:column? __
    t:index_type? __
    de:cte_column_definition __
    id:index_options? __
    {
      return {
        index: c,
        definition: de,
        keyword: kc.toLowerCase(),
        index_type: t,
        resource: 'index',
        index_options: id,
      }
    }

create_fulltext_spatial_index_definition
  = p: (KW_FULLTEXT / KW_SPATIAL) __
    kc:(KW_INDEX / KW_KEY)? __
    c:column? __
    de: cte_column_definition __
    id: index_options? __
    {
      return {
        index: c,
        definition: de,
        keyword: kc && `${p.toLowerCase()} ${kc.toLowerCase()}` || p.toLowerCase(),
        index_options: id,
        resource: 'index',
      }
    }

create_constraint_definition
  = create_constraint_primary
  / create_constraint_unique
  / create_constraint_foreign
  / create_constraint_check

constraint_name
  = kc:KW_CONSTRAINT __
  c:ident? {
    return {
      keyword: kc.toLowerCase(),
      constraint: c
    }
  }

create_with_index_options
  = KW_WITH __ LPAREN __ l: index_options_list __ RPAREN __ KW_ON __ LBRAKE __ o:ident_name __ RBRAKE {
    return { with: l, on:o }
  }
  / l:(index_options / index_options_list) {
    return { index_options: l }
  }

create_constraint_primary
  = kc:constraint_name? __
  p:('PRIMARY KEY'i) __
  t:index_type? __
  de:cte_column_definition __
  id:create_with_index_options? {
    return {
        constraint: kc && kc.constraint,
        definition: de,
        constraint_type: p.toLowerCase(),
        keyword: kc && kc.keyword,
        index_type: t,
        resource: 'constraint',
        ...id,
      }
  }

create_constraint_unique
  = kc:constraint_name? __
  u:KW_UNIQUE __
  p:(KW_INDEX / KW_KEY)? __
  i:column? __
  t:index_type? __
  de:cte_column_definition __
  id:index_options? {
    return {
        constraint: kc && kc.constraint,
        definition: de,
        constraint_type: p && `${u.toLowerCase()} ${p.toLowerCase()}` || u.toLowerCase(),
        keyword: kc && kc.keyword,
        index_type: t,
        index: i,
        resource: 'constraint',
        index_options: id
      }
  }

create_constraint_check
  = kc:constraint_name? __ u:'CHECK'i __ nfr:('NOT'i __ 'FOR'i __ 'REPLICATION'i __)? LPAREN __ c:or_and_where_expr __ RPAREN {
    return {
        constraint_type: u.toLowerCase(),
        keyword: kc && kc.keyword,
        constraint: kc && kc.constraint,
        index_type: nfr && { keyword: 'not for replication', type: '' },
        definition: [c],
        resource: 'constraint',
      }
  }

create_constraint_foreign
  = kc:constraint_name? __
  p:('FOREIGN KEY'i) __
  i:column? __
  de:cte_column_definition __
  id:reference_definition? {
    return {
        constraint: kc && kc.constraint,
        definition: de,
        constraint_type: p,
        keyword: kc && kc.keyword,
        index: i,
        resource: 'constraint',
        reference_definition: id
      }
  }

reference_definition
  = kc:KW_REFERENCES __
  t:table_ref_list __
  de:cte_column_definition __
  m:('MATCH FULL'i / 'MATCH PARTIAL'i / 'MATCH SIMPLE'i)? __
  od:on_reference? __
  ou:on_reference? {
    return {
        definition: de,
        table: t,
        keyword: kc.toLowerCase(),
        match: m && m.toLowerCase(),
        on_action: [od, ou].filter(v => v)
      }
  }
  / oa:on_reference {
    return {
      on_action: [oa]
    }
  }

on_reference
  = KW_ON __ kw:(KW_DELETE / KW_UPDATE) __ ro:reference_option {
    // => { type: 'on delete' | 'on update'; value: reference_option; }
    return {
      type: `on ${kw[0].toLowerCase()}`,
      value: ro
    }
  }
reference_option
  = kw:KW_CURRENT_TIMESTAMP __ LPAREN __ l:expr_list? __ RPAREN {
    return {
      type: 'function',
      name: { name: [{ type: 'origin', value: kw }]},
      args: l
    }
  }
  / kc:('RESTRICT'i / 'CASCADE'i / 'SET NULL'i / 'NO ACTION'i / 'SET DEFAULT'i / KW_CURRENT_TIMESTAMP) {
    return {
      type: 'origin',
      value: kc.toLowerCase()
    }
  }

table_options
  = head:table_option tail:(__ COMMA? __ table_option)* {
    return createList(head, tail)
  }

create_option_character_set_kw
  = 'CHARACTER'i __ 'SET'i {
    return 'CHARACTER SET'
  }
create_option_character_set
  = kw:KW_DEFAULT? __ t:(create_option_character_set_kw / 'CHARSET'i / 'COLLATE'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:ident_name {
    return {
      keyword: kw && `${kw[0].toLowerCase()} ${t.toLowerCase()}` || t.toLowerCase(),
      symbol: s,
      value: v
    }
  }

table_option
  = kw:('AUTO_INCREMENT'i / 'AVG_ROW_LENGTH'i / 'KEY_BLOCK_SIZE'i / 'MAX_ROWS'i / 'MIN_ROWS'i / 'STATS_SAMPLE_PAGES'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:literal_numeric {
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: v.value
    }
  }
  / create_option_character_set
  / kw:(KW_COMMENT / 'CONNECTION'i) __ s:(KW_ASSIGIN_EQUAL)? __ c:literal_string {
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: `'${c.value}'`
    }
  }
  / kw:'COMPRESSION'i __ s:(KW_ASSIGIN_EQUAL)? __ v:("'"('ZLIB'i / 'LZ4'i / 'NONE'i)"'") {
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: v.join('').toUpperCase()
    }
  }
  / kw:'ENGINE'i __ s:(KW_ASSIGIN_EQUAL)? __ c:ident_name {
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: c.toUpperCase()
    }
  }
  / KW_ON __ LBRAKE __ o:ident_name __ RBRAKE {
    return {
      keyword: 'on',
      value: `[${o}]`
    }
  }
  / 'TEXTIMAGE_ON'i __ LBRAKE __ to:ident_name __ RBRAKE {
    return {
      keyword:'textimage_on',
      value: `[${to}]`
    }
  }


ALTER_ADD_FULLETXT_SPARITAL_INDEX
  = KW_ADD __
    fsid:create_fulltext_spatial_index_definition
     {
      return {
        action: 'add',
        type: 'alter',
        ...fsid,
      }
    }

rename_stmt
  = KW_RENAME  __
    KW_TABLE __
    t:table_to_list {
      t.forEach(tg => tg.forEach(dt => dt.table && tableList.add(`rename::${dt.db}::${dt.table}`)))
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'rename',
          table: t
        }
      };
    }

set_stmt
  = KW_SET __
  kw: (KW_GLOBAL / KW_SESSION / KW_LOCAL / KW_PERSIST / KW_PERSIST_ONLY)? __
  a: assign_stmt {
    a.keyword = kw
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'set',
        expr: a
      }
    }
  }

unlock_stmt
  = KW_UNLOCK __ KW_TABLES {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'unlock',
        keyword: 'tables'
      }
    }
  }

lock_type
  = "READ"i __ s:("LOCAL"i)? {
    return {
      type: 'read',
      suffix: s && 'local'
    }
  }
  / p:("LOW_PRIORITY"i)? __ "WRITE"i {
    return {
      type: 'write',
      prefix: p && 'low_priority'
    }
  }

lock_table
  = t:table_base __ lt:lock_type {
    tableList.add(`lock::${t.db}::${t.table}`)
    return {
      table: t,
      lock_type: lt
    }
  }

lock_table_list
  = head:lock_table tail:(__ COMMA __ lock_table)* {
    return createList(head, tail);
  }

lock_stmt
  = KW_LOCK __ KW_TABLES __ ltl:lock_table_list {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'lock',
        keyword: 'tables',
        tables: ltl
      }
    }
  }

call_stmt
  = KW_CALL __
  e: proc_func_call {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'call',
        expr: e
      }
    }
  }

select_stmt
  = select_stmt_nake
  / s:('(' __ select_stmt __ ')') {
      return {
        ...s[2],
        parentheses_symbol: true,
      }
    }

with_clause
  = KW_WITH __ head:cte_definition tail:(__ COMMA __ cte_definition)* {
      return createList(head, tail);
    }
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition {
      cte.recursive = true;
      return [cte]
    }

cte_definition
  = name:(literal_string / ident_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:union_stmt __ RPAREN {
    if (typeof name === 'string') name = { type: 'default', value: name }
    return { name, stmt, columns };
  }

cte_column_definition
  = LPAREN __ l:column_ref_index __ RPAREN {
      return l
    }

select_stmt_nake
  = __ cte:with_clause? __ KW_SELECT ___
    opts:option_clause? __
    top: top_clause? __
    d:KW_DISTINCT?      __
    c:column_clause     __
    f:from_clause?      __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
    o:order_by_clause?  __
    l:limit_clause? __
    fx:for_xml? {
      if(f) f.forEach(info => info.table && tableList.add(`select::${info.db}::${info.table}`));
      return {
          with: cte,
          type: 'select',
          options: opts,
          distinct: d,
          columns: c,
          from: f,
          for: fx,
          where: w,
          groupby: g,
          having: h,
          top,
          orderby: o,
          limit: l
      };
  }

top_clause
  = KW_TOP __ LPAREN __ n:number __ RPAREN __ p:('PERCENT'i)? {
    return {
      value: n,
      percent: p && p.toLowerCase(),
      parentheses: true,
    }
  }
  / KW_TOP __ n:number __ p:('PERCENT'i)? {
    return {
      value: n,
      percent: p && p.toLowerCase()
    }
  }

// MySQL extensions to standard SQL
option_clause
  = head:query_option tail:(__ query_option)* {
    const opts = [head];
    for (let i = 0, l = tail.length; i < l; ++i) {
      opts.push(tail[i][1]);
    }
    return opts;
  }

query_option
  = option:(
        OPT_SQL_CALC_FOUND_ROWS
        / (OPT_SQL_CACHE / OPT_SQL_NO_CACHE)
        / OPT_SQL_BIG_RESULT
        / OPT_SQL_SMALL_RESULT
        / OPT_SQL_BUFFER_RESULT
    ) { return option; }

column_clause
  = head: (KW_ALL / (STAR !ident_start) / STAR) tail:(__ COMMA __ column_list_item)* {
      columnList.add('select::null::(.*)')
      const item = {
        expr: {
          type: 'column_ref',
          table: null,
          column: '*'
        },
        as: null
      }
      if (tail && tail.length > 0) return createList(item, tail)
      return [item]
    }
  / head:column_list_item tail:(__ COMMA __ column_list_item)* {
      return createList(head, tail);
    }

column_list_item
  = tbl:(ident __ DOT)? __ STAR {
      const table = tbl && tbl[0] || null
      columnList.add(`select::${table}::(.*)`);
      return {
        expr: {
          type: 'column_ref',
          table: table,
          column: '*'
        },
        as: null
      };
    }
  / e:binary_column_expr __ alias:alias_clause? {
      return { expr: e, as: alias };
    }
value_alias_clause
  = KW_AS? __ name:ident_name c:(__ LPAREN __ column_list __ RPAREN)? {
      if (!c) return name;
      return `${name}(${c[3].join(', ')})`
    }

alias_clause
  = KW_AS __ i:alias_ident { return i; }
  / KW_AS? __ i:ident { return i; }

from_clause
  = KW_FROM __ l:table_ref_list __ op:pivot_operator? {
    if (l[0]) l[0].operator = op
    return l
  }

pivot_unpivot_common_clause
  = 'FOR'i __ c:column_ref __ i:in_op_right {
    return {
      column: c,
      in_expr: i
    }
  }

pivot_operator
  = KW_PIVOT __ LPAREN __ e:aggr_func __ p:pivot_unpivot_common_clause __ RPAREN __ as:alias_clause? {
    return {
      'type': 'pivot',
      'expr': e,
      ...p,
      as,
    }
  }
  / KW_UNPIVOT __ LPAREN __ e:column_ref __ p:pivot_unpivot_common_clause __  RPAREN __ as:alias_clause? {
    return {
      'type': 'unpivot',
      'expr': e,
      ...p,
      as,
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

index_type
  = KW_USING __
  t:("BTREE"i / "HASH"i) {
    return {
      keyword: 'using',
      type: t.toLowerCase(),
    }
  }
  / k:(KW_CLUSTERED / KW_NONCLUSTERED)  {
    return {
      keyword: k.toLowerCase()
    }
  }

index_options_list
  = head:index_option tail:(__ COMMA __ index_option)* {
    return createList(head, tail)
  }

index_options
  = head:index_option tail:(__ index_option)* {
    const result = [head];
    for (let i = 0; i < tail.length; i++) {
      result.push(tail[i][1]);
    }
    return result;
  }

partition_number_expression_list
  = head:partition_number_expression tail:(__ COMMA __ partition_number_expression)* {
    return createList(head, tail)
  }

partition_number_expression
  = s:literal_numeric __ t:KW_TO __ e:literal_numeric {
    return {
      type: 'range',
      symbol: t[0],
      start: s,
      end: s
    }
  }
  / literal_numeric

on_partition
  = KW_ON __ 'PARTITIONS'i __ LPAREN __ p:partition_number_expression_list __ RPAREN {
    return {
      type: 'on partitions',
      partitions: p
    }
  }

index_option
  = k:(KW_KEY_BLOCK_SIZE) __ e:(KW_ASSIGIN_EQUAL)? __ kbs:literal_numeric {
    return {
      type: k.toLowerCase(),
      symbol: e,
      expr: kbs
    };
  }
  / k:('FILLFACTOR'i / 'MAX_DURATION'i / 'MAXDOP'i) __ e:KW_ASSIGIN_EQUAL __ kbs:literal_numeric {
    return {
      type: k.toLowerCase(),
      symbol: e,
      expr: kbs
    };
  }
  / index_type
  / "WITH"i __ "PARSER"i __ pn:ident_name {
    return {
      type: 'with parser',
      expr: pn
    }
  }
  / k:("VISIBLE"i / "INVISIBLE"i) {
    return {
      type: k.toLowerCase(),
      expr: k.toLowerCase()
    }
  }
  / k:('PAD_INDEX'i / 'SORT_IN_TEMPDB'i / 'IGNORE_DUP_KEY'i / 'STATISTICS_NORECOMPUTE'i / 'STATISTICS_INCREMENTAL'i / 'DROP_EXISTING'i / 'ONLINE'i / 'RESUMABLE'i / 'ALLOW_ROW_LOCKS'i / 'ALLOW_PAGE_LOCKS'i / 'OPTIMIZE_FOR_SEQUENTIAL_KEY'i ) __ e:KW_ASSIGIN_EQUAL __ r:(KW_ON / KW_OFF) {
    return {
      type: k.toLowerCase(),
      symbol: e,
      expr: {
        type: 'origin',
        value: r[0]
      }
    }
  }
  / k:'DATA_COMPRESSION'i __ e:KW_ASSIGIN_EQUAL __ r:('NONE'i / 'ROW'i / 'PAGE') __ on:on_partition? {
    return {
      type: k.toLowerCase(),
      symbol: e,
      expr: {
        value: r,
        on,
      },
    }
  }
  / keyword_comment

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
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ il:ident_name_list __ RPAREN {
      t.join = op;
      t.using = il;
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
table_hint_item
  = 'FORCESEEK'i __ LPAREN __ i:ident __ LPAREN __ ic:column_ref_index __ RPAREN __ RPAREN {
    return {
      keyword: 'forceseek',
      index: i,
      index_columns: ic,
      parentheses: true
    }
  }
  / 'SPATIAL_WINDOW_MAX_CELLS'i __ KW_ASSIGIN_EQUAL __ n:literal_numeric {
    return {
      keyword: 'spatial_window_max_cells',
      expr: n
    }
  }
  / p:'NOEXPAND'i? __ KW_INDEX __ LPAREN __ il:ident_name_list __ RPAREN {
    return {
      keyword: 'index',
      expr: il,
      parentheses: true,
      prefix: p && p.toLowerCase()
    }
  }
  / p:'NOEXPAND'i?  __ KW_INDEX __ KW_ASSIGIN_EQUAL __ i:ident {
    return {
      keyword: 'index',
      expr: i,
      prefix: p && p.toLowerCase()
    }
  }
  / i:('NOEXPAND'i / 'FORCESCAN'i / 'FORCESEEK'i / 'HOLDLOCK'i / 'NOLOCK'i / 'NOWAIT'i / 'PAGLOCK'i / 'READCOMMITTED'i / 'READCOMMITTEDLOCK'i / 'READPAST'i / 'READUNCOMMITTED'i / 'REPEATABLEREAD 'i  / 'ROWLOCK'i / 'SERIALIZABLE'i / 'SNAPSHOT'i / 'TABLOCK'i / 'TABLOCKX'i / 'UPDLOCK'i / 'XLOCK'i) {
    return {
      keyword: 'literal_string',
      expr: { type: 'origin', value: i }
    }
  }

table_hint_item_list
  = head:table_hint_item tail:(__ COMMA __ table_hint_item)* {
    return createList(head, tail)
  }

table_hint
  = k:KW_WITH? __ LPAREN __ t:table_hint_item_list __ RPAREN {
    return {
      keyword: k && k[0].toLowerCase(),
      expr: t,
      parentheses: true,
    }
  }

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = KW_DUAL {
      return {
        type: 'dual'
      };
  }
  / t:table_name __ alias:alias_clause? __ th:table_hint? {
      t.as = alias
      t.table_hint = th
      return t
    }
  / stmt:value_clause __ alias:value_alias_clause? {
    return {
      expr: { type: 'values', values: stmt },
      as: alias
    };
  }
  / LPAREN __ stmt:(union_stmt / value_clause) __ RPAREN __ alias:value_alias_clause? {
      if (Array.isArray(stmt)) stmt = { type: 'values', values: stmt }
      stmt.parentheses = true;
      return {
        expr: stmt,
        as: alias
      };
    }

join_op
  = a:(KW_LEFT / KW_RIGHT / KW_FULL) __ s:KW_OUTER? __ KW_JOIN { return [a[0].toUpperCase(), s && s[0], 'JOIN'].filter(v => v).join(' '); }
  / KW_CROSS __ j:(KW_JOIN / KW_APPLY) { return `CROSS ${j[0].toUpperCase()}` }
  / a:KW_OUTER __ KW_APPLY { return 'OUTER APPLY' }
  / a:(KW_INNER)? __ KW_JOIN { return a ? 'INNER JOIN' : 'JOIN' }

table_name
  = server:ident __ DOT __ db:ident __ DOT __ schema:ident __ DOT __ table:ident {
    return {
        server,
        db,
        schema,
        table
      }
  }
  / db:ident __ DOT __ schema:ident __ DOT __ table:ident {
      return {
        db,
        schema,
        table
      }
    }
  / dt:ident tail:(__ DOT __ ident)? {
      const obj = { db: null, table: dt };
      if (tail !== null) {
        obj.db = dt;
        obj.table = tail[3];
      }
      return obj;
    }
  / v:var_decl {
      v.db = null;
      v.table = v.name;
      return v;
    }
or_and_expr
	= head:expr tail:(__ (KW_AND / KW_OR) __ expr)* {
    const len = tail.length
    let result = head
    for (let i = 0; i < len; ++i) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3])
    }
    return result
  }
on_clause
  = KW_ON __ e:or_and_where_expr { return e; }

where_clause
  = KW_WHERE __ e:or_and_where_expr { return e; }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list { return e.value; }

column_ref_index
  = column_order_list / literal_list

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
      return createList(head, tail);
    }

having_clause
  = KW_HAVING __ e:or_and_where_expr { return e; }

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
    const obj = { expr: e, type: d };
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
for_xml_item
  = i:('RAW'i / 'AUTO'i /  'EXPLICIT'i) {
    return {
      keyword: i,
    }
  }
  / i:'PATH'i __ v:(LPAREN __ (column_ref / literal_string)? __ RPAREN)? {
    return {
      keyword: i,
      expr: v && v[2]
    }
  }
for_xml
  = 'FOR'i __ 'XML'i __ v:for_xml_item {
    return {
      type: 'for xml',
      ...v,
    }
  }

update_stmt
  = __ cte:with_clause? __ KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    w:where_clause? {
      const dbObj = {}
      if (t) t.forEach(tableInfo => {
        const { db, as, table, join } = tableInfo
        const action = join ? 'select' : 'update'
        if (db) dbObj[table] = db
        if (table) tableList.add(`${action}::${db}::${table}`)
      });
      if(l) {
        l.forEach(col => {
          if (col.table) {
            const table = queryTableAlias(col.table)
            tableList.add(`update::${dbObj[table] || null}::${table}`)
          }
          columnList.add(`update::${col.table}::${col.column}`)
        });
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          with: cte,
          type: 'update',
          table: t,
          set: l,
          where: w
        }
      };
    }

delete_stmt
  = KW_DELETE    __
    t: table_ref_list? __
    f:from_clause __
    w:where_clause? {
     if(f) f.forEach(tableInfo => {
        const { db, as, table, join } = tableInfo
        const action = join ? 'select' : 'delete'
        if (table) tableList.add(`${action}::${db}::${table}`)
        if (!join) columnList.add(`delete::${table}::(.*)`);
      });
      if (t === null && f.length === 1) {
        const tableInfo = f[0]
        t = [{
          db: tableInfo.db,
          table: tableInfo.table,
          as: tableInfo.as,
          addition: true
        }]
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'delete',
          table: t,
          from: f,
          where: w
        }
      };
    }
set_list
  = head:set_item tail:(__ COMMA __ set_item)* {
      return createList(head, tail);
    }

/**
 * here only use `additive_expr` to support 'col1 = col1+2'
 * if you want to use lower operator, please use '()' like below
 * 'col1 = (col2 > 3)'
 */
set_item
  = tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ v:additive_expr {
      return { column: c, value: v, table: tbl && tbl[0] };
    }
    / tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
      return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
  }
insert_value_clause
  = value_clause
  / select_stmt_nake

insert_partition
  = KW_PARTITION __ LPAREN __ il:ident_name_list __ RPAREN {
      return il
    }
  / KW_PARTITION __ v: value_item {
    return v
  }

replace_insert_stmt
  = ri:replace_insert       __
    KW_INTO?                 __
    t:table_name  __
    p:insert_partition? __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause {
      if (t) {
        tableList.add(`insert::${t.db}::${t.table}`)
        t.as = null
      }
      if (c) {
        let table = t && t.table || null
        if(Array.isArray(v)) {
          v.forEach((row, idx) => {
            if(row.value.length != c.length) {
              throw new Error(`Error: column count doesn't match value count at row ${idx+1}`)
            }
          })
        }
        c.forEach(c => columnList.add(`insert::${table}::${c}`));
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: ri,
          table: [t],
          columns: c,
          values: v,
          partition: p,
        }
      };
    }

insert_no_columns_stmt
  = ri:replace_insert       __
    ig:KW_IGNORE?  __
    it:KW_INTO?   __
    t:table_name  __
    p:insert_partition? __
    v:insert_value_clause {
      if (t) {
        tableList.add(`insert::${t.db}::${t.table}`)
        columnList.add(`insert::${t.table}::(.*)`);
        t.as = null
      }
      const prefix = [ig, it].filter(v => v).map(v => v[0] && v[0].toLowerCase()).join(' ')
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: ri,
          table: [t],
          columns: null,
          values: v,
          partition: p,
          prefix,
        }
      };
    }

replace_insert
  = KW_INSERT   { return 'insert'; }
  / KW_REPLACE  { return 'replace'; }

value_clause
  = KW_VALUES __ l:value_list  { return l; }

value_list
  = head:value_item tail:(__ COMMA __ value_item)* {
      return createList(head, tail);
    }

value_item
  = LPAREN __ l:expr_list  __ RPAREN {
      return l;
    }

expr_list
  = head:expr tail:(__ COMMA __ expr)* {
      const el = { type: 'expr_list' };
      el.value = createList(head, tail);
      return el;
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
    condition_list:case_when_then_list  __
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
    condition_list:case_when_then_list  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: expr,
        args: condition_list
      };
    }

case_when_then_list
  = head:case_when_then __ tail:(__ case_when_then)* {
    return createList(head, tail, 1)
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

/**
 * Borrowed from PL/SQL ,the priority of below list IS ORDER BY DESC
 * ---------------------------------------------------------------------------------------------------
 * | +, -                                                     | identity, negation                   |
 * | *, /                                                     | multiplication, division             |
 * | +, -                                                     | addition, subtraction, concatenation |
 * | =, <, >, <=, >=, <>, !=, IS, LIKE, BETWEEN, IN           | comparion                            |
 * | !, NOT                                                   | logical negation                     |
 * | AND                                                      | conjunction                          |
 * | OR                                                       | inclusion                            |
 * ---------------------------------------------------------------------------------------------------
 */

_expr
  = logic_operator_expr // support concatenation operator || and &&
  / or_expr
  / unary_expr

expr
  = _expr / union_stmt

logic_operator_expr
  = head:primary tail:(__ LOGIC_OPERATOR __ primary)+ __ rh:comparison_op_right? {
    const logicExpr = createBinaryExprChain(head, tail)
    if (rh === null) return logicExpr
    else if (rh.type === 'arithmetic') return createBinaryExprChain(logicExpr, rh.tail)
    else return createBinaryExpr(rh.op, logicExpr, rh.right)
  }

unary_expr
  = op: additive_operator tail: (__ primary)+ {
    return createUnaryExpr(op, tail[0][1]);
  }

binary_column_expr
  = head:expr tail:(__ (KW_AND / KW_OR / LOGIC_OPERATOR) __ expr)* {
    const ast = head.ast
    if (ast && ast.type === 'select') {
      if (!(head.parentheses_symbol || head.parentheses || head.ast.parentheses || head.ast.parentheses_symbol) || ast.columns.length !== 1 || ast.columns[0].expr.column === '*') throw new Error('invalid column clause with select statement')
    }
    if (!tail || tail.length === 0) return head
    const len = tail.length
    let result = tail[len - 1][3]
    for (let i = len - 1; i >= 0; i--) {
      const left = i === 0 ? head : tail[i - 1][3]
      result = createBinaryExpr(tail[i][1], left, result)
    }
    return result
  }

or_and_where_expr
	= head:expr tail:(__ (KW_AND / KW_OR / COMMA) __ expr)* {
    const len = tail.length
    let result = head;
    let seperator = ''
    for (let i = 0; i < len; ++i) {
      if (tail[i][1] === ',') {
        seperator = ','
        if (!Array.isArray(result)) result = [result]
        result.push(tail[i][3])
      } else {
        result = createBinaryExpr(tail[i][1], result, tail[i][3]);
      }
    }
    if (seperator === ',') {
      const el = { type: 'expr_list' }
      el.value = result
      return el
    }
    return result
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
  / op:in_op __ e:(var_decl / literal_string) {
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
  / var_decl

column_ref
  = db:(ident __ DOT)? __ schema:(ident __ DOT)? __ tbl:(ident __ DOT)? __ col:column {
      const obj = { table: null, db: null, schema: null }
      if (db !== null) {
        obj.table = db[0]
      }
      if (schema !== null) {
        obj.table = schema[0]
        obj.schema = db[0]
      }
      if (tbl !== null) {
        obj.table = tbl[0]
        obj.db = db[0]
        obj.schema = schema[0]
      }
      columnList.add(`select::${[obj.db, obj.schema, obj.table].join('.')}::${col}`);
      return {
        type: 'column_ref',
        ...obj,
        column: col
      };
    }

column_list
  = head:column tail:(__ COMMA __ column)* {
      return createList(head, tail);
    }
ident_without_kw_type
  = n:ident_name {
    return { type: 'default', value: n }
  }
  / quoted_ident_type

ident_type
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      return { type: 'default', value: name }
    }
  / quoted_ident_type
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

quoted_ident_type
  = double_quoted_ident / single_quoted_ident / backticks_quoted_ident / brackets_quoted_ident

quoted_ident
  = v:(double_quoted_ident / single_quoted_ident / backticks_quoted_ident / brackets_quoted_ident) {
    return v.value
  }

double_quoted_ident
  = '"' chars:[^"]+ '"' {
    return {
      type: 'double_quote_string',
      value: chars.join('')
    }
  }

single_quoted_ident
  = "'" chars:[^']+ "'" {
    return {
      type: 'single_quote_string',
      value: chars.join('')
    }
  }

backticks_quoted_ident
  = "`" chars:[^`]+ "`" {
    return {
      type: 'backticks_quote_string',
      value: chars.join('')
    }
  }

brackets_quoted_ident
  = "[" chars:[^\]]+ "]" {
    return {
      type: 'brackets_quote_string',
      value: chars.join('')
    }
  }

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

ident_name_list
  = head:ident_name tail:(__ COMMA __ ident_name)* {
    return createList(head, tail)
  }

ident_start = [A-Za-z_@#]

ident_part  = [A-Za-z0-9_\-@$]

// to support column name like `cf1:name` in hbase
column_part  = [A-Za-z0-9_:]

param
  = l:(':' ident_name) {
      return { type: 'param', value: l[1] };
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
        over: bc
      };
    }

KW_SUM_MAX_MIN_AVG
  = KW_SUM / KW_MAX / KW_MIN / KW_AVG

on_update_current_timestamp
  = KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP __ LPAREN __ l:expr_list? __ RPAREN{
    return {
      type: 'on update',
      keyword: kw,
      parentheses: true,
      expr: l
    }
  }
  / KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP {
    return {
      type: 'on update',
      keyword: kw,
    }
  }

over_partition
  = 'OVER'i __ aws:as_window_specification {
    return {
      type: 'window',
      as_window_specification: aws,
    }
  }
  / on_update_current_timestamp

window_clause
  = 'WINDOW'i __ l:named_window_expr_list {
    // => { keyword: 'window'; type: 'window', expr: named_window_expr_list; }
    return {
      keyword: 'window',
      type: 'window',
      expr: l,
    }
  }

named_window_expr_list
  = head:named_window_expr tail:(__ COMMA __ named_window_expr)* {
    // => named_window_expr[]
      return createList(head, tail);
    }

named_window_expr
  = nw:ident_name __ KW_AS __ anw:as_window_specification {
    // => { name: ident_name;  as_window_specification: as_window_specification; }
    return {
      name: nw,
      as_window_specification: anw,
    }
  }

as_window_specification
  = ident_name
  / LPAREN __ ws:window_specification? __ RPAREN {
    return {
      window_specification: ws || {},
      parentheses: true
    }
  }

window_specification
  = bc:partition_by_clause? __ l:order_by_clause? __ w:window_frame_clause? {
    return {
      name: null,
      partitionby: bc,
      orderby: l,
      window_frame_clause: w,
    }
  }

window_specification_frameless
  = bc:partition_by_clause? __ l:order_by_clause? {
    return {
      name: null,
      partitionby: bc,
      orderby: l,
      window_frame_clause: null
    }
  }

window_frame_clause
  = kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    // => string
    return `rows ${s.value}`
  }
  / KW_ROWS __ KW_BETWEEN __ p:window_frame_bound __ KW_AND __ f:window_frame_bound {
    // => string
    return `rows between ${p.value} and ${f.value}`
  }
window_frame_bound = window_frame_preceding / window_frame_following

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
  / d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN tail:(__ (KW_AND / KW_OR) __ expr)* __ or:order_by_clause? {
    const len = tail.length
    let result = c
    result.parentheses = true
    for (let i = 0; i < len; ++i) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3])
    }
    return {
      distinct: d,
      expr: result,
      orderby: or,
    };
  }
  / d:KW_DISTINCT? __ c:or_and_expr __ or:order_by_clause? { return { distinct: d, expr: c, orderby: or }; }


star_expr
  = "*" { return { type: 'star', value: '*' }; }

func_call
  = name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc
      };
    }
  / f:scalar_time_func __ up:on_update_current_timestamp? {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: f }] },
        over: up
    }
  }
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
    if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc
      };
    }
scalar_time_func
  = KW_CURRENT_DATE
  / KW_CURRENT_TIME
  / KW_CURRENT_TIMESTAMP
scalar_func
  = scalar_time_func
  / KW_CURRENT_USER
  / KW_USER
  / KW_SESSION_USER
  / KW_SYSTEM_USER

cast_expr
  = c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: t
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: {
        dataType: 'DECIMAL(' + precision + ')'
      }
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
      return {
        type: 'cast',
        keyword: c.toLowerCase(),
        expr: e,
        symbol: 'as',
        target: {
          dataType: 'DECIMAL(' + precision + ', ' + scale + ')'
        }
      };
    }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
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
  = r:'N'i? ca:("'" single_char* "'") {
      return {
        type: r ? 'var_string' : 'single_quote_string',
        value: ca[1].join(''),
      };
    }
  / ca:("\"" single_quote_char* "\"") {
      return {
        type: 'double_quote_string',
        value: ca[1].join('')
      };
    }
  / b:('_binary'i / '_latin1'i)? __ r:'0x'i ca:([0-9A-Fa-f]*) {
    return {
        type: 'full_hex_string',
        prefix: b,
        value: ca.join('')
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
  / "''" { return "''" }
  / '""' { return '""' }
  / '``' { return '``' }

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
  / op:("-" / "+" ) digits:digits { return op + digits; }
   / op:("-" / "+" ) digit:digit { return op + digit; }

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
KW_TOP      = "TOP"i        !ident_start
KW_FALSE    = "FALSE"i      !ident_start

KW_SHOW     = "SHOW"i       !ident_start
KW_DROP     = "DROP"i       !ident_start { return 'DROP'; }
KW_DECLARE  = "DECLARE"i    !ident_start { return 'DECLARE'; }
KW_USE      = "USE"i        !ident_start
KW_ALTER    = "ALTER"i      !ident_start { return 'ALTER' }
KW_SELECT   = "SELECT"i     !ident_start
KW_UPDATE   = "UPDATE"i     !ident_start
KW_CREATE   = "CREATE"i     !ident_start
KW_TEMPORARY = "TEMPORARY"i !ident_start
KW_DELETE   = "DELETE"i     !ident_start
KW_INSERT   = "INSERT"i     !ident_start
KW_RECURSIVE= "RECURSIVE"   !ident_start
KW_REPLACE  = "REPLACE"i    !ident_start
KW_RENAME   = "RENAME"i     !ident_start
KW_IGNORE   = "IGNORE"i     !ident_start
KW_EXPLAIN  = "EXPLAIN"i    !ident_start
KW_PARTITION = "PARTITION"i !ident_start { return 'PARTITION' }

KW_INTO     = "INTO"i       !ident_start
KW_FROM     = "FROM"i       !ident_start
KW_SET      = "SET"i        !ident_start { return 'SET' }
KW_UNLOCK   = "UNLOCK"i     !ident_start
KW_LOCK     = "LOCK"i       !ident_start

KW_AS       = "AS"i         !ident_start
KW_TABLE    = "TABLE"i      !ident_start { return 'TABLE'; }
KW_VIEW    = "VIEW"i      !ident_start { return 'VIEW'; }
KW_DATABASE = "DATABASE"i      !ident_start { return 'DATABASE'; }
KW_SCHEME   = "SCHEME"i      !ident_start { return 'SCHEME'; }
KW_TABLES   = "TABLES"i      !ident_start { return 'TABLES'; }
KW_COLLATE  = "COLLATE"i    !ident_start { return 'COLLATE'; }

KW_ON       = "ON"i       !ident_start
KW_OFF      = "OFF"i       !ident_start
KW_LEFT     = "LEFT"i     !ident_start
KW_RIGHT    = "RIGHT"i    !ident_start
KW_FULL     = "FULL"i     !ident_start
KW_INNER    = "INNER"i    !ident_start
KW_CROSS    = "CROSS"i    !ident_start
KW_JOIN     = "JOIN"i     !ident_start
KW_APPLY    = "APPLY"i     !ident_start
KW_OUTER    = "OUTER"i    !ident_start
KW_OVER     = "OVER"i     !ident_start
KW_UNION    = "UNION"i    !ident_start
KW_VALUES   = "VALUES"i   !ident_start
KW_USING    = "USING"i    !ident_start

KW_WHERE    = "WHERE"i      !ident_start
KW_WITH     = "WITH"i       !ident_start

KW_GO       = "GO"i         !ident_start { return 'GO'; }
KW_GROUP    = "GROUP"i      !ident_start
KW_BY       = "BY"i         !ident_start
KW_ORDER    = "ORDER"i      !ident_start
KW_HAVING   = "HAVING"i     !ident_start

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

KW_CALL     = "CALL"i       !ident_start { return 'CALL'; }

KW_CASE     = "CASE"i       !ident_start
KW_WHEN     = "WHEN"i       !ident_start
KW_THEN     = "THEN"i       !ident_start
KW_ELSE     = "ELSE"i       !ident_start
KW_END      = "END"i        !ident_start

KW_CAST     = "CAST"i       !ident_start { return 'CAST' }

KW_BIT  = "BIT"i  !ident_start { return 'BIT'; }
KW_MONEY  = "MONEY"i  !ident_start { return 'MONEY'; }
KW_SMALLMONEY  = "SMALLMONEY"i  !ident_start { return 'SMALLMONEY'; }
KW_CHAR     = "CHAR"i     !ident_start { return 'CHAR'; }
KW_VARCHAR  = "VARCHAR"i  !ident_start { return 'VARCHAR';}
KW_NCHAR  = "NCHAR"i  !ident_start { return 'NCHAR';}
KW_NVARCHAR  = "NVARCHAR"i  !ident_start { return 'NVARCHAR';}
KW_NUMERIC  = "NUMERIC"i  !ident_start { return 'NUMERIC'; }
KW_DECIMAL  = "DECIMAL"i  !ident_start { return 'DECIMAL'; }
KW_SIGNED   = "SIGNED"i   !ident_start { return 'SIGNED'; }
KW_UNSIGNED = "UNSIGNED"i !ident_start { return 'UNSIGNED'; }
KW_INT      = "INT"i      !ident_start { return 'INT'; }
KW_ZEROFILL = "ZEROFILL"i !ident_start { return 'ZEROFILL'; }
KW_INTEGER  = "INTEGER"i  !ident_start { return 'INTEGER'; }
KW_JSON     = "JSON"i     !ident_start { return 'JSON'; }
KW_SMALLINT = "SMALLINT"i !ident_start { return 'SMALLINT'; }
KW_TINYINT  = "TINYINT"i  !ident_start { return 'TINYINT'; }
KW_TINYTEXT = "TINYTEXT"i !ident_start { return 'TINYTEXT'; }
KW_TEXT     = "TEXT"i     !ident_start { return 'TEXT'; }
KW_MEDIUMTEXT = "MEDIUMTEXT"i  !ident_start { return 'MEDIUMTEXT'; }
KW_LONGTEXT  = "LONGTEXT"i  !ident_start { return 'LONGTEXT'; }
KW_BIGINT   = "BIGINT"i   !ident_start { return 'BIGINT'; }
KW_FLOAT   = "FLOAT"i   !ident_start { return 'FLOAT'; }
KW_REAL   = "REAL"i   !ident_start { return 'REAL'; }
KW_DOUBLE   = "DOUBLE"i   !ident_start { return 'DOUBLE'; }
KW_DATE     = "DATE"i     !ident_start { return 'DATE'; }
KW_SMALLDATETIME   = "SMALLDATETIME"i     !ident_start { return 'SMALLDATETIME'; }
KW_DATETIME   = "DATETIME"i     !ident_start { return 'DATETIME'; }
KW_DATETIME2  = "DATETIME2"i    !ident_start { return 'DATETIME2'; }
KW_DATETIMEOFFSET  = "DATETIMEOFFSET"i    !ident_start { return 'DATETIMEOFFSET'; }
KW_ROWS     = "ROWS"i     !ident_start { return 'ROWS'; }
KW_TIME     = "TIME"i     !ident_start { return 'TIME'; }
KW_TIMESTAMP= "TIMESTAMP"i!ident_start { return 'TIMESTAMP'; }
KW_TRUNCATE = "TRUNCATE"i !ident_start { return 'TRUNCATE'; }
KW_UNIQUEIDENTIFIER = "UNIQUEIDENTIFIER"i !ident_start { return 'UNIQUEIDENTIFIER'; }
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
KW_CURRENT_USER     = "CURRENT_USER"i !ident_start { return 'CURRENT_USER'; }
KW_SESSION_USER     = "SESSION_USER"i !ident_start { return 'SESSION_USER'; }
KW_SYSTEM_USER      = "SYSTEM_USER"i !ident_start { return 'SYSTEM_USER'; }

KW_GLOBAL         = "GLOBAL"i    !ident_start { return 'GLOBAL'; }
KW_SESSION        = "SESSION"i   !ident_start { return 'SESSION'; }
KW_LOCAL          = "LOCAL"i     !ident_start { return 'LOCAL'; }
KW_PIVOT          = "PIVOT"i   !ident_start { return 'PIVOT'; }
KW_UNPIVOT        = "UNPIVOT"i   !ident_start { return 'UNPIVOT'; }
KW_PERSIST        = "PERSIST"i   !ident_start { return 'PERSIST'; }
KW_PERSIST_ONLY   = "PERSIST_ONLY"i   !ident_start { return 'PERSIST_ONLY'; }

KW_VAR__PRE_AT = '@'
KW_VAR__PRE_AT_AT = '@@'
KW_VAR_PRE_DOLLAR = '$'
KW_VAR_PRE
  = KW_VAR__PRE_AT_AT / KW_VAR__PRE_AT / KW_VAR_PRE_DOLLAR
KW_RETURN = 'return'i
KW_ASSIGN = ':='
KW_ASSIGIN_EQUAL = '='

KW_DUAL = "DUAL"i

// MySQL Alter
KW_ADD     = "ADD"i     !ident_start { return 'ADD'; }
KW_COLUMN  = "COLUMN"i  !ident_start { return 'COLUMN'; }
KW_INDEX   = "INDEX"i  !ident_start { return 'INDEX'; }
KW_KEY     = "KEY"i  !ident_start { return 'KEY'; }
KW_FULLTEXT = "FULLTEXT"i  !ident_start { return 'FULLTEXT'; }
KW_SPATIAL  = "SPATIAL"i  !ident_start { return 'SPATIAL'; }
KW_UNIQUE     = "UNIQUE"i  !ident_start { return 'UNIQUE'; }
KW_CLUSTERED     = "CLUSTERED"i  !ident_start { return 'CLUSTERED'; }
KW_NONCLUSTERED  = "NONCLUSTERED"i  !ident_start { return 'NONCLUSTERED'; }
KW_KEY_BLOCK_SIZE = "KEY_BLOCK_SIZE"i !ident_start { return 'KEY_BLOCK_SIZE'; }
KW_COMMENT     = "COMMENT"i  !ident_start { return 'COMMENT'; }
KW_CONSTRAINT  = "CONSTRAINT"i  !ident_start { return 'CONSTRAINT'; }
KW_REFERENCES  = "REFERENCES"i  !ident_start { return 'REFERENCES'; }



// MySQL extensions to SQL
OPT_SQL_CALC_FOUND_ROWS = "SQL_CALC_FOUND_ROWS"i
OPT_SQL_CACHE           = "SQL_CACHE"i
OPT_SQL_NO_CACHE        = "SQL_NO_CACHE"i
OPT_SQL_SMALL_RESULT    = "SQL_SMALL_RESULT"i
OPT_SQL_BIG_RESULT      = "SQL_BIG_RESULT"i
OPT_SQL_BUFFER_RESULT   = "SQL_BUFFER_RESULT"i

//special character
DOT       = '.'
COMMA     = ','
STAR      = '*'
LPAREN    = '('
RPAREN    = ')'

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
  = "/*" (!"*/" !"/*" char / block_comment)* "*/"

line_comment
  = "--" (!EOL char)*

pound_sign_comment
  = "#" (!EOL char)*

keyword_comment
  = k:KW_COMMENT __ s:KW_ASSIGIN_EQUAL? __ c:literal_string {
    return {
      type: k.toLowerCase(),
      keyword: k.toLowerCase(),
      symbol: s,
      value: c,
    }
  }

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

//begin procedure extension
proc_stmts
  = proc_stmt+

proc_stmt
  = &{ varList = []; return true; } __ s:(assign_stmt / return_stmt) {
      return { stmt: s, vars: varList };
    }

assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s: (KW_ASSIGN / KW_ASSIGIN_EQUAL) __ e:proc_expr {
    return {
      type: 'assign',
      left: va,
      symbol: s,
      right: e
    };
  }


return_stmt
  = KW_RETURN __ e:proc_expr {
      return { type: 'return', expr: e };
    }

proc_expr
  = select_stmt
  / proc_join
  / proc_additive_expr
  / proc_array

proc_additive_expr
  = head:proc_multiplicative_expr
    tail:(__ additive_operator  __ proc_multiplicative_expr)* {
      return createBinaryExprChain(head, tail);
    }

proc_multiplicative_expr
  = head:proc_primary
    tail:(__ multiplicative_operator  __ proc_primary)* {
      return createBinaryExprChain(head, tail);
    }

proc_join
  = lt:var_decl __ op:join_op  __ rt:var_decl __ expr:on_clause {
      return {
        type: 'join',
        ltable: lt,
        rtable: rt,
        op: op,
        on: expr
      };
    }

proc_primary
  = literal
  / var_decl
  / proc_func_call
  / param
  / LPAREN __ e:proc_additive_expr __ RPAREN {
      e.parentheses = true;
      return e;
    }

proc_func_name
  = dt:ident_without_kw_type tail:(__ DOT __ ident_without_kw_type)? {
      const result = { name: [dt] }
      if (tail !== null) {
        result.schema = dt
        result.name = [tail[3]]
      }
      return result
    }

proc_func_call
  = name:proc_func_name __ LPAREN __ l:proc_primary_list? __ RPAREN {
      //compatible with original func_call
      return {
        type: 'function',
        name: name,
        args: {
          type: 'expr_list',
          value: l
        }
      };
    }
  / name:proc_func_name {
    return {
        type: 'function',
        name: name,
        args: null
      };
  }

proc_primary_list
  = head:proc_primary tail:(__ COMMA __ proc_primary)* {
      return createList(head, tail);
    }

proc_array =
  LBRAKE __ l:proc_primary_list __ RBRAKE {
    return { type: 'array', value: l };
  }

var_decl
  = p: KW_VAR_PRE d: without_prefix_var_decl {
    //push for analysis
    return {
      type: 'var',
      ...d,
      prefix: p
    };
  }

without_prefix_var_decl
  = name:ident_name m:mem_chain {
    //push for analysis
    varList.push(name);
    return {
      type: 'var',
      name: name,
      members: m,
      prefix: null,
    };
  }
  / n:literal_numeric {
    return {
      type: 'var',
      name: n.value,
      members: [],
      quoted: null,
      prefix: null,
    }
  }

mem_chain
  = l:('.' ident_name)* {
    const s = [];
    for (let i = 0; i < l.length; i++) {
      s.push(l[i][1]);
    }
    return s;
  }

data_type
  = character_string_type
  / numeric_type
  / datetime_type
  / json_type
  / text_type
  / uniqueidentifier_type

character_string_type
  = lb:LBRAKE? __ t:(KW_CHAR / KW_VARCHAR / KW_NCHAR / KW_NVARCHAR) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ LPAREN __ l:[0-9]+ __ RPAREN {
    return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true };
  }
  / lb:LBRAKE? __ t:(KW_CHAR / KW_VARCHAR) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t };
  }
  / lb:LBRAKE? __ t:KW_NVARCHAR __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ LPAREN __ m:'MAX'i __ RPAREN {
    return {
      dataType: t,
      length: 'max'
    }
  }

numeric_type_suffix
  = un: KW_UNSIGNED? __ ze: KW_ZEROFILL? {
    const result = []
    if (un) result.push(un)
    if (ze) result.push(ze)
    return result
  }

numeric_type
  = lb:LBRAKE? __ t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_REAL / KW_DOUBLE) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? {
    return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s };
  }
  / lb:LBRAKE? __ t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_REAL / KW_DOUBLE) rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ l:[0-9]+ __ s:numeric_type_suffix? {
    return { dataType: t, length: parseInt(l.join(''), 10), suffix: s };
  }
  / lb:LBRAKE? __ t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_REAL / KW_DOUBLE / KW_BIT / KW_MONEY / KW_SMALLMONEY) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ s:numeric_type_suffix? __{
    return { dataType: t, suffix: s };
  }
datetime_type
  = lb:LBRAKE? __ t:(KW_DATETIME2 / KW_DATETIMEOFFSET / KW_TIME) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN {
    return  {dataType: t, length: parseInt(l.join(''), 10), parentheses: true }
  }
  / lb:LBRAKE? __ t:(KW_DATE / KW_SMALLDATETIME / KW_DATETIME2 / KW_DATETIME / KW_DATETIMEOFFSET / KW_TIME / KW_TIMESTAMP) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t };
  }

json_type
  = lb:LBRAKE? __ t:KW_JSON __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t };
  }

text_type
  = lb:LBRAKE? __ t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t }
  }

uniqueidentifier_type
  = lb:LBRAKE? __ t:(KW_UNIQUEIDENTIFIER) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t }
  }
