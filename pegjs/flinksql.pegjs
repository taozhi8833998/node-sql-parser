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
    'INTERVAL': true,
    'IS': true,

    'JOIN': true,
    'JSON': true,

    'KEY': true,

    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,

    'NOT': true,
    'NULL': true,
    'NULLS': true,

    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'RECURSIVE': true,
    'RENAME': true,
    // 'REPLACE': true,
    'RIGHT': true,

    'SELECT': true,
    'SESSION_USER': true,
    'SET': true,
    'SHOW': true,
    'STATUS': true, // reserved (MySQL)
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

    'GLOBAL': true,
    'SESSION': true,
    'LOCAL': true,
    'PERSIST': true,
    'PERSIST_ONLY': true,
  };

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

  function commonStrToLiteral(strOrLiteral) {
    return typeof strOrLiteral === 'string' ? { type: 'same', value: strOrLiteral } : strOrLiteral
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
  = __ n:(multiple_stmt / cmd_stmt / crud_stmt) {
    // => multiple_stmt | cmd_stmt | crud_stmt
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

create_stmt
  = create_table_stmt
  / create_constraint_trigger
  / create_extension_stmt
  / create_index_stmt
  / create_db_stmt

alter_stmt
  = alter_table_stmt

crud_stmt
  = union_stmt
  / update_stmt
  / replace_insert_stmt
  / insert_no_columns_stmt
  / delete_stmt
  / cmd_stmt
  / proc_stmts

multiple_stmt
  = head:crud_stmt tail:(__ SEMICOLON __ crud_stmt)+ {
      /*
      // is in reality: { tableList: any[]; columnList: any[]; ast: T; }
      export type AstStatement<T> = T;
       => AstStatement<crud_stmt[]> */
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

union_stmt
  = head:select_stmt tail:(__ KW_UNION __ KW_ALL? __ select_stmt)* __ ob: order_by_clause? __ l:limit_clause? {
     /* export interface union_stmt_node extends select_stmt_node  {
         _next: union_stmt_node;
         union: 'union' | 'union all';
      }
     => AstStatement<union_stmt_node>
     */
      let cur = head
      for (let i = 0; i < tail.length; i++) {
        cur._next = tail[i][5]
        cur.union = tail[i][3] ? 'union all' : 'union'
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

create_extension_stmt
  = a:KW_CREATE __
    e:'EXTENSION'i __
    ife: KW_IF_NOT_EXISTS? __
    n:(ident_name / literal_string) __
    w:KW_WITH? __
    s:('SCHEMA'i __ ident_name / literal_string)? __
    v:('VERSION'i __ (ident_name / literal_string))? __
    f:(KW_FROM __ (ident_name / literal_string))? {
      /*
       export type nameOrLiteral = literal_string | { type: 'same', value: string; };
      => {
          type: 'create';
          keyword: 'extension';
          if_not_exists?: 'if not exists';
          extension: nameOrLiteral;
          with: 'with';
          schema: nameOrLiteral;
          version: nameOrLiteral;
          from: nameOrLiteral;
        }
      */
      return {
        type: 'create',
        keyword: e.toLowerCase(),
        if_not_exists: ife && ife[0].toLowerCase(),
        extension: commonStrToLiteral(n),
        with: w && w[0].toLowerCase(),
        schema: commonStrToLiteral(s && s[2].toLowerCase()), // <== wont that be a bug ?
        version: commonStrToLiteral(v && v[2]),
        from: commonStrToLiteral(f && f[2]),
      }
    }

create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    return createList(head, tail, 1)
  }

create_db_stmt
  = a:KW_CREATE __
    k:(KW_DATABASE / KW_SCHEME) __
    ife:KW_IF_NOT_EXISTS? __
    t:ident_name __
    c:create_db_definition? {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'database',
          if_not_exists: ife && ife[0].toLowerCase(),
          database: t,
          create_definitions: c,
        }
      }
    }


create_table_stmt
  = a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:KW_IF_NOT_EXISTS? __
    t:table_ref_list __
    c:create_table_definition __
    to:table_options? __
    ir: (KW_IGNORE / KW_REPLACE)? __
    as: KW_AS? __
    qe: union_stmt? {
      /*
      export type create_table_stmt_node = create_table_stmt_node_simple | create_table_stmt_node_like;
      export interface create_table_stmt_node_base {
        type: 'create';
        keyword: 'table';
        temporary?: 'temporary';
        if_not_exists?: 'if not exists';
        table: table_ref_list;
      }
      export interface create_table_stmt_node_simple extends create_table_stmt_node_base{
        ignore_replace?: 'ignore' | 'replace';
        as?: 'as';
        query_expr?: union_stmt_node;
        create_definition?: create_table_definition;
        table_options?: table_options;
      }
      => AstStatement<create_table_stmt_node>
      */
      if(t) t.forEach(tt => tableList.add(`create::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists: ife && ife[0].toLowerCase(),
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
    ife:KW_IF_NOT_EXISTS? __
    t:table_ref_list __
    lt:create_like_table {
      /*

      export interface create_table_stmt_node_like extends create_table_stmt_node_base{
        like: create_like_table;
      }
      => AstStatement<create_table_stmt_node>;
      */
      if(t) t.forEach(tt => tableList.add(`create::${tt.db}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists: ife && ife[0].toLowerCase(),
          table: t,
          like: lt
        }
      }
    }

create_index_stmt
  = a:KW_CREATE __
  kw:KW_UNIQUE? __
  t:KW_INDEX __
  co:KW_CONCURRENTLY? __
  n:ident? __
  on:KW_ON __
  ta:table_name __
  um:index_type? __
  LPAREN __ cols:column_order_list __ RPAREN __
  wr:(KW_WITH __ LPAREN __ index_options_list __ RPAREN)? __
  ts:(KW_TABLESPACE __ ident_name)? __
  w:where_clause? __ {
    /*
    export interface create_index_stmt_node {
      type: 'create';
      index_type?: 'unique';
      keyword: 'index';
      concurrently?: 'concurrently';
      index: string;
      on_kw: string;
      table: table_name;
      index_using?: index_type;
      index_columns: column_order[];
      with?: index_option[];
      with_before_where: true;
      tablespace?: {type: 'origin'; value: string; }
      where?: where_clause;
    }
    => AstStatement<create_index_stmt_node>
    */
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          index_type: kw && kw.toLowerCase(),
          keyword: t.toLowerCase(),
          concurrently: co && co.toLowerCase(),
          index: n,
          on_kw: on[0].toLowerCase(),
          table: ta,
          index_using: um,
          index_columns: cols,
          with: wr && wr[4],
          with_before_where: true,
          tablespace: ts && { type: 'origin', value: ts[2] },
          where: w,
        }
    }
  }

column_order_list
  = head:column_order tail:(__ COMMA __ column_order)* {
    // => column_order[]
    return createList(head, tail)
  }

column_order
  = c:expr __
  ca:collate_expr? __
  op:ident? __
  o:(KW_ASC / KW_DESC)? __
  nf:('NULLS'i __ ('FIRST'i / 'LAST'i))? {
    /*
    => {
      column: expr;
      collate: collate_expr;
      opclass: ident;
      order: 'asc' | 'desc';
      nulls: 'nulls last' | 'nulls first';
    }
    */
    return {
      column: c,
      collate: ca,
      opclass: op,
      order: o && o.toLowerCase() || 'asc',
      nulls: nf && `${nf[0].toLowerCase()} ${nf[2].toLowerCase()}`,
    }
  }

create_like_table_simple
  = KW_LIKE __ t: table_ref_list {
    // => { type: 'like'; table: table_ref_list; }
    return {
      type: 'like',
      table: t
    }
  }
create_like_table
  = create_like_table_simple
  / LPAREN __ e:create_like_table  __ RPAREN {
     // => create_like_table_simple & { parentheses?: boolean; }
      e.parentheses = true;
      return e;
  }

create_table_definition
  = LPAREN __ head:create_definition tail:(__ COMMA __ create_definition)* __ RPAREN {
      // => create_definition[]
      return createList(head, tail);
    }

