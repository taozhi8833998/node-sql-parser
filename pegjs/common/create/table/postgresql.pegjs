create_table_stmt
  = a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    po:create_table_partition_of {
      // => AstStatement<create_table_stmt_node_base & { partition_of: create_table_partition_of }>
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
          partition_of: po
        }
      }
    }
  /  a:KW_CREATE __
    tp:KW_TEMPORARY? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    c:create_table_definition __
    to:table_options? __
    ir: (KW_IGNORE / KW_REPLACE)? __
    as:KW_AS? __
    qe:union_stmt? {
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
        create_definitions?: create_table_definition;
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
      /*

      export interface create_table_stmt_node_like extends create_table_stmt_node_base{
        like: create_like_table;
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
          if_not_exists:ife,
          table: t,
          like: lt
        }
      }
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
  / ck:check_constraint_definition {
    // => { check: check_constraint_definition; }
    return { check: ck }
  }
  / t:create_option_character_set_kw __ s:KW_ASSIGIN_EQUAL? __ v:ident_without_kw_type {
    // => { character_set: { type: 'CHARACTER SET'; symbol: '=' | null; value: ident_without_kw_type; } }
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
      columnList.add(`create::${c.table}::${c.column.expr.value}`)
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
    // => { type: 'collate'; symbol: '=' | null; value: ident; }
    return {
      type: 'collate',
      symbol: s,
      value: ca,
    }
  }
collate_expr
  = KW_COLLATE __ ca:ident_name __ s:KW_ASSIGIN_EQUAL __ t:ident {
    // => { type: 'collate'; keyword: 'collate'; collate: { symbol: '=' ; name: ident_name; value: ident; }}
    return {
      type: 'collate',
      keyword: 'collate',
      collate: {
        name: ca,
        symbol: s,
        value: t
      }
    }
  }
  / KW_COLLATE __ s:KW_ASSIGIN_EQUAL? __ ca:ident {
    // => { type: 'collate'; keyword: 'collate'; collate: { symbol: '=' | null ; name: ident_name; }}
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
default_arg_expr
  = kw:(KW_DEFAULT / KW_ASSIGIN_EQUAL)? __ ce:(literal / expr) {
    // => { type: 'default'; keyword: string, value: literal | expr; }
    return {
      type: 'default',
      keyword: kw && kw[0],
      value: ce
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

create_table_partition_of
  = KW_PARTITION __ 'OF'i __ t:table_name __ fv:for_values __ ts:(KW_TABLESPACE __ ident_without_kw_type)? {
    /* => {
      type: 'partition_of';
      keyword: 'partition of';
      table: table_name;
      for_values: for_values;
      tablespace: ident_without_kw_type | undefined;
    } */
    return {
      type: 'partition_of',
      keyword: 'partition of',
      table: t,
      for_values: fv,
      tablespace: ts && ts[2]
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
      value: ident_without_kw_type;
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
    // => { keyword: 'compression'; symbol?: '='; value: "'ZLIB'" | "'LZ4'" | "'NONE'" }
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: v.join('').toUpperCase()
    }
  }
  / kw:'ENGINE'i __ s:(KW_ASSIGIN_EQUAL)? __ c:ident_name {
    // => { keyword: 'engine'; symbol?: '='; value: string; }
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: c.toUpperCase()
    }
  }
  / KW_PARTITION __ KW_BY __ v:expr {
    // => { keyword: 'partition by'; value: expr; }
    return {
      keyword: 'partition by',
      value: v
    }
  }