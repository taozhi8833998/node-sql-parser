{
  const reservedMap = {
    'ALTER': true,
    'ALL': true,
    'ADD': true,
    'AND': true,
    'AS': true,
    'ASC': true,
    'AT': true,

    'BETWEEN': true,
    'BY': true,

    'CALL': true,
    'CASE': true,
    'CREATE': true,
    'CONTAINS': true,
    'CONSTRAINT': true,
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
    'EXCEPT': true,

    'FALSE': true,
    'FROM': true,
    'FULL': true,

    'GROUP': true,

    'HAVING': true,

    'IN': true,
    'INNER': true,
    'INSERT': true,
    'INTERSECT': true,
    'INTO': true,
    'IS': true,
    'ILIKE': true,

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

    'PARTITION': true,

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
  };

  // Import common initializer functions (PostgreSQL variant with location and array-aware createList) and variables
  @import 'common/initializer/functions-pg.pegjs'
  @import 'common/initializer/variables-pg.pegjs'
}

start
  = __ n:(create_function_stmt / multiple_stmt) {
    // => multiple_stmt
    return n
  }
  / create_function_stmt
  / multiple_stmt

cmd_stmt
  = drop_stmt
  / create_stmt
  / declare_stmt
  / truncate_stmt
  / rename_stmt
  / call_stmt
  / use_stmt
  / alter_stmt
  / set_stmt
  / lock_stmt
  / show_stmt
  / deallocate_stmt
  / grant_revoke_stmt
  / if_else_stmt
  / raise_stmt
  / execute_stmt
  / for_loop_stmt
  / transaction_stmt
  / comment_on_stmt

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
  / create_aggregate_stmt

alter_stmt
  = alter_table_stmt
  / alter_schema_stmt
  / alter_domain_type_stmt
  / alter_function_stmt
  / alter_aggregate_stmt
  / alter_sequence_stmt

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
       => AstStatement<crud_stmt | crud_stmt[]> */
      const headAst = head && head.ast || head
      const cur = tail && tail.length && tail[0].length >= 4 ? [headAst] : headAst
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
  = KW_UNION __ a:(KW_ALL / KW_DISTINCT)? {
    // => 'union' | 'union all' | 'union distinct'
    return a ? `union ${a.toLowerCase()}` : 'union'
  }
  / KW_INTERSECT {
    // => 'intersect'
    return 'intersect'
  }
  / KW_EXCEPT {
    // => 'except'
    return 'except'
  }

union_stmt
  = head:select_stmt tail:(__ set_op __ select_stmt)* __ ob:order_by_clause? __ l:limit_clause? {
     /* export interface union_stmt_node extends select_stmt_node  {
         _next: union_stmt_node;
         set_op: 'union' | 'union all' | 'union distinct';
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

if_exists
  = 'if'i __ 'exists'i {
    // => 'IF EXISTS'
    return 'IF EXISTS'
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
    k:(KW_DATABASE / KW_SCHEMA) __
    ife:if_not_exists_stmt? __
    t:proc_func_name __
    c:create_db_definition? {
      /*
      export type create_db_stmt_t = {
        type: 'create',
        keyword: 'database' | 'schema',
        if_not_exists?: 'if not exists',
        database?: { db: ident_without_kw_type, schema: [ident_without_kw_type] };
        schema?: { db: ident_without_kw_type, schema: [ident_without_kw_type] };
        create_definitions?: create_db_definition
      }
      => AstStatement<create_db_stmt_t>
      */
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
      export type create_view_stmt_t = {
        type: 'create',
        keyword: 'view',
        replace?: 'or replace',
        temporary?: 'temporary' | 'temp',
        recursive?: 'recursive',
        view: table_name,
        columns?: column_list,
        select: select_stmt,
        with_options?: with_view_options,
        with?: string,
      }
      => AstStatement<create_view_stmt_t>
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
create_aggregate_opt_required
  = 'SFUNC'i __ KW_ASSIGIN_EQUAL __ n:table_name __ COMMA __ 'STYPE'i __ KW_ASSIGIN_EQUAL __ d:data_type {
    // => { type: string; symbol: '='; value: expr; }[]
    return [
      {
        type: 'sfunc',
        symbol: '=',
        value: { schema: n.db, name: n.table },
      },
      {
        type: 'stype',
        symbol: '=',
        value: d,
      }
    ]
  }

create_aggregate_opt_optional
  = n:ident __ KW_ASSIGIN_EQUAL __ e:(ident / expr)  {
    // => { type: string; symbol: '='; value: ident | expr; }
    return {
      type: n,
      symbol: '=',
      value: typeof e === 'string' ? { type: 'default', value: e } : e
    }
  }

create_aggregate_opts
  = head:create_aggregate_opt_required tail:(__ COMMA __ create_aggregate_opt_optional)* {
    // => create_aggregate_opt_optional[]
    return createList(head, tail)
  }

create_aggregate_stmt
  = a:KW_CREATE __ or:(KW_OR __ KW_REPLACE)? __ t:'AGGREGATE'i __ s:table_name __ LPAREN __ as:aggregate_signature __ RPAREN __ LPAREN __ opts:create_aggregate_opts __ RPAREN  {
    /*
      export type create_aggregate_stmt_t = {
        type: 'create',
        keyword: 'aggregate',
        replace?: 'or replace',
        name: table_name,
        args?: aggregate_signature,
        options: create_aggregate_opt_optional[]
      }
      => AstStatement<create_aggregate_stmt_t>
      */
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'create',
          keyword: 'aggregate',
          name: { schema: s.db, name: s.table },
          args: {
            parentheses: true,
            expr: as,
            orderby: as.orderby
          },
          options: opts
        }
      };
  }
column_data_type
  = c:column_ref __ d:data_type {
    // => { column: column_ref; definition: data_type; }
    return {
      column: c,
      definition: d,
    }
  }
column_data_type_list
  = head:column_data_type tail:(__ COMMA __ column_data_type)* {
    // => column_data_type[]
      return createList(head, tail)
    }
func_returns
  = 'RETURNS'i __ k:'SETOF'i? __ t:(data_type / table_name) {
    // => { type: "returns"; keyword?: "setof"; expr: data_type; }
    return {
      type: 'returns',
      keyword: k,
      expr: t
    }
  }
  / 'RETURNS'i __ KW_TABLE __ LPAREN __ e:column_data_type_list __ RPAREN {
    // => { type: "returns"; keyword?: "table"; expr: column_data_type_list; }
    return {
      type: 'returns',
      keyword: 'table',
      expr: e
    }
  }

declare_variable_item
  = n:ident_name &{ return n.toLowerCase() !== 'begin' } __ c:'CONSTANT'i? __ d:data_type __  collate:collate_expr? __ nu:(KW_NOT __ KW_NULL)? __ expr:((KW_DEFAULT / ':=')? __ (&'BEGIN'i / literal / expr))?  __ s:SEMICOLON? {
    // => { keyword: 'variable'; name: string, constant?: string; datatype: data_type; collate?: collate_expr; not_null?: string; default?: { type: 'default'; keyword: string; value: literal | expr; }; }
    return {
      keyword: 'variable',
      name: n,
      constant: c,
      datatype: d,
      collate,
      not_null: nu && 'not null',
      definition: expr && expr[0] && {
        type: 'default',
        keyword: expr[0],
        value: expr[2]
      },
    }
  }
declare_variables
  = head:declare_variable_item tail:(__ declare_variable_item)* {
    // => declare_variable_item[]
    return createList(head, tail, 1)
}
declare_stmt
  = 'DECLARE'i __ vars:declare_variables {
    /*
      export type declare_stmt_t = { type: 'declare'; declare: declare_variable_item[]; }
      => AstStatement<declare_stmt_t>
    */
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'declare',
        declare: vars,
        symbol: ';',
      }
    }
  }

create_func_opt
  = 'LANGUAGE' __ ln:ident_name __ {
    // => literal_string
    return {
      prefix: 'LANGUAGE',
      type: 'default',
      value: ln
    }
  }
  / 'TRANSORM'i __ ft:('FOR' __ 'TYPE' __ ident_name)? __ {
    // => literal_string
    if (!ft) return { type: 'origin', value: 'TRANSORM' }
    return {
      prefix: ['TRANSORM', ft[0].toUpperCase(), ft[2].toUpperCase()].join(' '),
      type: 'default',
      value: ft[4]
    }
  }
  / i:('WINDOW'i / 'IMMUTABLE'i / 'STABLE'i / 'VOLATILE'i / 'STRICT'i) __ {
    // => literal_string
    return {
      type: 'origin',
      value: i
    }
  }
  / n:('NOT'i)? __ 'LEAKPROOF'i __ {
    // => literal_string
    return {
      type: 'origin',
      value: [n, 'LEAKPROOF'].filter(v => v).join(' ')
    }
  }
  / i:('CALLED'i / ('RETURNS'i __ 'NULL'i))? __ 'ON'i __ 'NULL'i __ 'INPUT'i __ {
    // => literal_string
    if (Array.isArray(i)) i = [i[0], i[2]].join(' ')
    return {
      type: 'origin',
      value: `${i} ON NULL INPUT`
    }
  }
  / e:('EXTERNAL'i)? __ 'SECURITY'i __ i:('INVOKER'i / 'DEFINER'i) __ {
    // => literal_string
    return {
      type: 'origin',
      value: [e, 'SECURITY', i].filter(v => v).join(' ')
    }
  }
  / 'PARALLEL'i __ i:('UNSAFE'i / 'RESTRICTED'i / 'SAFE'i) __ {
    // => literal_string
    return {
      type: 'origin',
      value: ['PARALLEL', i].join(' ')
    }
  }
  / KW_AS __ c:[^ \s\t\n\r]+ __ de:declare_stmt? __ b:('BEGIN'i)? __ s:multiple_stmt __ e:KW_END? &{ return (b && e) || (!b && !e) } __ SEMICOLON? __ l:[^ \s\t\n\r;]+ __ {
    // => { type: 'as'; begin?: string; declare?: declare_stmt; expr: multiple_stmt; end?: string; symbol: string; }
    const start = c.join('')
    const end = l.join('')
    if (start !== end) throw new Error(`start symbol '${start}'is not same with end symbol '${end}'`)
    return {
      type: 'as',
      declare: de && de.ast,
      begin: b,
      expr: Array.isArray(s.ast) ? s.ast.flat() : [s.ast],
      end: e && e[0],
      symbol: start,
    }
  }
  / p:('COST'i / 'ROWS'i) __ n:literal_numeric __ {
    // => literal_numeric
    n.prefix = p
    return n
  }
  / 'SUPPORT'i __ n:proc_func_name __ {
    // => literal_string
    return {
      prefix: 'support',
      type: 'default',
      value: [n.schema && n.schema.value, n.name.value].filter(v => v).join('.')
    }
  }
  / KW_SET __ ca:ident_name __ e:((('TO'i / '=') __ ident_list) / (KW_FROM __ 'CURRENT'i))? __ {
    // => { type: "set"; parameter: ident_name; value?: { prefix: string; expr: expr }}
    let value
    if (e) {
      const val = Array.isArray(e[2]) ? e[2] : [e[2]]
      value = {
        prefix: e[0],
        expr: val.map(v => ({ type: 'default', value: v }))
      }
    }
    return {
      type: 'set',
      parameter: ca,
      value,
    }
  }
  / return_stmt