create_definition
  = create_column_definition
  / create_index_definition
  / create_fulltext_spatial_index_definition
  / create_constraint_definition

create_column_definition
  = c:column_ref __
    d:data_type __
    clc:column_constraint? __
    a:('AUTO_INCREMENT'i)? __
    u:('UNIQUE'i / ('PRIMARY'i __ 'KEY'i))? __
    co:keyword_comment? __
    ca:collate_expr? __
    cf:column_format? __
    s:storage? __
    re:reference_definition? {
      /*
      => {
        column: column_ref;
        definition: data_type;
        nullable: column_constraint['nullable'];
        default_val: column_constraint['default_val'];
        auto_increment?: 'auto_increment';
        unique_or_primary?: 'unique' | 'primary key';
        comment?: keyword_comment;
        collate?: collate_expr;
        column_format?: column_format;
        storage?: storage;
        reference_definition?: reference_definition;
        resource: 'column';
      }
      */
      columnList.add(`create::${c.table}::${c.column}`)
      return {
        column: c,
        definition: d,
        nullable: clc && clc.nullable,
        default_val: clc && clc.default_val,
        auto_increment: a && a.toLowerCase(),
        unique_or_primary: Array.isArray(u) ? `${u[0].toLowerCase()} ${u[2].toLowerCase()}` : u,
        comment: co,
        collate: ca,
        column_format: cf,
        storage:s,
        reference_definition: re,
        resource: 'column'
      }
    }

column_constraint
  = n:(literal_not_null / literal_null) __ df:default_expr? {
    // => { nullable: literal_null | literal_not_null; default_val: default_expr; }
    if (n && !n.value) n.value = 'null'
    return {
      default_val: df,
      nullable: n
    }
  }
  / df:default_expr __ n:(literal_not_null / literal_null)? {
    // => { nullable: literal_null | literal_not_null; default_val: default_expr; }
    if (n && !n.value) n.value = 'null'
    return {
      default_val: df,
      nullable: n
    }
  }

collate_expr
  = KW_COLLATE __ ca:ident {
    // => { type: 'collate'; value: ident; }
    return {
      type: 'collate',
      value: ca,
    }
  }
column_format
  = k:'COLUMN_FORMAT'i __ f:('FIXED'i / 'DYNAMIC'i / 'DEFAULT'i) {
    // => { type: 'column_format'; value: 'fixed' | 'dynamic' | 'default'; }
    return {
      type: 'column_format',
      value: f.toLowerCase()
    }
  }
storage
  = k:'STORAGE'i __ s:('DISK'i / 'MEMORY'i) {
    // => { type: 'storage'; value: 'disk' | 'memory' }
    return {
      type: 'storage',
      value: s.toLowerCase()
    }
  }
default_expr
  = KW_DEFAULT __ ce: (literal / expr) {
    // => { type: 'default'; value: literal | expr; }
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
      /*
      export interface truncate_stmt_node {
        type: 'trucate';
        keyword: 'table';
        name: table_ref_list;
      }
      => AstStatement<truncate_stmt_node>
      */
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
      /*
      export interface use_stmt_node {
        type: 'use';
        db: ident;
      }
      => AstStatement<use_stmt_node>
      */
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
      /*
      export interface alter_table_stmt_node {
        type: 'alter';
        table: table_ref_list;
        expr: alter_action_list;
      }
      => AstStatement<alter_table_stmt_node>
      */
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
      // => alter_action[]
      return createList(head, tail);
    }

alter_action
  = ALTER_ADD_COLUMN
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
      /*
      => {
        action: 'add';
        keyword: KW_COLUMN;
        resource: 'column';
        type: 'alter';
      } & create_column_definition;
      */
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
      /* => {
        action: 'drop';
        collumn: column_ref;
        keyword: KW_COLUMN;
        resource: 'column';
        type: 'alter';
      } */
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
       /* => {
         action: 'add';
         type: 'alter';
         } & create_index_definition */
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
       /* => {
         action: 'rename';
         type: 'alter';
         resource: 'table';
         keyword?: 'to' | 'as';
         table: ident;
         } */
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
    /* => {
        type: 'alter';
        keyword: 'algorithm';
        resource: 'algorithm';
        symbol?: '=';
        algorithm: 'DEFAULT' | 'INSTANT' | 'INPLACE' | 'COPY';
      }*/
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
    /* => {
      type: 'alter';
      keyword: 'lock';
      resource: 'lock';
      symbol?: '=';
      lock: 'DEFAULT' | 'NONE' | 'SHARED' | 'EXCLUSIVE';
    }*/
    return {
      type: 'alter',
      keyword: 'lock',
      resource: 'lock',
      symbol: s,
      lock: val
    }
  }

