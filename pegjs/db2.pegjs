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
    'EXCEPT': true,
    'EXPLAIN': true,

    'FALSE': true,
    'FETCH': true,
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

    'MINUS': true,
    'NOT': true,
    'NULL': true,

    'OFFSET': true,
    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

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
  = __ n:(multiple_stmt) {
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

create_stmt
  = create_table_stmt
  / create_db_stmt

alter_stmt
  = alter_table_stmt

crud_stmt
  = union_stmt
  / update_stmt
  / replace_insert_stmt
  / insert_no_columns_stmt
  / insert_into_set
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
  = u:(KW_UNION / KW_INTERSECT / KW_EXCEPT) __ s:(KW_ALL / KW_DISTINCT)? {
    return s ? `${u.toLowerCase()} ${s.toLowerCase()}` : `${u.toLowerCase()}`
  }
  / KW_MINUS { return 'minus' }

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
    k:(KW_DATABASE / KW_SCHEMA) __
    ife:if_not_exists_stmt? __
    t:proc_func_name __
    c:create_db_definition? {
      const keyword = k.toLowerCase()
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword,
          if_not_exists:ife,
          [keyword]: { db: t.schema, schema: t.name },
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
          if_not_exists:ife,
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
          if_not_exists:ife,
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
  = LPAREN __ head:create_definition tail:(__ COMMA __ create_definition)* __ RPAREN {
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
  / a:('AUTO_INCREMENT'i) {
    return { auto_increment: a.toLowerCase() }
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

collate_expr
  = KW_COLLATE __ s:KW_ASSIGIN_EQUAL? __ ca:ident {
    return {
      type: 'collate',
      keyword: 'collate',
      collate: {
        name: ca,
        symbol: s,
      }
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
  = KW_DEFAULT __ ce:expr {
    return {
      type: 'default',
      value: ce
    }
  }
drop_index_opt
  = head:(ALTER_ALGORITHM / ALTER_LOCK) tail:(__ (ALTER_ALGORITHM / ALTER_LOCK))* {
    return createList(head, tail, 1)
  }
drop_stmt
  = a:KW_DROP __
    r:KW_TABLE __
    t:table_ref_list {
      if(t) t.forEach(tt => tableList.add(`${a}::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          name: t
        }
      };
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
  = KW_ADD __
    kc:KW_COLUMN? __
    cd:create_column_definition {
      return {
        action: 'add',
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
  = KW_DROP __ kc:'CHECK'i __ c:ident_name {
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
        keyword: 'check check',
        resource: 'constraint',
        type: 'alter',
      }
    }

ALTER_DISABLE_CONSTRAINT
  = 'NOCHECK'i __ KW_CONSTRAINT __ c:ident_name {
      return {
        action: 'nocheck',
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

create_constraint_primary
  = kc:constraint_name? __
  p:('PRIMARY KEY'i) __
  t:index_type? __
  de:cte_column_definition __
  id:index_options? {
    return {
        constraint: kc && kc.constraint,
        definition: de,
        constraint_type: p.toLowerCase(),
        keyword: kc && kc.keyword,
        index_type: t,
        resource: 'constraint',
        index_options: id,
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
  = kc:constraint_name? __ u:'CHECK'i __ nfr:('NOT'i __ 'FOR'i __ 'REPLICATION'i __)? LPAREN __ c:expr __ RPAREN {
    return {
        constraint_type: u.toLowerCase(),
        keyword: kc && kc.keyword,
        constraint: kc && kc.constraint,
        index_type: nfr && { keyword: 'not for replication' },
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
    const on_action = []
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
  = kw:KW_DEFAULT? __ t:(create_option_character_set_kw / 'CHARSET'i / 'COLLATE'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:ident_without_kw_type {
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


ALTER_ADD_FULLETXT_SPARITAL_INDEX
  = KW_ADD __ fsid:create_fulltext_spatial_index_definition {
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
  a: assign_stmt_list {
    a.keyword = kw
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'set',
        keyword: kw,
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
  = LPAREN __ l:column_ref_list __ RPAREN {
      return l
    }

select_stmt_nake
  = __ cte:with_clause? __ KW_SELECT ___
    opts:option_clause? __
    d:KW_DISTINCT?      __
    c:column_clause     __
    f:from_clause?      __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
    o:order_by_clause?  __
    l:limit_clause? 
    iso:isolation_clause? __ {
      if(f) f.forEach(info => info.table && tableList.add(`select::${info.db}::${info.table}`));
      return {
          with: cte,
          type: 'select',
          options: opts,
          distinct: d,
          columns: c,
          from: f,
          where: w,
          groupby: g,
          having: h,
          orderby: o,
          limit: l,
          isolation: iso,
      };
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

alias_clause
  = KW_AS __ i:alias_ident { return i; }
  / KW_AS? __ i:ident { return i; }

from_clause
  = KW_FROM __ l:table_ref_list { return l; }

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

index_options
  = head:index_option tail:(__ index_option)* {
    const result = [head];
    for (let i = 0; i < tail.length; i++) {
      result.push(tail[i][1]);
    }
    return result;
  }

index_option
  = k:KW_KEY_BLOCK_SIZE __ e:(KW_ASSIGIN_EQUAL)? __ kbs:literal_numeric {
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
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_without_kw_type tail:(__ COMMA __ ident_without_kw_type)* __ RPAREN {
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
      t.join = op;
      t.on   = expr;
      return t;
    }
  / op:(join_op / set_op) __ LPAREN __ stmt:union_stmt __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
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
  = KW_DUAL {
      return {
        type: 'dual'
      };
  }
  / t:table_name __ alias:alias_clause? {
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

join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { return 'FULL JOIN'; }
  / (KW_INNER __)? KW_JOIN { return 'INNER JOIN'; }

table_name
  = dt:ident tail:(__ DOT __ ident)? {
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
  = KW_GROUP __ KW_BY __ e:expr_list {
    return {
      columns: e.value
    }
  }

column_ref_index
  = l:column_ref_list
  / l: literal_list {
    return l
  }

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
      return createList(head, tail);
    }

having_clause
  = KW_HAVING __ e:or_and_where_expr { return e; }

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
  = k:KW_FETCH __ t:('FIRST'i / 'LAST'i / 'NEXT'i)  __ i1:(number_or_param) __ r:('ROWS'i / 'ROW'i) __ 'ONLY'i {
    return {
      fetch: {
        prefix: [
          { type: 'origin', value: 'fetch' },
          { type: 'origin', value: t.toLowerCase() },
        ],
        value: i1,
        suffix: [
          { type: 'origin', value: r },
          { type: 'origin', value: 'only' },
        ]
      }
    }
  }
  / KW_OFFSET __ i1:(number_or_param) __ s:('ROWS'i)? __ f:(KW_FETCH __ 'NEXT'i __ number_or_param __ ('ROWS'i / 'ROW'i) __ 'ONLY'i)? {
    const result = {
      offset: {
        prefix: [
          { type: 'origin', value: 'offset' },
        ],
        value: i1,
        suffix: [],
      }
    }
    if (s) {
      result.offset.suffix = [
        { type: 'origin', value: 'rows' },
      ]
    }
    if (f) {
      result.fetch = {
        prefix: [
          { type: 'origin', value: 'fetch' },
          { type: 'origin', value: f[2].toLowerCase() },
        ],
        value: f[4],
        suffix: [
          { type: 'origin', value: f[6].toLowerCase() },
          { type: 'origin', value: 'only' },
        ]
      }
    }
    return result
  }

isolation_clause
  = KW_WITH __ is:('CS'i / 'UR'i / 'RS'i / 'RR'i) {
    return {
      type: 'isolation',
      keyword: 'with',
      expr: { type: 'origin', value: is },
    }
  }
update_stmt
  = KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    w:where_clause? {
      const dbObj = {}
      const addTableFun = (tableInfo) => {
        const { server, db, schema, as, table, join } = tableInfo
        const action = join ? 'select' : 'update'
        const fullName = [server, db, schema].filter(Boolean).join('.') || null
        if (db) dbObj[table] = fullName
        if (table) tableList.add(`${action}::${fullName}::${table}`)
      }
      if (t) t.forEach(addTableFun);
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
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      return createList(head, tail)
    }
  / KW_PARTITION __ v: value_item {
    return v
  }

replace_insert_stmt
  = ri:replace_insert       __
    KW_INTO?                 __
    t:table_name  __
    p:insert_partition? __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause __
    odp:on_duplicate_update_stmt? {
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
          on_duplicate_update: odp,
        }
      };
    }

insert_no_columns_stmt
  = ri:replace_insert       __
    ig:KW_IGNORE?  __
    it:KW_INTO?   __
    t:table_name  __
    p:insert_partition? __
    v:insert_value_clause __
    odp: on_duplicate_update_stmt? {
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
          on_duplicate_update: odp,
        }
      };
    }

insert_into_set
  = ri:replace_insert __
    KW_INTO __
    t:table_name  __
    p:insert_partition? __
    KW_SET       __
    l:set_list   __
    odp:on_duplicate_update_stmt? {
      if (t) {
        tableList.add(`insert::${t.db}::${t.table}`)
        columnList.add(`insert::${t.table}::(.*)`);
        t.as = null
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: ri,
          table: [t],
          columns: null,
          partition: p,
          set: l,
          on_duplicate_update: odp,
        }
      };
    }

on_duplicate_update_stmt
  = KW_ON __ 'DUPLICATE'i __ KW_KEY __ KW_UPDATE __ s:set_list {
    return {
      keyword: 'on duplicate key update',
      set: s
    }
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
  = or_expr
  / unary_expr

expr
  = _expr / union_stmt

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
  / op:in_op __ e:(var_decl / literal_string / func_call) {
      return { op: op, right: e };
    }

additive_expr
  = head:multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      if (tail && tail.length && head.type === 'column_ref' && head.column === '*') throw new Error(JSON.stringify({
        message: 'args could not be star column in additive expr',
        ...getLocationObject(),
      }))
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

multiplicative_expr
  = head:unary_expr_or_primary
    tail:(__ (multiplicative_operator / LOGIC_OPERATOR)  __ unary_expr_or_primary)* {
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

unary_expr_or_primary
  = jsonb_expr
  / op:(unary_operator) tail:(__ unary_expr_or_primary) {
    // if (op === '!') op = 'NOT'
    return createUnaryExpr(op, tail[1])
  }

unary_operator
  = '!' / '-' / '+' / '~'

jsonb_expr
  = head:primary __ tail: (__ ('?|' / '?&' / '?' / '#-' / '#>>' / '#>' / DOUBLE_ARROW / SINGLE_ARROW / '@>' / '<@') __  primary)* {
    // => primary | binary_expr
    if (!tail || tail.length === 0) return head
    return createBinaryExprChain(head, tail)
  }

column_ref
  = tbl:ident __ DOT __ col:column_without_kw ce:(__ collate_expr)? {
      columnList.add(`select::${tbl}::${col}`);
      return {
        type: 'column_ref',
        table: tbl,
        column: col,
        collate: ce && ce[1],
      };
    }
  / col:column ce:(__ collate_expr)? {
      columnList.add(`select::null::${col}`);
      return {
        type: 'column_ref',
        table: null,
        column: col,
        collate: ce && ce[1],
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
  = double_quoted_ident / single_quoted_ident / backticks_quoted_ident

quoted_ident
  = v:(double_quoted_ident / single_quoted_ident / backticks_quoted_ident) {
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

ident_start = [A-Za-z_\u4e00-\u9fa5]

ident_part  = [A-Za-z0-9_$\u4e00-\u9fa5\u00C0-\u017F]

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
  = name:KW_SUM_MAX_MIN_AVG  __ LPAREN __ e:additive_expr __ RPAREN __ bc:over_partition?  {
      return {
        type: 'aggr_func',
        name: name,
        args: {
          expr: e
        },
        over: bc,
        ...getLocationObject(),
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
  = KW_OVER __ LPAREN __ KW_PARTITION __ KW_BY __ bc:column_clause __ l:order_by_clause? __ RPAREN {
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
        over: bc,
        ...getLocationObject(),
      };
    }
  / f:scalar_time_func __ up:on_update_current_timestamp? {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: f }] },
        over: up,
        ...getLocationObject(),
    }
  }
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
    if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
        ...getLocationObject(),
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
      target: [t]
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: [{
        dataType: 'DECIMAL(' + precision + ')'
      }]
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
      return {
        type: 'cast',
        keyword: c.toLowerCase(),
        expr: e,
        symbol: 'as',
        target: [{
          dataType: 'DECIMAL(' + precision + ', ' + scale + ')'
        }]
      };
    }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: [{
        dataType: s + (t ? ' ' + t: '')
      }]
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
  = ca:("'" single_char* "'") {
      return {
        type: 'single_quote_string',
        value: ca[1].join('')
      };
    }
  / ca:("\"" single_quote_char* "\"") {
      return {
        type: 'double_quote_string',
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
KW_FALSE    = "FALSE"i      !ident_start

KW_SHOW     = "SHOW"i       !ident_start
KW_DROP     = "DROP"i       !ident_start { return 'DROP'; }
KW_USE      = "USE"i        !ident_start
KW_ALTER    = "ALTER"i      !ident_start
KW_SELECT   = "SELECT"i     !ident_start
KW_UPDATE   = "UPDATE"i     !ident_start
KW_CREATE   = "CREATE"i     !ident_start
KW_TEMPORARY = "TEMPORARY"i !ident_start
KW_DELETE   = "DELETE"i     !ident_start
KW_INSERT   = "INSERT"i     !ident_start
KW_RECURSIVE= "RECURSIVE"i   !ident_start
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
KW_TABLES   = "TABLES"i      !ident_start { return 'TABLES'; }
KW_DATABASE = "DATABASE"i      !ident_start { return 'DATABASE'; }
KW_SCHEMA   = "SCHEMA"i      !ident_start { return 'SCHEMA'; }
KW_COLLATE  = "COLLATE"i    !ident_start { return 'COLLATE'; }

KW_ON       = "ON"i       !ident_start
KW_LEFT     = "LEFT"i     !ident_start
KW_RIGHT    = "RIGHT"i    !ident_start
KW_FULL     = "FULL"i     !ident_start
KW_INNER    = "INNER"i    !ident_start
KW_JOIN     = "JOIN"i     !ident_start
KW_OUTER    = "OUTER"i    !ident_start
KW_OVER     = "OVER"i     !ident_start
KW_UNION    = "UNION"i    !ident_start { return 'UNION'; }
KW_MINUS    = "MINUS"i    !ident_start { return 'MINUS'; }
KW_INTERSECT    = "INTERSECT"i    !ident_start { return 'INTERSECT'; }
KW_EXCEPT   = "EXCEPT"i   !ident_start { return 'EXCEPT'; }
KW_VALUES   = "VALUES"i   !ident_start
KW_USING    = "USING"i    !ident_start

KW_WHERE    = "WHERE"i      !ident_start
KW_WITH     = "WITH"i       !ident_start

KW_GROUP    = "GROUP"i      !ident_start
KW_BY       = "BY"i         !ident_start
KW_ORDER    = "ORDER"i      !ident_start
KW_HAVING   = "HAVING"i     !ident_start

KW_FETCH    = "FETCH"i      !ident_start { return 'FETCH'; }
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

KW_CHAR     = "CHAR"i     !ident_start { return 'CHAR'; }
KW_VARCHAR  = "VARCHAR"i  !ident_start { return 'VARCHAR';}
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
KW_DOUBLE   = "DOUBLE"i   !ident_start { return 'DOUBLE'; }
KW_DATE     = "DATE"i     !ident_start { return 'DATE'; }
KW_DATETIME     = "DATETIME"i     !ident_start { return 'DATETIME'; }
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
KW_CURRENT_USER     = "CURRENT_USER"i !ident_start { return 'CURRENT_USER'; }
KW_SESSION_USER     = "SESSION_USER"i !ident_start { return 'SESSION_USER'; }
KW_SYSTEM_USER      = "SYSTEM_USER"i !ident_start { return 'SYSTEM_USER'; }

KW_GLOBAL         = "GLOBAL"i    !ident_start { return 'GLOBAL'; }
KW_SESSION        = "SESSION"i   !ident_start { return 'SESSION'; }
KW_LOCAL          = "LOCAL"i     !ident_start { return 'LOCAL'; }
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
SINGLE_ARROW = '->'
DOUBLE_ARROW = '->>'

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
  = proc_stmt*

proc_stmt
  = &{ varList = []; return true; } __ s:(assign_stmt / return_stmt) {
      return { stmt: s, vars: varList };
    }

assign_stmt_list
  = head:assign_stmt tail:(__ COMMA __ assign_stmt)* {
    return createList(head, tail);
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
        },
        ...getLocationObject(),
      };
    }
  / name:proc_func_name {
    return {
        type: 'function',
        name: name,
        args: null,
        ...getLocationObject(),
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

character_string_type
  = t:(KW_CHAR / KW_VARCHAR) __ LPAREN __ l:[0-9]+ __ RPAREN {
    return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true };
  }
  / t:KW_CHAR { return { dataType: t }; }
  / t:KW_VARCHAR { return { dataType: t }; }

numeric_type_suffix
  = un: KW_UNSIGNED? __ ze: KW_ZEROFILL? {
    const result = []
    if (un) result.push(un)
    if (ze) result.push(ze)
    return result
  }
numeric_type
  = t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE) __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? { return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE)l:[0-9]+ __ s:numeric_type_suffix? { return { dataType: t, length: parseInt(l.join(''), 10), suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE) __ s:numeric_type_suffix? __{ return { dataType: t, suffix: s }; }


datetime_type
  = t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) __ LPAREN __ l:[0-9]+ __ RPAREN { return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true }; }
  / t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) { return { dataType: t }; }

json_type
  = t:KW_JSON { return { dataType: t }; }

text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) { return { dataType: t }}
