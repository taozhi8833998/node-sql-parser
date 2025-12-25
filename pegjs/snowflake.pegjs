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
    'IS': true,

    'JOIN': true,
    'JSON': true,

    // 'KEY': true,

    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,

    'NOT': true,
    'NULL': true,
    'NULLS': true,

    'OFFSET': true,
    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'QUALIFY': true,
    'RECURSIVE': true,
    'RENAME': true,
    // 'REPLACE': true,
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

    'UNION': true,
    'UPDATE': true,
    'USING': true,

    // 'VALUES': true,

    'WITH': true,
    'WHEN': true,
    'WHERE': true,
    'WINDOW': true,

    'GLOBAL': true,
    'SESSION': true,
    'LOCAL': true,
    'PERSIST': true,
    'PERSIST_ONLY': true,
    'PIVOT': true,
    'UNPIVOT': true,
  };

  // Import common initializer functions (with location tracking) and variables
  @import 'common/initializer/functions-location.pegjs'
  @import 'common/initializer/variables.pegjs'

  // Snowflake specific helper functions
  function commonStrToLiteral(strOrLiteral) {
    return typeof strOrLiteral === 'string' ? { type: 'same', value: strOrLiteral } : strOrLiteral
  }

  function getSurroundFromLiteralType(literal) {
    switch (literal.type) {
      case 'double_quote_string':
        return '"'
      case 'single_quote_string':
        return "'"
      case 'backticks_quote_string':
        return '`'
      default:
        return ''
    }
  }
}

start
  = __ n:multiple_stmt {
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
  / show_stmt
  / deallocate_stmt

create_stmt
  = create_table_stmt
  / create_constraint_trigger
  / create_extension_stmt
  / create_index_stmt
  / create_sequence
  / create_db_stmt
  / create_domain_stmt
  / create_type_stmt
  / create_view_stmt

alter_stmt
  = alter_table_stmt
  / alter_schema_stmt
  / alter_domain_type_stmt
  / alter_function_stmt
  / alter_aggregate_stmt

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
      /*
      // is in reality: { tableList: any[]; columnList: any[]; ast: T; }
      export type AstStatement<T> = T;
       => AstStatement<crud_stmt[]> */
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
  = KW_UNION __ a:KW_ALL? {
    // => 'union' | 'union all'
    return a ? 'union all' : 'union'
  }

union_stmt
  = head:select_stmt tail:(__ set_op __ select_stmt)* __ ob: order_by_clause? __ l:limit_clause? {
     /* export interface union_stmt_node extends select_stmt_node  {
         _next: union_stmt_node;
         set_op: 'union' | 'union all';
      }
     => AstStatement<union_stmt_node>
     */
      let cur = head
      for (let i = 0; i < tail.length; i++) {
        cur._next = tail[i][3]
        cur.set_op = tail[i][1]
        cur = cur._next
      }
      if(ob) head._orderby = ob
      if(l && l.value && l.value.length > 0) head._limit = l
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: head
      }
    }

if_not_exists_stmt
  = 'IF'i __ KW_NOT __ KW_EXISTS {
    // => 'IF NOT EXISTS'
    return 'IF NOT EXISTS'
  }

create_extension_stmt
  = a:KW_CREATE __
    e:'EXTENSION'i __
    ife: if_not_exists_stmt? __
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
        if_not_exists:ife,
        extension: commonStrToLiteral(n),
        with: w && w[0].toLowerCase(),
        schema: commonStrToLiteral(s && s[2].toLowerCase()), // <== wont that be a bug ?
        version: commonStrToLiteral(v && v[2]),
        from: commonStrToLiteral(f && f[2]),
      }
    }

create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    // => create_option_character_set[]
    return createList(head, tail, 1)
  }

create_db_stmt
  = a:KW_CREATE __
    or:(KW_OR __ KW_REPLACE)? __
    k:(KW_DATABASE / KW_SCHEMA) __
    ife:if_not_exists_stmt? __
    t:proc_func_name __
    c:create_db_definition? {
      /*
      export type create_db_stmt = {
        type: 'create',
        keyword: 'database' | 'schema',
        if_not_exists?: 'if not exists',
        database?: { db: string, schema: string };
        schema?: { db: string, schema: string };
        create_definitions?: create_db_definition
      }
      => AstStatement<create_db_stmt>
      */
      const keyword = k.toLowerCase()
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword,
          if_not_exists:ife,
          replace: or && 'or replace',
          [keyword]: { db: t.schema, schema: t.name },
          create_definitions: c,
        }
      }
    }

view_with
  = KW_WITH __ c:("CASCADED"i / "LOCAL"i) __ "CHECK"i __ "OPTION" {
    // => string
    return `with ${c.toLowerCase()} check option`
  }
  / KW_WITH __ "CHECK"i __ "OPTION" {
    // => string
    return 'with check option'
  }

with_view_option
  = 'check_option'i __ KW_ASSIGIN_EQUAL __ t:("CASCADED"i / "LOCAL"i) {
    // => {type: string; value: string; symbol: string; }
    return  { type: 'check_option', value: t, symbol: '=' }
  }
  / k:('security_barrier'i / 'security_invoker'i) __ KW_ASSIGIN_EQUAL __ t:literal_bool {
    // => {type: string; value: string; symbol: string; }
    return { type: k.toLowerCase(), value: t.value ? 'true' : 'false', symbol: '=' }
  }
with_view_options
  = head:with_view_option tail:(__ COMMA __ with_view_option)* {
      // => with_view_option[]
      return createList(head, tail);
    }
create_view_stmt
  = a:KW_CREATE __ or:(KW_OR __ KW_REPLACE)? __ tp:(KW_TEMP / KW_TEMPORARY)? __ r:KW_RECURSIVE? __
  KW_VIEW __ v:table_name __ c:(LPAREN __ column_list __ RPAREN)? __ wo:(KW_WITH __ LPAREN __ with_view_options __ RPAREN)? __
  KW_AS __ s:select_stmt __ w:view_with? {
    /*
      export type create_view_stmt = {
        type: 'create',
        keyword: 'view',
        replace?: 'or replace',
        temporary?: 'temporary' | 'temp',
        recursive?: 'recursive',
        view: table_name,
        columns?: column_list,
        select: select_stmt_nake,
        with_options?: with_options,
        with?: string,
      }
      => AstStatement<create_view_stmt>
      */
    v.view = v.table
    delete v.table
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: a[0].toLowerCase(),
        keyword: 'view',
        replace: or && 'or replace',
        temporary: tp && tp[0].toLowerCase(),
        recursive: r && r.toLowerCase(),
        columns: c && c[2],
        select: s,
        view: v,
        with_options: wo && wo[4],
        with: w,
      }
    }
  }
create_type_stmt
  = a:KW_CREATE __ k:'TYPE'i __ s:table_name __ as:KW_AS __ r:KW_ENUM __ LPAREN __ e:expr_list? __ RPAREN {
      /*
      export type create_type_stmt = {
        type: 'create',
        keyword: 'type',
        name: { schema: string; name: string },
        as?: string,
        resource?: string,
        create_definitions?: any
      }
      => AstStatement<create_type_stmt>
      */
      e.parentheses = true
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: k.toLowerCase(),
          name: { schema: s.db, name: s.table },
          as: as && as[0] && as[0].toLowerCase(),
          resource: r.toLowerCase(),
          create_definitions: e,
        },
        ...getLocationObject(),
      }
    }
  / a:KW_CREATE __ k:'TYPE'i __ s:table_name {
    // => AstStatement<create_type_stmt>
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: k.toLowerCase(),
          name: { schema: s.db, name: s.table },
        }
      }
  }
create_domain_stmt
  = a:KW_CREATE __ k:'DOMAIN'i __ s:table_name __ as:KW_AS? __ d:data_type __ ce:collate_expr? __ de:default_expr? __ ccc: create_constraint_check? {
      /*
      export type create_domain_stmt = {
        type: 'create',
        keyword: 'domain',
        domain: { schema: string; name: string },
        as?: string,
        target: data_type,
        create_definitions?: any[]
      }
      => AstStatement<create_domain_stmt>
      */
     if (ccc) ccc.type = 'constraint'
     const definitions = [ce, de, ccc].filter(v => v)
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: k.toLowerCase(),
          domain: { schema: s.db, name: s.table },
          as: as && as[0] && as[0].toLowerCase(),
          target: d,
          create_definitions: definitions,
        },
        ...getLocationObject(),
      }
    }