create_index_definition
  = kc:(KW_INDEX / KW_KEY) __
    c:column? __
    t:index_type? __
    de:cte_column_definition __
    id:index_options? __
     {
       /* => {
         index: column;
         definition: cte_column_definition;
         keyword: 'index' | 'key';
         index_type?: index_type;
         resource: 'index';
         index_options?: index_options;
       }*/
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
      /* => {
          index: column;
          definition: cte_column_definition;
          keyword: 'fulltext' | 'spatial' | 'fulltext key' | 'spatial key' | 'fulltext index' | 'spatial index';
          index_options?: index_options;
          resource: 'index';
        }*/
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

constraint_name
  = kc:KW_CONSTRAINT __
  c:ident? {
    // => { keyword: 'constraint'; constraint: ident; }
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
    /* => {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'primary key';
      index_type?: index_type;
      resource: 'constraint';
      index_options?: index_options;
    }*/
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
    /* => {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'unique key' | 'unique' | 'unique index';
      index_type?: index_type;
      resource: 'constraint';
      index_options?: index_options;
    }*/
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

create_constraint_foreign
  = kc:constraint_name? __
  p:('FOREIGN KEY'i) __
  i:column? __
  de:cte_column_definition __
  id:reference_definition? {
    /* => {
      constraint?: constraint_name['constraint'];
      definition: cte_column_definition;
      constraint_type: 'FOREIGN KEY';
      keyword: constraint_name['keyword'];
      index?: column;
      resource: 'constraint';
      reference_definition?: reference_definition;
    }*/
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
    /* => {
        definition: cte_column_definition;
        table: table_ref_list;
        keyword: 'references';
        match: 'match full' | 'match partial' | 'match simple';
        on_delete?: on_reference;
        on_update?: on_reference;
      }*/
    return {
        definition: de,
        table: t,
        keyword: kc.toLowerCase(),
        match:m && m.toLowerCase(),
        on_delete: od,
        on_update: ou,
      }
  }

on_reference
  = on_kw:'ON'i __ kw: ('DELETE'i / 'UPDATE'i) __ ro:reference_option {
    return {
      type: `${on_kw.toLowerCase()} ${kw.toLowerCase()}`,
      value: ro
    }
  }

reference_option
  = kc:('RESTRICT'i / 'CASCADE'i / 'SET NULL'i / 'NO ACTION'i / 'SET DEFAULT'i) {
    // => 'restrict' | 'cascade' | 'set null' | 'no action' | 'set default'
    return kc.toLowerCase()
  }

create_constraint_trigger
  = kw: KW_CREATE __
  kc:KW_CONSTRAINT? __
  t:('TRIGGER'i) __
  c:ident_name __
  p:('BEFORE'i / 'AFTER'i / 'INSTEAD OF'i) __
  te:trigger_event_list __
  on:'ON'i __
  tn:table_name __
  fr:(KW_FROM __ table_name)? __
  de:trigger_deferrable? __
  fe:trigger_for_row? __
  tw:trigger_when? __
  fc:'EXECUTE'i __ 'PROCEDURE'i __
  fct:proc_func_call {
    /*
    => {
      type: 'create';
      constraint: string;
      location: 'before' | 'after' | 'instead of';
      events: trigger_event_list;
      table: table_name;
      from?: table_name;
      deferrable?: trigger_deferrable;
      for_each?: trigger_for_row;
      when?: trigger_when;
      execute: {
        keyword: 'execute procedure';
        expr: proc_func_call;
      };
      constraint_type: 'trigger';
      keyword: 'trigger';
      constraint_kw: 'constraint';
      resource: 'constraint';
    }
    */
    return {
        type: 'create',
        constraint: c,
        location: p && p.toLowerCase(),
        events: te,
        table: tn,
        from: fr && fr[2],
        deferrable: de,
        for_each: fe,
        when: tw,
        execute: {
          keyword: 'execute procedure',
          expr: fct
        },
        constraint_type: t && t.toLowerCase(),
        keyword: t && t.toLowerCase(),
        constraint_kw: kc && kc.toLowerCase(),
        resource: 'constraint',
      }
  }

trigger_event
  = kw:(KW_INSERT / KW_DELETE / KW_TRUNCATE) {
    // => { keyword: 'insert' | 'delete' | 'truncate' }
    const keyword = Array.isArray(kw) ? kw[0].toLowerCase() : kw.toLowerCase()
    return {
      keyword,
    }
  }
  / kw:KW_UPDATE __ a:('OF'i __ column_ref_list)? {
    // => { keyword: 'update'; args?: { keyword: 'of', columns: column_ref_list; }}
    return {
      keyword: kw && kw[0] && kw[0].toLowerCase(),
      args: a && { keyword: a[0], columns: a[2] } || null
    }
  }

trigger_event_list
  = head:trigger_event tail:(__ KW_OR __ trigger_event)* {
    // => trigger_event[];
    return createList(head, tail)
  }

trigger_deferrable
  = kw:(('NOT'i)?  __ 'DEFERRABLE'i) __ args:('INITIALLY IMMEDIATE'i / 'INITIALLY DEFERRED'i) {
    // => { keyword: 'deferrable' | 'not deferrable'; args: 'initially immediate' | 'initially deferred' }
    return {
      keyword: kw && kw[0] ? `${kw[0].toLowerCase()} deferrable` : 'deferrable',
      args: args && args.toLowerCase(),
    }
  }

trigger_for_row
  = kw:'FOR'i __ e:('EACH'i)? __ ob:('ROW'i / 'STATEMENT'i) {
    // => { keyword: 'for' | 'for each'; args: 'row' | 'statement' }
    return {
      keyword: e ? `${kw.toLowerCase()} ${e.toLowerCase()}` : kw.toLowerCase(),
      args: ob.toLowerCase()
    }
  }

trigger_when
  = KW_WHEN __ LPAREN __ condition:expr __ RPAREN {
    // => { type: 'when'; cond: expr; parentheses: true; }
    return {
      type: 'when',
      cond: condition,
      parentheses: true,
    }
  }

table_options
  = head:table_option tail:(__ COMMA? __ table_option)* {
    // => table_option[]
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
    /* => {
      keyword: 'auto_increment' | 'avg_row_length' | 'key_block_size' | 'max_rows' | 'min_rows' | 'stats_sample_pages';
      symbol: '=';
      value: number; // <== literal_numeric['value']
      } */
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: v.value
    }
  }
  / create_option_character_set
  / kw:(KW_COMMENT / 'CONNECTION'i) __ s:(KW_ASSIGIN_EQUAL)? __ c:literal_string {
    // => { keyword: 'connection' | 'comment'; symbol: '='; value: string; }
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: `'${c.value}'`
    }
  }
  / kw:'COMPRESSION'i __ s:(KW_ASSIGIN_EQUAL)? __ v:("'"('ZLIB'i / 'LZ4'i / 'NONE'i)"'") {
    // => { keyword: 'compression'; symbol: '='; value: "'ZLIB'" | "'LZ4'" | "'NONE'" }
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: v.join('').toUpperCase()
    }
  }
  / kw:'ENGINE'i __ s:(KW_ASSIGIN_EQUAL)? __ c:ident_name {
    // => { keyword: 'engine'; symbol: '='; value: string; }
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: c.toUpperCase()
    }
  }


ALTER_ADD_FULLETXT_SPARITAL_INDEX
  = KW_ADD __
    fsid:create_fulltext_spatial_index_definition
     {
       // => create_fulltext_spatial_index_definition & { action: 'add'; type: 'alter' }
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
      /*
      export interface rename_stmt_node {
        type: 'rename';
        table: table_to_list;
      }
       => AstStatement<rename_stmt_node>
       */
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
      /*
      export interface set_stmt_node {
        type: 'set';
        expr: assign_stmt & { keyword?: 'GLOBAL' | 'SESSION' | 'LOCAL' | 'PERSIST' | 'PERSIST_ONLY'; };
      }
       => AstStatement<set_stmt_node>
       */
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

lock_mode
  = "IN"i __
  m:("ACCESS SHARE"i / "ROW SHARE"i / "ROW EXCLUSIVE"i / "SHARE UPDATE EXCLUSIVE"i / "SHARE ROW EXCLUSIVE"i / "EXCLUSIVE"i / "ACCESS EXCLUSIVE"i / "SHARE"i) __
  "MODE"i {
    // => { mode: string; }
    return {
      mode: `in ${m.toLowerCase()} mode`
    }
  }

lock_stmt
  = KW_LOCK __
  k:KW_TABLE? __
  t:table_ref_list __
  lm:lock_mode? __
  nw:("NOWAIT"i)? {

      /*
      export interface lock_stmt_node {
        type: 'lock';
        keyword: 'lock';
        tables: [[table_base], ...{table: table_ref}[]]; // see table_ref_list
        lock_mode?: lock_mode;
        nowait?: 'NOWAIT';
      }
       => AstStatement<lock_stmt_node>
       */

    if (t) t.forEach(tt => tableList.add(`lock::${tt.db}::${tt.table}`))
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'lock',
        keyword: k && k.toLowerCase(),
        tables: t.map((table) => ({ table })),
        lock_mode: lm,
        nowait: nw
      }
    }
  }

call_stmt
  = KW_CALL __
  e: proc_func_call {
    /*
    export interface call_stmt_node {
      type: 'call';
      expr: proc_func_call;
    }
       => AstStatement<call_stmt_node>
       */
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
    /*
    export interface select_stmt_node extends select_stmt_nake  {
       parentheses_symbol: true;
      }
      => select_stmt_node
      */
      return {
        ...s[2],
        parentheses_symbol: true,
      }
    }

with_clause
  = KW_WITH __ head:cte_definition tail:(__ COMMA __ cte_definition)* {
      // => cte_definition[]
      return createList(head, tail);
    }
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition {
      // => [cte_definition & {recursive: true; }]
      cte.recursive = true;
      return [cte]
    }