create_function_stmt
  = a:KW_CREATE __
  or:(KW_OR __ KW_REPLACE)? __
  t:'FUNCTION'i __
  c:proc_func_name __ LPAREN __ args:alter_func_args? __ RPAREN __
  r:func_returns? __
  fo:create_func_opt* __ SEMICOLON? __ {
    /*
      export type create_function_stmt_t = {
        type: 'create';
        replace?: string;
        name: proc_func_name;
        args?: alter_func_args;
        returns?: func_returns;
        keyword: 'function';
        options?: create_func_opt[];
      }
      => AstStatement<create_function_stmt_t>
      */
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          args: args || [],
          type: 'create',
          replace: or && 'or replace',
          name: c,
          returns: r,
          keyword: t && t.toLowerCase(),
          options: fo || [],
        }
      }
  }

create_type_stmt_option
  = KW_AS __ r:(KW_ENUM / 'RANGE'i) __ LPAREN __ e:expr_list? __ RPAREN {
    // => { as: 'as'; resource: string; create_definitions: expr_list | create_column_definition_list; }
    e.parentheses = true
    return {
      as: 'as',
      resource: r.toLowerCase(),
      create_definitions: e,
    }
  }
  / KW_AS __ LPAREN __ e:create_column_definition_list? __ RPAREN {
    // => ignore
    return {
      as: 'as',
      create_definitions: e,
    }
  }

create_type_stmt
  = a:KW_CREATE __ k:'TYPE'i __ s:table_name __ e:create_type_stmt_option? {
      /*
      export type create_type_stmt_t = {
        type: 'create',
        keyword: 'type',
        name: { schema: string; name: string },
        as?: string,
        resource?: string,
        create_definitions?: expr_list | create_column_definition_list;
      }
      => AstStatement<create_type_stmt_t>
      */

      customTypes.add([s.db, s.table].filter(v => v).join('.'))
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: k.toLowerCase(),
          name: { schema: s.db, name: s.table },
          ...e,
        }
      }
    }

create_domain_stmt
  = a:KW_CREATE __ k:'DOMAIN'i __ s:table_name __ as:KW_AS? __ d:data_type __ ce:collate_expr? __ de:default_expr? __ ccc: create_constraint_check? {
      /*
      export type create_domain_stmt_t = {
        type: 'create',
        keyword: 'domain',
        domain: { schema: string; name: string },
        as?: string,
        target: data_type,
        create_definitions?: any[]
      }
      => AstStatement<create_domain_stmt_t>
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
        }
      }
    }
create_table_stmt
  = a:KW_CREATE __
    tp:(KW_TEMP / KW_TEMPORARY)? __
    ul:KW_UNLOGGED? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    po:create_table_partition_of {
      // => AstStatement<create_table_stmt_node_base & { partition_of: create_table_partition_of }>
      if(t) t.forEach(tt => tableList.add(`create::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          unlogged: ul,
          if_not_exists: ife,
          table: t,
          partition_of: po
        }
      }
    }
  /  a:KW_CREATE __
    tp:(KW_TEMP / KW_TEMPORARY)? __
    ul:KW_UNLOGGED? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_ref_list __
    c:create_table_definition? __
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
        unlogged?: 'unlogged';
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
      if(t) t.forEach(tt => tableList.add(`create::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          unlogged: ul,
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
    tp:(KW_TEMP / KW_TEMPORARY)? __
    ul:KW_UNLOGGED? __
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
      if(t) t.forEach(tt => tableList.add(`create::${[tt.db, tt.schema].filter(Boolean).join('.') || null}::${tt.table}`));
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          unlogged: ul,
          if_not_exists:ife,
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
  / k:'RESTART'i __ w:KW_WITH? __ n:literal_numeric {
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

include_column
  = k:'INCLUDE'i __ LPAREN __ c:column_list __ RPAREN {
    // => { type: 'include', keyword: 'include', columns: column_list }
    return {
      type: k.toLowerCase(),
      keyword: k.toLowerCase(),
      columns:c,
    }
  }

create_index_stmt
  = a:KW_CREATE __
  kw:KW_UNIQUE? __
  t:KW_INDEX __
  ife:if_not_exists_stmt?
  co:KW_CONCURRENTLY? __
  n:ident? __
  on:KW_ON __
  ta:table_name __
  um:index_type? __
  LPAREN __ cols:column_order_list __ RPAREN __
  include:include_column? __
  wr:(KW_WITH __ LPAREN __ index_options_list __ RPAREN)? __
  ts:(KW_TABLESPACE __ ident_name)? __
  w:where_clause? __ {
    /*
    export interface create_index_stmt_node {
      type: 'create';
      index_type?: 'unique';
      if_not_exists: if_not_exists_stmt;
      keyword: 'index';
      concurrently?: 'concurrently';
      index: string;
      on_kw: string;
      table: table_name;
      index_using?: index_type;
      index_columns: column_order[];
      include?: column_list_items;
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
          if_not_exists: ife,
          on_kw: on[0].toLowerCase(),
          table: ta,
          index_using: um,
          index_columns: cols,
          include,
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
      collate: ca,
      ...c,
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

for_values_item
  = KW_FROM __ LPAREN __ f:literal_string __ RPAREN __ KW_TO __ LPAREN __ t:literal_string __ RPAREN {
    /* => {
      type: 'for_values_item';
      keyword: 'from';
      from: literal_string;
      to: literal_string;
    } */
    return {
      type: 'for_values_item',
      keyword: 'from',
      from: f,
      to: t,
    }
  }
  / KW_IN __ LPAREN __ e:expr_list __ RPAREN {
    /* => {
      type: 'for_values_item';
      keyword: 'in';
      in: expr_list;
    } */
    return {
      type: 'for_values_item',
      keyword: 'in',
      in: e,
    }
  }
  / KW_WITH __ LPAREN __ 'MODULUS'i __ m:literal_numeric __ COMMA __ 'REMAINDER'i __ r:literal_numeric __ RPAREN {
    /* => {
      type: 'for_values_item';
      keyword: 'with';
      modulus: literal_numeric;
      remainder: literal_numeric;
    } */
    return {
      type: 'for_values_item',
      keyword: 'with',
      modulus: m,
      remainder: r,
    }
  }