create_table_stmt
  = a:KW_CREATE __
    or:(KW_OR __ KW_REPLACE)? __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_name __
    c:create_table_definition? __
    to:table_options? __
    ir:(KW_IGNORE / KW_REPLACE)? __
    as:KW_AS? __
    qe:union_stmt? {
      tableList.add(`create::${[t.db, t.schema].filter(Boolean).join('.') || null}::${t.table}`)
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists:ife,
          table: [t],
          replace: or && 'or replace',
          ignore_replace: ir && ir[0].toLowerCase(),
          as: as && as[0].toLowerCase(),
          query_expr: qe && qe.ast,
          create_definitions: c,
          table_options: to
        },
        ...getLocationObject(),
      }
    }
  / a:KW_CREATE __
    or:(KW_OR __ KW_REPLACE)? __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    lt:create_like_table {
      /*

      export interface create_table_stmt_node_like extends create_table_stmt_node_base{
        like: create_like_table;
      }
      => AstStatement<create_table_stmt_node>;
      */
      if(t) t.forEach(tt => tableList.add(`create::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists:ife,
          replace: or && (or[0] + ' ' +  or[2][0]).toUpperCase(),
          table: t,
          like: lt
        }
      }
    }

create_sequence
  = a:KW_CREATE __
    tp:(KW_TEMPORARY / KW_TEMP)? __
    KW_SEQUENCE __
    ife:if_not_exists_stmt? __
    t:table_name __ as:(KW_AS __ alias_ident)?__
    c:create_sequence_definition_list? {
      /*
      export type create_sequence_stmt = {
        type: 'create',
        keyword: 'sequence',
        temporary?: 'temporary' | 'temp',
        if_not_exists?: 'if not exists',
        table: table_ref_list,
        create_definitions?: create_sequence_definition_list
      }
      => AstStatement<create_sequence_stmt>
      */
      t.as = as && as[2]
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'sequence',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists:ife,
          sequence: [t],
          create_definitions: c,
        }
      }
    }

sequence_definition_increment
  = k:'INCREMENT'i __ b:KW_BY? __ n:literal_numeric {
    /*
    export type sequence_definition = { "resource": "sequence", prefix?: string,value: literal | column_ref }
    => sequence_definition
    */
    return {
      resource: 'sequence',
      prefix: b ? `${k.toLowerCase()} by` : k.toLowerCase(),
      value: n
    }
  }
sequence_definition_minval
  = k:'MINVALUE'i __ n:literal_numeric {
    // => sequence_definition
    return {
      resource: 'sequence',
      prefix: k.toLowerCase(),
      value: n
    }
  }
  / 'NO'i __ 'MINVALUE'i {
    // => sequence_definition
    return {
      resource: 'sequence',
      value: {
        type: 'origin',
        value: 'no minvalue'
      }
    }
  }

sequence_definition_maxval
  = k:'MAXVALUE'i __ n:literal_numeric {
    // => sequence_definition
    return {
      resource: 'sequence',
      prefix: k.toLowerCase(),
      value: n
    }
  }
  / 'NO'i __ 'MAXVALUE'i {
    // => sequence_definition
    return {
      resource: 'sequence',
      value: {
        type: 'origin',
        value: 'no maxvalue'
      }
    }
  }

sequence_definition_start
  = k:'START'i __ w:KW_WITH? __ n:literal_numeric {
    // => sequence_definition
    return {
      resource: 'sequence',
      prefix: w ? `${k.toLowerCase()} with` : k.toLowerCase(),
      value: n
    }
  }

sequence_definition_cache
  = k:'CACHE'i __ n:literal_numeric {
    // => sequence_definition
    return {
      resource: 'sequence',
      prefix: k.toLowerCase(),
      value: n
    }
  }

sequence_definition_cycle
  = n:'NO'i? __ 'CYCLE'i {
    // => sequence_definition
    return {
      resource: 'sequence',
      value: {
        type: 'origin',
        value: n ? 'no cycle' : 'cycle'
      }
    }
  }

sequence_definition_owned
  = 'OWNED'i __ KW_BY __ 'NONE'i {
    // => sequence_definition
    return {
      resource: 'sequence',
      prefix: 'owned by',
      value: {
        type: 'origin',
        value: 'none'
      }
    }
  }
  / n:'OWNED'i __ KW_BY __ col:column_ref {
    // => sequence_definition
    return {
      resource: 'sequence',
      prefix: 'owned by',
      value: col
    }
  }

create_sequence_definition
  = sequence_definition_increment
  / sequence_definition_minval
  / sequence_definition_maxval
  / sequence_definition_start
  / sequence_definition_cache
  / sequence_definition_cycle
  / sequence_definition_owned

create_sequence_definition_list
  = head: create_sequence_definition tail:(__ create_sequence_definition)* {
    // => create_sequence_definition[]
    return createList(head, tail, 1)
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
      collate: collate_expr;
      opclass: ident;
      order: 'asc' | 'desc';
      nulls: 'nulls last' | 'nulls first';
    }
    */
    return {
      ...c,
      collate: ca,
      opclass: op,
      order_by: o && o.toLowerCase(),
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

column_definition_opt
  = column_constraint
  / a:('AUTO_INCREMENT'i) {
    // => { auto_increment: 'auto_increment'; }
    return { auto_increment: a.toLowerCase() }
  }
  / 'UNIQUE'i __ k:('KEY'i)? {
    // => { unique: 'unique' | 'unique key'; }
    const sql = ['unique']
    if (k) sql.push(k)
    return { unique: sql.join(' ').toLowerCase('') }
  }
  / p:('PRIMARY'i)? __ 'KEY'i {
    // => { unique: 'key' | 'primary key'; }
    const sql = []
    if (p) sql.push('primary')
    sql.push('key')
    return { primary_key: sql.join(' ').toLowerCase('') }
  }
  / co:keyword_comment {
    // => { comment: keyword_comment; }
    return { comment: co }
  }
  / ca:collate_expr {
    // => { collate: collate_expr; }
    return { collate: ca }
  }
  / cf:column_format {
    // => { column_format: column_format; }
    return { column_format: cf }
  }
  / s:storage {
    // => { storage: storage }
    return { storage: s }
  }
  / re:reference_definition {
    // => { reference_definition: reference_definition; }
    return { reference_definition: re }
  }
  / t:create_option_character_set_kw __ s:KW_ASSIGIN_EQUAL? __ v:ident_without_kw_type {
    return { character_set: { type: t, value: v, symbol: s }}
  }

column_definition_opt_list
  = head:column_definition_opt __ tail:(__ column_definition_opt)* {
    /*
      => {
        nullable?: column_constraint['nullable'];
        default_val?: column_constraint['default_val'];
        auto_increment?: 'auto_increment';
        unique?: 'unique' | 'unique key';
        primary?: 'key' | 'primary key';
        comment?: keyword_comment;
        collate?: collate_expr;
        column_format?: column_format;
        storage?: storage;
        reference_definition?: reference_definition;
      }
      */
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
      /*
      => {
        column: column_ref;
        definition: data_type;
        nullable: column_constraint['nullable'];
        default_val: column_constraint['default_val'];
        auto_increment?: 'auto_increment';
        unique?: 'unique' | 'unique key';
        primary?: 'key' | 'primary key';
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
        resource: 'column',
        ...(cdo || {})
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
  = KW_DEFAULT __ ce:expr {
    // => { type: 'default'; value: literal | expr; }
    return {
      type: 'default',
      value: ce
    }
  }
drop_index_opt
  = head:(ALTER_ALGORITHM / ALTER_LOCK) tail:(__ (ALTER_ALGORITHM / ALTER_LOCK))* {
    // => (ALTER_ALGORITHM | ALTER_LOCK)[]
    return createList(head, tail, 1)
  }
drop_stmt
  = a:KW_DROP __
    r:KW_TABLE __
    t:table_ref_list {
      /*
      export interface drop_stmt_node {
        type: 'drop';
        keyword: 'table';
        name: table_ref_list;
      }
      => AstStatement<drop_stmt_node>
      */
      if(t) t.forEach(tt => tableList.add(`${a}::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`));
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
    cu:KW_CONCURRENTLY? __
    ie:('IF'i __ KW_EXISTS)? __
    i:column_ref __
    op:('CASCADE'i / 'RESTRICT'i)? {
      /*
      export interface drop_index_stmt_node {
        type: 'drop';
        prefix?: 'CONCURRENTLY';
        keyword: string;
        name: column_ref;
        options?: 'cascade' | 'restrict';
      }
      => AstStatement<drop_index_stmt_node>
      */
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          prefix: cu,
          name: i,
          options: op && [{ type: 'origin', value: op }]
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
      if(t) t.forEach(tt => tableList.add(`${a}::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`));
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
          db: d,
          ...getLocationObject(),
        }
      };
    }

aggregate_signature
  = STAR {
    // => { name: ”*“ }
    return [
      {
        name: '*'
      }
    ]
  }
  / s:alter_func_args? __ KW_ORDER __ KW_BY __ o:alter_func_args {
    // => alter_func_args
    const ans = s || []
    ans.orderby = o
    return ans
  }
  / alter_func_args

alter_func_argmode
  = t:(KW_IN / 'OUT'i / 'VARIADIC'i / 'INOUT'i) {
    // => ignore
    return t.toUpperCase()
  }

alter_func_arg_item
  = m:alter_func_argmode? __ ad:data_type {
    // => { mode?: string; name?: string; type: data_type; }
    return {
      mode: m,
      type: ad,
    }
  }
  / m:alter_func_argmode? __ an:ident_name __ ad:data_type {
    // => { mode?: string; name?: string; type: data_type; }
    return {
      mode: m,
      name: an,
      type: ad,
    }
  }
alter_func_args
  = head:alter_func_arg_item tail:(__ COMMA __ alter_func_arg_item)* {
      // => alter_func_arg_item[]
      return createList(head, tail)
  }
alter_aggregate_stmt
  = KW_ALTER __ t:'AGGREGATE'i __ s:table_name __ LPAREN __ as:aggregate_signature __ RPAREN __ ac:(ALTER_RENAME / ALTER_OWNER_TO / ALTER_SET_SCHEMA) {
    // => AstStatement<alter_resource_stmt_node>
    const keyword = t.toLowerCase()
    ac.resource = keyword
    ac[keyword] = ac.table
    delete ac.table
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword,
          name: { schema: s.db, name: s.table },
          args: {
            parentheses: true,
            expr: as,
            orderby: as.orderby
          },
          expr: ac
        },
        ...getLocationObject(),
      };
  }
alter_function_stmt
  = KW_ALTER __ t:'FUNCTION'i __ s:table_name __ ags:(LPAREN __ alter_func_args? __ RPAREN)? __ ac:(ALTER_RENAME / ALTER_OWNER_TO / ALTER_SET_SCHEMA) {
    // => AstStatement<alter_resource_stmt_node>
    const keyword = t.toLowerCase()
    ac.resource = keyword
    ac[keyword] = ac.table
    delete ac.table
    const args = {}
    if (ags && ags[0]) args.parentheses = true
    args.expr = ags && ags[2]
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword,
          name: { schema: s.db, name: s.table },
          args,
          expr: ac
        }
      };
  }
alter_domain_type_stmt
  = KW_ALTER __ t:('DOMAIN'i / 'TYPE'i) __ s:table_name __ ac:(ALTER_RENAME / ALTER_OWNER_TO / ALTER_SET_SCHEMA) {
    /*
      export interface alter_resource_stmt_node {
        type: 'alter';
        keyword: 'domain' | 'type',
        name: string | { schema: string, name: string };
        args?: { parentheses: true; expr?: alter_func_args; orderby?: alter_func_args; };
        expr: alter_rename_owner;
      }
      => AstStatement<alter_resource_stmt_node>
      */
    const keyword = t.toLowerCase()
    ac.resource = keyword
    ac[keyword] = ac.table
    delete ac.table
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword,
          name: { schema: s.db, name: s.table },
          expr: ac
        }
      };
  }

alter_schema_stmt
  = KW_ALTER __ t:KW_SCHEMA __ s:ident_name __ ac:(ALTER_RENAME / ALTER_OWNER_TO / ALTER_SET_SCHEMA) {
    // => AstStatement<alter_resource_stmt_node>
    const keyword = t.toLowerCase()
    ac.resource = keyword
    ac[keyword] = ac.table
    delete ac.table
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword,
          schema: s,
          expr: ac
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
      if (t && t.length > 0) t.forEach(table => tableList.add(`alter::${[table.db, table.schema].filter(Boolean).join('.') || null}::${table.table}`));
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
  / ALTER_ADD_CONSTRAINT
  / ALTER_DROP_COLUMN
  / ALTER_ADD_INDEX_OR_KEY
  / ALTER_ADD_FULLETXT_SPARITAL_INDEX
  / ALTER_RENAME
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

ALTER_ADD_CONSTRAINT
  = KW_ADD __ c:create_constraint_definition {
    /* => {
        action: 'add';
        create_definitions: create_db_definition;
        resource: 'constraint';
        type: 'alter';
      } */
      return {
        action: 'add',
        create_definitions: c,
        resource: 'constraint',
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

ALTER_RENAME
  = KW_RENAME __ kw:(KW_TO / KW_AS)? __ tn:ident {
    /*
      export interface alter_rename_owner {
        action: string;
        type: 'alter';
        resource: string;
        keyword?: 'to' | 'as';
        [key: string]: ident;
      }
      => AstStatement<alter_rename>
      */
    return {
      action: 'rename',
      type: 'alter',
      resource: 'table',
      keyword: kw && kw[0].toLowerCase(),
      table: tn
    }
  }

ALTER_OWNER_TO
  = 'OWNER'i __ KW_TO __ tn:(ident / 'CURRENT_ROLE'i / 'CURRENT_USER'i / 'SESSION_USER'i) {
      // => AstStatement<alter_rename_owner>
    return {
      action: 'owner',
      type: 'alter',
      resource: 'table',
      keyword: 'to',
      table: tn
    }
  }

ALTER_SET_SCHEMA
  = KW_SET __ KW_SCHEMA __ s:ident {
    // => AstStatement<alter_rename_owner>
    return {
      action: 'set',
      type: 'alter',
      resource: 'table',
      keyword: 'schema',
      table: s
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
  / create_constraint_check

constraint_name
  = kc:KW_CONSTRAINT __ c:ident? {
    // => { keyword: 'constraint'; constraint: ident; }
    return {
      keyword: kc.toLowerCase(),
      constraint: c
    }
  }
create_constraint_check
  = kc:constraint_name? __ p:'CHECK'i __ LPAREN __ e:or_and_where_expr __ RPAREN {
    /* => {
      constraint?: constraint_name['constraint'];
      definition: or_and_where_expr;
      keyword?: constraint_name['keyword'];
      constraint_type: 'check';
      resource: 'constraint';
    }*/
    return {
        constraint: kc && kc.constraint,
        definition: [e],
        constraint_type: p.toLowerCase(),
        keyword: kc && kc.keyword,
        resource: 'constraint',
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
      keyword?: constraint_name['keyword'];
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
      keyword?: constraint_name['keyword'];
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
  t: table_name __
  de:cte_column_definition __
  m:('MATCH FULL'i / 'MATCH PARTIAL'i / 'MATCH SIMPLE'i)? __
  od: on_reference? __
  ou: on_reference? {
    /* => {
        definition: cte_column_definition;
        table: table_ref_list;
        keyword: 'references';
        match: 'match full' | 'match partial' | 'match simple';
        on_action: [on_reference?];
      }*/
    return {
        definition: de,
        table: [t],
        keyword: kc.toLowerCase(),
        match:m && m.toLowerCase(),
        on_action: [od, ou].filter(v => v)
      }
  }
  / oa:on_reference {
    /* => {
      on_action: [on_reference];
    }
    */
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
    // => { type: 'function'; name: string; args: expr_list; }
    return {
      type: 'function',
      name: { name: [{ type: 'origin', value: kw }] },
      args: l
    }
  }
  / kc:('RESTRICT'i / 'CASCADE'i / 'SET NULL'i / 'NO ACTION'i / 'SET DEFAULT'i / KW_CURRENT_TIMESTAMP) {
    // => 'restrict' | 'cascade' | 'set null' | 'no action' | 'set default' | 'current_timestamp'
    return {
      type: 'origin',
      value: kc.toLowerCase()
    }
  }

create_constraint_trigger
  = kw: KW_CREATE __
  or:(KW_OR __ KW_REPLACE)? __
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
  fc:'EXECUTE'i __ e:('PROCEDURE'i / 'FUNCTION'i) __
  fct:proc_func_call {
    /*
    => {
      type: 'create';
      replace?: string;
      constraint?: string;
      location: 'before' | 'after' | 'instead of';
      events: trigger_event_list;
      table: table_name;
      from?: table_name;
      deferrable?: trigger_deferrable;
      for_each?: trigger_for_row;
      when?: trigger_when;
      execute: {
        keyword: string;
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
        replace: or && 'or replace',
        constraint: c,
        location: p && p.toLowerCase(),
        events: te,
        table: tn,
        from: fr && fr[2],
        deferrable: de,
        for_each: fe,
        when: tw,
        execute: {
          keyword: `execute ${e.toLowerCase()}`,
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
    // => string
    return 'CHARACTER SET'
  }

create_option_character_set
  = kw:KW_DEFAULT? __ t:(create_option_character_set_kw / 'CHARSET'i / 'COLLATE'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:ident_without_kw_type {
    /* => {
      keyword: 'character set' | 'charset' | 'collate' | 'default character set' | 'default charset' | 'default collate';
      symbol: '=';
      value: ident_name;
      } */
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
      t.forEach(tg => tg.forEach(dt => dt.table && tableList.add(`rename::${[dt.db, dt.schema].filter(Boolean).join('.') || null}::${dt.table}`)))
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

    if (t) t.forEach(tt => tableList.add(`lock::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`))
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

show_stmt
  = KW_SHOW __ 'TABLES'i {
    return {
      /*
        export interface show_stmt_node {
          type: 'show';
          keyword: 'tables' | 'var';
          var?: without_prefix_var_decl;
        }
        => AstStatement<show_stmt_node>
       */
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        keyword: 'tables'
      }
    }
  }
  / KW_SHOW __ c:without_prefix_var_decl {
    return {
      // => AstStatement<show_stmt_node>
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        keyword: 'var',
        var: c,
      }
    }
  }

deallocate_stmt
  = KW_DEALLOCATE __ p:('PREPARE'i)? __ i:(ident_name / KW_ALL) {
    return {
      /*
        export interface deallocate_stmt_node {
          type: 'deallocate';
          keyword: 'PREPARE' | undefined;
          expr: { type: 'default', value: string }
        }
        => AstStatement<deallocate_stmt_node>
       */
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'deallocate',
        keyword: p,
        expr: { type: 'default', value: i }
      },
    }
  }

select_stmt
  = KW_SELECT __ ';' {
    // => { type: 'select'; }
    return {
      type: 'select',
      ...getLocationObject(),
    }
  }
  / select_stmt_nake
  / s:('(' __ select_stmt __ ')') {
    /*
    export interface select_stmt_node extends select_stmt_nake  {
       parentheses: true;
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
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition tail:(__ COMMA __ cte_definition)* {
      cte.recursive = true;
      return createList(cte, tail);
    }

cte_definition
  = name:(literal_string / ident_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:crud_stmt __ RPAREN {
    // => { name: { type: 'default'; value: string; }; stmt: crud_stmt; columns?: cte_column_definition; }
    if (typeof name === 'string') name = { type: 'default', value: name }
      return { name, stmt, columns, ...getLocationObject() };
    }

cte_column_definition
  = LPAREN __ l:column_ref_list __ RPAREN {
    // => column_ref_list
      return l
    }

distinct_on
  = d:KW_DISTINCT __ o:KW_ON __ LPAREN __ c:column_ref_list __ RPAREN {
    // => {type: string; columns: column_ref_list;}
    console.lo
    return {
      type: `${d} ON`,
      columns: c
    }
  }
  / d:KW_DISTINCT? {
    // => { type: string | undefined; }
    return {
      type: d,
    }
  }

select_stmt_nake
  = __ cte:with_clause? __ KW_SELECT ___
    opts:option_clause? __
    d:distinct_on?      __
    top:top_clause? __
    c:column_clause     __
    ci:into_clause?      __
    f:from_clause?      __
    fi:into_clause?      __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
    q:qualify_clause? __
    o:order_by_clause?  __
    l:limit_clause? __
    win:window_clause? __
    li:into_clause? {
      /* => {
          with?: with_clause;
          type: 'select';
          options?: option_clause;
          distinct?: {type: string; columns?: column_list; };
          columns: column_clause;
          from?: from_clause;
          into?: into_clause;
          where?: where_clause;
          groupby?: group_by_clause;
          having?: having_clause;
          orderby?: order_by_clause;
          top?: top_clause;
          limit?: limit_clause;
          window?: window_clause;
        }*/
      if ((ci && fi) || (ci && li) || (fi && li) || (ci && fi && li)) {
        throw new Error('A given SQL statement can contain at most one INTO clause')
      }
      if(f) f.forEach(info => info.table && tableList.add(`select::${[info.db, info.schema].filter(Boolean).join('.') || null}::${info.table}`));
      return {
          with: cte,
          type: 'select',
          options: opts,
          distinct: d,
          columns: c,
          into: {
            ...(ci || fi || li || {}),
            position: ci && 'column' || fi && 'from' || li && 'end'
          },
          from: f,
          where: w,
          groupby: g,
          having: h,
          qualify: q,
          orderby: o,
          top,
          limit: l,
          window: win,
          ...getLocationObject()
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

column_star_option
  = 'exclude'i __ LPAREN __  l:expr_list __ RPAREN {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'exclude' }] },
        args: l,
      };
  }
  / 'exclude'i __ c:column_ref {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'exclude' }] },
        args:{ type: 'expr_list', value: [c] },
        args_parentheses: false,
      };
  }

column_clause
  = head:column_list_item tail:(__ COMMA __ column_list_item)* {
    // => column_list_item[]
      return createList(head, tail);
    }

array_index
  = LBRAKE __ n:(literal_numeric / literal_string) __ RBRAKE {
    // => { brackets: boolean, number: number }
    return {
      brackets: true,
      index: n
    }
  }
  / d:DOT __ n:ident {
    return {
      notation: d,
      index: {
        type: 'default',
        value: n
      }
    }
  }
array_index_list
  = head:array_index tail:(__ array_index)* {
    return createList(head, tail, 1)
  }
expr_item
  = e:binary_column_expr __ a:array_index_list? {
    // => binary_expr & { array_index: array_index }
    if (a) e.array_index = a
    return e
  }

column_list_item
  = head: (KW_ALL / STAR) __ c:column_star_option? {
    // => 'ALL' | '*' | column_list_item[]
    columnList.add('select::null::(.*)')
    return {
      expr: {
        type: 'column_ref',
        table: null,
        column: '*',
        suffix: c,
      },
      as: null,
      ...getLocationObject()
    }
  }
  / c:string_constants_escape {
    // => { expr: expr; as: null; }
    return { expr: c, as: null, ...getLocationObject(), }
  }
  / e:expr_item __ c:cast_double_colon __ tail:(__ (additive_operator / multiplicative_operator) __ expr_item)* __ alias:alias_clause? {
    return {
      ...c,
      as: alias,
      type: 'cast',
      expr: e,
      tail: tail && tail[0] && { operator: tail[0][1], expr: tail[0][3] },
      ...getLocationObject(),
    }
  }
  / tbl:(ident __ DOT)? pro:(ident __ DOT)? __ (KW_ALL/STAR)  __ c:column_star_option? {
      // => { expr: column_ref; as: null; }
      let schema, table
      if (tbl) {
        schema = null
        table = tbl[0]
      }
      if (pro) {
        schema = tbl[0]
        table = pro[0]
      }
      columnList.add(`select::${table}::(.*)`)
      const column = '*'
      return {
        expr: {
          type: 'column_ref',
          table,
          schema,
          column,
          suffix: c,
        },
        as: null,
        ...getLocationObject()
      }
    }
  / e:expr_item  __ alias:alias_clause? {
    // => { type: 'expr'; expr: expr; as?: alias_clause; }
      if (e.type === 'double_quote_string' || e.type === 'single_quote_string') {
        columnList.add(`select::null::${e.value}`)
      }
      return { type: 'expr', expr: e, as: alias, ...getLocationObject(), };
    }

value_alias_clause
  = KW_AS? __ i:alias_ident { /*=>alias_ident*/ return i; }

alias_clause
  = KW_AS __ i:column_without_kw { /*=>alias_ident*/ return i; }
  / KW_AS? __ i:column { /*=>ident*/ return i; }

into_clause
  = KW_INTO __ v:var_decl_list {
    // => { keyword: 'var'; type: 'into'; expr: var_decl_list; }
    return {
      keyword: 'var',
      type: 'into',
      expr: v
    }
  }
  / KW_INTO __ k:('OUTFILE'i / 'DUMPFILE'i)? __ f:(literal_string / ident) {
    // => { keyword: 'var'; type: 'into'; expr: literal_string | ident; }
    return {
      keyword: k,
      type: 'into',
      expr: f
    }
  }

from_clause
  = KW_FROM __ l:table_ref_list __ op:pivot_operator? {
    if (l[0]) l[0].operator = op
    return l;
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
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_without_kw_type tail:(__ COMMA __ ident_without_kw_type)* __ RPAREN {
      // => table_base & {join: join_op; using: ident_name[]; }
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
    // => table_base & {join: join_op; on?: on_clause; }
      t.join = op;
      t.on = expr;
      return t;
    }
  / op:(join_op / set_op) __ LPAREN __ stmt:(union_stmt / table_ref_list) __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
    /* => {
      expr: (union_stmt || table_ref_list) & { parentheses: true; };
      as?: alias_clause;
      join: join_op | set_op;
      on?: on_clause;
    }*/
    if (Array.isArray(stmt)) stmt = { type: 'tables', expr: stmt }
    stmt.parentheses = true;
    return {
      expr: stmt,
      as: alias,
      join: op,
      on: expr,
      ...getLocationObject(),
    };
  }

table_generator_option
  = t:('ROWCOUNT'i / 'TIMELIMIT'i) __ '=>' __ v:literal_numeric {
    return {
      type: t.toLowerCase(),
      symbol: '=>',
      value: v
    }
  }

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = KW_DUAL {
    // => { type: 'dual' }
      return {
        type: 'dual'
      };
  }
  / stmt:value_clause __ alias:value_alias_clause? {
    // => { expr: value_clause; as?: alias_clause; }
    return {
      expr: stmt,
      as: alias,
      ...getLocationObject(),
    };
  }
  / KW_TABLE __ LPAREN __ 'GENERATOR'i __ LPAREN __ g:(table_generator_option)* __ RPAREN __ RPAREN __ alias:value_alias_clause? {
    return {
      expr: {
        keyword: 'table',
        type: 'generator',
        generators: g,
      },
      as: alias,
      ...getLocationObject(),
    };
  }
  / l:('LATERAL'i)? __ LPAREN __ stmt:(union_stmt / value_clause) __ RPAREN __ alias:value_alias_clause? {
    // => { prefix?: string; expr: union_stmt | value_clause; as?: alias_clause; }
    stmt.parentheses = true;
    return {
      prefix: l,
      expr: stmt,
      as: alias,
      ...getLocationObject(),
    };
  }
  / l:('LATERAL'i)? __ LPAREN __ stmt:table_ref_list __ RPAREN __ alias:value_alias_clause? {
    // => { prefix?: string; expr: table_ref_list; as?: alias_clause; }
    stmt = { type: 'tables', expr: stmt, parentheses: true }
    return {
      prefix: l,
      expr: stmt,
      as: alias,
      ...getLocationObject(),
    };
  }
  / l:('LATERAL'i)? __ e:func_call __ alias:alias_clause? {
    // => { prefix?: string; type: 'expr'; expr: expr; as?: alias_clause; }
      return { prefix: l, type: 'expr', expr: e, as: alias };
    }
  / t:table_name __ 'TABLESAMPLE'i __ f:func_call __ re:('REPEATABLE'i __ LPAREN __ literal_numeric __ RPAREN)? __ alias:alias_clause? {
    // => table_name & { expr: expr, repeatable: literal_numeric; as?: alias_clause;}
    return {
      ...t,
      as: alias,
      tablesample: {
        expr: f,
        repeatable: re && re[4],
      },
      ...getLocationObject(),
    }
  }
  / t:table_name __ alias:alias_clause? {
    // => table_name & { as?: alias_clause; }
      if (t.type === 'var') {
        t.as = alias;
        t = { ...t, ...getLocationObject() }
        return t;
      } else {
        return {
          ...t,
          as: alias,
          ...getLocationObject(),
        };
      }
    }


join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { /* => 'LEFT JOIN' */ return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { /* =>  'RIGHT JOIN' */ return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { /* => 'FULL JOIN' */ return 'FULL JOIN'; }
  / 'CROSS'i __ KW_JOIN { /* => 'CROSS JOIN' */ return 'CROSS JOIN'; }
  / (KW_INNER __)? KW_JOIN { /* => 'INNER JOIN' */ return 'INNER JOIN'; }

table_name
  = db:ident_without_kw_type schema:(__ DOT __ ident_without_kw_type) tail:(__ DOT __ ident_without_kw_type) {
      const obj = { db: null, table: db.value };
      if (tail !== null) {
        obj.db = db.value;
        obj.catalog = db.value;
        obj.schema = schema[3].value;
        obj.table = tail[3].value;
        obj.surround = { table: getSurroundFromLiteralType(tail[3]), db: getSurroundFromLiteralType(db), schema: getSurroundFromLiteralType(schema[3]) };
      }
      return obj;
    }
  / dt:ident __ DOT __ STAR {
    // => IGNORE
      return {
        db: dt,
        table: '*',
        ...getLocationObject(),
      }
    }
  / dt:ident_without_kw_type tail:(__ DOT __ ident_without_kw_type)? {
      const obj = { db: null, table: dt.value, surround: { table: getSurroundFromLiteralType(dt) } };
      if (tail !== null) {
        obj.db = dt.value;
        obj.table = tail[3].value;
        obj.surround = { table: getSurroundFromLiteralType(tail[3]), db: getSurroundFromLiteralType(dt) };
      }
      return obj;
    }
    / v:var_decl {
    // => IGNORE
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
  = KW_ON __ e:or_and_where_expr { /* => or_and_where_expr */ return e; }

where_clause
  = KW_WHERE __ e:or_and_where_expr { /* => binary_expr */ return e; }

group_by_clause
  = KW_GROUP __ KW_BY __ e:(KW_ALL / expr_list) {
    const columns = e === 'ALL' ? [{ type: 'origin', value: 'all'}] : e.value
    return {
      columns
    }
  }

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
    // => column_ref[]
      return createList(head, tail);
    }

having_clause
  = KW_HAVING __ e:or_and_where_expr { /* => expr */ return e; }

qualify_clause
  = KW_QUALIFY __ e:or_and_where_expr { /* => or_and_where_expr */ return e; }

window_clause
  = KW_WINDOW __ l:named_window_expr_list {
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
    // => { window_specification: window_specification; parentheses: boolean }
    return {
      window_specification: ws || {},
      parentheses: true
    }
  }

window_specification
  = bc:partition_by_clause? __
  l:order_by_clause? __
  w:window_frame_clause? {
    // => { name: null; partitionby: partition_by_clause; orderby: order_by_clause; window_frame_clause: string | null; }
    return {
      name: null,
      partitionby: bc,
      orderby: l,
      window_frame_clause: w
    }
  }

window_specification_frameless
  = bc:partition_by_clause? __
  l:order_by_clause? {
    // => { name: null; partitionby: partition_by_clause; orderby: order_by_clause; window_frame_clause: null }
    return {
      name: null,
      partitionby: bc,
      orderby: l,
      window_frame_clause: null
    }
  }

interval_expr_preceding
  = i:interval_expr __ 'PRECEDING'i {
    const suffix = {
      type: 'origin',
      value: 'preceding',
    }
    i.suffix = suffix;
    return i;
  }
window_frame_clause
  = kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    return {
      type: 'rows',
      expr: s
    }
  }
  / KW_ROWS __ op:KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:window_frame_following {
    const left = {
      type: 'origin',
      value: 'rows',
    }
    const right = {
      type: 'expr_list',
      value: [p, f]
    }
    return createBinaryExpr(op, left, right)
  }
  / 'RANGE'i __ op:KW_BETWEEN __ p:interval_expr_preceding __ KW_AND __ f:(interval_expr_preceding / window_frame_current_row) {
    const left = {
      type: 'origin',
      value: 'range',
    }
    const right = {
      type: 'expr_list',
      value: [p, f]
    }
    return createBinaryExpr(op, left, right)
  }

window_frame_following
  = s:window_frame_value __ 'FOLLOWING'i  {
    // => string
    s.value += ' FOLLOWING'
    return s
  }
  / window_frame_current_row

window_frame_preceding
  = s:window_frame_value __ k:('PRECEDING'i / 'FOLLOWING'i)  {
    // => string
    s.value += ` ${k.toUpperCase()}`
    return s
  }
  / window_frame_current_row

window_frame_current_row
  = 'CURRENT'i __ 'ROW'i {
    return { type: 'origin', value: 'current row', ...getLocationObject() }
  }

window_frame_value
  = s:'UNBOUNDED'i {
    return { type: 'origin', value: s.toUpperCase(), ...getLocationObject() }
  }
  / literal_numeric

partition_by_clause
  = KW_PARTITION __ KW_BY __ bc:column_clause { /* => column_clause */ return bc; }

order_by_clause
  = KW_ORDER __ KW_BY __ l:order_by_list { /* => order_by_list */ return l; }

order_by_list
  = head:order_by_element tail:(__ COMMA __ order_by_element)* {
    // => order_by_element[]
      return createList(head, tail);
    }

order_by_element
  = e:expr __ d:(KW_DESC / KW_ASC)? __ nl:('NULLS'i __ ('FIRST'i / 'LAST'i)?)? {
    // => { expr: expr; type: 'ASC' | 'DESC' | undefined;  nulls: 'NULLS FIRST' | 'NULLS LAST' | undefined }
    const obj = { expr: e, type: d };
    obj.nulls = nl && [nl[0], nl[2]].filter(v => v).join(' ')
    return obj;
  }

number_or_param
  = literal_numeric
  / var_decl
  / param

limit_clause
  = l:(KW_LIMIT __ (number_or_param / KW_ALL))? __ tail:(KW_OFFSET __ number_or_param)? {
    // => { separator: 'offset' | ''; value: [number_or_param | { type: 'origin', value: 'all' }, number_or_param?] }
      const res = []
      if (l) res.push(typeof l[2] === 'string' ? { type: 'origin', value: 'all' } : l[2])
      if (tail) res.push(tail[2]);
      return {
        seperator: tail && tail[0] && tail[0].toLowerCase() || '',
        value: res,
        ...getLocationObject(),
      };
    }

update_stmt
  = __ cte:with_clause? __ KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    f:from_clause? __
    w:where_clause? __
    r:returning_stmt? {
      /* export interface update_stmt_node {
        with?: with_clause;
         type: 'update';
         table: table_ref_list;
         set: set_list;
         from?: from_clause;
         where?: where_clause;
         returning?: returning_stmt;
      }
     => AstStatement<update_stmt_node>
     */
      const dbObj = {}
      const addTableFun = (tableInfo) => {
        const { server, db, schema, as, table, join } = tableInfo
        const action = join ? 'select' : 'update'
        const fullName = [server, db, schema].filter(Boolean).join('.') || null
        if (db) dbObj[table] = fullName
        if (table) tableList.add(`${action}::${fullName}::${table}`)
      }
      if (t) t.forEach(addTableFun);
      if (f) f.forEach(addTableFun);
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
          from: f,
          where: w,
          returning: r,
        }
      };
    }

delete_stmt
  = KW_DELETE    __
    t:table_ref_list? __
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
     if(f) f.forEach(tableInfo => {
        const { db, as, schema, table, join } = tableInfo
        const action = join ? 'select' : 'delete'
        const fullName = [db, schema].filter(Boolean).join('.') || null
        if (table) tableList.add(`${action}::${fullName}::${table}`)
        if (!join) columnList.add(`delete::${table}::(.*)`);
      });
      if (t === null && f.length === 1) {
        const tableInfo = f[0]
        t = [{
          db: tableInfo.db,
          schema: tableInfo.schema,
          table: tableInfo.table,
          as: tableInfo.as,
          addition: true,
          ...getLocationObject(),
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
  = tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ v:expr {
      // => { column: ident; value: additive_expr; table?: ident;}
      return { column: c, value: v, table: tbl && tbl[0] };
    }
    / tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
      // => { column: ident; value: column_ref; table?: ident; keyword: 'values' }
      return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
  }

returning_stmt
  = k:KW_RETURNING __ c:(column_clause / select_stmt) {
    // => { type: 'returning'; columns: column_clause | select_stmt; }
    return {
      type: k && k.toLowerCase() || 'returning',
      columns: c === '*' && [{ type: 'expr', expr: { type: 'column_ref', table: null, column: '*' }, as: null, ...getLocationObject() }] || c
    }
  }

insert_value_clause
  = value_clause
  / u:union_stmt {
      return u.ast
  }

insert_partition
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
    // => ident_name[]
      return createList(head, tail)
    }
  / KW_PARTITION __ v: value_item {
    // => value_item
    return v
  }

conflict_target
  = LPAREN __ c:column_ref_list  __ RPAREN {
    // => { type: 'column'; expr: column_ref_list; parentheses: true; }
    return {
      type: 'column',
      expr: c,
      parentheses: true,
    }
  }

conflict_action
  = 'DO'i __ 'NOTHING'i {
    // => { keyword: "do"; expr: {type: 'origin'; value: string; }; }
    return {
      keyword: 'do',
      expr: {
        type: 'origin',
        value: 'nothing'
      }
    }
  }
  / 'DO'i __ KW_UPDATE __ KW_SET __ s:set_list __ w:where_clause? {
    // => { keyword: "do"; expr: {type: 'update'; set: set_list; where: where_clause; }; }
    return {
      keyword: 'do',
      expr: {
        type: 'update',
        set: s,
        where: w,
      }
    }
  }

on_conflict
  = KW_ON __ 'CONFLICT'i __ ct:conflict_target? __ ca:conflict_action {
    // => { type: "conflict"; keyword: "on"; target: conflict_target; action: conflict_action; }
    return {
      type: 'conflict',
      keyword: 'on',
      target: ct,
      action: ca,
    }
  }

replace_insert_stmt
  = ri:replace_insert       __
    KW_INTO?                 __
    t:table_name  __
    p:insert_partition? __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause __
    oc:on_conflict? __
    r:returning_stmt? {
      /*
       export interface replace_insert_stmt_node {
         type: 'insert' | 'replace';
         table?: [table_name];
         columns: column_list;
         conflict?: on_conflict;
         values: insert_value_clause;
         partition?: insert_partition;
         returning?: returning_stmt;
      }
     => AstStatement<replace_insert_stmt_node>
     */
      if (t) {
        tableList.add(`insert::${[t.db, t.schema].filter(Boolean).join('.') || null}::${t.table}`)
        t.as = null
      }
      if (c) {
        let table = t && t.table || null
        if(Array.isArray(v.values)) {
          v.values.forEach((row, idx) => {
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
          conflict: oc,
          returning: r,
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
    r:returning_stmt? {
     // => AstStatement<replace_insert_stmt_node>
      if (t) {
        tableList.add(`insert::${[t.db, t.schema].filter(Boolean).join('.') || null}::${t.table}`)
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
          returning: r,
        }
      };
    }

replace_insert
  = KW_INSERT   { /* => 'insert' */ return 'insert'; }
  / KW_REPLACE  { /* => 'replace' */return 'replace'; }

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
    condition_list:case_when_then_list  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      /* => {
          type: 'case';
          expr:  null;
          // nb: Only the last element is a case_else
          args: (case_when_then | case_else)[];
        } */
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: null,
        args: condition_list
      };
    }
  / KW_CASE                        __
    expr:expr                      __
    condition_list:case_when_then_list  __
    otherwise:case_else?            __
    KW_END __ KW_CASE? {
      /* => {
          type: 'case';
          expr: expr;
          // nb: Only the last element is a case_else
          args: (case_when_then | case_else)[];
        } */
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: expr,
        args: condition_list
      };
    }

case_when_then_list
  = head:case_when_then __ tail:(__ case_when_then)* {
    // => case_when_then[]
    return createList(head, tail, 1)
  }

case_when_then
  = KW_WHEN __ condition:or_and_where_expr __ KW_THEN __ result:expr_item {
    // => { type: 'when'; cond: binary_expr; result: expr; }
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

_expr
  = or_expr
  / unary_expr

expr
  = _expr / union_stmt

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

binary_column_expr
  = head:expr tail:(__ (KW_AND / KW_OR / LOGIC_OPERATOR) __ expr)* {
    const ast = head.ast
    if (ast && ast.type === 'select') {
      if (!(head.parentheses_symbol || head.parentheses || head.ast.parentheses || head.ast.parentheses_symbol) || ast.columns.length !== 1 || ast.columns[0].expr.column === '*') throw new Error('invalid column clause with select statement')
    }
    if (!tail || tail.length === 0) return head
    // => binary_expr
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
    // => binary_expr | { type: 'expr_list'; value: expr[] }
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
  / regex_op_right

arithmetic_op_right
  = l:(__ arithmetic_comparison_operator __ (additive_expr / column_without_kw_type))+ {
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
      type: 'default',
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
  = nk:(KW_NOT __ (KW_LIKE / KW_ILIKE)) { /* => 'LIKE' */ return nk[0] + ' ' + nk[2]; }
  / KW_LIKE
  / KW_ILIKE
  / 'SIMILAR'i __ KW_TO {
    // => 'SIMILAR TO'
    return 'SIMILAR TO'
  }
  / KW_NOT __ 'SIMILAR'i __ KW_TO {
    // => 'NOT SIMILAR TO'
    return 'NOT SIMILAR TO'
  }

regex_op
  = nk:(KW_NOT __ KW_REGEXP) { /* => 'REGEXP' */ return nk[0] + ' ' + nk[2]; }
  / KW_REGEXP

escape_op
  = kw:'ESCAPE'i __ c:literal_string {
    // => { type: 'ESCAPE'; value: literal_string }
    return {
      type: 'ESCAPE',
      value: c,
    }
  }

in_op
  = nk:(KW_NOT __ KW_IN) { /* => 'NOT IN' */ return nk[0] + ' ' + nk[2]; }
  / KW_IN

like_op_right
  = op:like_op __ right:(literal / comparison_expr) __ es:escape_op? {
     // => { op: like_op; right: (literal | comparison_expr) & { escape?: escape_op }; }
      if (es) right.escape = es
      return { op: op, right: right };
    }

in_op_right
  = op:in_op __ LPAREN  __ l:expr_list __ RPAREN {
    // => {op: in_op; right: expr_list | var_decl | literal_string; }
      return { op: op, right: l };
    }
   / op:in_op __ e:(var_decl / literal_string / func_call) {
    // => IGNORE
      return { op: op, right: e };
    }

regex_op_right
  = op:regex_op __ right:(literal / comparison_expr) __ es:escape_op? {
     // => { op: regex_op; right: (literal | comparison_expr) & { escape?: escape_op }; }
      if (es) right.escape = es
      return { op: op, right: right };
    }

additive_expr
  = head:multiplicative_expr
    tail:(__ additive_operator  __ multiplicative_expr)* {
      // => binary_expr
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
    tail:(__  (multiplicative_operator / LOGIC_OPERATOR)  __ unary_expr_or_primary)* {
      // => binary_expr
      return createBinaryExprChain(head, tail)
    }

multiplicative_operator
  = "*" / "/" / "%" / "||"

column_ref_array_index
  = c:column_ref __ a:array_index_list? {
    // => column_ref
    if (a) c.array_index = a
    return c
  }
primary
  = cast_expr
  / LPAREN __ list:or_and_where_expr __ RPAREN {
    // => or_and_where_expr
        list.parentheses = true;
        return list;
    }
  / var_decl
  / __ p:'$''<'n:literal_numeric'>' {
    // => { type: 'origin'; value: string; }
    return {
      type: 'origin',
      value: `$<${n.value}>`,
    }
  }

unary_expr_or_primary
  = jsonb_expr
  / op:(unary_operator) tail:(__ unary_expr_or_primary) {
    // if (op === '!') op = 'NOT'
    return createUnaryExpr(op, tail[1])
  }

unary_operator
  = '!' / '-' / '+' / '~'

primary_array_index
  = e:primary __ a:array_index_list? {
    // => primary & { array_index: array_index }
    if (a) e.array_index = a
    return e
  }

jsonb_expr
  = head:primary_array_index __ tail: (__ ('?|' / '?&' / '?' / '#-' / '#>>' / '#>' / DOUBLE_ARROW / SINGLE_ARROW / '@>' / '<@') __  primary_array_index)* {
    // => primary_array_index | binary_expr
    if (!tail || tail.length === 0) return head
    return createBinaryExprChain(head, tail)
  }

string_constants_escape
  = 'E'i"'" __ n:single_char* __ "'" {
    // => { type: 'default'; value: string; }
    return {
      type: 'default',
      value: `E'${n.join('')}'`
    }
  }
column_symbol
  = DOT / KW_SINGLE_COLON
column_ref
  = string_constants_escape
  / tbl:(ident __ DOT)? __ STAR {
    // => IGNORE
      const table = tbl && tbl[0] || null
      columnList.add(`select::${table}::(.*)`);
      return {
          type: 'column_ref',
          table: table,
          column: '*',
          ...getLocationObject()
      }
    }
  / schema:ident tbl:(__ column_symbol __ ident_without_kw) col:(__ column_symbol __ column_without_kw)+ ce:(__ collate_expr)? {
      if (col.length === 1) {
        columnList.add(`select::${schema}.${tbl[3]}::${col[0][3]}`);
        return {
          type: 'column_ref',
          schema: schema,
          notations: [tbl[1], col[0][1]],
          table: tbl[3],
          column: col[0][3],
          collate: ce && ce[1],
          ...getLocationObject()
        };
      }
      const left = createBinaryExpr(column_symbol, schema, tbl[3])
      return {
        type: 'column_ref',
        column: { expr: createBinaryExprChain(left, col) },
        collate: ce && ce[1],
        ...getLocationObject()
      };
    }
  / tbl:ident __ s:column_symbol __ col:column_without_kw ce:(__ collate_expr)? {
      columnList.add(`select::${tbl}::${col}`);
      return {
        type: 'column_ref',
        table: tbl,
        notations: [s],
        column: col,
        collate: ce && ce[1],
        ...getLocationObject()
      };
    }
  / col:column ce:(__ collate_expr)? {
    // => IGNORE
      columnList.add(`select::null::${col}`);
      return {
        type: 'column_ref',
        table: null,
        column: col,
        collate: ce && ce[1],
        ...getLocationObject()
      };
    }

column_list
  = head:column tail:(__ COMMA __ column)* {
    // => column[]
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
      // => ident_name
      return name;
    }
  / name:quoted_ident {
      // => indent_name
      return name;
    }

alias_ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true } c:(__ LPAREN __ column_list __ RPAREN)? {
      // => string
      if (!c) return name;
      return `${name}(${c[3].join(', ')})`
    }
  / name:quoted_ident {
      // => IGNORE
      return name;
    }

// quoted_ident_type, quoted_ident, double_quoted_ident, single_quoted_ident, backticks_quoted_ident
// are imported from common/identifier/quoted.pegjs
@import 'common/identifier/quoted.pegjs'

ident_without_kw
  = ident_name / quoted_ident

// column_without_kw, column, column_name, ident_name, param
// are imported from common/identifier/column.pegjs
@import 'common/identifier/column.pegjs'

// Snowflake-specific extension
column_without_kw_type
  = n:column_name {
    return { type: 'default', value: n }
  }
  / quoted_ident_type

// ident_start, ident_part, column_part are defined at the end of this file

on_update_current_timestamp
  = KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP __ LPAREN __ l:expr_list? __ RPAREN{
    // => { type: 'on update'; keyword: string; parentheses: boolean; expr: expr }
    return {
      type: 'on update',
      keyword: kw,
      parentheses: true,
      expr: l
    }
  }
  / KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP {
    // => { type: 'on update'; keyword: string; }
    return {
      type: 'on update',
      keyword: kw,
    }
  }

over_partition
  = 'OVER'i __ aws:as_window_specification {
    // => { type: 'windows'; as_window_specification: as_window_specification }
    return {
      type: 'window',
      as_window_specification: aws,
    }
  }
  / 'OVER'i __ LPAREN __ bc:partition_by_clause? __ l:order_by_clause? __ RPAREN {
    // => { partitionby: partition_by_clause; orderby: order_by_clause }
    return {
      partitionby: bc,
      orderby: l
    }
  }
  / on_update_current_timestamp

aggr_filter
  = 'FILTER'i __ LPAREN __ wc:where_clause __ RPAREN {
    // => { keyword: 'filter'; parentheses: true, where: where_clause }
    return {
      keyword: 'filter',
      parentheses: true,
      where: wc,
    }
  }

aggr_func
  = e:(aggr_fun_count / aggr_fun_smma / aggr_array_agg) __ f:aggr_filter? {
    // => { type: 'aggr_func'; name: string; args: { expr: additive_expr } | count_arg; over: over_partition; filter?: aggr_filter; }
    if (f) e.filter = f
    return e
  }

window_func
  = window_fun_rank
  / window_fun_laglead
  / window_fun_firstlast

window_fun_rank
  = name:KW_WIN_FNS_RANK __ LPAREN __ RPAREN __ over:over_partition {
    // => { type: 'window_func'; name: string; over: over_partition }
    return {
      type: 'window_func',
      name: name,
      over: over
    }
  }

window_fun_laglead
  = name:KW_LAG_LEAD __ LPAREN __ l:expr_list __ RPAREN __ cn:consider_nulls_clause? __ over:over_partition {
    // => { type: 'window_func'; name: string; args: expr_list; consider_nulls: null | string; over: over_partition }
    return {
      type: 'window_func',
      name: name,
      args: l,
      over: over,
      consider_nulls: cn
    };
  }

window_fun_firstlast
  = name:KW_FIRST_LAST_VALUE __ LPAREN __ l:expr __ RPAREN __ cn:consider_nulls_clause?  __ over:over_partition {
    // => window_fun_laglead
    return {
      type: 'window_func',
      name: name,
      args: {
        type: 'expr_list', value: [l]
      },
      over: over,
      consider_nulls: cn
    };
  }

KW_FIRST_LAST_VALUE
  = 'FIRST_VALUE'i / 'LAST_VALUE'i

KW_WIN_FNS_RANK
  = 'ROW_NUMBER'i / 'DENSE_RANK'i / 'RANK'i
  // / 'CUME_DIST'i / 'MEDIAN'i /  'PERCENT_RANK'i
  // / 'PERCENTILE_CONT'i / 'PERCENTILE_DISC'i / 'RATIO_TO_REPORT'i

KW_LAG_LEAD
  = 'LAG'i / 'LEAD'i / 'NTH_VALUE'i

consider_nulls_clause
  = v:('IGNORE'i / 'RESPECT'i) __ 'NULLS'i {
    // => string
    return v.toUpperCase() + ' NULLS'
  }

aggr_fun_smma
  = name:KW_SUM_MAX_MIN_AVG __ LPAREN __ e:additive_expr __ RPAREN __ bc:over_partition? {
    // => { type: 'aggr_func'; name: 'SUM' | 'MAX' | 'MIN' | 'AVG'; args: { expr: additive_expr }; over: over_partition }
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

aggr_fun_count
  = name:(KW_COUNT / KW_GROUP_CONCAT / 'LISTAGG'i) __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
    // => { type: 'aggr_func'; name: 'COUNT' | 'GROUP_CONCAT'; args:count_arg; over: over_partition }
      return {
        type: 'aggr_func',
        name: name,
        args: arg,
        over: bc
      };
    }
  / name:('percentile_cont'i / 'percentile_disc'i) __ LPAREN __ arg:(literal_numeric / literal_array) __ RPAREN __ 'within'i __ KW_GROUP __ LPAREN __ or:order_by_clause __ RPAREN __ bc:over_partition? {
   // => { type: 'aggr_func'; name: 'PERCENTILE_CONT' | 'PERCENTILE_DISC'; args: literal_numeric / literal_array; within_group_orderby: order_by_clause; over?: over_partition }
    return {
        type: 'aggr_func',
        name: name.toUpperCase(),
        args: {
          expr: arg
        },
        within_group_orderby: or,
        over: bc
      };
  }
  / name:('mode'i) __ LPAREN __ RPAREN __ 'within'i __ KW_GROUP __ LPAREN __ or:order_by_clause __ RPAREN __ bc:over_partition? {
    // => { type: 'aggr_func'; name: 'MODE'; args: literal_numeric / literal_array; within_group_orderby: order_by_clause; over?: over_partition }
    return {
        type: 'aggr_func',
        name: name.toUpperCase(),
        args: { expr: {} },
        within_group_orderby: or,
        over: bc
      };
  }

concat_separator
  = kw:COMMA __ s:literal_string {
    // => { symbol: ','; delimiter: literal_string; }
    return {
      symbol: kw,
      delimiter: s
    }
  }

distinct_args
  = d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN __ tail:(__ (KW_AND / KW_OR) __ expr)* __ s:concat_separator? __ or:order_by_clause? {
    /* => { distinct: 'DISTINCT'; expr: expr; orderby?: order_by_clause; separator?: concat_separator; } */
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
      separator: s
    };
  }
  / d:KW_DISTINCT? __ c:or_and_expr __ s:concat_separator? __ or:order_by_clause? {
    /* => { distinct: 'DISTINCT'; expr: expr; orderby?: order_by_clause; separator?: concat_separator; } */
    return { distinct: d, expr: c, orderby: or, separator: s };
  }

count_arg
  = e:star_expr { /* => { expr: star_expr } */ return { expr: e }; }
  / distinct_args

aggr_array_agg
  = pre:(ident __ DOT)? __ name:(KW_ARRAY_AGG / KW_STRING_AGG) __ LPAREN __ arg:distinct_args __ RPAREN {
    // => { type: 'aggr_func'; args:count_arg; name: 'ARRAY_AGG' | 'STRING_AGG';  }
      return {
        type: 'aggr_func',
        name: pre ? `${pre[0]}.${name}` : name,
        args: arg,
      };
    }

star_expr
  = "*" { /* => { type: 'star'; value: '*' } */ return { type: 'star', value: '*' }; }

trim_position
  = 'BOTH'i / 'LEADING'i / 'TRAILING'i

trim_rem
  = p:trim_position? __ rm:expr? __ k:KW_FROM {
    // => expr_list
    let value = []
    if (p) value.push({type: 'origin', value: p })
    if (rm) value.push(rm)
    value.push({type: 'origin', value: 'from' })
    return {
      type: 'expr_list',
      value,
    }
  }

trim_func_clause
  = 'trim'i __ LPAREN __ tr:trim_rem? __ s:expr __ RPAREN {
    // => { type: 'function'; name: string; args: expr_list; }
    let args = tr || { type: 'expr_list', value: [] }
    args.value.push(s)
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'trim' }]},
        args,
        ...getLocationObject(),
    };
  }

flattern_args_input
  = 'INPUT'i __ '=>' __ e:expr {
    return {
      type: 'input',
      symbol: '=>',
      value: e,
    }
  }
flattern_args_path
  = 'PATH'i __ '=>' __ e:literal_string {
    return {
      type: 'path',
      symbol: '=>',
      value: e,
    }
  }
flattern_args_outer
  = k:'OUTER'i __ '=>' __ e:literal_bool {
    return {
      type: 'outer',
      symbol: '=>',
      value: e
    }
  }
flattern_args_recursive
  = k:'RECURSIVE'i __ '=>' __ e:literal_bool {
    return {
      type: 'recursive',
      symbol: '=>',
      value: e
    }
  }
flattern_args_mode
  = 'MODE'i __ '=>' __ e:literal_string {
    const modes = new Set(['object', 'array', 'both'])
    if (!e.value || !modes.has(e.value.toLowerCase())) throw new Error(`${e && e.value} is not valid mode in object, array and both`)
    e.value = e.value.toUpperCase()
    return {
      type: 'mode',
      symbol: '=>',
      value: e,
    }
  }

flattern_args
  = input:flattern_args_input path:(__ COMMA __ flattern_args_path)? outer:(__ COMMA __ flattern_args_outer)? recursive:(__ COMMA __ flattern_args_recursive)? mode:(__ COMMA __ flattern_args_mode)? {
    return {
      type: 'flattern',
      input,
      path: path && path[3],
      outer: outer && outer[3],
      recursive: recursive && recursive[3],
      mode: mode && mode[3]
    }
  }

json_visit
  = KW_SINGLE_COLON __ k:ident_without_kw_type {
    return {
      type: 'json_visitor',
      symbol: ':',
      expr: k
    }
  }
json_visit_list
  = head:json_visit tail:(__ json_visit)* {
    return {
      type: 'expr_list',
      value: createList(head, tail, 1)
    }
  }

position_func_args
  = s:literal_string __ KW_IN __ e:expr start:(__ KW_FROM __ literal_numeric)? {
    // => expr_list
    let value = [s, { type: 'origin', value: 'in' }, e]
    if (start) {
      value.push({ type: 'origin', value: 'from' })
      value.push(start[3])
    }
    return {
      type: 'expr_list',
      value,
    }
  }

position_func_clause
  = 'POSITION'i __ LPAREN __ args:position_func_args __ RPAREN {
    // => { type: 'function'; name: string; args: expr_list; }
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'position' }]},
        separator: ' ',
        args,
        ...getLocationObject(),
    };
  }
func_call
  = trim_func_clause / position_func_clause
  / name:'now'i __ LPAREN __ l:expr_list? __ RPAREN __ 'at'i __ KW_TIME __ 'zone'i __ z:literal_string {
    // => { type: 'function'; name: string; args: expr_list; suffix: literal_string; }
      z.prefix = 'at time zone'
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        suffix: z,
        ...getLocationObject(),
      };
    }
  / name:'FLATTEN'i __ LPAREN __ l:flattern_args __ RPAREN {
    return {
        type: 'flatten',
        name: { name: [{ type: 'default', value: name }] },
        args: l,
        ...getLocationObject(),
      }
  }
  / name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
    // => { type: 'function'; name: string; args: expr_list; over?: over_partition; }
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
        ...getLocationObject(),
      };
    }
  / extract_func
  / f:scalar_time_func __ up:on_update_current_timestamp? {
    // => { type: 'function'; name: string; over?: on_update_current_timestamp; }
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: f }] },
        over: up,
        ...getLocationObject(),
    }
  }
  / name:'parse_json'i __ LPAREN __ l:or_and_where_expr? __ RPAREN __ j:json_visit_list? {
      // => { type: 'function'; name: string; args: expr_list; }
      if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        suffix: j,
        ...getLocationObject(),
      };
    }
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
      // => { type: 'function'; name: string; args: expr_list; }
      if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
        ...getLocationObject(),
      };
    }

extract_filed
  = f:('CENTURY'i / 'DAY'i / 'DATE'i / 'DECADE'i / 'DOW'i / 'DOY'i / 'EPOCH'i / 'HOUR'i / 'ISODOW'i / 'ISOYEAR'i / 'MICROSECONDS'i / 'MILLENNIUM'i / 'MILLISECONDS'i / 'MINUTE'i / 'MONTH'i / 'QUARTER'i / 'SECOND'i / 'TIMEZONE'i / 'TIMEZONE_HOUR'i / 'TIMEZONE_MINUTE'i / 'WEEK'i / 'YEAR'i) {
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
        },
        ...getLocationObject(),
    }
  }
  / kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ s:expr __ RPAREN {
    // => { type: 'extract'; args: { field: extract_filed; source: expr; }}
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          source: s,
        },
        ...getLocationObject(),
    }
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
  / "NTILE"i

cast_data_type
  = p:'"'? t:data_type s:'"'? {
    if ((p && !s) || (!p && s)) throw new Error('double quoted not match')
    if (p && s) t.quoted = '"'
    return t
  }

cast_double_colon
  = s:(KW_DOUBLE_COLON __ cast_data_type)+ {
    return {
      symbol: '::',
      target: s.map(v => v[2]),
    }
  }

cast_expr
  = c:(KW_CAST / KW_TRY_CAST) __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    // => IGNORE
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: [t],
    };
  }
  / c:(KW_CAST / KW_TRY_CAST) __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    // => IGNORE
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
  / c:(KW_CAST / KW_TRY_CAST) __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
      // => IGNORE
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
  / c:(KW_CAST / KW_TRY_CAST) __ LPAREN __ e:expr __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
    // => IGNORE
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
  / LPAREN __ e:(literal / interval_expr / aggr_func / window_func / func_call / case_expr / column_ref_array_index / param) __ RPAREN __ c:cast_double_colon?  {
    e.parentheses = true
    if (!c) return e
    return {
      type: 'cast',
      keyword: 'cast',
      expr: e,
      ...c,
    }
  }
  / e:(literal / aggr_func / window_func / func_call / case_expr / interval_expr / column_ref_array_index / param) __ c:cast_double_colon? {
    if (!c) return e
    return {
      type: 'cast',
      keyword: 'cast',
      expr: e,
      ...c,
    }
  }



literal
  = literal_string
  / literal_numeric
  / literal_bool
  / literal_null
  / literal_datetime
  / literal_array

// Snowflake specific: literal_array
literal_array
  = s:KW_ARRAY __ LBRAKE __ c:expr_list? __ RBRAKE {
    return {
      expr_list: c || { type: 'origin', value: '' },
      type: 'array',
      keyword: 'array',
      brackets: true
    }
  }

// literal_list, literal_null, literal_not_null, literal_bool, literal_numeric
// are imported from common/literal/basic.pegjs
@import 'common/literal/basic.pegjs'

// literal_string is imported from common/literal/string-basic.pegjs
@import 'common/literal/string-basic.pegjs'

// literal_datetime is imported from common/literal/datetime.pegjs
@import 'common/literal/datetime.pegjs'

// single_quote_char, single_char, escape_char (no backtick)
// are imported from common/literal/string-chars-no-backtick.pegjs
@import 'common/literal/string-chars-no-backtick.pegjs'

// number (with optional int), int, frac, exp, digits, digit, hexDigit, e
// are imported from common/literal/number-optional-int.pegjs
@import 'common/literal/number-optional-int.pegjs'


// All KW_ keywords imported from common/keyword/core.pegjs

// Snowflake specific: LOGIC_OPERATOR without XOR
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// Snowflake specific symbols
WELL_ARROW = '#>'
DOUBLE_WELL_ARROW = '#>>'

// Identifier patterns (Snowflake with unicode support)
ident_start = [A-Za-z0-9_\u4e00-\u9fa5]
ident_part  = [A-Za-z0-9_\-$\u4e00-\u9fa5]
column_part = [A-Za-z0-9_\u4e00-\u9fa5]
line_terminator = [\n\r]

// Import common modules
@import 'common/keyword/core.pegjs'
@import 'common/symbol.pegjs'
@import 'common/value/core.pegjs'

// Snowflake specific: custom comment handling with nested block comments
// Note: Snowflake supports // comments and nested /* */ comments
__
  = (whitespace / comment)*

___
  = (whitespace / comment)+

comment
  = block_comment
  / line_comment
  / double_slash_comment

block_comment
  = "/*" (!"*/" !"/*" char / block_comment)* "*/"

line_comment
  = "--" (!EOL char)*

double_slash_comment
  = '//' (!EOL char)*

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

whitespace =
  [ \t\n\r]

EOL
  = EOF
  / [\n\r]+

EOF = !.

// Snowflake specific: interval_unit with WEEK
interval_unit
  = KW_UNIT_YEAR
  / KW_UNIT_MONTH
  / KW_UNIT_WEEK
  / KW_UNIT_DAY
  / KW_UNIT_HOUR
  / KW_UNIT_MINUTE
  / KW_UNIT_SECOND

//begin procedure extension
proc_stmts
  = proc_stmt*

proc_stmt
  = &{ varList = []; return true; } __ s:(assign_stmt / return_stmt) {
      // => { type: 'proc'; stmt: assign_stmt | return_stmt; vars: any }
      return { type: 'proc', stmt: s, vars: varList };
    }

// assign_stmt_list and assign_stmt are imported from common/procedure/assign.pegjs
@import 'common/procedure/assign.pegjs'


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
    // => { type: 'function'; name: string; args: null | { type: expr_list; value: proc_primary_list; }}
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
    // => IGNORE
    return {
        type: 'function',
        name: name,
        args: null,
        ...getLocationObject(),
      };
  }

proc_primary_list
  = head:proc_primary tail:(__ COMMA __ proc_primary)* {
    // => proc_primary[]
      return createList(head, tail);
    }

proc_array
  = LBRAKE __ l:proc_primary_list __ RBRAKE {
    // => { type: 'array'; value: proc_primary_list }
    return { type: 'array', value: l };
  }

var_decl_list
  = head:var_decl tail:(__ COMMA __ var_decl)* {
    // => var_decl[]
    return createList(head, tail)
  }

var_decl
  = p: KW_VAR_PRE_DOLLAR_DOUBLE d:[^$]* s:KW_VAR_PRE_DOLLAR_DOUBLE {
    // => { type: 'var'; name: string; prefix: string; suffix: string; };
    return {
      type: 'var',
      name: d.join(''),
      prefix: '$$',
      suffix: '$$'
    };
  }
  / KW_VAR_PRE_DOLLAR f:column KW_VAR_PRE_DOLLAR d:[^$]* KW_VAR_PRE_DOLLAR s:column !{ if (f !== s) return true } KW_VAR_PRE_DOLLAR {
    // => { type: 'var'; name: string; prefix: string; suffix: string; };
    return {
      type: 'var',
      name: d.join(''),
      prefix: `$${f}$`,
      suffix: `$${s}$`
    };
  }
  / p: KW_VAR_PRE d: without_prefix_var_decl {
    // => without_prefix_var_decl & { type: 'var'; prefix: string; };
    // push for analysis
    return {
      type: 'var',
      ...d,
      prefix: p
    };
  }

without_prefix_var_decl
  = p:'"'? name:ident_name m:mem_chain s:'"'? {
    // => { type: 'var'; prefix: string; name: ident_name; members: mem_chain; quoted: string | null }
    //push for analysis
    if ((p && !s) || (!p && s)) throw new Error('double quoted not match')
    varList.push(name);
    return {
      type: 'var',
      name: name,
      members: m,
      quoted: p && s ? '"' : null,
      prefix: null,
    };
  }
  / n:literal_numeric {
    // => { type: 'var'; prefix: null; name: number; members: []; quoted: null }
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
    // => ident_name[];
    const s = [];
    for (let i = 0; i < l.length; i++) {
      s.push(l[i][1]);
    }
    return s;
  }

data_type
  = array_type
  / character_string_type
  / numeric_type
  / datetime_type
  / json_type
  / geometry_type
  / text_type
  / uuid_type
  / boolean_type
  / enum_type
  / serial_type
  / interval_type
  / binary_type
  / geometry_type
  / oid_type


array_type
  = t:(numeric_type / character_string_type) __ LBRAKE __ RBRAKE __ LBRAKE __ RBRAKE {
    /* => data_type */
    return { ...t, array: { dimension: 2 } }
  }
  / t:(numeric_type / character_string_type) __ LBRAKE __ l:literal_numeric? __ RBRAKE {
    /* => data_type */
    return { ...t, array: { dimension: 1,  length: [l] } }
  }
  / t:(numeric_type / character_string_type) __ KW_ARRAY {
    /* => data_type */
    return { ...t, array: { keyword: 'array' } }
  }



text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) LBRAKE __ RBRAKE { /* =>  data_type */ return { dataType: `${t}[]` }}
  / t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) { /* =>  data_type */ return { dataType: t }}


@import 'common/keyword/signedness.pegjs'
@import 'common/datatype/size.pegjs'
@import 'common/datatype/boolean.pegjs'
@import 'common/datatype/blob.pegjs'
@import 'common/datatype/binary.pegjs'
@import 'common/datatype/character.pegjs'
@import 'common/datatype/datetime.pegjs'
@import 'common/datatype/numeric.pegjs'
@import 'common/datatype/oid.pegjs'
@import 'common/datatype/enum.pegjs'
@import 'common/datatype/json.pegjs'
@import 'common/datatype/geometry.pegjs'
@import 'common/datatype/serial.pegjs'
@import 'common/datatype/interval.pegjs'
@import 'common/datatype/uuid.pegjs'