cte_definition
  = name:(literal_string / ident_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:union_stmt __ RPAREN {
    // => { name: { type: 'default'; value: string; }; stmt: union_stmt; columns?: cte_column_definition; }
    if (typeof name === 'string') name = { type: 'default', value: name }
    return { name, stmt, columns };
  }

cte_column_definition
  = LPAREN __ head:column tail:(__ COMMA __ column)* __ RPAREN {
    // => column[]
      return createList(head, tail);
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
    l:limit_clause? {
      /* => {
          with?: with_clause;
          type: 'select';
          options?: option_clause;
          distinct?: 'DISTINCT';
          columns: column_clause;
          from?: from_clause;
          where?: where_clause;
          groupby?: group_by_clause;
          having?: having_clause;
          orderby?: order_by_clause;
          limit?: limit_clause;
        }*/
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
          limit: l
      };
  }

// MySQL extensions to standard SQL
option_clause
  = head:query_option tail:(__ query_option)* {
    // => query_option[]
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
    ) {
      // =>  'SQL_CALC_FOUND_ROWS'| 'SQL_CACHE'| 'SQL_NO_CACHE'| 'SQL_BIG_RESULT'| 'SQL_SMALL_RESULT'| 'SQL_BUFFER_RESULT'
      return option;
    }

column_clause
  = head: (KW_ALL / (STAR !ident_start) / STAR) tail:(__ COMMA __ column_list_item)* {
      // => 'ALL' | '*' | column_list_item[]
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
  / head:column_list_item tail:(__ COMMA __ column_list_item)* {
    // => column_list_item[]
      return createList(head, tail);
    }

column_list_item
  = e:expr s:KW_DOUBLE_COLON t:data_type {
    // => { type: 'cast'; expr: expr; symbol: '::'; target: data_type;  as?: null; }
    return {
      type: 'cast',
      expr: e,
      symbol: '::',
      target: t
    }
  }
  / tbl:(ident __ DOT)? __ STAR {
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
  / e:expr __ alias:alias_clause? {
    // => { type: 'expr'; expr: expr; as?: alias_clause; }
      return { type: 'expr', expr: e, as: alias };
    }

alias_clause
  = KW_AS __ i:alias_ident { /*=>alias_ident*/ return i; }
  / KW_AS? __ i:ident { /*=>ident*/ return i; }

from_clause
  = KW_FROM __ l:table_ref_list { /*=>table_ref_list*/return l; }

table_to_list
  = head:table_to_item tail:(__ COMMA __ table_to_item)* {
    // => table_to_item[]
      return createList(head, tail);
    }

table_to_item
  = head:table_name __ KW_TO __ tail: (table_name) {
    // => table_name[]
      return [head, tail]
    }

index_type
  = KW_USING __
  t:("BTREE"i / "HASH"i / "GIST"i / "GIN"i) {
    // => { keyword: 'using'; type: 'btree' | 'hash' | 'gist' | 'gin' }
    return {
      keyword: 'using',
      type: t.toLowerCase(),
    }
  }

index_options_list
  = head:index_option tail:(__ COMMA __ index_option)* {
    // => index_option[]
    return createList(head, tail)
  }

index_options
  = head:index_option tail:(__ index_option)* {
    // => index_option[]
    const result = [head];
    for (let i = 0; i < tail.length; i++) {
      result.push(tail[i][1]);
    }
    return result;
  }

index_option
  = k:KW_KEY_BLOCK_SIZE __ e:(KW_ASSIGIN_EQUAL)? __ kbs:literal_numeric {
    // => { type: 'key_block_size'; symbol: '='; expr: number; }
    return {
      type: k.toLowerCase(),
      symbol: e,
      expr: kbs
    }
  }
  / k:ident_name __ e:KW_ASSIGIN_EQUAL __ kbs:(literal_numeric / ident) {
    // => { type: ident_name; symbol: '='; expr: number | {type: 'origin'; value: ident; }; }
    return {
      type: k.toLowerCase(),
      symbol: e,
      expr: typeof kbs === 'string' && { type: 'origin', value: kbs } || kbs
    };
  }
  / index_type
  / "WITH"i __ "PARSER"i __ pn:ident_name {
    // => { type: 'with parser'; expr: ident_name }
    return {
      type: 'with parser',
      expr: pn
    }
  }
  / k:("VISIBLE"i / "INVISIBLE"i) {
    // => { type: 'visible'; expr: 'visible' } | { type: 'invisible'; expr: 'invisible' }
    return {
      type: k.toLowerCase(),
      expr: k.toLowerCase()
    }
  }
  / keyword_comment

table_ref_list
  = head:table_base
    tail:table_ref* {
      // => [table_base, ...table_ref[]]
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
  = __ COMMA __ t:table_base { /* => table_base */ return t; }
  / __ t:table_join { /* => table_join */ return t; }


table_join
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      // => table_base & {join: join_op; using: ident_name[]; }
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
    // => table_base & {join: join_op; on?: on_clause; }
      t.join = op;
      t.on   = expr;
      return t;
    }
  / op:join_op __ LPAREN __ stmt:union_stmt __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
    /* => {
      expr: union_stmt & { parentheses: true; };
      as?: alias_clause;
      join: join_op;
      on?: on_clause;
    }*/
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
    // => { type: 'dual' }
      return {
        type: 'dual'
      };
  }
  / t:table_name __ alias:alias_clause? {
    // => table_name & { as?: alias_clause; }
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
    // => { expr: union_stmt; as?: alias_clause; }
      stmt.parentheses = true;
      return {
        expr: stmt,
        as: alias
      };
    }

join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { /* => 'LEFT JOIN' */ return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { /* =>  'RIGHT JOIN' */ return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { /* => 'FULL JOIN' */ return 'FULL JOIN'; }
  / (KW_INNER __)? KW_JOIN { /* => 'INNER JOIN' */ return 'INNER JOIN'; }

table_name
  = dt:ident schema:(__ DOT __ ident) tail:(__ DOT __ ident) {
      // => { db?: ident; table: ident | '*'; }
      const obj = { db: null, table: dt };
      if (tail !== null) {
        obj.db = `${dt}.${schema[3]}`;
        obj.table = tail[3];
      }
      return obj;
    }
  / dt:ident __ DOT __ STAR {
    // => IGNORE
      tableList.add(`select::${dt}::(.*)`);
      return {
        db: dt,
        table: '*'
      }
    }
  / dt:ident tail:(__ DOT __ ident)? {
    // => IGNORE
      const obj = { db: null, table: dt };
      if (tail !== null) {
        obj.db = dt;
        obj.table = tail[3];
      }
      return obj;
    }
  / v:var_decl {
    // => IGNORE
      v.db = null;
      v.table = v.name;
      return v;
    }

on_clause
  = KW_ON __ e:or_and_where_expr { /* => expr */ return e; }

where_clause
  = KW_WHERE __ e:(or_and_where_expr / expr) { /* => expr */ return e; }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list { /* => expr_list['value'] */ return e.value; }

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
    // => column_ref[]
      return createList(head, tail);
    }

having_clause
  = KW_HAVING __ e:expr { /* => expr */ return e; }

order_by_clause
  = KW_ORDER __ KW_BY __ l:order_by_list { /* => order_by_list */ return l; }

order_by_list
  = head:order_by_element tail:(__ COMMA __ order_by_element)* {
    // => order_by_element[]
      return createList(head, tail);
    }

order_by_element
  = e:expr __ d:(KW_DESC / KW_ASC)? {
    // => { expr: expr; type: 'ASC' | 'DESC'; }
    const obj = { expr: e, type: 'ASC' };
    if (d === 'DESC') obj.type = 'DESC';
    return obj;
  }

number_or_param
  = literal_numeric
  / param

limit_clause
  = KW_LIMIT __ i1:(number_or_param / KW_ALL) __ tail:(KW_OFFSET __ number_or_param)? {
    // => { separator: 'offset' | ''; value: [number_or_param | { type: 'origin', value: 'all' }, number_or_param?] }
      const res = []
      if (typeof i1 === 'string') res.push({ type: 'origin', value: 'all' })
      else res.push(i1)
      if (tail) res.push(tail[2]);
      return {
        seperator: tail && tail[0] && tail[0].toLowerCase() || '',
        value: res
      };
    }

update_stmt
  = KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    w:where_clause? __
    r:returning_stmt? {
      /* export interface update_stmt_node {
         type: 'update';
         table: table_ref_list;
         set: set_list;
         where?: where_clause;
         returning?: returning_stmt;
      }
     => AstStatement<update_stmt_node>
     */
      if (t) t.forEach(tableInfo => {
        const { db, as, table } = tableInfo
        tableList.add(`update::${db}::${table}`)
      });
      if(l) {
        l.forEach(col => columnList.add(`update::${col.table}::${col.column}`));
      }
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'update',
          table: t,
          set: l,
          where: w,
          returning: r,
        }
      };
    }

delete_stmt
  = KW_DELETE    __
    t: table_ref_list? __
    f:from_clause __
    w:where_clause? {
      /*
      export interface table_ref_addition extends table_name {
        addition: true;
        as?: alias_clause;
      }
       export interface delete_stmt_node {
         type: 'delete';
         table?: table_ref_list | [table_ref_addition];
         where?: where_clause;
      }
     => AstStatement<delete_stmt_node>
     */
      if(f) f.forEach(info => {
        info.table && tableList.add(`delete::${info.db}::${info.table}`);
        columnList.add(`delete::${info.table}::(.*)`);
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
      // => set_item[]
      return createList(head, tail);
    }

/**
 * here only use `additive_expr` to support 'col1 = col1+2'
 * if you want to use lower operator, please use '()' like below
 * 'col1 = (col2 > 3)'
 */
set_item
  = tbl:(ident __ DOT)? __ c:column __ '=' __ v:additive_expr {
      // => { column: ident; value: additive_expr; table?: ident;}
      return { column: c, value: v, table: tbl && tbl[0] };
    }
    / tbl:(ident __ DOT)? __ c:column __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
      return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
  }

returning_stmt
  = k:KW_RETURNING __ c:(STAR / column_ref_list) {
    // => { type: 'returning'; columns: column_ref_list | column_ref; }
    return {
      type: k && k.toLowerCase() || 'returning',
      columns: c === '*' && [{ type: 'columne_ref', table: null, column: '*' }] || c
    }
  }

insert_value_clause
  = value_clause
  / select_stmt_nake

insert_partition
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
    // => ident_name[]
      return createList(head, tail)
    }
  / KW_PARTITION __ v: value_item {
    // => value_item
    return v
  }

replace_insert_stmt
  = ri:replace_insert       __
    KW_INTO?                 __
    t:table_name  __
    p:insert_partition? __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause __
    r:returning_stmt? {
      /*
       export interface replace_insert_stmt_node {
         type: 'insert' | 'replace';
         table?: [table_name];
         columns: column_list;
         values: insert_value_clause;
         partition?: insert_partition;
         returning?: returning_stmt;
      }
     => AstStatement<replace_insert_stmt_node>
     */
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
          returning: r,
        }
      };
    }