for_values
  = 'FOR'i __ KW_VALUES __ fvi:for_values_item {
    /* => {
      type: 'for_values';
      keyword: 'for values';
      expr: for_values_item;
    } */
    return {
      type: 'for_values',
      keyword: 'for values',
      expr: fvi
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
  / gbd:('GENERATED'i)? __ 'BY'i __ 'DEFAULT'i __ 'AS'i __ 'IDENTITY'i {
    // => { generated_by_default: { type: 'origin', value: string } }
    const sql = []
    if (gbd) sql.push('generated')
    sql.push('by', 'default', 'as', 'identity')
    return { generated_by_default: { type: 'origin', value: sql.join(' ').toLowerCase('') } }
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

create_column_definition_list
  = head:create_column_definition tail:(__ COMMA __ create_column_definition)* {
      // => create_column_definition[]
      return createList(head, tail)
    }

create_column_definition
  = c:column_ref __
    d:(data_type / double_quoted_ident) __
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
      if (d.type === 'double_quote_string') d = { dataType: `"${d.value}"` }
      return {
        column: c,
        definition: d,
        resource: 'column',
        ...(cdo || {})
      }
    }

column_constraint
  = n:constraint_name {
    // => { constraint: constraint_name; }
    return { constraint: n }
  }
  / n:(literal_not_null / literal_null) __ df:default_expr? {
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
  = KW_COLLATE __ s:KW_ASSIGIN_EQUAL? __ schema:(ident_type __ DOT __ )? ca:ident_type {
    // => { type: 'collate'; keyword: 'collate'; collate: { symbol: '=' | null ; name: ident_type; }}
    return {
      type: 'collate',
      keyword: 'collate',
      collate: {
        name: schema ? [schema[0], ca] : ca,
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
  = kw:(KW_DEFAULT / KW_ASSIGIN_EQUAL)? __ ce:expr {
    // => { type: 'default'; keyword: string, value: expr; }
    return {
      type: 'default',
      keyword: kw && kw[0],
      value: ce
    }
  }
default_expr
  = KW_DEFAULT __ ce:expr {
    // => { type: 'default'; value: expr; }
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
    ife:if_exists? __
    t:table_ref_list {
      /*
      export interface drop_stmt_node {
        type: 'drop';
        keyword: 'table';
        prefix?: string;
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
          prefix: ife,
          name: t
        }
      };
    }
  / a:KW_DROP __
    r:KW_INDEX __
    cu:KW_CONCURRENTLY? __
    ife:if_exists? __
    i:column_ref __
    op:('CASCADE'i / 'RESTRICT'i)? {
      /*
      export interface drop_index_stmt_node {
        type: 'drop';
        prefix?: string;
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
          prefix: [cu, ife].filter(v => v).join(' '),
          name: i,
          options: op && [{ type: 'origin', value: op }]
        }
      };
    }
  / a:KW_DROP __
    r:KW_TYPE __
    ife:if_exists? __
    i:column_ref_list __
    op:('CASCADE'i / 'RESTRICT'i)? {
      /*
      export interface drop_index_stmt_node {
        type: 'drop';
        prefix?: string;
        keyword: string;
        name: column_ref_list;
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
          prefix: [ife].filter(v => v).join(' '),
          name: i,
          options: op && [{ type: 'origin', value: op }]
        }
      };
    }
  / a:KW_DROP __
    r:KW_VIEW __
    ife:if_exists? __
    t:table_ref_list __
    op:view_options? {
      /*
      export interface drop_view_stmt_node {
        type: 'drop';
        prefix?: string;
        keyword: 'view';
        name: table_ref_list;
        options?: view_options;
      }
      => AstStatement<drop_view_stmt_node>
      */
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          prefix: ife,
          name: t,
          options: op && [{ type: 'origin', value: op }],
        }
      };
    }

truncate_table_name
  = t:table_name __ s:STAR? {
    // => table_name & { suffix?: string }
    tableList.add(`truncate::${[t.db, t.schema].filter(Boolean).join('.') || null}::${t.table}`)
    if (s) t.suffix = s
    return t
  }
truncate_table_name_list
  = head:truncate_table_name tail:(__ COMMA __ truncate_table_name)* {
    // => truncate_table_name[]
      return createList(head, tail)
    }
truncate_stmt
  = a:KW_TRUNCATE  __
    kw:KW_TABLE? __
    on: 'ONLY'i? __
    t:truncate_table_name_list __
    id: (('RESTART'i / 'CONTINUE'i) __ 'IDENTITY'i)? __
    op:('CASCADE'i / 'RESTRICT'i)? {
      /*
      export interface truncate_stmt_node {
        type: 'trucate';
        keyword: 'table';
        prefix?: string;
        name: table_ref_list;
        suffix: string[];
      }
      => AstStatement<truncate_stmt_node>
      */
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: kw && kw.toLowerCase() || 'table',
          prefix: on,
          name: t,
          suffix: [id && [id[0], id[2]].join(' '), op].filter(v => v).map(v => ({ type: 'origin', value: v }))
        }
      }
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

aggregate_signature
  = STAR {
    // => { name: "*" }
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
  = t:(KW_IN / 'OUT'i / 'VARIADIC'i) {
    // => "IN" | "OUT" | "VARIADIC"
    return t.toUpperCase()
  }

alter_func_arg_item
  = m:alter_func_argmode? __ ad:data_type __ de:default_arg_expr?  {
    // => { mode?: string; name?: string; type: data_type;  default: default_arg_expr; }
    return {
      mode: m,
      type: ad,
      default: de,
    }
  }
  / m:alter_func_argmode? __ an:ident_name __ ad:data_type __ de:default_arg_expr?  {
    // => { mode?: string; name?: string; type: data_type;  default: default_arg_expr; }
    return {
      mode: m,
      name: an,
      type: ad,
      default: de,
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
        }
      };
  }

alter_sequence_definition_owner
  = 'OWNER'i __ KW_TO __ o:(KW_CURRENT_ROLE / KW_CURRENT_USER / KW_SESSION_USER / ident_type) {
    /*
    export type alter_sequence_definition = { "resource": "sequence", prefix?: string,value: literal_string }
    => alter_sequence_definition
    */
    const value = typeof o === 'string' ? { type: 'origin', value: o } : o;
    return {
      resource: 'sequence',
      prefix: 'owner to',
      value: value
    }
  }

alter_sequence_definition_rename
  = KW_RENAME __ KW_TO __ o:ident_type {
    // => alter_sequence_definition
    return {
      resource: 'sequence',
      prefix: 'rename to',
      value: o
    }
  }

alter_sequence_definition_set
  = KW_SET __ o:('LOGGED'i / 'UNLOGGED'i) {
    // => alter_sequence_definition
    return {
      resource: 'sequence',
      prefix: 'set',
      value: { type: 'origin', value: o }
    }
  }
  / KW_SET __ KW_SCHEMA __ o:ident_type {
    // => alter_sequence_definition
    return {
      resource: 'sequence',
      prefix: 'set schema',
      value: o
    }
  }
alter_sequence_definition
  = alter_sequence_definition_owner
  / alter_sequence_definition_rename
  / alter_sequence_definition_set

alter_sequence_definition_list
  = head: alter_sequence_definition tail:(__ alter_sequence_definition)* {
    // => alter_sequence_definition[]
    return createList(head, tail, 1)
}

alter_sequence_stmt
  = KW_ALTER __ KW_SEQUENCE __ ife:if_exists? __ t:table_name __ as:(KW_AS __ data_type)?__ c:(create_sequence_definition_list / alter_sequence_definition_list)? {
    /*
      export type alter_sequence_stmt = {
        type: 'alter',
        keyword: 'sequence',
        if_exists?: 'if exists',
        sequence: [table_name],
        create_definitions?: create_sequence_definition_list | alter_sequence_definition_list
      }
      => AstStatement<alter_sequence_stmt>
      */
      t.as = as && as[2]
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          keyword: 'sequence',
          if_exists: ife,
          sequence: [t],
          expr: c,
        }
      }
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
    KW_TABLE? __
    ife:if_exists? __
    o:'only'i? __
    t:table_name __
    e:alter_action_list {
      /*
      export interface alter_table_stmt_node {
        type: 'alter';
        table: table_ref_list;
        keyword: 'table';
        if_exists: if_exists;
        prefix?: literal_string;
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
          keyword: 'table',
          if_exists: ife,
          prefix: o && { type: 'origin', value: o },
          table: [t],
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
  / ALTER_DROP_CONSTRAINT
  / ALTER_DROP_COLUMN
  / ALTER_ADD_INDEX_OR_KEY
  / ALTER_ADD_FULLETXT_SPARITAL_INDEX
  / ALTER_RENAME
  / ALTER_ALGORITHM
  / ALTER_LOCK
  / ALTER_OWNER_TO
  / ALTER_COLUMN_DATA_TYPE
  / ALTER_COLUMN_DEFAULT
  / ALTER_COLUMN_NOT_NULL
  / ALTER_REPLICA_IDENTITY

ALTER_ADD_COLUMN
  = KW_ADD __
    kc:KW_COLUMN? __
    ife:if_not_exists_stmt? __
    cd:create_column_definition {
      /*
      => {
        action: 'add';
        keyword: KW_COLUMN;
        resource: 'column';
        if_not_exists: if_not_exists_stmt;
        type: 'alter';
      } & create_column_definition;
      */
      return {
        action: 'add',
        if_not_exists: ife,
        ...cd,
        keyword: kc,
        resource: 'column',
        type: 'alter',
      }
    }

ALTER_DROP_COLUMN
  = KW_DROP __
    kc:KW_COLUMN? __
    ife:if_exists? __
    c:column_ref {
      /* => {
        action: 'drop';
        collumn: column_ref;
        keyword: KW_COLUMN;
        if_exists: if_exists;
        resource: 'column';
        type: 'alter';
      } */
      return {
        action: 'drop',
        column: c,
        if_exists: ife,
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

ALTER_DROP_CONSTRAINT
  = KW_DROP __ kc:'CONSTRAINT'i __ c:ident {
  /* => {
        action: 'drop';
        constraint: ident,
        keyword: 'constraint',
        resource: 'constraint',
        type: 'alter';
      } */
      return {
        action: 'drop',
        constraint: c,
        keyword: kc.toLowerCase(),
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
        [key: string]: ident | undefined;
      }
      => AstStatement<alter_rename_owner>
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

ALTER_COLUMN_DATA_TYPE
  = KW_ALTER __ kc:KW_COLUMN? __ c:column_ref __ sd:(KW_SET __ 'data'i)? __ 'type'i __ t:data_type __ co:collate_expr? __ us:(KW_USING __ expr)? {
    /*
      => {
        action: 'alter';
        keyword?: KW_COLUMN;
        using?: expr;
        type: 'alter';
      } & create_column_definition;
      */
      c.suffix = sd ? 'set data type' : 'type'
      return {
        action: 'alter',
        column: c,
        keyword: kc,
        resource: 'column',
        definition: t,
        collate: co,
        using: us && us[2],
        type: 'alter',
      }
  }

ALTER_COLUMN_DEFAULT
  = KW_ALTER __ kc:KW_COLUMN? __ c:column_ref __ KW_SET __ KW_DEFAULT __ e:expr {
    /* => {
        action: 'alter';
        keyword?: KW_COLUMN;
        default_val?: { type: 'set default', value: expr };
        type: 'alter';
      } & create_column_definition;
      */
      return {
        action: 'alter',
        column: c,
        keyword: kc,
        resource: 'column',
        default_val: {
          type: 'set default',
          value: e,
        },
        type: 'alter',
      }
  }
  / KW_ALTER __ kc:KW_COLUMN? __ c:column_ref __ KW_DROP __ KW_DEFAULT {
    /* => {
        action: 'alter';
        keyword?: KW_COLUMN;
        default_val?: { type: 'set default', value: expr };
        type: 'alter';
      } & create_column_definition;
      */
      return {
        action: 'alter',
        column: c,
        keyword: kc,
        resource: 'column',
        default_val: {
          type: 'drop default',
        },
        type: 'alter',
      }
  }

ALTER_COLUMN_NOT_NULL
  = KW_ALTER __ kc:KW_COLUMN? __ c:column_ref __ ac:(KW_SET / KW_DROP) __ n:literal_not_null {
    /* => {
        action: 'alter';
        keyword?: KW_COLUMN;
        nullable: literal_not_null;
        type: 'alter';
      } & create_column_definition;
      */
      n.action = ac.toLowerCase();
      return {
        action: 'alter',
        column: c,
        keyword: kc,
        resource: 'column',
        nullable: n,
        type: 'alter',
      }
  }

ALTER_REPLICA_IDENTITY
  = 'REPLICA'i __ 'IDENTITY'i __ n:('DEFAULT'i / 'FULL'i / 'NOTHING'i) {
    /* => {
        action: 'replica';
        keyword?: 'identity';
        resource: 'replica_identity';
        type: 'alter';
        replica_identity: 'default' | 'full' | 'nothing';
      }
      */
      return {
        action: 'replica',
        keyword: 'identity',
        resource: 'replica_identity',
        replica_identity: n,
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
      definition: [or_and_where_expr];
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

check_constraint_definition
  = kc:constraint_name? __ u:'CHECK'i __ LPAREN __ c:or_and_expr __ RPAREN __ ne:(KW_NOT? __ 'ENFORCED'i)?  {
    /* => {
      constraint_type: 'check';
      keyword: constraint_name['keyword'];
      constraint?: constraint_name['constraint'];
      definition: [or_and_expr];
      enforced?: 'enforced' | 'not enforced';
      resource: 'constraint';
    }*/
    const enforced = []
    if (ne) enforced.push(ne[0], ne[2])
    return {
        constraint_type: u.toLowerCase(),
        keyword: kc && kc.keyword,
        constraint: kc && kc.constraint,
        definition: [c],
        enforced: enforced.filter(v => v).join(' ').toLowerCase(),
        resource: 'constraint',
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

view_options
  = kc:('RESTRICT'i / 'CASCADE'i) {
    // => 'restrict' | 'cascade';
    return kc.toLowerCase()
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


ALTER_ADD_FULLETXT_SPARITAL_INDEX
  = KW_ADD __ fsid:create_fulltext_spatial_index_definition {
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
      /*
      export interface set_stmt_node {
        type: 'set';
        keyword?: 'GLOBAL' | 'SESSION' | 'LOCAL' | 'PERSIST' | 'PERSIST_ONLY' | undefined;
        expr: assign_stmt_list;
      }
       => AstStatement<set_stmt_node>
       */
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
priv_type_table
  =  p:(KW_SELECT / KW_INSERT / KW_UPDATE / KW_DELETE / KW_TRUNCATE / KW_REFERENCES / 'TRIGGER'i) {
    /* export interface origin_str_stmt {
        type: 'origin';
        value: string;
      }
      => origin_str_stmt
     */
    return {
      type: 'origin',
      value: Array.isArray(p) ? p[0] : p
    }
  }
priv_type_sequence
  = p:('USAGE'i / KW_SELECT / KW_UPDATE) {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: Array.isArray(p) ? p[0] : p
    }
  }
priv_type_database
  = p:(KW_CREATE / 'CONNECT'i / KW_TEMPORARY / KW_TEMP) {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: Array.isArray(p) ? p[0] : p
    }
  }
prive_type_all
  = KW_ALL p:(__ 'PRIVILEGES'i)? {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: p ? 'all privileges' : 'all'
    }
  }
prive_type_usage
  = p:'USAGE'i {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: p
    }
  }
  / prive_type_all
prive_type_execute
  = p:'EXECUTE'i {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: p
    }
  }
  / prive_type_all
priv_type
  = priv_type_table / priv_type_sequence / priv_type_database / prive_type_usage / prive_type_execute
priv_item
  = p:priv_type __ c:(LPAREN __ column_ref_list __ RPAREN)? {
    // => { priv: priv_type; columns: column_ref_list; }
    return {
      priv: p,
      columns: c && c[2],
    }
  }
priv_list
  = head:priv_item tail:(__ COMMA __ priv_item)* {
    // => priv_item[]
      return createList(head, tail)
    }
object_type
  = o:(KW_TABLE / 'SEQUENCE'i / 'DATABASE'i / 'DOMAIN' / 'FUNCTION' / 'PROCEDURE'i / 'ROUTINE'i / 'LANGUAGE'i / 'LARGE'i / 'SCHEMA') {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: o.toUpperCase()
    }
  }
  / KW_ALL __ i:('TABLES'i / 'SEQUENCE'i / 'FUNCTIONS'i / 'PROCEDURES'i / 'ROUTINES'i) __ KW_IN __ KW_SCHEMA {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: `all ${i} in schema`
    }
  }
priv_level
  = prefix:(ident __ DOT)? __ name:(ident / STAR) {
    // => { prefix: string; name: string; }
      return {
          prefix: prefix && prefix[0],
          name,
      }
    }
priv_level_list
  = head:priv_level tail:(__ COMMA __ priv_level)* {
    // => priv_level[]
      return createList(head, tail)
    }
user_or_role
  = g:KW_GROUP? __ i:ident {
    // => origin_str_stmt
    const name = g ? `${group} ${i}` : i
    return {
      name: { type: 'origin', value: name },
    }
  }
  / i:('PUBLIC'i / KW_CURRENT_ROLE / KW_CURRENT_USER / KW_SESSION_USER) {
    // => origin_str_stmt
    return {
      name: { type: 'origin', value: i },
    }
  }
user_or_role_list
  = head:user_or_role tail:(__ COMMA __ user_or_role)* {
    // => user_or_role[]
      return createList(head, tail)
    }
with_grant_option
  = KW_WITH __ 'GRANT'i __ 'OPTION'i {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: 'with grant option',
    }
  }
with_admin_option
  = KW_WITH __ 'ADMIN'i __ 'OPTION'i {
    // => origin_str_stmt
    return {
      type: 'origin',
      value: 'with admin option',
    }
  }
grant_revoke_keyword
  = 'GRANT'i {
    // => { type: 'grant' }
    return {
      type: 'grant'
    }
  }
  / 'REVOKE'i __ i:('GRANT'i __ 'OPTION'i __ 'FOR'i)? {
    // => { type: 'revoke'; grant_option_for?: origin_str_stmt; }
    return {
      type: 'revoke',
      grant_option_for: i && { type: 'origin', value: 'grant option for' }
    }
  }


grant_revoke_stmt
  = g:grant_revoke_keyword __ pl:priv_list __ KW_ON __ ot:object_type? __ le:priv_level_list __ t:(KW_TO / KW_FROM) &{
      const obj = { revoke: 'from', grant: 'to' }
      return obj[g.type].toLowerCase() === t[0].toLowerCase()
    } __ to:user_or_role_list __ wo:with_grant_option? {
      /* export interface grant_revoke_stmt_t {
        type: string;
        grant_option_for?: origin_str_stmt;
        keyword: 'priv';
        objects: priv_list;
        on: {
          object_type?: object_type;
          priv_level: priv_level_list;
        };
        to_from: 'to' | 'from';
        user_or_roles?: user_or_role_list;
        with?: with_grant_option;
      }
      => AstStatement<grant_revoke_stmt_t>
     */
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        ...g,
        keyword: 'priv',
        objects: pl,
        on: {
          object_type: ot,
          priv_level: le
        },
        to_from: t[0],
        user_or_roles: to,
        with: wo
      }
    }
  }
  / g:grant_revoke_keyword __ o:ident_list __ t:(KW_TO / KW_FROM) &{
      const obj = { revoke: 'from', grant: 'to' }
      return obj[g.type].toLowerCase() === t[0].toLowerCase()
    } __ to:user_or_role_list __ wo:with_admin_option? {
      // => AstStatement<grant_revoke_stmt_t>
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        ...g,
        keyword: 'role',
        objects: o.map(name => ({ priv: { type: 'string', value: name }})),
        to_from: t[0],
        user_or_roles: to,
        with: wo
      }
    }
  }
