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
    'EXCEPT': true,

    'FALSE': true,
    'FROM': true,
    'FULL': true,
    'FOR': true,

    'GROUP': true,

    'HAVING': true,

    'IN': true,
    'INNER': true,
    'INSERT': true,
    'INTERSECT': true,
    'INTO': true,
    'IS': true,

    'JOIN': true,
    'JSON': true,

    'KEY': false,

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
    'RIGHT': false,

    'SELECT': true,
    'SESSION_USER': true,
    'SET': true,
    'SHOW': true,
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

    'WINDOW': true,
    'WITH': true,
    'WHEN': true,
    'WHERE': true,
    'WRITE': true, // for lock table

    'GLOBAL': true,
    // 'SESSION': true,
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

  // Import common initializer functions (with location tracking) and variables
  @import 'common/initializer/functions-location.pegjs'
  @import 'common/initializer/variables.pegjs'

  // BigQuery specific helper function
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
  = __ n:(multiple_stmt) {
    return n
  }

multiple_stmt
  = head:stmt tail:(__ SEMICOLON __ stmt)* {
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

stmt
  = query_statement / crud_stmt

crud_stmt
  = union_stmt
  / update_stmt
  / replace_insert_stmt
  / insert_no_columns_stmt
  / insert_into_set
  / delete_stmt
  / cmd_stmt
  / proc_stmts

update_stmt
  = KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    f:from_clause? __
    w:where_clause? __
    or:order_by_clause? __
    lc:limit_clause? {
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
          orderby: or,
          limit: lc,
        }
      };
    }

delete_stmt
  = KW_DELETE    __
    t: table_ref_list? __
    f:from_clause? __
    w:where_clause? __
    or:order_by_clause? __
    l:limit_clause? {
      if(t) t.forEach(tt => tableList.add(`delete::${tt.db}::${tt.table}`));
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
          where: w,
          orderby: or,
          limit: l,
        }
      };
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
    KW_INTO? __
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

cmd_stmt
  = analyze_stmt
  / attach_stmt
  / drop_stmt
  / create_stmt
  / truncate_stmt
  / rename_stmt
  / call_stmt
  / use_stmt
  / alter_stmt
  / set_stmt
  / lock_stmt
  / unlock_stmt
  / show_stmt
  / desc_stmt

proc_stmts
  = proc_stmt*

proc_stmt
  = &{ varList = []; return true; } __ s:(assign_stmt / return_stmt) {
      return { stmt: s, vars: varList };
    }

// assign_stmt_list and assign_stmt are imported from common/procedure/assign.pegjs
@import 'common/procedure/assign.pegjs'


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

proc_array
  = LBRAKE __ l:proc_primary_list __ RBRAKE {
    return { type: 'array', value: l, brackets: true };
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
  = tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ v:expr {
      return { column: c, value: v, table: tbl && tbl[0] };
  }
  / tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
      return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
  }

replace_insert
  = KW_INSERT   { return 'insert'; }
  / KW_REPLACE  { return 'replace'; }

insert_partition
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      return createList(head, tail)
    }
  / KW_PARTITION __ v: value_item {
    return v
  }

insert_value_clause
  = value_clause
  / u:union_stmt {
      return u.ast
  }

on_duplicate_update_stmt
  = KW_ON __ 'DUPLICATE'i __ KW_KEY __ KW_UPDATE __ s:set_list {
    return {
      keyword: 'on duplicate key update',
      set: s
    }
  }

analyze_stmt
  = a:KW_ANALYZE __ t:table_name __ {
      tableList.add(`${a}::${t.db}::${t.table}`);
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          table: t
        }
      };
    }

attach_stmt
  = a:KW_ATTACH __ db: KW_DATABASE __ e:expr __ as:KW_AS __ schema:ident __ {
      // tableList.add(`${a}::${t.db}::${t.table}`);
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          database: db,
          expr: e,
          as: as && as[0].toLowerCase(),
          schema,
        }
      };
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

