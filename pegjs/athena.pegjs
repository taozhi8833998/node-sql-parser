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

    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,
    'LOW_PRIORITY': true,

    'NOT': true,
    'NULL': true,

    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'RECURSIVE': true,
    'RENAME': true,
    'READ': true,
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
    'UNNEST': true,

    'VALUES': true,

    'WITH': true,
    'WHEN': true,
    'WHERE': true,
    'WRITE': true,

    'GLOBAL': true,
    'SESSION': true,
    'LOCAL': true,
    'PERSIST': true,
    'PERSIST_ONLY': true,
  };

  // Import common initializer functions and variables
  @import 'common/initializer/functions.pegjs'
  @import 'common/initializer/variables.pegjs'
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
  = KW_UNION __ s:(KW_ALL / KW_DISTINCT)? {
    return s ? `union ${s.toLowerCase()}` : 'union'
  }

union_stmt
  = head:select_stmt tail:(__ set_op __ select_stmt)* __ ob: order_by_clause? __ l:limit_clause? {
      tail.forEach(item => item.slice(1, 1))
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

create_definition
  = create_column_definition
  / create_index_definition
  / create_fulltext_spatial_index_definition
  / create_constraint_definition

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

create_constraint_definition
  = create_constraint_primary
  / create_constraint_unique
  / create_constraint_foreign

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
      },
      ...getLocationObject(),
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
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition tail:(__ COMMA __ cte_definition)* {
      cte.recursive = true;
      return createList(cte, tail);
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
    l:limit_clause? {
      if(f) {
        const tables = Array.isArray(f) ? f : f.expr
        tables.forEach(info => info.table && tableList.add(`select::${info.db}::${info.table}`))
      }
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

array_index
  = LBRAKE __ n:(literal_numeric / literal_string) __ RBRAKE s:(__ "." __ ident)? {
    let property
    if (s) property = { type: 'default', value: s[3] }
    return {
      brackets: true,
      index: n,
      property,
    }
  }
array_index_list
  = head:array_index tail:(__ array_index)* {
    return createList(head, tail, 1)
  }

expr_item
  = e:binary_column_expr __ a:array_index_list? {
    if (a) e.array_index = a
    return e
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
  / e:expr_item __ alias:alias_clause? {
      if (e.type === 'double_quote_string' || e.type === 'single_quote_string') {
        columnList.add(`select::null::${e.value}`)
      }
      return { type: 'expr', expr: e, as: alias };
    }

value_alias_clause
  = KW_AS? __ i:(func_call / alias_ident) { return i; }

alias_clause
  = KW_AS __ i:(func_call / alias_ident) { return i; }
  / KW_AS? __ i:ident { return i; }

with_offset
  = KW_WITH __ KW_OFFSET __ alias:alias_clause? {
    return {
      keyword: 'with offset as',
      as: alias
    }
  }

from_unnest_item
  = 'UNNEST'i __ LPAREN __ a:expr? __ RPAREN __ alias:(func_call / alias_clause)? __ wf:with_offset? {
    return {
      type: 'unnest',
      expr: a,
      parentheses: true,
      as: alias,
      with_offset: wf,
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
  = head:table_base __ tail:table_ref* {
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
  / op:(join_op / set_op) __ LPAREN __ stmt:(union_stmt / table_ref_list) __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
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
  = from_unnest_item
  / KW_DUAL {
      return {
        type: 'dual'
      };
  }
  / stmt:value_clause __ alias:value_alias_clause? {
    return {
      expr: stmt,
      as: alias
    };
  }
  / LPAREN __ stmt:value_clause __ RPAREN __ alias:value_alias_clause? {
      return {
        expr: { ...stmt, parentheses: true },
        as: alias
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
  / LPAREN __ stmt:table_ref_list __ RPAREN __ alias:alias_clause? {
    stmt = { type: 'tables', expr: stmt, parentheses: true }
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
  / KW_CROSS __ KW_JOIN { return 'CROSS JOIN'; }

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

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list {
    return {
      columns: e.value
    }
  }

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
      return createList(head, tail);
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
  = bc:partition_by_clause? __
  l:order_by_clause? __
  w:window_frame_clause? {
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
    return {
      name: null,
      partitionby: bc,
      orderby: l,
      window_frame_clause: null
    }
  }

window_frame_clause
  = kw:KW_ROWS __ s:(window_frame_following / window_frame_preceding) {
    return {
      type: 'rows',
      expr: s
    }
  }
  / KW_ROWS __ op:KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:(window_frame_following / window_frame_preceding) {
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
    return { type: 'origin', value: 'current row' }
  }

window_frame_value
  = s:'UNBOUNDED'i {
    // => literal_string
    return { type: 'origin', value: s.toUpperCase() }
  }
  / literal_numeric

partition_by_clause
  = KW_PARTITION __ KW_BY __ bc:column_clause { return bc; }

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

update_stmt
  = KW_UPDATE    __
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
  = tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ v:expr {
      return { column: c, value: v, table: tbl && tbl[0] };
    }
  / tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
      return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
  }

insert_value_clause
  = value_clause
  / u:union_stmt {
      return u.ast
  }

insert_partition
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      return createList(head, tail)
    }
  / KW_PARTITION __ v: value_item {
    return v
  }

replace_insert_stmt
  = ri:replace_insert       __
    kw:KW_INTO                 __
    ta:KW_TABLE? __
    t:table_name
    p:insert_partition?  __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause {
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
      const tableKey = ta ? ` ${ta.toLowerCase()}` : ''
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: ri,
          prefix: `${kw.toLowerCase()}${tableKey}`,
          table: [t],
          columns: c,
          values: v,
          partition: p,
        }
      };
    }

insert_no_columns_stmt
  = ri:replace_insert       __
    kw:(KW_INTO / KW_OVERWRITE) __
    ta:KW_TABLE? __
    t:table_name  __
    p:insert_partition?  __
    v:insert_value_clause {
      if (t) {
        tableList.add(`insert::${t.db}::${t.table}`)
        columnList.add(`insert::${t.table}::(.*)`);
        t.as = null
      }
      const tableKey = ta ? ` ${ta.toLowerCase()}` : ''
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: ri,
          prefix: `${kw.toLowerCase()}${tableKey}`,
          table: [t],
          columns: null,
          values: v,
          partition: p,
        }
      };
    }

replace_insert
  = KW_INSERT   { return 'insert'; }
  / KW_REPLACE  { return 'replace'; }

value_clause
  = KW_VALUES __ l:value_list  { return { type: 'values', values: l } }

value_list
  = head:value_item tail:(__ COMMA __ value_item)* {
      return createList(head, tail);
    }

value_item
  = LPAREN __ l:expr_list  __ RPAREN {
      return l;
    }
  / func_call

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
  / rlike_op_right

arithmetic_op_right
  = l:(__ arithmetic_comparison_operator __ additive_expr)+ {
      return { type: 'arithmetic', tail: l };
    }

arithmetic_comparison_operator
  = ">=" / ">" / "<=" / "<>" / "<" / "==" / "=" / "!="

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

rlike_op
  = nk:(KW_NOT __ KW_RLIKE) { return nk[0] + ' ' + nk[2]; }
  / KW_RLIKE

in_op
  = nk:(KW_NOT __ KW_IN) { return nk[0] + ' ' + nk[2]; }
  / KW_IN

like_op_right
  = op:like_op __ right:(literal / comparison_expr) {
      return { op: op, right: right };
    }

rlike_op_right
  = op:rlike_op __ right:(literal / comparison_expr) {
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
  / interval_expr
  / aggr_func
  / func_call
  / case_expr
  / c:column_ref __ a:array_index_list {
    // => column_ref
    c.array_index = a
    return c
  }
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
  = head:primary_array_index __ tail: (__ ('?|' / '?&' / '?' / '#-' / '#>>' / '#>' / SINGLE_ARROW / '@>' / '<@') __  primary_array_index)* {
    // => primary_array_index | binary_expr
    if (!tail || tail.length === 0) return head
    return createBinaryExprChain(head, tail)
  }

column_ref
  = schema:ident tbl:(__ DOT __ ident) col:(__ DOT __ column)+ ce:(__ collate_expr)? {
      if (col.length === 1) {
        columnList.add(`select::${schema}.${tbl[3]}::${col[0][3].value || col[0][3]}`);
        return {
          type: 'column_ref',
          schema: schema,
          table: tbl[3],
          column: col[0][3],
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
  / tbl:ident __ DOT __ col:column ce:(__ collate_expr)? {
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

// quoted_ident_type, quoted_ident, double_quoted_ident, single_quoted_ident, backticks_quoted_ident
// are imported from common/identifier/quoted.pegjs
@import 'common/identifier/quoted.pegjs'

column_without_kw
  = name:column_name {
    return name;
  }
  / quoted_ident

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / quoted_ident

column_name
  =  start:ident_part parts:column_part* { return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* { return start + parts.join(''); }

// ident_start, ident_part, column_part moved to after symbol imports

param
  = l:(':' ident_name) {
      return { type: 'param', value: l[1] };
    }

aggr_func
  = aggr_fun_count
  / aggr_fun_smma
  / aggr_array_agg

aggr_fun_smma
  = name:KW_SUM_MAX_MIN_AVG  __ LPAREN __ e:additive_expr __ RPAREN __ bc:over_partition?   {
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
  = 'OVER'i __ aws:as_window_specification {
    return {
      type: 'window',
      as_window_specification: aws,
    }
  }
  / 'OVER'i __ LPAREN __ bc:partition_by_clause? __ l:order_by_clause? __ RPAREN {
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
concat_separator
  = kw:(COMMA / OPERATOR_CONCATENATION) __ s:literal_string {
    // => { symbol: ',' | '||'; delimiter: literal_string; }
    return {
      symbol: kw,
      delimiter: s
    }
  }

distinct_args
  = d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN __ tail:(__ (KW_AND / KW_OR / OPERATOR_CONCATENATION) __ expr)* __ or:order_by_clause? {
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
  / d:KW_DISTINCT? __ c:(column_ref / or_and_expr) __ tail:(__ (COMMA / OPERATOR_CONCATENATION) __ expr)* __ or:order_by_clause? {
    const len = tail.length
    let result = c
    for (let i = 0; i < len; ++i) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3])
    }
    return { distinct: d, expr: result, orderby: or };
  }

count_arg
  = e:star_expr { return { expr: e }; }
  / distinct_args

aggr_array_agg
  = pre:(ident __ DOT)? __ name:(KW_ARRAY_AGG) __ LPAREN __ arg:distinct_args __ RPAREN {
    // => { type: 'aggr_func'; args:count_arg; name: 'ARRAY_AGG' | 'STRING_AGG';  }
    return {
      type: 'aggr_func',
      name: pre ? `${pre[0]}.${name}` : name,
      args: arg,
    };
  }

star_expr
  = "*" { return { type: 'star', value: '*' }; }

arrow_func
  = v:ident_without_kw_type __ s:SINGLE_ARROW __ e:expr {
      return createBinaryExpr(s, v, e)
  }

filter_func
  = 'filter'i __ LPAREN __ ar:expr __ COMMA __ af:arrow_func __ RPAREN {
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'filter' }] },
        args: { type: 'expr_list', value: [ar, af] },
        ...getLocationObject(),
      };
  }

trim_position
  = 'BOTH'i / 'LEADING'i / 'TRAILING'i

trim_rem
  = p:trim_position? __ rm:expr? __ k:KW_FROM {
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
  = 'trim'i __ LPAREN __ tr:trim_rem? __ s:expr_item __ RPAREN {
    let args = tr || { type: 'expr_list', value: [] }
    args.value.push(s)
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'trim' }] },
        args,
    };
  }

func_call
  = name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
        ...getLocationObject(),
      };
    }
  / extract_func / filter_func / trim_func_clause
  / f:scalar_time_func __ up:on_update_current_timestamp? {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: f }] },
        over: up,
        ...getLocationObject(),
    }
  }
  / name:(KW_DATE / KW_TIME / KW_TIMESTAMP / 'AT TIME ZONE'i) __ l:or_and_where_expr? __ bc:over_partition? {
    if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
        args_parentheses: false,
        ...getLocationObject(),
      };
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
  / literal_array