elseif_stmt
  = 'ELSEIF'i __ e:expr __ 'THEN'i __ ia:crud_stmt __ s:SEMICOLON? {
    // => { type: 'elseif'; boolean_expr: expr; then: crud_stmt; semicolon?: string; }
    return {
      type: 'elseif',
      boolean_expr: e,
      then: ia,
      semicolon: s
    }

  }
elseif_stmt_list
  = head:elseif_stmt tail:(__ elseif_stmt)* {
    // => elseif_stmt[]
    return createList(head, tail, 1)
  }
if_else_stmt
  = 'IF'i __ ie:expr __ 'THEN'i __ ia:crud_stmt __ s:SEMICOLON? __ ei:elseif_stmt_list? __ el:(KW_ELSE __ crud_stmt)? __ es:SEMICOLON? __ 'END'i __ 'IF'i {
    /* export interface if_else_stmt_t {
        type: 'if';
        keyword: 'if';
        boolean_expr: expr;
        semicolons: string[];
        if_expr: crud_stmt;
        elseif_expr: elseif_stmt[];
        else_expr: crud_stmt;
        prefix: literal_string;
        suffix: literal_string;
      }
     => AstStatement<if_else_stmt_t>
     */
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'if',
        keyword: 'if',
        boolean_expr: ie,
        semicolons: [s || '', es || ''],
        prefix: {
          type: 'origin',
          value: 'then'
        },
        if_expr: ia,
        elseif_expr: ei,
        else_expr: el && el[2],
        suffix: {
          type: 'origin',
          value: 'end if',
        }
      }
    }
  }