create_stmt
  = create_table_stmt
  / create_db_stmt
  / create_view_stmt

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

alter_stmt
  = alter_table_stmt

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

show_stmt
  = KW_SHOW __ t:('BINARY'i / 'MASTER'i) __ 'LOGS'i {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        suffix: 'logs',
        keyword: t.toLowerCase()
      }
    }
  }
  / KW_SHOW __ 'BINLOG'i __ 'EVENTS'i __ ins:in_op_right? __ from: from_clause? __ limit: limit_clause? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        suffix: 'events',
        keyword: 'binlog',
        in: ins,
        from,
        limit,
      }
    }
  }
  / KW_SHOW __ k:(('CHARACTER'i __ 'SET'i) / 'COLLATION'i) __ e:(like_op_right / where_clause)? {
    let keyword = Array.isArray(k) && k || [k]
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        suffix: keyword[2] && keyword[2].toLowerCase(),
        keyword: keyword[0].toLowerCase(),
        expr: e
      }
    }
  }
  / show_grant_stmt

 desc_stmt
  = (KW_DESC / KW_DESCRIBE) __ t:ident {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'desc',
        table: t
      }
    };
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

drop_index_opt
  = head:(ALTER_ALGORITHM / ALTER_LOCK) tail:(__ (ALTER_ALGORITHM / ALTER_LOCK))* {
    return createList(head, tail, 1)
  }

if_not_exists_stmt
  = 'IF'i __ KW_NOT __ KW_EXISTS {
    return 'IF NOT EXISTS'
  }

create_table_stmt
  = a:KW_CREATE __
    or:(KW_OR __ KW_REPLACE)? __
    tp:(KW_TEMP / KW_TEMPORARY)? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_name __
    c:create_table_definition? __
    to:table_options? __
    as:KW_AS? __
    qe:union_stmt? {
      if(t) tableList.add(`create::${t.db}::${t.table}`)
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
    return  { type: 'check_option', value: t, symbol: '=' }
  }
  / k:('security_barrier'i / 'security_invoker'i) __ KW_ASSIGIN_EQUAL __ t:literal_bool {
    return { type: k.toLowerCase(), value: t.value ? 'true' : 'false', symbol: '=' }
  }
with_view_options
  = head:with_view_option tail:(__ COMMA __ with_view_option)* {
      return createList(head, tail);
    }
create_view_stmt
  = a:KW_CREATE __ or:(KW_OR __ KW_REPLACE)? __ tp:(KW_TEMP / KW_TEMPORARY)? __ r:KW_RECURSIVE? __
  KW_VIEW __ v:table_name __ c:(LPAREN __ column_list __ RPAREN)? __ wo:(KW_WITH __ LPAREN __ with_view_options __ RPAREN)? __
  KW_AS __ s:select_stmt __ w:view_with? {
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

lock_table_list
  = head:lock_table tail:(__ COMMA __ lock_table)* {
    return createList(head, tail);
  }

show_grant_stmt
  = KW_SHOW __ 'GRANTS'i __ f:show_grant_for? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        keyword: 'grants',
        for: f,
      }
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

create_table_definition
  = LPAREN __ head:create_definition tail:(__ COMMA __ create_definition)* __ RPAREN {
      return createList(head, tail);
    }

create_definition
  = create_column_definition
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

table_options
  = head:table_option tail:(__ COMMA? __ table_option)* {
    return createList(head, tail)
  }

create_like_table
  = create_like_table_simple
  / LPAREN __ e:create_like_table  __ RPAREN {
      e.parentheses = true;
      return e;
  }

create_db_definition
  = head:create_option_character_set tail:(__ create_option_character_set)* {
    return createList(head, tail, 1)
  }

alter_action_list
  = head:alter_action tail:(__ COMMA __ alter_action)* {
      return createList(head, tail);
    }

lock_table
  = t:table_base __ lt:lock_type {
    tableList.add(`lock::${t.db}::${t.table}`)
    return {
      table: t,
      lock_type: lt
    }
  }