// Athena specific: literal_array
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

// single_quote_char, single_char, escape_char
// are imported from common/literal/string-chars.pegjs
@import 'common/literal/string-chars.pegjs'

// number, int, frac, exp, digits, digit, hexDigit, e
// are imported from common/literal/number.pegjs
@import 'common/literal/number.pegjs'


// Import common keywords (all KW_ keywords are defined there)
@import 'common/keyword/core.pegjs'

// Import common modules
@import 'common/symbol.pegjs'
@import 'common/comment.pegjs'
@import 'common/create/core.pegjs'
@import 'common/datatype/size.pegjs'
@import 'common/datatype/character.pegjs'
@import 'common/datatype/numeric.pegjs'
@import 'common/datatype/datetime.pegjs'
@import 'common/datatype/json.pegjs'
@import 'common/datatype/text.pegjs'
@import 'common/datatype/boolean.pegjs'
@import 'common/clause/core.pegjs'
@import 'common/expression/case.pegjs'

// Athena specific: LOGIC_OPERATOR without XOR
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// Athena specific: ident_start, ident_part, column_part, line_terminator rules
ident_start = [A-Za-z_]
ident_part  = [A-Za-z0-9_]
column_part  = [A-Za-z0-9_:\u4e00-\u9fa5\u00C0-\u017F]
line_terminator = [\n\r]

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
  = data_type_item
  / array_type

data_type_item
  = character_string_type
  / numeric_type
  / datetime_type
  / json_type
  / text_type
  / boolean_type

data_type_list
  = head:data_type_item tail:(__ COMMA __ data_type_item)* {
      return createList(head, tail);
    }

array_type
  = t:KW_ARRAY __ LPAREN __ a:data_type_list __ RPAREN {
    return {
      dataType: t,
      parentheses: true,
      expr: {
        type: 'expr_list',
        value: a.map(d => ({ type: 'datatype', ...d }))
      },
    }
  }
  / t:KW_ARRAY __ LANGLE_BRACKET __ a:data_type_list __ RANGLE_BRACKET {
    return {
      dataType: t,
      angle_brackets: true,
      expr: {
        type: 'expr_list',
        value: a.map(d => ({ type: 'datatype', ...d }))
      },
    }
  }