raise_level
  // => string
  = 'DEBUG'i / 'LOG'i / 'INFO'i  / 'NOTICE'i / 'WARNING'i / 'EXCEPTION'i
raise_opt
  = KW_USING __ o:('MESSAGE'i / 'DETAIL'i / 'HINT'i / 'ERRCODE'i / 'COLUMN'i / 'CONSTRAINT'i / 'DATATYPE'i / 'TABLE'i / 'SCHEMA'i) __ KW_ASSIGIN_EQUAL __ e:expr es:(__ COMMA __ expr)* {
    // => { type: 'using'; option: string; symbol: '='; expr: expr[]; }
    const expr = [e]
    if (es) es.forEach(ex => expr.push(ex[3]))
    return {
      type: 'using',
      option: o,
      symbol: '=',
      expr
    }
  }
raise_item
  = format:literal_string e:(__ COMMA __ proc_primary)* {
    // => IGNORE
    return {
      type: 'format',
      keyword: format,
      expr: e && e.map(ex => ex[3])
    }
  }
  / 'SQLSTATE'i __ ss:literal_string {
    // => IGNORE
    return {
      type: 'sqlstate',
      keyword: { type: 'origin', value: 'SQLSTATE' },
      expr: [ss],
    }
  }
  / n:ident {
    // => IGNORE
    return {
      type: 'condition',
      expr: [{ type: 'default', value: n }]
    }
  }
raise_stmt
  = 'RAISE'i __ l:raise_level?  __ r:raise_item? __ using:raise_opt? {
    /* export interface raise_stmt_t {
        type: 'raise';
        level?: string;
        raise?: raise_item;
        using?: raise_opt;
      }
      => AstStatement<raise_stmt_t>
     */
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'raise',
        level: l,
        using,
        raise: r,
      }
    }
  }
execute_stmt
  = 'EXECUTE'i __ name:ident __ a:(LPAREN __ proc_primary_list __ RPAREN)?  {
    /* export interface execute_stmt_t {
        type: 'execute';
        name: string;
        args?: { type: expr_list; value: proc_primary_list; }
      }
      => AstStatement<execute_stmt_t>
     */
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'execute',
        name,
        args: a && { type: 'expr_list', value: a[2] }
      }
    }
  }
for_label
  = 'FOR'i {
    // => { label?: string; keyword: 'for'; }
    return {
      label: null,
      keyword: 'for',
    }
  }
  / label:ident __ 'FOR'i {
  // => IGNORE
    return {
      label,
      keyword: 'for'
    }
  }
for_loop_stmt
  = f:for_label __ target:ident __ KW_IN __ query:select_stmt __ 'LOOP'i  __ stmts:multiple_stmt __ KW_END __ 'LOOP'i __ label:ident? &{
    if (f.label && label && f.label === label) return true
    if (!f.label && !label) return true
    return false
  } {
    /* export interface for_loop_stmt_t {
        type: 'for';
        label?: string
        target: string;
        query: select_stmt;
        stmts: multiple_stmt;
      }
      => AstStatement<for_loop_stmt_t>
     */
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'for',
        label,
        target,
        query,
        stmts: stmts.ast,
      }
    }
  }
transaction_mode_isolation_level
  = 'SERIALIZABLE'i {
    // => { type: 'origin'; value: string; }
    return {
      type: 'origin',
      value: 'serializable'
    }
  }
  / 'REPEATABLE'i __ 'READ'i {
    // => ignore
    return {
      type: 'origin',
      value: 'repeatable read'
    }
  }
  / 'READ'i __ e:('COMMITTED'i / 'UNCOMMITTED'i) {
    // => ignore
    return {
      type: 'origin',
      value: `read ${e.toLowerCase()}`
    }
  }

transaction_mode
  = 'ISOLATION'i __ 'LEVEL'i __ l:transaction_mode_isolation_level {
    // => { type: 'origin'; value: string; }
    return {
      type: 'origin',
      value: `isolation level ${l.value}`
    }
  }
  / 'READ'i __ e:('WRITE'i / 'ONLY'i) {
    // => ignore
    return {
      type: 'origin',
      value: `read ${e.toLowerCase()}`
    }
  }
  / n:KW_NOT? __ 'DEFERRABLE'i {
    // => ignore
    return {
      type: 'origin',
      value: n ? 'not deferrable' : 'deferrable'
    }
  }

transaction_mode_list
  = head: transaction_mode tail:(__ COMMA __ transaction_mode)* {
    // => transaction_mode[]
    return createList(head, tail)
  }
transaction_stmt
  = k:('commit'i / 'rollback'i) {
    /* export interface transaction_stmt_t {
        type: 'transaction';
        expr: {
          action: {
            type: 'origin',
            value: string
          };
          keyword?: string;
          modes?: transaction_mode[];
        }
      }
      => AstStatement<transaction_stmt_t>
     */
    return {
      type: 'transaction',
      expr: {
        action: {
          type: 'origin',
          value: k
        },
      }
    }
  }
  / 'begin'i __ k:('WORK'i / 'TRANSACTION'i)? __ m:transaction_mode_list? {
    // => ignore
    return {
      type: 'transaction',
      expr: {
        action: {
          type: 'origin',
          value: 'begin'
        },
        keyword: k,
        modes: m
      }
    }
  }
  / 'start'i __ k:'transaction'i __ m:transaction_mode_list? {
    // => ignore
    return {
      type: 'transaction',
      expr: {
        action: {
          type: 'origin',
          value: 'start'
        },
        keyword: k,
        modes: m
      }
    }
  }
comment_on_option
  = t:(KW_TABLE / KW_VIEW / KW_TABLESPACE) __ name:table_name {
    // => { type: string; name: table_name; }
    return {
      type: t.toLowerCase(),
      name,
    }
  }
  / t:(KW_COLUMN) __ name:column_ref {
    // => { type: string; name: column_ref; }
    return {
      type: t.toLowerCase(),
      name,
    }
  }
  / t:(KW_INDEX / KW_COLLATION / KW_TABLESPACE / KW_SCHEMA / 'DOMAIN'i / KW_DATABASE / 'ROLE'i / 'SEQUENCE'i / 'SERVER'i / 'SUBSCRIPTION'i / 'EXTENSION'i) __ name:ident_type {
    // => { type: string; name: ident; }
    return {
      type: t.toLowerCase(),
      name,
    }
  }

comment_on_is
  = 'IS'i __ e:(literal_string / literal_null) {
    // => { keyword: 'is'; expr: literal_string | literal_null; }
    return {
      keyword: 'is',
      expr: e,
    }
  }
comment_on_stmt
  = 'COMMENT'i __ 'ON'i __ co:comment_on_option __ is:comment_on_is {
    /* export interface comment_on_stmt_t {
        type: 'comment';
        target: comment_on_option;
        expr: comment_on_is;
      }
      => AstStatement<comment_on_stmt_t>
     */
    return {
      type: 'comment',
      keyword: 'on',
      target: co,
      expr: is,
    }
  }