show_grant_for
  = 'FOR'i __ n:ident __ h:(KW_VAR__PRE_AT __ ident)? __ u:show_grant_for_using? {
    return {
      user: n,
      host: h && h[2],
      role_list: u
    }
  }

create_constraint_definition
  = create_constraint_primary
  / create_constraint_unique
  / create_constraint_foreign
  / create_constraint_check

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
    de:cte_column_definition __
    id:index_options? {
      return {
        index: c,
        definition: de,
        keyword: kc && `${p.toLowerCase()} ${kc.toLowerCase()}` || p.toLowerCase(),
        index_options: id,
        resource: 'index',
      }
    }

default_expr
  = KW_DEFAULT __ ce:expr {
    return {
      type: 'default',
      value: ce
    }
  }

// keyword_comment imported from common/comment.pegjs

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

table_option_list_item
  = k:('expiration_timestamp'i / 'partition_expiration_days'i / 'require_partition_filter'i / 'kms_key_name'i / 'friendly_name'i / 'description'i / 'labels'i / 'default_rounding_mode'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:expr {
    return {
      keyword: k,
      symbol: '=',
      value: v
    }
  }
table_option_list
  = head:table_option_list_item tail:(__ COMMA __ table_option_list_item)* {
    return createList(head, tail);
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
  / KW_PARTITION __ KW_BY __ v:expr {
    return {
      keyword: 'partition by',
      value: v
    }
  }
  / 'CLUSTER'i __ 'BY'i __ c:column_list {
    return {
      keyword: 'cluster by',
      value: c
    }
  }
  / 'OPTIONS'i __ LPAREN __ v:table_option_list __ RPAREN {
    return {
      keyword: 'options',
      parentheses: true,
      value: v
    }
  }

create_like_table_simple
  = KW_LIKE __ t: table_ref_list {
    return {
      type: 'like',
      table: t
    }
  }

create_option_character_set
  = kw:KW_DEFAULT? __ t:(create_option_character_set_kw / 'CHARSET'i / 'COLLATE'i) __ s:(KW_ASSIGIN_EQUAL)? __ v:ident_without_kw_type {
    return {
      keyword: kw && `${kw[0].toLowerCase()} ${t.toLowerCase()}` || t.toLowerCase(),
      symbol: s,
      value: v
    }
  }

alter_action
  = ALTER_ADD_COLUMN
  / ALTER_DROP_COLUMN
  / ALTER_RENAME_TABLE

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

show_grant_for_using
  = KW_USING __ l:show_grant_for_using_list {
    return l
  }

show_grant_for_using_list
  = head:ident tail:(__ COMMA __ ident)* {
    return createList(head, tail);
  }


create_constraint_primary
  = kc:constraint_name? __
  p:('PRIMARY'i __ 'KEY'i) __
  t:index_type? __
  de:cte_column_definition __
  id:index_options? {
    return {
        constraint: kc && kc.constraint,
        definition: de,
        constraint_type: `${p[0].toLowerCase()} ${p[2].toLowerCase()}`,
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

index_type
  = KW_USING __
  t:("BTREE"i / "HASH"i) {
    return {
      keyword: 'using',
      type: t.toLowerCase(),
    }
  }

cte_column_definition
  = LPAREN __ head:column tail:(__ COMMA __ column)* __ RPAREN {
      return createList(head, tail);
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

on_reference
  = KW_ON __ kw:(KW_DELETE / KW_UPDATE) __ ro:reference_option {
    // => { type: 'on delete' | 'on update'; value: reference_option; }
    return {
      type: `on ${kw[0].toLowerCase()}`,
      value: ro
    }
  }

create_option_character_set_kw
  = 'CHARACTER'i __ 'SET'i {
    return 'CHARACTER SET'
  }

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

constraint_name
  = kc:KW_CONSTRAINT __
  c:ident? {
    return {
      keyword: kc.toLowerCase(),
      constraint: c
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

// Note: All KW_ keywords are imported from common/keyword/core.pegjs (see below)

query_statement
  = query_expr
  / s:('(' __ select_stmt __ ')') {
      return {
        ...s[2],
        parentheses_symbol: true,
      }
    }

query_expr
  = s:union_stmt __ o:order_by_clause?  __ l:limit_clause? __
  {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        ...s.ast,
        _orderby: o,
        _limit: l,
        _parentheses: s._parentheses
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
        _parentheses: true
      }
    }

union_stmt_nake
  = head:select_stmt tail:(__ set_op? __ select_stmt)* __ ob: order_by_clause? __ l:limit_clause?  {
      let cur = head
      for (let i = 0; i < tail.length; i++) {
        cur._next = tail[i][3]
        cur.set_op = tail[i][1]
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
    q:qualify_clause? __
    o:order_by_clause?  __
    l:limit_clause? __
    win:window_clause? {
      if(Array.isArray(f)) f.forEach(info => info.table && tableList.add(`select::${[info.db, info.schema].filter(Boolean).join('.') || null}::${info.table}`));
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
          qualify: q,
          orderby: o,
          limit: l,
          window:win,
          ...getLocationObject()
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
  = e:binary_column_expr __ alias:alias_clause? {
      return { expr: e, as: alias, ...getLocationObject() };
    }

column_clause
  = c:columns_list __ COMMA? {
    return c
  }

columns_list
  = head:column_list_item tail:(__ COMMA __ column_list_item)* {
      return createList(head, tail);
    }

array_index
  = LBRAKE __ n:(literal_numeric / literal_string) __ RBRAKE {
    return { value: n }
  }

column_offset_expr_list
  = l:array_index+ {
    return l
  }
  / l:(LBRAKE __ (KW_OFFSET / KW_ORDINAL / KW_SAFE_OFFSET / KW_SAFE_ORDINAL) __ LPAREN __ (literal_numeric / literal_string) __ RPAREN __ RBRAKE)+ {
    return l.map(item => ({ name: item[2], value: item[6] }))
  }
column_offset_expr
  = n:expr __ l:column_offset_expr_list {
    return {
      expr: n,
      offset: l
    }
  }

column_list_item
  = p:(column_without_kw __ DOT)? STAR __ k:('EXCEPT'i / 'REPLACE'i) __ LPAREN __ c:columns_list __ RPAREN {
    const tbl = p && p[0]
    columnList.add(`select::${tbl}::(.*)`)
    return {
      expr_list: c,
      parentheses: true,
      expr: {
        type: 'column_ref',
        table: tbl,
        column: '*'
      },
      type: k.toLowerCase(),
      ...getLocationObject(),
    }
  }
  / head: (KW_ALL / (STAR !ident_start) / STAR) {
      columnList.add('select::null::(.*)')
      const item = {
        expr: {
          type: 'column_ref',
          table: null,
          column: '*'
        },
        as: null,
        ...getLocationObject()
      }
      return item
  }
  / tbl:column_without_kw __ DOT pro:((column_offset_expr / column_without_kw) __ DOT)? __ STAR {
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
        as: null,
        ...getLocationObject()
      }
    }
  / c:column_offset_expr __ s:(DOT __ column_without_kw)? __ as:alias_clause? {
    if (s) c.suffix = `.${s[2]}`
    return {
        expr: {
          type: 'column_ref',
          table: null,
          column: c
        },
        as: as,
        ...getLocationObject()
      }
  }
  / e:expr_alias {
    if (e.expr.type === 'double_quote_string' || e.expr.type === 'single_quote_string') {
      columnList.add(`select::null::${e.expr.value}`)
    }
    return e
  }

alias_clause
  = KW_AS __ i:alias_ident { return i; }
  / KW_AS? __ i:column { return i; }

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

hint
  = ([\@])([\{]) __ ident_name __ ([\=]) __ ident_name __ ([}])

tablesample
  = 'TABLESAMPLE'i __ ( 'BERNOULLI'i / 'RESERVOIR'i ) __ '(' __ number  __ ( 'PERCENT'i / 'ROWS'i ) __ ')'

//NOTE that, the table assigned to `var` shouldn't write in `table_join`
table_base
  = from_unnest_item / e:func_call __ alias:alias_clause? {
      return { type: 'expr', expr: e, as: alias };
  }
  / t:table_name
    ht:hint? __
	  ts:tablesample? __
	  alias:alias_clause? {
      if (t.type === 'var') {
        t.as = alias;
        return t;
      }
      return {
        ...t,
        as: alias,
        ...getLocationObject(),
      };
    }
  / LPAREN __ stmt:union_stmt __ RPAREN __ ts:tablesample? __ alias:alias_clause? {
      stmt.parentheses = true;
      return {
        expr: stmt,
        as: alias,
        ...getLocationObject(),
      };
    }

join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { return 'FULL JOIN'; }
  / k:KW_CROSS __ KW_JOIN { return `${k.toUpperCase()} JOIN`; }
  / k:KW_INNER? __ KW_JOIN { return k ? `${k.toUpperCase()} JOIN` : 'JOIN'; }

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
  / dt:ident_without_kw_type tail:(__ DOT __ ident_without_kw_type)? {
      const obj = { db: null, table: dt.value, surround: { table: getSurroundFromLiteralType(dt) } };
      if (tail !== null) {
        obj.db = dt.value;
        obj.table = tail[3].value;
        obj.surround = { table: getSurroundFromLiteralType(tail[3]), db: getSurroundFromLiteralType(dt) };
      }
      return obj;
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

having_clause
  = KW_HAVING __ e:or_and_where_expr { return e; }

qualify_clause
  = KW_QUALIFY __ e:expr { return e }

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
  = kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    return {
      type: 'rows',
      expr: s
    }
  }
  / k:(KW_ROWS / 'RANGE'i) __ op:KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:window_frame_following {
    const left = {
      type: 'origin',
      value: k.toLowerCase(),
    }
    const right = {
      type: 'expr_list',
      value: [p, f]
    }
    return createBinaryExpr(op, left, right)
  }

window_frame_following
  = s:window_frame_value __ c:('FOLLOWING'i / 'PRECEDING'i) {
    // => string
    s.value += ` ${c.toUpperCase()}`
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
  = KW_PARTITION __ KW_BY __ bc:column_clause { return bc; }

order_by_clause
  = KW_ORDER __ KW_BY __ l:order_by_list { return l; }

order_by_list
  = head:order_by_element tail:(__ COMMA __ order_by_element)* {
      return createList(head, tail);
    }

order_by_element
  = e:expr __
    c:('COLLATE'i __ literal_string)? __
    d:(KW_DESC / KW_ASC)? {
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
        value: res,
        ...getLocationObject(),
      };
    }

/**
 * here only use `additive_expr` to support 'col1 = col1+2'
 * if you want to use lower operator, please use '()' like below
 * 'col1 = (col2 > 3)'
 */

_expr
  = struct_expr
  / json_expr
  / or_expr
  / unary_expr
  / array_expr

expr
  = _expr / union_stmt

parentheses_list_expr
  = head:parentheses_expr tail:(__ COMMA __ parentheses_expr)* {
      return createList(head, tail);
    }

parentheses_expr
  = LPAREN __ c:column_clause __ RPAREN {
    return c
  }

array_expr
  = LBRAKE __ c:column_clause? __ RBRAKE {
    return {
      array_path: c,
      type: 'array',
      brackets: true,
      keyword: '',
    }
  }
  / s:(array_type / KW_ARRAY)? LBRAKE __ c:literal_list __ RBRAKE {
    return {
      definition: s,
      array_path: c.map(l => ({ expr: l, as: null })),
      type: 'array',
      keyword: s && 'array',
      brackets: true,
    }
  }
  / s:(array_type / KW_ARRAY)? __ l:(LBRAKE) __ c:(parentheses_list_expr / expr) __ r:(RBRAKE) {
    return {
      definition: s,
      expr_list: c,
      type: 'array',
      keyword: s && 'array',
      brackets: true,
      parentheses: false
    }
  }
  / s:(array_type / KW_ARRAY) __ l:(LPAREN) __ c:(parentheses_list_expr / expr) __ r:(RPAREN) {
    return {
      definition: s,
      expr_list: c,
      type: 'array',
      keyword: s && 'array',
      brackets: false,
      parentheses: true
    }
  }

json_expr
  = KW_JSON __ l:literal_list {
    return {
      type: 'json',
      keyword: 'json',
      expr_list: l
    }
  }

struct_expr
  = s:(struct_type / KW_STRUCT) __ LPAREN __ c:column_clause __ RPAREN __ o:order_by_clause?  __ l:limit_clause? {
    return {
      definition: s,
      expr_list: c,
      type: 'struct',
      keyword: s && 'struct',
      parentheses: true,
      order_by: o,
      limit: l
    }
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
  = l:(__ arithmetic_comparison_operator __ (additive_expr))+ {
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
  / op:in_op __ e:(literal_string / from_unnest_item) {
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
  = array_expr
  / interval_expr
  / aggr_func
  / func_call
  / struct_expr
  / json_expr
  / cast_expr
  / literal
  / case_expr
  / column_ref
  / param
  / LPAREN __ list:or_and_where_expr __ RPAREN {
        list.parentheses = true;
        return list;
    }

unary_expr_or_primary
  = primary
  / op:(unary_operator) tail:(__ unary_expr_or_primary) {
    // if (op === '!') op = 'NOT'
    return createUnaryExpr(op, tail[1])
  }

unary_operator
  = '!' / '-' / '+' / '~'

interval_expr
  = KW_INTERVAL __
    e:expr __
    u: interval_unit {
      return {
        type: 'interval',
        expr: e,
        unit: u.toLowerCase(),
      }
    }

column_ref
  = tbl:column_without_kw col:(__ DOT __ column_without_kw)+ __ cof:(column_offset_expr_list __ (DOT __ column_without_kw)?)? ce:(__ collate_expr)? {
      const cols = col.map(c => c[3])
      columnList.add(`select::${tbl}::${cols[0]}`)
      const column = cof
      ? {
          column: {
            expr: {
              type: 'column_ref',
              table: null,
              column: cols[0],
              subFields: cols.slice(1)
            },
            offset: cof && cof[0],
            suffix: cof && cof[2] && `.${cof[2][2]}`,
          }
        }
      : { column: cols[0], subFields: cols.slice(1) }
      return {
        type: 'column_ref',
        table: tbl,
        ...column,
        collate: ce && ce[1],
        ...getLocationObject(),
      };
    }
  / col:(quoted_ident_type / column) __ cf:array_index* ce:(__ collate_expr)? {
      const columnName = typeof col === 'string' ? col : col.value;
      columnList.add(`select::null::${columnName}`);
      const column = typeof col === 'string' ? { expr: { type: 'default', value: col }} : { expr: col }
      if (cf) column.offset = cf;
      return {
        type: 'column_ref',
        table: null,
        column,
        collate: ce && ce[1],
        ...getLocationObject()
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
  = name:ident_name !{ return reservedMap[`${name}`.toUpperCase()] === true; } {
      return name;
    }
  / name:quoted_ident {
      return name;
    }

alias_ident
  = name:column_name !{
      if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
      return false
    } {
      return name;
    }
  / name:quoted_ident_type {
      return name;
    }

// quoted_ident_type, quoted_ident, double_quoted_ident, single_quoted_ident, backticks_quoted_ident
// are imported from common/identifier/quoted.pegjs
@import 'common/identifier/quoted.pegjs'

column_without_kw
  = column_name / quoted_ident

ident_without_kw
  = ident_name / quoted_ident

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / quoted_ident

column_name
  =  start:ident_start parts:column_part* { return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* { return start + parts.join(''); }

// ident_start, ident_part, column_part moved after common symbol imports

param
  = s:(':'/'@') n:ident_name {
      return { type: 'param', value: n, prefix: s };
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
  / aggr_array_agg

aggr_fun_smma
  = name:KW_SUM_MAX_MIN_AVG  __ LPAREN __ e:additive_expr __ RPAREN __ bc:over_partition? {
      return {
        type: 'aggr_func',
        name: name,
        args: {
          expr: e
        },
        over: bc,
        ...getLocationObject()
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
  = name:(KW_COUNT / 'string_agg'i) __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
      return {
        type: 'aggr_func',
        name: name,
        args: arg,
        over: bc,
        ...getLocationObject()
      };
    }

count_arg
  = e:star_expr { return { expr: e, ...getLocationObject() }; }
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
      ...getLocationObject()
    };
  }
  / d:KW_DISTINCT? __ c:or_and_expr __ or:order_by_clause?  { return { distinct: d, expr: c, orderby: or, ...getLocationObject() }; }

aggr_array_agg
  = pre:(ident __ DOT)? __ name:(KW_ARRAY_AGG / KW_STRING_AGG) __ LPAREN __ arg:expr __ RPAREN {
    // => { type: 'aggr_func'; args:count_arg; name: 'ARRAY_AGG' | 'STRING_AGG';  }
      return {
        type: 'aggr_func',
        name: pre ? `${pre[0]}.${name}` : name,
        args: arg,
      };
    }

star_expr
  = "*" { return { type: 'star', value: '*' }; }

func_call
  = extract_func
  / any_value_func
  / name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
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

proc_func_name
  = dt:ident_without_kw_type tail:(__ DOT __ ident_without_kw_type)* {
      const result = { name: [dt] }
      if (tail !== null) {
        result.schema = dt
        result.name = tail.map(t => t[3])
      }
      return result
    }

scalar_time_func
  = KW_CURRENT_DATE
  / KW_CURRENT_TIME
  / KW_CURRENT_TIMESTAMP
scalar_func
  = scalar_time_func / KW_SESSION_USER

any_value_having
  = KW_HAVING __ i:(KW_MAX / KW_MIN) __ e:or_and_where_expr {
    return {
      prefix: i,
      expr: e
    }
  }

any_value_func
  = 'ANY_VALUE'i __ LPAREN __ e:or_and_where_expr __ h:any_value_having? __ RPAREN __ bc:over_partition? {
    return {
        type: 'any_value',
        args: {
          expr: e,
          having: h
        },
        over: bc,
        ...getLocationObject(),
    }
  }

extract_filed
  = f:(
    'YEAR_MONTH'i / 'DAY_HOUR'i / 'DAY_MINUTE'i / 'DAY_SECOND'i / 'DAY_MICROSECOND'i / 'HOUR_MINUTE'i / 'HOUR_SECOND'i/ 'HOUR_MICROSECOND'i / 'MINUTE_SECOND'i / 'MINUTE_MICROSECOND'i / 'SECOND_MICROSECOND'i / 'TIMEZONE_HOUR'i / 'TIMEZONE_MINUTE'i
    / 'CENTURY'i / 'DAYOFWEEK'i / 'DAY'i / 'DATE'i / 'DECADE'i / 'DOW'i / 'DOY'i / 'EPOCH'i / 'HOUR'i / 'ISODOW'i / 'ISOWEEK'i / 'ISOYEAR'i / 'MICROSECONDS'i / 'MILLENNIUM'i / 'MILLISECONDS'i / 'MINUTE'i / 'MONTH'i / 'QUARTER'i / 'SECOND'i / 'TIME'i / 'TIMEZONE'i / 'WEEK'i / 'YEAR'i
  ) {
    return f
  }
extract_func
  = kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ t:(KW_TIMESTAMP / KW_INTERVAL / KW_TIME / KW_DATE) __ s:expr __ RPAREN {
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
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          source: s,
        },
        ...getLocationObject(),
    }
  }
  / 'DATE_TRUNC'i __  LPAREN __ e:expr __ COMMA __ f:extract_filed __ RPAREN {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'date_trunc' }]},
        args: { type: 'expr_list', value: [e, { type: 'origin', value: f }] },
        over: null,
        ...getLocationObject(),
      };
  }

cast_expr_arg
  = n:expr __ l:column_offset_expr_list? {
    const result = { expr: n }
    if (l) result.offset = l
    return result
  }
cast_keyword
  = KW_CAST / KW_SAFE_CAST
cast_expr
  = c:cast_keyword __ LPAREN __ e:cast_expr_arg __ KW_AS __ t:data_type __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      ...e,
      symbol: 'as',
      target: [t]
    };
  }
  / c:cast_keyword __ LPAREN __ e:cast_expr_arg __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      ...e,
      symbol: 'as',
      target: [{
        dataType: 'DECIMAL(' + precision + ')'
      }]
    };
  }
  / c:cast_keyword __ LPAREN __ e:cast_expr_arg __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ COMMA __ scale:int __ RPAREN __ RPAREN {
      return {
        type: 'cast',
        keyword: c.toLowerCase(),
        ...e,
        symbol: 'as',
        target: [{
          dataType: 'DECIMAL(' + precision + ', ' + scale + ')'
        }]
      };
    }
  / c:cast_keyword __ LPAREN __ e:cast_expr_arg __ KW_AS __ s:signedness __ t:KW_INTEGER? __ RPAREN { /* MySQL cast to un-/signed integer */
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      ...e,
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

// literal_list, literal_null, literal_not_null, literal_bool, literal_numeric
// are imported from common/literal/basic.pegjs
@import 'common/literal/basic.pegjs'

// literal_string is imported from common/literal/string-basic.pegjs
@import 'common/literal/string-basic.pegjs'

// literal_datetime is imported from common/literal/datetime.pegjs
@import 'common/literal/datetime.pegjs'

// single_quote_char, single_char, escape_char
// are imported from common/literal/string-chars.pegjs
@import 'common/literal/string-chars.pegjs'

// number, int, frac, exp, digits, digit, hexDigit, e
// are imported from common/literal/number.pegjs
@import 'common/literal/number.pegjs'


// All KW_ keywords imported from common/keyword/core.pegjs

// Import common modules
@import 'common/keyword/core.pegjs'
@import 'common/symbol.pegjs'
@import 'common/comment.pegjs'
@import 'common/expression/case.pegjs'
@import 'common/value/core.pegjs'

@import 'common/datatype/character.pegjs'
@import 'common/datatype/numeric.pegjs'
@import 'common/datatype/datetime.pegjs'
@import 'common/datatype/boolean.pegjs'
@import 'common/datatype/byte.pegjs'
@import 'common/datatype/geometry.pegjs'

// BigQuery specific: LOGIC_OPERATOR without XOR
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// BigQuery specific: angle brackets for type syntax (ARRAY<type>, STRUCT<type>)
LANGLE    = '<'
RANGLE    = '>'

// BigQuery specific: ident_start, ident_part, column_part, line_terminator rules
ident_start = [A-Za-z_]
ident_part  = [A-Za-z0-9_-]
column_part  = [A-Za-z0-9_:\u4e00-\u9fa5\u00C0-\u017F]
line_terminator = [\n\r]

interval_unit
  = KW_UNIT_YEAR
  / KW_UNIT_ISOYEAR
  / KW_UNIT_MONTH
  / KW_UNIT_DAY
  / KW_UNIT_HOUR
  / KW_UNIT_MINUTE
  / KW_UNIT_SECOND
  / KW_UNIT_WEEK

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
  / byte_type
  / boolean_type
  / geometry_type


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