insert_no_columns_stmt
  = ri:replace_insert       __
    KW_INTO                 __
    t:table_name  __
    p:insert_partition? __
    v:insert_value_clause __
    r:returning_stmt? {
     // => AstStatement<replace_insert_stmt_node>
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
          values: v,
          partition: p,
          returning: r,
        }
      };
    }

replace_insert
  = KW_INSERT   { /* => 'insert' */ return 'insert'; }
  / KW_REPLACE  { /* => 'replace' */return 'replace'; }

value_clause
  = KW_VALUES __ l:value_list  { /* => value_list */ return l; }

value_list
  = head:value_item tail:(__ COMMA __ value_item)* {
    // => value_item[]
      return createList(head, tail);
    }

value_item
  = LPAREN __ l:expr_list  __ RPAREN {
    // => expr_list
      return l;
    }

expr_list
  = head:expr tail:(__ COMMA __ expr)* {
    // => { type: 'expr_list'; value: expr[] }
      const el = { type: 'expr_list' };
      el.value = createList(head, tail);
      return el;
    }

interval_expr
  = KW_INTERVAL __
    e:expr __
    u: interval_unit {
      // => { type: 'interval', expr: expr; unit: interval_unit; }
      return {
        type: 'interval',
        expr: e,
        unit: u.toLowerCase(),
      }
    }
  / KW_INTERVAL __
    e:literal_string  {
      // => { type: 'interval', expr: expr; unit: interval_unit; }
      return {
        type: 'interval',
        expr: e,
        unit: '',
      }
    }

case_expr
  = KW_CASE                         __
    expr:expr?                      __
    condition_list:case_when_then+  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      /* => {
          type: 'case';
          expr?: expr;
          // nb: Only the last element is a case_else
          args: (case_when_then | case_else)[];
        } */
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: expr || null,
        args: condition_list
      };
    }

case_when_then
  = KW_WHEN __ condition:or_and_where_expr __ KW_THEN __ result:expr {
    // => { type: 'when'; cond: expr; result: expr; }
    return {
      type: 'when',
      cond: condition,
      result: result
    };
  }