select_stmt_parentheses
  = s:('(' __ select_stmt __ ')') {
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
select_stmt
  = KW_SELECT __ ';' {
    // => { type: 'select'; }
    return {
      type: 'select',
    }
  }
  / select_stmt_nake / select_stmt_parentheses

with_clause
  = KW_WITH __ head:cte_definition tail:(__ COMMA __ cte_definition)* {
      // => cte_definition[]
      return createList(head, tail);
    }
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition tail:(__ COMMA __ cte_definition)* {
    // => (cte_definition & { recursive?: true; })[]
      cte.recursive = true;
      return createList(cte, tail);
    }

cte_definition
  = name:(literal_string / ident_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:crud_stmt __ RPAREN {
    // => { name: { type: 'default'; value: string; }; stmt: crud_stmt; columns?: cte_column_definition; }
    if (typeof name === 'string') name = { type: 'default', value: name }
      return { name, stmt: stmt.ast, columns };
    }

cte_column_definition
  = LPAREN __ l:column_ref_list __ RPAREN {
    // => column_ref_list
      return l
    }

distinct_on
  = d:KW_DISTINCT __ o:KW_ON __ LPAREN __ c:column_list_items __ RPAREN {
    // => {type: string; columns: column_list_items;}
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
    c:column_clause     __
    ci:into_clause?      __
    f:from_clause?      __
    fi:into_clause?      __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
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
          orderby: o,
          limit: l,
          window: win,
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

column_list_items
  = head:column_list_item tail:(__ COMMA __ column_list_item)* {
    // => column_list_item[]
      return createList(head, tail);
    }
column_clause
  = head: (KW_ALL / (STAR !ident_start) / STAR) tail:(__ COMMA __ column_list_item)* {
      // => 'ALL' | '*' | column_list_item[]
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
  / column_list_items

array_index
  = LBRAKE __ n:(literal_numeric / literal_string / func_call) __ RBRAKE {
    // => { brackets: boolean, index: literal_numeric | literal_string | func_call }
    return {
      brackets: true,
      index: n
    }
  }

array_index_list
  = head:array_index tail:(__ array_index)* {
    // => array_index[]
    return createList(head, tail, 1)
  }

expr_item
  = e:binary_column_expr __ a:array_index_list? {
    // => binary_column_expr & { array_index: array_index }
    if (a) e.array_index = a
    return e
  }

column_item_suffix
  = 'AT'i __ KW_TIME __ 'ZONE'i __ t:(quoted_ident_type / column_ref) {
    // => [{ type: 'origin'; value: string; }, quoted_ident_type | column_ref]
    return [
      {
        type: 'origin',
        value: 'at time zone'
      },
      t
    ]
  }
column_list_item
  = c:string_constants_escape {
    // => { expr: expr; as: null; }
    return { expr: c, as: null }
  }
  / e:column_ref __ c:cast_double_colon __ cs:column_item_suffix+ __ alias:alias_clause? {
    // => { type: 'cast'; expr: expr; symbol: '::'; target: cast_data_type[];  as?: null; }
    c.target[c.target.length - 1].suffix = cs.flat()
    return {
      ...c,
      as: alias,
      type: 'cast',
      expr: e,
      suffix: cs.flat(),
    }
  }
  / e:(column_ref_quoted / expr_item) __ c:cast_double_colon __ tail:(__ (additive_operator / multiplicative_operator) __ expr_item)* __ cs:column_item_suffix* __ alias:alias_clause? {
    // => { type: 'cast'; expr: expr; symbol: '::'; target: cast_data_type[];  as?: null; }
    if (e.type === 'column_ref' && cs.length) {
      e.column.options = { type: 'expr_list', value: cs.flat(), separator: ' ' }
    }
    return {
      ...c,
      as: alias,
      type: 'cast',
      expr: e,
      tail: tail && tail[0] && { operator: tail[0][1], expr: tail[0][3] },
    }
  }
  / tbl:ident_type __ DOT pro:(ident_without_kw_type __ DOT)? __ STAR {
      // => { expr: column_ref; as: null; }
      const mid = pro && pro[0]
      let schema
      if (mid) {
        schema = tbl
        tbl = mid
      }
      columnList.add(`select::${tbl ? tbl.value : null}::(.*)`)
      const column = '*'
      return {
        expr: {
          type: 'column_ref',
          table: tbl,
          schema,
          column,
        },
        as: null
      }
    }
  / tbl:(ident_type __ DOT)? __ STAR {
      // => { expr: column_ref; as: null; }
      const table = tbl && tbl[0] || null
      columnList.add(`select::${table ? table.value : null}::(.*)`);
      return {
        expr: {
          type: 'column_ref',
          table: table,
          column: '*'
        },
        as: null
      };
    }
  / e:expr_item __ alias:alias_clause? {
    // => { type: 'expr'; expr: expr; as?: alias_clause; }
      if (e.type === 'double_quote_string' || e.type === 'single_quote_string') {
        columnList.add(`select::null::${e.value}`)
      }
      return { type: 'expr', expr: e, as: alias };
    }

value_alias_clause
  = KW_AS? __ i:alias_ident { /*=>alias_ident*/ return i; }

alias_clause
  = KW_AS __ i:alias_ident { /*=>alias_ident*/ return i; }
  / KW_AS? __ i:alias_ident { /*=>alias_ident*/ return i; }

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
  = KW_USING __ t:("BTREE"i / "HASH"i / "GIST"i / "GIN"i) {
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
      // => table_base & {join: join_op; using: ident_without_kw_type[]; }
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
      expr: (union_stmt | table_ref_list) & { parentheses: true; };
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
  / stmt:value_clause __ alias:value_alias_clause? {
    // => { expr: value_clause; as?: alias_clause; }
    return {
      expr: stmt,
      as: alias
    };
  }
  / l:('LATERAL'i)? __ LPAREN __ stmt:(union_stmt / value_clause) __ RPAREN __ alias:value_alias_clause? {
    // => { prefix?: string; expr: union_stmt | value_clause; as?: alias_clause; }
    stmt.parentheses = true;
    return {
      prefix: l,
      expr: stmt,
      as: alias
    };
  }
  / l:('LATERAL'i)? __ LPAREN __ stmt:table_ref_list __ RPAREN __ alias:value_alias_clause? {
    // => { prefix?: string; expr: table_ref_list; as?: alias_clause; }
    stmt = { type: 'tables', expr: stmt, parentheses: true }
    return {
      prefix: l,
      expr: stmt,
      as: alias
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
      }
    }
  }
  / t:table_name __ alias:alias_clause? {
    // => table_name & { as?: alias_clause; }
      if (t.type === 'var') {
        t.as = alias;
        return t;
      } else {
        return {
          ...t,
          as: alias
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
  = dt:ident schema:(__ DOT __ (ident / STAR))? tail:(__ DOT __ (ident / STAR))? {
      // => { db?: ident; schema?: ident, table: ident | '*'; }
      const obj = { db: null, table: dt };
      if (tail !== null) {
        obj.db = dt;
        obj.schema = schema[3];
        obj.table = tail[3];
        return obj
      }
      if (schema !== null) {
        obj.db = dt;
        obj.table = schema[3];
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
    /*
    export type BINARY_OPERATORS =
      | LOGIC_OPERATOR
      | "OR"
      | "AND"
      | multiplicative_operator
      | additive_operator
      | arithmetic_comparison_operator
      | "IN"
      | "NOT IN"
      | "BETWEEN"
      | "NOT BETWEEN"
      | "IS"
      | "IS NOT"
      | "ILIKE"
      | "LIKE"
      | "@>"
      | "<@"
      | OPERATOR_CONCATENATION
      | DOUBLE_WELL_ARROW
      | WELL_ARROW
      | "?"
      | "?|"
      | "?&"
      | "#-";

    export type binary_expr = {
      type: "binary_expr";
      operator: BINARY_OPERATORS;
      left: expr;
      right: expr;
    };
    => binary_expr
     */
    const len = tail.length
    let result = head
    for (let i = 0; i < len; ++i) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3])
    }
    return result
  }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list {
    // => { columns: expr_list['value']; modifiers: literal_string[]; }
    return {
      columns: e.value
    }
  }

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
    // => column_ref[]
      return createList(head, tail);
    }

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

window_frame_clause
  = kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    // => { type: 'row'; expr: window_frame_following / window_frame_preceding }
    return {
      type: 'rows',
      expr: s
    }
  }
  / KW_ROWS __ op:KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:window_frame_following {
    // => binary_expr
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
    // => { type: 'origin'; value: string }
    return { type: 'origin', value: 'current row' }
  }

window_frame_value
  = s:'UNBOUNDED'i {
    // => { type: 'origin'; value: string }
    return { type: 'origin', value: s.toUpperCase() }
  }
  / literal_numeric

partition_by_clause
  = KW_PARTITION __ KW_BY __ bc:(column_ref_list / func_call) {
    /* => { type: 'expr'; expr: column_ref_list }[] */
    return Array.isArray(bc) ? bc.map(item => ({ type: 'expr', expr: item })) : [{ type: 'expr', expr: bc }];
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
  = l:(KW_LIMIT __ (number_or_param / KW_ALL / select_stmt_parentheses))? __ tail:(KW_OFFSET __ number_or_param)? {
    // => { separator: 'offset' | ''; value: [number_or_param | { type: 'origin', value: 'all' }, number_or_param?] }
      const res = []
      if (l) res.push(typeof l[2] === 'string' ? { type: 'origin', value: 'all' } : l[2])
      if (tail) res.push(tail[2]);
      return {
        seperator: tail && tail[0] && tail[0].toLowerCase() || '',
        value: res
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
          columnList.add(`update::${col.table}::${col.column.expr.value}`)
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
    w:where_clause? __
    r:returning_stmt? {
      /*
      export interface table_ref_addition extends table_name {
        addition: true;
        as?: alias_clause;
      }
       export interface delete_stmt_node {
         type: 'delete';
         table?: table_ref_list | [table_ref_addition];
         from?: from_clause;
         where?: where_clause;
         returning?: returning_stmt;
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
          where: w,
          returning: r,
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
  = c:column_ref_array_index __ '=' __ v:expr {
    // => { column: ident; value: additive_expr; table?: ident;}
    return {  ...c, value: v };
  }
  / column_ref_array_index __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
    // => { column: ident; value: column_ref; table?: ident; keyword: 'values' }
    return { ...c, value: v, keyword: 'values' };
  }

returning_stmt
  = k:KW_RETURNING __ c:(column_clause / select_stmt) {
    // => { type: 'returning'; columns: column_clause | select_stmt; }
    return {
      type: k && k.toLowerCase() || 'returning',
      columns: c === '*' && [{ type: 'expr', expr: { type: 'column_ref', table: null, column: '*' }, as: null }] || c
    }
  }

insert_value_clause
  = value_clause
  / u:union_stmt {
      // => union_stmt_node
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
        c.forEach(c => columnList.add(`insert::${table}::${c.value}`));
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
  = KW_WHEN __ condition:or_and_expr __ KW_THEN __ result:expr_item {
    // => { type: 'when'; cond: or_and_expr; result: expr_item; }
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
  = "!~*" / "~*" / "~" / "!~"

regex_op_right
= op:regex_op __ right:(literal / comparison_expr) {
     // => { op: regex_op; right: literal | comparison_expr}
      return { op: op, right: right };
    }

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
  = c:column_ref __ a:array_index_list? __ cs:column_item_suffix* {
    // => column_ref
    if (a) c.array_index = a
    if (cs.length) c.options = { type: 'expr_list', value: cs.flat(), separator: ' ' }
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
    // => unary_expr
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

column_ref
  = string_constants_escape
  / tbl:(ident __ DOT)? __ STAR {
    // => IGNORE
      const table = tbl && tbl[0] || null
      columnList.add(`select::${table}::(.*)`);
      return {
          type: 'column_ref',
          table: table,
          column: '*'
      }
    }
  / schema:ident tbl:(__ DOT __ ident) col:(__ DOT __ column_without_kw_type)+ ce:(__ collate_expr)? {
    /* => {
        type: 'column_ref';
        schema: string;
        table: string;
        column: column | '*';
        collate?: collate_expr;
      } */

      if (col.length === 1) {
        columnList.add(`select::${schema}.${tbl[3]}::${col[0][3].value}`);
        return {
          type: 'column_ref',
          schema: schema,
          table: tbl[3],
          column: { expr: col[0][3] },
          collate: ce && ce[1],
        };
      }
      const left = createBinaryExpr('.', schema, tbl[3])
      return {
        type: 'column_ref',
        column: { expr: createBinaryExprChain(left, col) },
        collate: ce && ce[1],
      };
    }
  / tbl:ident __ DOT __ col:column_without_kw_type ce:(__ collate_expr)? {
      /* => {
        type: 'column_ref';
        table: ident;
        column: column | '*';
        collate?: collate_expr;
      } */
      columnList.add(`select::${tbl}::${col.value}`);
      return {
        type: 'column_ref',
        table: tbl,
        column: { expr: col },
        collate: ce && ce[1],
      };
    }
  / col:column_type !LPAREN ce:(__ collate_expr)? {
    // => IGNORE
      columnList.add(`select::null::${col.value}`);
      return {
        type: 'column_ref',
        table: null,
        column: { expr: col },
        collate: ce && ce[1],
      };
    }

column_ref_quoted
  = col:literal_double_quoted_string {
    // => unknown
      columnList.add(`select::null::${col.value}`);
      return {
        type: 'column_ref',
        table: null,
        column: { expr: col }
      };
    }

column_list
  = head:column_type tail:(__ COMMA __ column_type)* {
    // => column[]
      return createList(head, tail);
    }

ident_without_kw_type
  = n:ident_name {
     // => { type: 'default', value: string }
    return { type: 'default', value: n }
  }
  / quoted_ident_type

ident_type
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      // => ident_name
      return { type: 'default', value: name }
    }
  / quoted_ident_type

ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      // => ident_name
      return name;
    }
  / quoted_ident
ident_list
  = head:ident tail:(__ COMMA __ ident)* {
    // => ident[]
      return createList(head, tail)
    }
alias_ident
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true } c:(__ LPAREN __ column_list __ RPAREN)? {
      // => string
      if (!c) return name;
      return `${name}(${c[3].map(v => v.value).join(', ')})`
    }
  / name:double_quoted_ident {
      // => IGNORE
      return name.value;
    }

// quoted_ident_type, quoted_ident, double_quoted_ident, single_quoted_ident, backticks_quoted_ident
// are imported from common/identifier/quoted.pegjs
@import 'common/identifier/quoted.pegjs'

ident_without_kw
  = ident_name / quoted_ident

column_without_kw
  = column_name / quoted_ident

column_without_kw_type
  = n:column_name {
     // => { type: 'default', value: string }
    return { type: 'default', value: n }
  }
  / quoted_ident_type
column_type
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } {
    // => { type: 'default', value: string }
    return { type: 'default', value: name }
  }
  / quoted_ident_type
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

// ident_start, ident_part, column_part moved after common symbol imports

param
  = l:(':' ident_name) {
    // => { type: 'param'; value: ident_name }
      return { type: 'param', value: l[1] };
    }

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
  = name:KW_FIRST_LAST_VALUE __ LPAREN __ l:expr __ RPAREN __ cn:consider_nulls_clause? __ over:over_partition {
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
  = name:(KW_COUNT / KW_GROUP_CONCAT) __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
    // => { type: 'aggr_func'; name: 'COUNT' | 'GROUP_CONCAT'; args:count_arg; over: over_partition }
      return {
        type: 'aggr_func',
        name: name,
        args: arg,
        over: bc
      };
    }
  / name:('percentile_cont'i / 'percentile_disc'i) __ LPAREN __ arg:(literal_numeric / literal_array) __ RPAREN __ 'within'i __ KW_GROUP __ LPAREN __ or:order_by_clause __ RPAREN __ bc:over_partition? {
   // => { type: 'aggr_func'; name: 'PERCENTILE_CONT' | 'PERCENTILE_DISC'; args: literal_numeric | literal_array; within_group_orderby: order_by_clause; over?: over_partition }
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
    // => { type: 'aggr_func'; name: 'MODE'; args: literal_numeric | literal_array; within_group_orderby: order_by_clause; over?: over_partition }
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
    // => { type: 'function'; name: proc_func_name; args: expr_list; }
    let args = tr || { type: 'expr_list', value: [] }
    args.value.push(s)
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'trim' }] },
        args,
        ...getLocationObject(),
    };
  }

