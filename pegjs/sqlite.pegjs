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
    'COUNT': true,
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

    'GENERATED': true,
    'GROUP': true,

    'HAVING': true,

    'IN': true,
    'INNER': true,
    'INSERT': true,
    'INTO': true,
    'IS': true,

    'JOIN': true,
    // 'JSON': true,

    // 'KEY': true,

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

  // Import common initializer functions and variables
  @import 'common/initializer/functions.pegjs'
  @import 'common/initializer/variables.pegjs'
}

start
  = __ n:(multiple_stmt) {
    return n
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

create_stmt
  = create_table_stmt
  / create_db_stmt
  / create_index_stmt
  / create_trigger_stmt
  / create_view_stmt

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
      if (!tail) tail = []
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

if_exists
  = 'if'i __ 'exists'i {
    return 'if exists'
  }

create_trigger_stmt
  = kw: KW_CREATE __
  tp:(KW_TEMPORARY / KW_TEMP)? __
  t:('TRIGGER'i) __
  ife:if_not_exists_stmt? __
  c:table_name __
  p:('BEFORE'i / 'AFTER'i / 'INSTEAD OF'i)? __
  te:trigger_event_list __
  on:'ON'i __
  tn:table_name __
  fe:trigger_for_row? __
  tw:trigger_when? __
  ta:trigger_action {
    return {
        type: 'create',
        temporary: tp && tp[0].toLowerCase(),
        time: p && p.toLowerCase(),
        events: te,
        trigger: c,
        table: tn,
        for_each: fe,
        if_not_exists: ife,
        when: tw,
        execute: ta,
        keyword: t && t.toLowerCase(),
      }
  }

trigger_event
  = kw:(KW_INSERT / KW_DELETE) {
    return {
      keyword: kw[0].toLowerCase(),
    }
  }
  / kw:KW_UPDATE __ a:('OF'i __ column_ref_list)? {
    return {
      keyword: kw[0].toLowerCase(),
      args: a && { keyword: a[0], columns: a[2] } || null
    }
  }

trigger_event_list
  = head:trigger_event tail:(__ KW_OR __ trigger_event)* {
    return createList(head, tail)
  }

trigger_action
  = b:'BEGIN'i __ ms:multiple_stmt __ e:'END'i {
    return {
      type: 'multiple',
      prefix: b,
      expr: ms,
      suffix: e,
    }
  }

trigger_for_row
  = kw:'FOR'i __ e:('EACH'i)? __ ob:('ROW'i / 'STATEMENT'i) {
    return {
      keyword: e ? `${kw.toLowerCase()} ${e.toLowerCase()}` : kw.toLowerCase(),
      args: ob.toLowerCase()
    }
  }

trigger_when
  = KW_WHEN __ condition:expr {
    return {
      type: 'when',
      cond: condition,
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

column_order_list
  = head:column_order_item tail:(__ COMMA __ column_order_item)* {
    return createList(head, tail)
  }

column_order_item
  = c:expr __ ce:collate_expr? __ o:(KW_ASC / KW_DESC)? {
    return {
      collate: ce,
      ...c,
      order_by: o && o.toLowerCase(),
    }
  }
  / column_order

column_order
  = c:column_ref __ o:(KW_ASC / KW_DESC)? {
    return {
      ...c,
      order_by: o && o.toLowerCase(),
    }
  }

create_index_stmt
  = a:KW_CREATE __
  kw:(KW_UNIQUE)? __
  t:KW_INDEX __
  ife:if_not_exists_stmt? __
  n:table_name __
  um:index_type? __
  on:KW_ON __
  ta:table_name __ LPAREN __ cols:column_order_list __ RPAREN __
  where:where_clause? {
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          index_type: kw && kw.toLowerCase(),
          keyword: t.toLowerCase(),
          if_not_exists: ife,
          index: { schema: n.db, name: n.table },
          on_kw: on[0].toLowerCase(),
          table: ta,
          index_columns: cols,
          where,
        }
    }
  }

view_with
  = KW_WITH __ c:("CASCADED"i / "LOCAL"i) __ "CHECK"i __ "OPTION" {
    return `with ${c.toLowerCase()} check option`
  }
  / KW_WITH __ "CHECK"i __ "OPTION" {
    return 'with check option'
  }

create_view_stmt
  = a:KW_CREATE __ tp:(KW_TEMP / KW_TEMPORARY)? __
  KW_VIEW __ ife:if_not_exists_stmt? __ v:table_name __ c:(LPAREN __ column_list __ RPAREN)? __
  KW_AS __ s:select_stmt_nake {
    v.view = v.table
    delete v.table
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: a[0].toLowerCase(),
        keyword: 'view',
        if_not_exists: ife,
        temporary: tp && tp[0].toLowerCase(),
        columns: c && c[2],
        select: s,
        view: v,
      }
    }
  }