case_else = KW_ELSE __ result:expr {
    // => { type: 'else'; condition?: never; result: expr; }
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

expr
  = logic_operator_expr // support concatenation operator || and &&
  / or_expr
  / unary_expr
  / union_stmt

logic_operator_expr
  = head:primary tail:(__ LOGIC_OPERATOR __ primary)+ {
    /*
    export type BINARY_OPERATORS = LOGIC_OPERATOR | 'OR' | 'AND' | multiplicative_operator | additive_operator
      | arithmetic_comparison_operator
      | 'IN' | 'NOT IN'
      | 'BETWEEN' | 'NOT BETWEEN'
      | 'IS' | 'IS NOT'
      | 'LIKE'
      | '@>' | '<@' | OPERATOR_CONCATENATION | DOUBLE_WELL_ARROW | WELL_ARROW | '?' | '?|' | '?&' | '#-'
    export interface binary_expr {
      type: 'binary_expr',
      operator: BINARY_OPERATORS,
      left: expr,
      right: expr
    }
    => binary_expr
    */
    return createBinaryExprChain(head, tail);
  }

unary_expr
  = op: additive_operator tail: (__ primary)+ {
    /*
    export type UNARY_OPERATORS = '+' | '-' | 'EXISTS' | 'NOT EXISTS'  | 'NULL'
    => {
      type: 'unary_expr',
      operator: UNARY_OPERATORS,
      expr: expr;
      parentheses?: boolean;
    } */
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
      // => binary_expr
      return createBinaryExprChain(head, tail);
    }

and_expr
  = head:not_expr tail:(___ KW_AND __ not_expr)* {
      // => binary_expr
      return createBinaryExprChain(head, tail);
    }

//here we should use `NOT` instead of `comparision_expr` to support chain-expr
not_expr
  = comparison_expr
  / exists_expr
  / (KW_NOT / "!" !"=") __ expr:not_expr {
    // => unary_expr
      return createUnaryExpr('NOT', expr);
    }

comparison_expr
  = left:additive_expr __ rh:comparison_op_right? {
    // => binary_expr
      if (rh === null) return left;
      else if (rh.type === 'arithmetic') return createBinaryExprChain(left, rh.tail);
      else return createBinaryExpr(rh.op, left, rh.right);
    }
  / literal_string
  / column_ref

exists_expr
  = op:exists_op __ LPAREN __ stmt:union_stmt __ RPAREN {
    // => unary_expr
    stmt.parentheses = true;
    return createUnaryExpr(op, stmt);
  }

exists_op
  = nk:(KW_NOT __ KW_EXISTS) { /* => 'NOT EXISTS' */ return nk[0] + ' ' + nk[2]; }
  / KW_EXISTS

comparison_op_right
  = arithmetic_op_right
  / in_op_right
  / between_op_right
  / is_op_right
  / like_op_right
  / jsonb_op_right

arithmetic_op_right
  = l:(__ arithmetic_comparison_operator __ additive_expr)+ {
    // => { type: 'arithmetic'; tail: any }
      return { type: 'arithmetic', tail: l };
    }

arithmetic_comparison_operator
  = ">=" / ">" / "<=" / "<>" / "<" / "=" / "!="

is_op_right
  = KW_IS __ right:additive_expr {
    // => { op: 'IS'; right: additive_expr; }
      return { op: 'IS', right: right };
    }
  / KW_IS __ right:(KW_DISTINCT __ KW_FROM __ table_name) {
    // => { type: 'origin'; value: string; }
    const { db, table } = right.pop()
    const tableName = table === '*' ? '*' : `"${table}"`
    let tableStr = db ? `"${db}".${tableName}` : tableName
    return { op: 'IS', right: {
      type: 'origin',
      value: `DISTINCT FROM ${tableStr}`
    }}
  }
  / (KW_IS __ KW_NOT) __ right:additive_expr {
      // => { type: 'IS NOT'; right: additive_expr; }
      return { op: 'IS NOT', right: right };
  }

between_op_right
  = op:between_or_not_between_op __  begin:additive_expr __ KW_AND __ end:additive_expr {
    // => { op: 'BETWEEN' | 'NOT BETWEEN'; right: { type: 'expr_list'; value: [expr, expr] }  }
      return {
        op: op,
        right: {
          type: 'expr_list',
          value: [begin, end]
        }
      };
    }

between_or_not_between_op
  = nk:(KW_NOT __ KW_BETWEEN) { /* => 'NOT BETWEEN' */ return nk[0] + ' ' + nk[2]; }
  / KW_BETWEEN

like_op
  = nk:(KW_NOT __ KW_LIKE) { /* => 'LIKE' */ return nk[0] + ' ' + nk[2]; }
  / KW_LIKE

in_op
  = nk:(KW_NOT __ KW_IN) { /* => 'NOT IN' */ return nk[0] + ' ' + nk[2]; }
  / KW_IN

like_op_right
  = op:like_op __ right:(literal / comparison_expr) {
     // => { op: like_op; right: comparison_expr}
      return { op: op, right: right };
    }

in_op_right
  = op:in_op __ LPAREN  __ l:expr_list __ RPAREN {
    // => {op: in_op; right: expr_list | var_decl | literal_string; }
      return { op: op, right: l };
    }
  / op:in_op __ e:(var_decl / literal_string) {
    // => IGNORE
      return { op: op, right: e };
    }

jsonb_op_right
  = s: ('@>' / '<@' / OPERATOR_CONCATENATION / DOUBLE_WELL_ARROW / WELL_ARROW / '?' / '?|' / '?&' / '#-') __
  c:column_list_item {
    // => { op: string; right: expr }
    return {
      op: s,
      right: c && c.expr || c
    }
  }

additive_expr
  = head:multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      // => binary_expr
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

multiplicative_expr
  = head:primary
    tail:(__ multiplicative_operator  __ primary)* {
      // => binary_expr
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
  / __ prepared_symbol:'$'n:literal_numeric {
    // => { type: 'origin'; value: string; }
    return {
      type: 'origin',
      value: `$${n.value}`,
    }
  }

column_ref
  = tbl:(ident __ DOT)? __ STAR {
    // => IGNORE
      const table = tbl && tbl[0] || null
      columnList.add(`select::${table}::(.*)`);
      return {
          type: 'column_ref',
          table: table,
          column: '*'
      }
    }
  / tbl:(ident __ DOT)? __ col:column __ a:(DOUBLE_ARROW / SINGLE_ARROW) __ j:(literal_string / literal_numeric) {
    // => IGNORE
      const tableName = tbl && tbl[0] || null
      columnList.add(`select::${tableName}::${col}`);
      return {
        type: 'column_ref',
        table: tableName,
        column: col,
        arrow: a,
        property: j
      };
  }
  / tbl:ident __ DOT __ col:column {
      /* => {
        type: 'column_ref';
        table: ident;
        column: column | '*';
        arrow?: '->>' | '->';
        property?: literal_string | literal_numeric;
      } */
      columnList.add(`select::${tbl}::${col}`);
      return {
        type: 'column_ref',
        table: tbl,
        column: col
      };
    }
  / col:column {
    // => IGNORE
      columnList.add(`select::null::${col}`);
      return {
        type: 'column_ref',
        table: null,
        column: col
      };
    }

column_list
  = head:column tail:(__ COMMA __ column)* {
    // => column[]
      return createList(head, tail);
    }

ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      // => indent_name
      return name;
    }
  / name:quoted_ident {
      // => indent_name
      return name;
    }

alias_ident
  = name:ident_name !{
      if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
      return false
    } {
      // => string
      return name;
    }
  / name:quoted_ident {
      // => IGNORE
      return name;
    }

quoted_ident
  = double_quoted_ident
  / single_quoted_ident
  / backticks_quoted_ident

double_quoted_ident
  = '"' chars:[^"]+ '"' { /* => string */ return chars.join(''); }

single_quoted_ident
  = "'" chars:[^']+ "'" { /* => string */ return chars.join(''); }

backticks_quoted_ident
  = "`" chars:[^`]+ "`" { /* => string */ return chars.join(''); }

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { /* => string */ return name; }
  / quoted_ident

column_name
  =  start:ident_start parts:column_part* { /* => string */ return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* {
      // => string
      return start + parts.join('');
    }

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_\-]

// to support column name like `cf1:name` in hbase
column_part  = [A-Za-z0-9_]

param
  = l:(':' ident_name) {
    // => { type: 'param'; value: ident_name }
      return { type: 'param', value: l[1] };
    }

aggr_func
  = aggr_fun_count
  / aggr_fun_expr


aggr_fun_expr
  = name:KW_AGGR_FUNC __ LPAREN __ d:KW_DISTINCT? __ e:additive_expr __ RPAREN {
    // => { type: 'aggr_func'; name: 'SUM' | 'MAX' | 'MIN' | 'AVG'; args: { expr: additive_expr } }
      return {
        type: 'aggr_func',
        name: name,
        args: {
          expr: e,
          distinct: d
        }
      };
    }
  / name:KW_AGGR_FUNC_NO_ARG __ LPAREN __ RPAREN {
      return {
        type: 'aggr_func',
        name: name
      };
    }
  / name:KW_AGGR_FUNC_STR_ARG __ LPAREN __ e:additive_expr s:(__ COMMA __ literal_string)? __ RPAREN {
      return {
        type: 'aggr_func',
        name: name,
        args: {
          expr: e,
          separator: s
        }
      };
    }

KW_AGGR_FUNC
  = KW_SUM / KW_MAX / KW_MIN / KW_AVG / KW_COLLECT

KW_AGGR_FUNC_NO_ARG
  = KW_RANK / KW_DENSE_RANK / KW_ROW_NUMBER

KW_AGGR_FUNC_STR_ARG
  = KW_LISTAGG

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
  = 'OVER'i __ LPAREN __ KW_PARTITION __ KW_BY __ bc:column_clause __ l:order_by_clause? __ RPAREN {
    return {
      partitionby: bc,
      orderby: l
    }
  }
  / on_update_current_timestamp

aggr_fun_count
  = name:KW_COUNT __ LPAREN __ arg:count_arg __ RPAREN {
    // => { type: 'aggr_func'; name: 'COUNT'; args:count_arg; }
      return {
        type: 'aggr_func',
        name: name,
        args: arg
      };
    }

count_arg
  = e:star_expr { /* => { expr: star_expr } */ return { expr: e }; }
  / d:KW_DISTINCT? __ c:column_ref { return { distinct: d, expr: c }; }
  / d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN __ or:order_by_clause? { return { distinct: d, expr: c, orderby: or, parentheses: true }; }

star_expr
  = "*" { /* => { type: 'star'; value: '*' } */ return { type: 'star', value: '*' }; }

func_call
  = name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
      // => { type: 'function'; name: string; args: expr_list; }
      if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
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
  / extract_func
  / f:scalar_func __ up:on_update_current_timestamp? {
    // => { type: 'function'; name: string; over?: on_update_current_timestamp; }
    return {
        type: 'function',
        name: f,
        over: up
    }
  }

extract_filed
  = f:'CENTURY'i / 'DAY'i / 'DECADE'i / 'DOW'i / 'DOY'i / 'EPOCH'i / 'HOUR'i / 'ISODOW'i / 'ISOYEAR'i / 'MICROSECONDS'i / 'MILLENNIUM'i / 'MILLISECONDS'i / 'MINUTE'i / 'MONTH'i / 'QUARTER'i / 'SECOND'i / 'TIMEZONE'i / 'TIMEZONE_HOUR'i / 'TIMEZONE_MINUTE'i / 'WEEK'i / 'YEAR'i {
    // => 'string'
    return f
  }
extract_func
  = kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ t:(KW_TIMESTAMP / KW_INTERVAL / KW_TIME / KW_DATE)? __ s:expr __ RPAREN {
    // => { type: 'extract'; args: { field: extract_filed; cast_type: 'TIMESTAMP' | 'INTERVAL' | 'TIME'; source: expr; }}
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          cast_type: t,
          source: s,
        }
    }
  }

scalar_func
  = KW_CURRENT_DATE
  / KW_CURRENT_TIME
  / KW_CURRENT_TIMESTAMP
  / KW_CURRENT_USER
  / KW_USER
  / KW_SESSION_USER
  / KW_SYSTEM_USER

cast_expr
  = e:(literal / aggr_func / func_call / case_expr / interval_expr / column_ref / param) s:KW_DOUBLE_COLON t:data_type {
    /* => {
        type: 'cast';
        expr: expr | literal | aggr_func | func_call | case_expr | interval_expr | column_ref | param
          | expr;
        symbol: '::' | 'as',
        target: data_type;
      }
      */
    return {
      type: 'cast',
      expr: e,
      symbol: '::',
      target: t
    }
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    // => IGNORE
    return {
      type: 'cast',
      expr: e,
      symbol: 'as',
      target: t
    };
  }
  / KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    // => IGNORE
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
      // => IGNORE
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
    // => IGNORE
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
    // => literal[]
      return createList(head, tail);
    }

literal_null
  = KW_NULL {
    // => { type: 'null'; value: null }
      return { type: 'null', value: null };
    }

literal_not_null
  = KW_NOT_NULL {
    // => { type: 'not null'; value: 'not null' }
    return {
      type: 'not null',
      value: 'not null',
    }
  }

literal_bool
  = KW_TRUE {
      // => { type: 'bool', value: true }
      return { type: 'bool', value: true };
    }
  / KW_FALSE {
      //=> { type: 'bool', value: false }
      return { type: 'bool', value: false };
    }

literal_string
  = ca:("'" single_char* "'") {
      // => { type: 'single_quote_string'; value: string; }
      return {
        type: 'single_quote_string',
        value: ca[1].join('')
      };
    }
  / ca:("\"" single_quote_char* "\"") !DOT {
      // => { type: 'string'; value: string; }
      return {
        type: 'string',
        value: ca[1].join('')
      };
    }

literal_datetime
  = type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("'" single_char* "'") {
      //=> { type: 'TIME' | 'DATE' | 'TIMESTAMP' | 'DATETIME', value: string }
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
  = [^'\\]
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
    // => number | { type: 'bigint'; value: string; }
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
    // => IGNORE
    const numStr = int_ + frac
    if (isBigInt(int_)) return {
      type: 'bigint',
      value: numStr
    }
    return parseFloat(numStr);
  }
  / int_:int exp:exp {
    // => IGNORE
    const numStr = int_ + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int {
    // => IGNORE
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

KW_SHOW     = "SHOW"i       !ident_start
KW_DROP     = "DROP"i       !ident_start { return 'DROP'; }
KW_USE      = "USE"i        !ident_start
KW_ALTER    = "ALTER"i      !ident_start
KW_SELECT   = "SELECT"i     !ident_start
KW_UPDATE   = "UPDATE"i     !ident_start
KW_CREATE   = "CREATE"i     !ident_start
KW_TEMPORARY = "TEMPORARY"i !ident_start
KW_IF_NOT_EXISTS = "IF NOT EXISTS"i !ident_start
KW_DELETE   = "DELETE"i     !ident_start
KW_INSERT   = "INSERT"i     !ident_start
KW_RECURSIVE= "RECURSIVE"   !ident_start
KW_REPLACE  = "REPLACE"i    !ident_start
KW_RETURNING  = "RETURNING"i    !ident_start { return 'RETURNING' }
KW_RENAME   = "RENAME"i     !ident_start
KW_IGNORE   = "IGNORE"i     !ident_start
KW_EXPLAIN  = "EXPLAIN"i    !ident_start
KW_PARTITION = "PARTITION"i !ident_start { return 'PARTITION' }

KW_INTO     = "INTO"i       !ident_start
KW_FROM     = "FROM"i       !ident_start
KW_SET      = "SET"i        !ident_start
KW_LOCK     = "LOCK"i       !ident_start

KW_AS       = "AS"i         !ident_start
KW_TABLE    = "TABLE"i      !ident_start { return 'TABLE'; }
KW_TABLESPACE  = "TABLESPACE"i      !ident_start { return 'TABLESPACE'; }
KW_DATABASE = "DATABASE"i      !ident_start { return 'DATABASE'; }
KW_SCHEME   = "SCHEME"i      !ident_start { return 'SCHEME'; }
KW_COLLATE  = "COLLATE"i    !ident_start { return 'COLLATE'; }

KW_ON       = "ON"i       !ident_start
KW_LEFT     = "LEFT"i     !ident_start
KW_RIGHT    = "RIGHT"i    !ident_start
KW_FULL     = "FULL"i     !ident_start
KW_INNER    = "INNER"i    !ident_start
KW_JOIN     = "JOIN"i     !ident_start
KW_OUTER    = "OUTER"i    !ident_start
KW_UNION    = "UNION"i    !ident_start
KW_VALUES   = "VALUES"i   !ident_start
KW_USING    = "USING"i    !ident_start

KW_WHERE    = "WHERE"i      !ident_start
KW_WITH     = "WITH"i       !ident_start

KW_GROUP    = "GROUP"i      !ident_start
KW_BY       = "BY"i         !ident_start
KW_ORDER    = "ORDER"i      !ident_start
KW_HAVING   = "HAVING"i     !ident_start

KW_LIMIT    = "LIMIT"i      !ident_start
KW_OFFSET   = "OFFSET"i     !ident_start { return 'OFFSET' }

KW_ASC      = "ASC"i        !ident_start { return 'ASC'; }
KW_DESC     = "DESC"i       !ident_start { return 'DESC'; }

KW_ALL      = "ALL"i        !ident_start { return 'ALL'; }
KW_DISTINCT = "DISTINCT"i   !ident_start { return 'DISTINCT';}

KW_BETWEEN  = "BETWEEN"i    !ident_start { return 'BETWEEN'; }
KW_IN       = "IN"i         !ident_start { return 'IN'; }
KW_IS       = "IS"i         !ident_start { return 'IS'; }
KW_LIKE     = "LIKE"i       !ident_start { return 'LIKE'; }
KW_EXISTS   = "EXISTS"i     !ident_start { /* => 'EXISTS' */ return 'EXISTS'; }

KW_NOT      = "NOT"i        !ident_start { return 'NOT'; }
KW_AND      = "AND"i        !ident_start { return 'AND'; }
KW_OR       = "OR"i         !ident_start { return 'OR'; }

// aggregation functions
KW_COUNT    = "COUNT"i      !ident_start { return 'COUNT'; }
KW_MAX      = "MAX"i        !ident_start { return 'MAX'; }
KW_MIN      = "MIN"i        !ident_start { return 'MIN'; }
KW_SUM      = "SUM"i        !ident_start { return 'SUM'; }
KW_AVG      = "AVG"i        !ident_start { return 'AVG'; }
KW_COLLECT  = "COLLECT"i    !ident_start { return 'COLLECT'; }
KW_RANK     = "RANK"i       !ident_start { return 'RANK'; }
KW_DENSE_RANK = "DENSE_RANK"i       !ident_start { return 'DENSE_RANK'; }
KW_LISTAGG  = "LISTAGG"i    !ident_start { return 'LISTAGG'; }
KW_ROW_NUMBER = "ROW_NUMBER"i !ident_start { return 'ROW_NUMBER'; }

// group window start end functions
KW_TUMBLE_START   = "TUMBLE_START"i  !ident_start { return 'TUMBLE_START'; }
KW_TUMBLE_END     = "TUMBLE_END"i    !ident_start { return 'TUMEBLE_END'; }
KW_HOP_START      = "HOP_START"i     !ident_start { return 'HOP_START'; }
KW_HOP_END        = "HOP_END"i       !ident_start { return 'HOP_END'; }
KW_SESSION_START  = "SESSION_START"i !ident_start { return 'SESSION_START'; }
KW_SESSION_END    = "SESSION_END"i   !ident_start { return 'SESSION_END'; }

KW_TUMBLE_ROWTIME = "TUMBLE_ROWTIME"i   !ident_start { return 'TUMBLE_ROWTIME'; }
KW_HOP_ROWTIME = "HOP_ROWTIME"i         !ident_start { return 'HOP_ROWTIME'; }
KW_SESSION_ROWTIME = "SESSION_ROWTIME"i !ident_start { return 'SESSION_ROWTIME'; }

KW_TUMBLE_PROCTIME = "TUMBLE_PROCTIME"i   !ident_start { return 'TUMBLE_PROCTIME'; }
KW_HOP_PROCTIME = "HOP_PROCTIME"i         !ident_start { return 'HOP_PROCTIME'; }
KW_SESSION_PROCTIME = "SESSION_PROCTIME"i !ident_start { return 'SESSION_PROCTIME'; }

KW_EXTRACT  = "EXTRACT"i    !ident_start { return 'EXTRACT'; }
KW_CALL     = "CALL"i       !ident_start { return 'CALL'; }

KW_CASE     = "CASE"i       !ident_start
KW_WHEN     = "WHEN"i       !ident_start
KW_THEN     = "THEN"i       !ident_start
KW_ELSE     = "ELSE"i       !ident_start
KW_END      = "END"i        !ident_start

KW_CAST     = "CAST"i       !ident_start

KW_BOOL     = "BOOL"i     !ident_start { return 'BOOL'; }
KW_BOOLEAN  = "BOOLEAN"i  !ident_start { return 'BOOLEAN'; }
KW_CHAR     = "CHAR"i     !ident_start { return 'CHAR'; }
KW_VARCHAR  = "VARCHAR"i  !ident_start { return 'VARCHAR';}
KW_STRING   = "STRING"i   !ident_start { return 'STRING';}
KW_NUMERIC  = "NUMERIC"i  !ident_start { return 'NUMERIC'; }
KW_DECIMAL  = "DECIMAL"i  !ident_start { return 'DECIMAL'; }
KW_SIGNED   = "SIGNED"i   !ident_start { return 'SIGNED'; }
KW_UNSIGNED = "UNSIGNED"i !ident_start { return 'UNSIGNED'; }
KW_INT      = "INT"i      !ident_start { return 'INT'; }
KW_ZEROFILL = "ZEROFILL"i !ident_start { return 'ZEROFILL'; }
KW_INTEGER  = "INTEGER"i  !ident_start { return 'INTEGER'; }
KW_JSON     = "JSON"i     !ident_start { return 'JSON'; }
KW_JSONB    = "JSONB"i    !ident_start { return 'JSONB'; }
KW_GEOMETRY = "GEOMETRY"i !ident_start { return 'GEOMETRY'; }
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
KW_UUID     = "UUID"i     !ident_start { return 'UUID'; }
KW_ARRAY    = "ARRAY"i    !ident_start { return 'ARRAY'; }
KW_MAP      = "MAP"i      !ident_start { return 'MAP'; }
KW_MULTISET = "MULTISET"i !ident_start { return 'MULTISET'; }
KW_ROW      = "ROW"i      !ident_start { return 'ROW'; }

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
KW_DOUBLE_COLON = '::'
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
KW_CONCURRENTLY  = "CONCURRENTLY"i  !ident_start { return 'CONCURRENTLY'; }
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

LANGLEBRAKE = '<'
RANGLEBRAKE = '>'

SEMICOLON = ';'
SINGLE_ARROW = '->'
DOUBLE_ARROW = '->>'
WELL_ARROW = '#>'
DOUBLE_WELL_ARROW = '#>>'

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

block_comment
  = "/*" (!"*/" char)* "*/"

line_comment
  = "--" (!EOL char)*

pound_sign_comment
  = "#" (!EOL char)*

keyword_comment
  = k:KW_COMMENT __ s:KW_ASSIGIN_EQUAL? __ c:literal_string {
    // => { type: 'comment'; keyword: 'comment'; symbol: '='; value: literal_string; }
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
      // => { type: 'proc'; stmt: assign_stmt | return_stmt; vars: any }
      return { type: 'proc', stmt: s, vars: varList };
    }

assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s: (KW_ASSIGN / KW_ASSIGIN_EQUAL) __ e:proc_expr {
    // => { type: 'assign'; left: var_decl | without_prefix_var_decl; symbol: ':=' | '='; right: proc_expr; }
    return {
      type: 'assign',
      left: va,
      symbol: s,
      right: e
    };
  }


return_stmt
  = KW_RETURN __ e:proc_expr {
    // => { type: 'return'; expr: proc_expr; }
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
      // => binary_expr
      return createBinaryExprChain(head, tail);
    }

proc_multiplicative_expr
  = head:proc_primary
    tail:(__ multiplicative_operator  __ proc_primary)* {
      // => binary_expr
      return createBinaryExprChain(head, tail);
    }

proc_join
  = lt:var_decl __ op:join_op  __ rt:var_decl __ expr:on_clause {
    // => { type: 'join'; ltable: var_decl; rtable: var_decl; op: join_op; expr: on_clause; }
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
    // => proc_additive_expr & { parentheses: true; }
      e.parentheses = true;
      return e;
    }

proc_func_name
  = dt:ident tail:(__ DOT __ ident)? {
    // => string
      let name = dt
      if (tail !== null) {
        name = `${dt}.${tail[3]}`
      }
      return name;
    }

proc_func_call
  = name:proc_func_name __ LPAREN __ l:proc_primary_list? __ RPAREN {
    // => { type: 'function'; name: string; args: null | { type: expr_list; value: proc_primary_list; }}
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
    // => IGNORE
    return {
        type: 'function',
        name: name,
        args: null
      };
  }

proc_primary_list
  = head:proc_primary tail:(__ COMMA __ proc_primary)* {
    // => proc_primary[]
      return createList(head, tail);
    }

proc_array =
  LBRAKE __ l:proc_primary_list __ RBRAKE {
    // => { type: 'array'; value: proc_primary_list }
    return { type: 'array', value: l };
  }

var_decl
  = p: KW_VAR_PRE d: without_prefix_var_decl {
    // => without_prefix_var_decl & { type: 'var'; prefix: string; };
    //push for analysis
    return {
      type: 'var',
      ...d,
      prefix: p
    };
  }

without_prefix_var_decl
  = name:ident_name m:mem_chain {
    // => { type: 'var'; prefix: string; name: ident_name; members: mem_chain; }
    //push for analysis
    varList.push(name);
    return {
      type: 'var',
      name: name,
      members: m,
      prefix: null,
    };
  }

mem_chain
  = l:('.' ident_name)* {
    // => ident_name[];
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
  / geometry_type
  / text_type
  / uuid_type
  / boolean_type
  / collection_type
  / key_value_type
  / row_type

boolean_type
  = t:(KW_BOOL / KW_BOOLEAN) { /* => data_type */ return { dataType: t }}

character_string_type
  = t:(KW_CHAR / KW_VARCHAR) __ LPAREN __ l:[0-9]+ __ RPAREN {
    // => data_type
    return { dataType: t, length: parseInt(l.join(''), 10) };
  }
  / t:KW_CHAR { /* =>  data_type */ return { dataType: t }; }
  / t:KW_VARCHAR { /* =>  data_type */  return { dataType: t }; }
  / t:KW_STRING { return {dataType: t }; }

numeric_type_suffix
  = un: KW_UNSIGNED? __ ze: KW_ZEROFILL? {
    // => any[];
    const result = []
    if (un) result.push(un)
    if (ze) result.push(ze)
    return result
  }
numeric_type
  = t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE) __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? { /* =>  data_type */ return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE)l:[0-9]+ __ s:numeric_type_suffix? { /* =>  data_type */ return { dataType: t, length: parseInt(l.join(''), 10), suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE) __ s:numeric_type_suffix? __{ /* =>  data_type */ return { dataType: t, suffix: s }; }

datetime_type
  = t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) __ LPAREN __ l:[0-9]+ __ RPAREN { /* =>  data_type */ return { dataType: t, length: parseInt(l.join(''), 10) }; }
  / t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP) { /* =>  data_type */  return { dataType: t }; }

json_type
  = t:(KW_JSON / KW_JSONB) { /* =>  data_type */  return { dataType: t }; }

geometry_type
  = t:KW_GEOMETRY {/* =>  data_type */  return { dataType: t }; }

text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) { /* =>  data_type */ return { dataType: t }}

uuid_type
  = t:KW_UUID {/* =>  data_type */  return { dataType: t }}

collection_type
  = t:KW_ARRAY LANGLEBRAKE subt:data_type RANGLEBRAKE { return { dataType: t, subType: subt}; }

key_value_type
  = t:KW_MAP LANGLEBRAKE subk:data_type COMMA subv:data_type RANGLEBRAKE { return {dataType: t, subType: subv}; }

row_type
  = t:KW_ROW { return {dataType: t} }