tablefunc_clause
  = name:('crosstab'i / 'jsonb_to_recordset'i / 'jsonb_to_record'i /  'json_to_recordset'i / 'json_to_record'i) __ LPAREN __ s:expr_list __ RPAREN __ d:(KW_AS __ ident_name __ LPAREN __ column_data_type_list __ RPAREN)? {
    // => { type: 'tablefunc'; name: proc_func_name; args: expr_list; as: func_call }
    return {
      type: 'tablefunc',
      name: { name: [{ type: 'default', value: name }] },
      args: s,
      as: d && {
          type: 'function',
          name: { name: [{ type: 'default', value: d[2] }]},
          args: { type: 'expr_list', value: d[6].map(v => ({ ...v, type: 'column_definition' })) },
          ...getLocationObject(),
      },
      ...getLocationObject(),
    }
  }

substring_funcs_clause
  = 'substring'i __ LPAREN __ s:quoted_ident_type __ COMMA __ start:literal_numeric __ COMMA __ len:literal_numeric __ RPAREN {
    // => { type: 'function'; name: 'substring'; args: expr_list; }
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'substring' }] },
        args: { type: 'expr_list', value: [s, start, len] },
      }
  }
  / 'substring'i __ LPAREN __ s:quoted_ident_type __ KW_FROM __ start:quoted_ident_type __ len:('FOR'i __ quoted_ident_type)? __ RPAREN {
    // => { type: 'function'; name: 'substring'; args: expr_list; }
      const separator = [{ type: 'origin', value: 'from' }]
      const args = { type: 'expr_list', value: [s, start] }
      if (len) {
        separator.push({ type: 'origin', value: 'for' })
        args.value.push(len[2])
      }
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'substring' }] },
        args,
        separator
      }
  }
  / 'substring'i __ LPAREN __ s:quoted_ident_type __ start:(KW_FROM __ literal_numeric)? __ len:('FOR'i __ literal_numeric)? __ RPAREN {
    // => { type: 'function'; name: 'substring'; args: expr_list; }
      const separator = []
      const args = { type: 'expr_list', value: [s] }
      if (start) {
        separator.push({ type: 'origin', value: 'from' })
        args.value.push(start[2])
      }
      if (len) {
        separator.push({ type: 'origin', value: 'for' })
        args.value.push(len[2])
      }
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'substring' }] },
        args,
        separator
      }
  }

make_interval_func_args_item
  = n:('years'i / 'months'i / 'weeks'i / 'days'i / 'hours'i / 'mins'i) __ '=>' __ v:(integer / expr) {
    // => { type: 'func_arg', value: { name: ident_name; symbol: '=>', value: literal_numeric; } }
      return { type: 'func_arg', value: { name: n, symbol: '=>', expr: v } };
    }
  / n:('secs'i) __ '=>' __ v:(double_float / expr) {
    // => IGNORE
      return { type: 'func_arg', value: { name: n, symbol: '=>', expr: v } };
    }

make_interval_func_args
  = head:make_interval_func_args_item tail:(__ COMMA __ make_interval_func_args_item)* {
    // => make_interval_func_args_item[]
      return { type: 'expr_list', value: createList(head, tail) };
    }
  / expr_list

make_interval_func_clause
  = name:'make_interval'i __ LPAREN __ l:make_interval_func_args __ RPAREN {
    // => { type: 'function'; name: proc_func_name; args: make_interval_func_args; }
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: name }] },
        args: l,
        ...getLocationObject(),
      }
  }

func_call
  = position_func_clause / trim_func_clause / tablefunc_clause / substring_funcs_clause / make_interval_func_clause
  / name:'now'i __ LPAREN __ l:expr_list? __ RPAREN __ 'at'i __ KW_TIME __ 'zone'i __ z:literal_string {
    // => { type: 'function'; name: proc_func_name; args: expr_list; suffix: literal_string; }
      z.prefix = 'at time zone'
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        suffix: z,
        ...getLocationObject(),
      };
    }
  / name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
    // => { type: 'function'; name: proc_func_name; args: expr_list; over?: over_partition; }
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
        ...getLocationObject(),
      };
    }
  / extract_func
  / f:scalar_time_func __ l:column_item_suffix? __ up:on_update_current_timestamp? {
    // => { type: 'function'; name: proc_func_name; over?: on_update_current_timestamp; }
    const rest = {}
    if (l) {
      rest.args = { type: 'expr_list', value: l }
      rest.args_parentheses = false
      rest.separator = ' '
    }
    const result = {
        type: 'function',
        name: { name: [{ type: 'origin', value: f }] },
        over: up,
        ...rest,
        ...getLocationObject(),
    }
    return result
  }
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN {
      // => { type: 'function'; name: proc_func_name; args: expr_list; }
      if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
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
    // => data_type & { quoted?: string }
    if ((p && !s) || (!p && s)) throw new Error('double quoted not match')
    if (p && s) t.quoted = '"'
    return t
  }

cast_double_colon
  = s:(KW_DOUBLE_COLON __ cast_data_type)+ {
    /* => {
        symbol: '::' | 'as',
        target: cast_data_type[];
      }
      */
    return {
      symbol: '::',
      target: s.map(v => v[2]),
    }
  }