create_table_stmt
  = a:KW_CREATE __
    tp:(KW_TEMPORARY / KW_TEMP)? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_name __
    c:create_table_definition __
    to:table_options? {
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
          create_definitions: c,
          table_options: to
        }
      }
    }
  / a:KW_CREATE __
    tp:(KW_TEMPORARY / KW_TEMP)? __
    KW_TABLE __
    ife:if_not_exists_stmt? __
    t:table_name __
    as:KW_AS __
    qe:select_stmt {
      if(t) tableList.add(`create::${t.db}::${t.table}`)
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'table',
          temporary: tp && tp[0].toLowerCase(),
          if_not_exists: ife,
          table: [t],
          as: 'as',
          query_expr: qe,
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
  / a:('AUTO_INCREMENT'i / 'AUTOINCREMENT'i) {
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
  / kc:KW_CONSTRAINT __ n:ident_without_kw_type {
    return { constraint: { keyword: kc.toLowerCase(), constraint: n } }
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
  / ck:check_constraint_definition {
    return { check: ck }
  }
  / t:create_option_character_set_kw __ s:KW_ASSIGIN_EQUAL? __ v:ident_without_kw_type {
    return { character_set: { type: t, value: v, symbol: s }}
  }
  / g:generated {
    return { generated: g }
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
  = c:column_without_kw __
    d:data_type? __
    cdo:column_definition_opt_list? {
      columnList.add(`create::${c.table}::${c.value || c}`)
      return {
        column: {
          type: 'column_ref',
          table: null,
          column: c
        },
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
generated_always
  = ga:('GENERATED'i __ 'ALWAYS'i) {
    return ga.join('').toLowerCase()
  }

generated
  = gn:(generated_always? __ 'AS'i) __ LPAREN __ expr:(literal / expr) __ RPAREN __ st:('STORED'i / 'VIRTUAL'i)* {
      return {
        type: 'generated',
        expr: expr,
        value: gn.filter(s => typeof s === 'string').join(' ').toLowerCase(),
        storage_type: st && st[0] && st[0].toLowerCase()
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
drop_index_opt
  = head:(ALTER_ALGORITHM / ALTER_LOCK) tail:(__ (ALTER_ALGORITHM / ALTER_LOCK))* {
    return createList(head, tail, 1)
  }
drop_stmt
  = a:KW_DROP __
    r:KW_TABLE __
    ife:if_exists? __
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

alter_column_suffix
  = k:"first"i {
      return { keyword: k };
    }
  / k:"after"i __ i:column_ref {
      return { keyword: k, expr: i };
    }

alter_action_list
  = head:alter_action tail:(__ COMMA __ alter_action)* {
      return createList(head, tail);
    }

alter_action
  = ALTER_ADD_CONSTRAINT
  / ALTER_DROP_CONSTRAINT
  / ALTER_DROP_KEY_INDEX
  / ALTER_ADD_COLUMN
  / ALTER_DROP_COLUMN
  / ALTER_MODIFY_COLUMN
  / ALTER_ADD_INDEX_OR_KEY
  / ALTER_RENAME_COLUMN
  / ALTER_RENAME_TABLE
  / ALTER_ALGORITHM
  / ALTER_LOCK
  / ALTER_CHANGE_COLUMN
  / t:table_option {
    t.resource = t.keyword
    t[t.keyword] = t.value
    delete t.value
    return {
      type: 'alter',
      ...t,
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

ALTER_DROP_KEY_INDEX
  = KW_DROP __ 'PRIMARY'i __ KW_KEY {
    return {
        action: 'drop',
        key: '',
        keyword: 'primary key',
        resource: 'key',
        type: 'alter',
    }
  }
  / KW_DROP __ k:(('FOREIGN'i? __ KW_KEY) / (KW_INDEX)) __ c:ident {
    const resource = Array.isArray(k) ? 'key' : 'index'
    return {
        action: 'drop',
        [resource]: c,
        keyword: Array.isArray(k) ? `${[k[0], k[2]].filter(v => v).join(' ').toLowerCase()}` : k.toLowerCase(),
        resource,
        type: 'alter',
    }
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

ALTER_MODIFY_COLUMN
  = KW_MODIFY __
    kc:KW_COLUMN? __
    cd:create_column_definition __ af:alter_column_suffix? {
      return {
        action: 'modify',
        keyword: kc,
        ...cd,
        suffix: af,
        resource: 'column',
        type: 'alter',
      }
    }

ALTER_ADD_INDEX_OR_KEY
  = KW_ADD __
    id:create_index_definition {
      return {
        action: 'add',
        type: 'alter',
        ...id,
      }
    }

ALTER_RENAME_COLUMN
  = KW_RENAME __ KW_COLUMN __ c:column_ref __
  kw:(KW_TO / KW_AS)? __
  tn:column_ref {
    return {
      action: 'rename',
      type: 'alter',
      resource: 'column',
      keyword: 'column',
      old_column: c,
      prefix: kw && kw[0].toLowerCase(),
      column: tn
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

ALTER_CHANGE_COLUMN
  = 'CHANGE'i __ kc:KW_COLUMN? __ od:column_ref __ cd:create_column_definition __ af:alter_column_suffix? {
    return {
        action: 'change',
        old_column: od,
        ...cd,
        keyword: kc,
        resource: 'column',
        type: 'alter',
        suffix: af,
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

create_constraint_check
  = kc:constraint_name? __ u:'CHECK'i __ nfr:('NOT'i __ 'FOR'i __ 'REPLICATION'i __)? LPAREN __ c:or_and_expr __ RPAREN {
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

check_constraint_definition
  = kc:constraint_name? __ u:'CHECK'i __ LPAREN __ c:or_and_expr __ RPAREN __ ne:(KW_NOT? __ 'ENFORCED'i)?  {
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
  t:table_name __
  de:cte_column_definition __
  m:('MATCH FULL'i / 'MATCH PARTIAL'i / 'MATCH SIMPLE'i)? __
  od:on_reference? __
  ou:on_reference? {
    return {
        definition: de,
        table: [t],
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
      name: { name: [{ type: 'origin', value: kw }] },
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
  / 'WITHOUT'i __ 'ROWID'i {
    return {
      keyword: 'without rowid'
    }
  }
  / 'STRICT'i {
    return {
      keyword: 'strict'
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

show_grant_for
  = 'FOR'i __ n:ident __ h:(KW_VAR__PRE_AT __ ident)? __ u:show_grant_for_using? {
    return {
      user: n,
      host: h && h[2],
      role_list: u
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
  = name:(literal_string / ident_name / table_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:union_stmt __ RPAREN {
    if (typeof name === 'string') name = { type: 'default', value: name }
    if (name.table) name = { type: 'default', value: name.table }
    return { name, stmt, columns };
  }

cte_column_definition
  = LPAREN __ l:column_ref_index __ RPAREN {
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
    fu: ('FOR'i __ KW_UPDATE)? {
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
          for_update: fu && `${fu[0]} ${fu[2][0]}`,
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
      if (e.type === 'double_quote_string' || e.type === 'single_quote_string') {
        columnList.add(`select::null::${e.value}`)
      }
      return { expr: e, as: alias };
    }

alias_clause
  = KW_AS ___ i:alias_ident { return i; }
  / KW_AS? __ i:ident { return i; }

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
  / name:ident_name __ LPAREN __ l:expr_list __ RPAREN __ alias:alias_clause? {
      return {
        expr: {
          type: 'function',
          name: { name: [{ type: 'default', value: name }]},
          args: l,
        },
        as: alias,
      }
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
group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list {
    return {
      columns: e.value
    }
  }

column_ref_index
  = column_ref_list / literal_list

column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
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

update_stmt
  = KW_UPDATE    __
    t:table_ref_list __
    KW_SET       __
    l:set_list   __
    w:where_clause? __
    r:returning_stmt? __
    or:order_by_clause? __
    lc:limit_clause? {
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
          where: w,
          returning: r,
          orderby: or,
          limit: lc,
        }
      };
    }

delete_stmt
  = KW_DELETE    __
    t: table_ref_list? __
    f:from_clause __
    w:where_clause? __
    r:returning_stmt? __
    or:order_by_clause? __
    l:limit_clause? {
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
          returning: r,
          orderby: or,
          limit: l,
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
    KW_INTO?                 __
    t:table_name  __
    p:insert_partition? __ LPAREN __ c:column_list  __ RPAREN __
    v:insert_value_clause __
    odp:on_duplicate_update_stmt? __
    r:returning_stmt? {
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
          ...ri,
          table: [t],
          columns: c,
          values: v,
          partition: p,
          on_duplicate_update: odp,
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
    odp: on_duplicate_update_stmt? __
    r:returning_stmt? {
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
          ...ri,
          table: [t],
          columns: null,
          values: v,
          partition: p,
          prefix,
          on_duplicate_update: odp,
          returning: r,
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
          ...ri,
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
  = KW_INSERT tail:(__ KW_OR __ ('ABORT'i / 'FAIL'i / 'IGNORE'i / 'REPLACE'i / 'ROLLBACK'i))? {
    const result = {
      type: 'insert',
    }
    if (!tail || tail.length === 0) {
      return result;
    }
    result.or = [
      {
        type: 'origin',
        value: 'or',
      },
      {
        type: 'origin',
        value: tail[3],
      }
    ]
    return result
  }
  / KW_REPLACE  {
    return { type: 'replace' }
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
  = op:additive_operator tail: (__ primary)+ {
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
  / regexp_op_right

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

regexp_op
  = n: KW_NOT? __ k:(KW_REGEXP / KW_RLIKE) {
    return n ? `${n} ${k}` : k
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
  = nk:(KW_NOT __ KW_IN) { return nk[0] + ' ' + nk[2]; }
  / KW_IN

regexp_op_right
  = op:regexp_op __ b:'BINARY'i? __ e:(func_call / literal_string / column_ref) {
    return  { op: b ? `${op} ${b}` :  op, right: e };
  }
  / 'glob'i __ e:literal_string {
    return { op: 'GLOB', right: e }
  }

like_op_right
  = op:like_op __ right:(comparison_expr / literal) __ es:escape_op? {
      if (es) right.escape = es
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
  = head: multiplicative_expr
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
    tail:(__  (multiplicative_operator / LOGIC_OPERATOR)  __ unary_expr_or_primary)* {
      return createBinaryExprChain(head, tail)
    }

multiplicative_operator
  = "*" / "/" / "%" / "||" / '&' / '>>' / '<<' / '^' / '|'

primary
  = cast_expr
  / literal
  / interval_expr
  / aggr_func
  / func_call
  / case_expr
  / column_ref
  / param
  / LPAREN __ list:or_and_where_expr __ RPAREN {
        list.parentheses = true;
        return list;
    }
  / var_decl
  / __ prepared_symbol:'?' {
    return {
      type: 'origin',
      value: prepared_symbol
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

// quoted_ident_type, quoted_ident, double_quoted_ident, single_quoted_ident, backticks_quoted_ident
// are imported from common/identifier/quoted.pegjs
@import 'common/identifier/quoted.pegjs'

// column_without_kw, column, column_name, ident_name, param
// are imported from common/identifier/column.pegjs
@import 'common/identifier/column.pegjs'

// ident_start, ident_part, column_part are defined at the end of this file

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
  = name:(KW_COUNT / KW_GROUP_CONCAT) __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
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


// SQLite specific: literal has BINARY prefix and collate support
literal
  = b:'BINARY'i? __ s:literal_string ca:(__ collate_expr)? {
    if (b) s.prefix = b.toLowerCase()
    if (ca) s.suffix = { collate: ca[1] }
    return s
  }
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

// SQLite specific: number and frac have special handling for optional digits
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
    const fixed = frac.length >= 1 ? frac.length - 1 : 0
    return parseFloat(numStr).toFixed(fixed);
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
  = "." digits:digits? {
    if (!digits) return ''
    return "." + digits;
  }

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

// Identifier patterns (SQLite without unicode support)
ident_start = [A-Za-z_]
ident_part  = [A-Za-z0-9_]
column_part = [A-Za-z0-9_:\u4e00-\u9fa5\u00C0-\u017F]
line_terminator = [\n\r]

// SQLite specific: LOGIC_OPERATOR without XOR
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND

// Import common modules
@import 'common/keyword/core.pegjs'
@import 'common/symbol.pegjs'
@import 'common/comment.pegjs'
@import 'common/datatype/character.pegjs'

@import 'common/datatype/size.pegjs'
@import 'common/datatype/json.pegjs'
@import 'common/datatype/text.pegjs'
@import 'common/clause/core.pegjs'
@import 'common/expression/case.pegjs'
@import 'common/value/core.pegjs'

// SQLite specific: interval_unit
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

// Basic data type rules are imported from common/datatype/basic-real.pegjs
// SQLite-specific extensions below

data_type
  = character_string_type
  / numeric_type
  / datetime_type
  / json_type
  / text_type
  / enum_type
  / boolean_type
  / blob_type

@import 'common/keyword/signedness.pegjs'
@import 'common/datatype/boolean.pegjs'
@import 'common/datatype/blob.pegjs'
@import 'common/datatype/datetime.pegjs'
@import 'common/datatype/numeric.pegjs'
@import 'common/datatype/enum.pegjs'