cast_expr
  = c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    // => IGNORE
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: [t],
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
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
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
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
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
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
  / LPAREN __ e:(or_expr / column_ref_array_index / param) __ RPAREN __ c:cast_double_colon?  {
    /* => {
        type: 'cast';
        expr: or_expr | column_ref | param
          | expr;
        keyword: 'cast';
      } & cast_double_colon
      */
    e.parentheses = true
    if (!c) return e
    return {
      ...c,
      type: 'cast',
      keyword: 'cast',
      expr: e,
    }
  }
  / e:(interval_expr / aggr_func / window_func / func_call / column_ref_quoted / literal / case_expr / column_ref_array_index / param) __ c:cast_double_colon? {
    /* => ({
        type: 'cast';
        expr: literal | jsonb_expr | aggr_func | func_call | case_expr | interval_expr | column_ref | param
          | expr;
        keyword: 'cast';
      } & cast_double_colon)
      */
    if (!c) return e
    return {
      ...c,
      type: 'cast',
      keyword: 'cast',
      expr: e,
    }
  }



literal
  = literal_string
  / literal_numeric
  / literal_bool
  / literal_null
  / literal_datetime
  / literal_array

// PostgreSQL specific: literal_array
literal_array
  = s:KW_ARRAY __ LBRAKE __ c:expr_list? __ RBRAKE {
    return {
      expr_list: c || { type: 'origin', value: '' },
      type: 'array',
      keyword: 'array',
      brackets: true
    }
  }

// literal_list, literal_null, literal_not_null, literal_bool
// are imported from common/literal/basic-no-numeric.pegjs
// (PostgreSQL has custom literal_numeric, so we use the no-numeric variant)
@import 'common/literal/basic-no-numeric.pegjs'

// literal_string is imported from common/literal/string-basic.pegjs
@import 'common/literal/string-basic.pegjs'

// literal_datetime is imported from common/literal/datetime.pegjs
@import 'common/literal/datetime.pegjs'

// single_quote_char, single_char, escape_char (minimal, only '' escape)
// are imported from common/literal/string-chars-minimal.pegjs
@import 'common/literal/string-chars-minimal.pegjs'

// PostgreSQL specific: number has special structure (double_float / integer)
literal_numeric
  = n:number {
      if (n && typeof n === 'object') return n
      return { type: 'number', value: n };
    }

integer
  = int_:int exp:exp {
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
    return { type: 'number', value: parseFloat(int_) };
  }

double_float
  = int_:int? frac:frac exp:exp {
    const numStr = (int_ || '') + frac + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int? frac:frac {
    const numStr = (int_ || '') + frac
    if (int_ && isBigInt(int_)) return {
      type: 'bigint',
      value: numStr
    }
    return parseFloat(numStr).toFixed(frac.length - 1);
  }

number
  = double_float / integer

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


// All KW_ keywords imported from common/keyword/core.pegjs

// Import common modules
@import 'common/keyword/core.pegjs'
@import 'common/symbol.pegjs'
@import 'common/clause/core.pegjs'
@import 'common/value/core.pegjs'

// PostgreSQL specific: LOGIC_OPERATOR without XOR
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// PostgreSQL specific: additional arrow operators
WELL_ARROW = '#>'
DOUBLE_WELL_ARROW = '#>>'

// PostgreSQL specific: ident_start, ident_part, column_part, line_terminator rules
ident_start = [A-Za-z_\u4e00-\u9fa5\u00C0-\u017F]
ident_part  = [A-Za-z0-9_\-$\u4e00-\u9fa5\u00C0-\u017F]
column_part  = [A-Za-z0-9_\u4e00-\u9fa5\u00C0-\u017F]
line_terminator = [\n\r]

// PostgreSQL specific: comment rules (has nested block comment)
__
  = (whitespace / comment)*

___
  = (whitespace / comment)+

comment
  = block_comment
  / line_comment

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

whitespace =
  [ \t\n\r]

EOL
  = EOF
  / [\n\r]+

EOF = !.

interval_unit
  = KW_UNIT_YEAR
  / KW_UNIT_MONTH
  / KW_UNIT_DAY
  / KW_UNIT_HOUR
  / KW_UNIT_MINUTE
  / KW_UNIT_SECOND

//begin procedure extension
proc_stmts
  = proc_stmt*

proc_stmt
  = &{ varList = []; return true; } __ s:(assign_stmt / return_stmt) {
      /* export interface proc_stmt_t { type: 'proc'; stmt: assign_stmt | return_stmt; vars: any }
     => AstStatement<proc_stmt_t>
     */
      return { type: 'proc', stmt: s, vars: varList }
    }

// assign_stmt_list is imported from common/procedure/assign-list.pegjs
@import 'common/procedure/assign-list.pegjs'

// PostgreSQL-specific: assign_stmt with timezone support
assign_stmt_timezone
  = KW_TIME __ 'ZONE'i __ e:interval_expr __ KW_TO __ r:interval_unit {
    // => { type: 'assign';  left: expr_list; symbol: 'to'; right: interval_unit; }
    return {
      type: 'assign',
      left: { type: 'expr_list', value: [{ type: 'origin', value: 'time zone' }, e], separator: ' ' },
      symbol: 'to',
      right: { type: 'origin', value: r }
    };
  }
  / KW_TIME __ 'ZONE'i __ s:KW_TO? __ e:(literal_numeric / literal_string / KW_LOCAL / 'default'i) {
    // => { type: 'assign'; left: literal_string; symbol?: 'to'; right: literal; }
    return {
      type: 'assign',
      left: { type: 'origin', value: 'time zone' },
      symbol: s ? 'to' : null,
      right: typeof e === 'string' ? { type: 'origin', value: e } : e
    };
  }
assign_stmt
  = assign_stmt_timezone
  / va:(var_decl / without_prefix_var_decl) __ s:(KW_ASSIGN / KW_ASSIGIN_EQUAL / KW_TO) __ e:proc_expr {
    // => { type: 'assign'; left: var_decl | without_prefix_var_decl; symbol: ':=' | '='; right: proc_expr; }
    return {
      type: 'assign',
      left: va,
      symbol: Array.isArray(s) ? s[0] : s,
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
  / n:ident_name s:(DOT __ ident_name)? {
    // => { type: 'var'; prefix: null; name: number; members: []; quoted: null } | column_ref
    if (!s) return {
      type: 'var',
      name: n,
      prefix: null
    }
    return {
      type: 'column_ref',
      table: n,
      column: s[2]
    }
  }

proc_func_name
  = dt:ident_without_kw_type tail:(__ DOT __ ident_without_kw_type)? {
    // => { schema?: ident_without_kw_type, name: ident_without_kw_type }
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
  = p:KW_VAR_PRE_DOLLAR_DOUBLE d:[^$]* s:KW_VAR_PRE_DOLLAR_DOUBLE {
    // => { type: 'var'; name: string; prefix: string; suffix: string; }
    return {
      type: 'var',
      name: d.join(''),
      prefix: '$$',
      suffix: '$$'
    };
  }
  / KW_VAR_PRE_DOLLAR f:column KW_VAR_PRE_DOLLAR d:[^$]* KW_VAR_PRE_DOLLAR s:column !{ if (f !== s) return true } KW_VAR_PRE_DOLLAR {
    // => { type: 'var'; name: string; prefix: string; suffix: string; }
    return {
      type: 'var',
      name: d.join(''),
      prefix: `$${f}$`,
      suffix: `$${s}$`
    };
  }
  / p:KW_VAR_PRE d: without_prefix_var_decl {
    // => without_prefix_var_decl & { type: 'var'; prefix: string; }
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
  / oid_type
  / record_type
  / network_address_type
  / bit_type
  / byte_type
  / money_type
  / custom_types


array_type
  = t:(numeric_type / character_string_type / text_type) __ LBRAKE __ RBRAKE __ LBRAKE __ RBRAKE {
    /* => data_type */
    return { ...t, array: { dimension: 2 } }
  }
  / t:(numeric_type / character_string_type / text_type) __ LBRAKE __ l:literal_numeric? __ RBRAKE {
    /* => data_type */
    return { ...t, array: { dimension: 1,  length: [l] } }
  }
  / t:(numeric_type / character_string_type / text_type) __ KW_ARRAY {
    /* => data_type */
    return { ...t, array: { keyword: 'array' } }
  }


geometry_type_args
  = t:('POINT'i / 'LINESTRING'i / 'POLYGON'i / 'MULTIPOINT'i / 'MULTILINESTRING'i / 'MULTIPOLYGON'i / 'GEOMETRYCOLLECTION'i) __ srid:(COMMA __ [0-9]+)? {
    // => { length: string, scale?: number | null }
    return {
      length: t,
      scale: srid && srid[2] && parseInt(srid[2].join(''), 10)
    }
  }
geometry_type
  = t:KW_GEOMETRY geo:(__ LPAREN __ geometry_type_args __ RPAREN )? {/* =>  data_type */  return { dataType: t, ...(geo && geo[3] || {}), parentheses: geo ? true : false }; }

text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) s:(LBRAKE __ RBRAKE)? {
    /* =>  data_type */
    return { dataType: `${t}${s ? '[]' : ''}` }
  }
  / t:(KW_TSVECTOR / KW_TSQUERY) {/* =>  data_type */  return { dataType: t }; }


@import 'common/keyword/signedness.pegjs'
@import 'common/datatype/size.pegjs'
@import 'common/datatype/boolean.pegjs'
@import 'common/datatype/blob.pegjs'
@import 'common/datatype/binary.pegjs'
@import 'common/datatype/character.pegjs'
@import 'common/datatype/datetime.pegjs'
@import 'common/datatype/numeric.pegjs'
@import 'common/datatype/money.pegjs'
@import 'common/datatype/oid.pegjs'
@import 'common/datatype/enum.pegjs'
@import 'common/datatype/json.pegjs'
@import 'common/datatype/serial.pegjs'
@import 'common/datatype/interval.pegjs'
@import 'common/datatype/uuid.pegjs'
@import 'common/datatype/record.pegjs'
@import 'common/datatype/network.pegjs'
@import 'common/datatype/byte.pegjs'
@import 'common/datatype/custom.pegjs'
