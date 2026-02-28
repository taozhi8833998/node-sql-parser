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
    'BOOLEAN': true,

    'CALL': true,
    'CASCADE': true,
    'CASE': true,
    'CREATE': true,
    'CONTAINS': true,
    'CROSS': true,
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
    'FOR': true,
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

    'JOIN': true,
    'JSON': true,

    'KEY': true,

    'LATERAL': true,
    'LEFT': true,
    'LIKE': true,
    'LIMIT': true,
    'LOW_PRIORITY': true, // for lock table

    'NATURAL': true,
    'MINUS': true,
    'NOT': true,
    'NULL': true,

    'ON': true,
    'OR': true,
    'ORDER': true,
    'OUTER': true,

    'RECURSIVE': true,
    'RENAME': true,
    // 'REPLACE': true,
    'RIGHT': true,
    'READ': true, // for lock table
    'RETURNING': true,

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

  const reservedFunctionName = {
    avg: true,
    sum: true,
    count: true,
    max: true,
    min: true,
    group_concat: true,
    std: true,
    variance: true,
    current_date: true,
    current_time: true,
    current_timestamp: true,
    current_user: true,
    user: true,
    session_user: true,
    system_user: true
  }

  // Import common initializer functions and variables
  @import 'common/initializer/functions.pegjs'
  @import 'common/initializer/variables.pegjs'
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
  / unlock_stmt
  / show_stmt
  / desc_stmt
  / grant_stmt
  / explain_stmt
  / transaction_stmt
  / load_data_stmt

create_stmt
  = create_table_stmt
  / create_trigger_stmt
  / create_index_stmt
  / create_db_stmt
  / create_view_stmt
  / create_user_stmt

alter_stmt
  = alter_table_stmt

crud_stmt
  = set_op_stmt
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
  = KW_UNION __ s:(KW_ALL / KW_DISTINCT)? {
    return s ? `union ${s.toLowerCase()}` : 'union'
  }
  / KW_MINUS { return 'minus' }
  / KW_INTERSECT { return 'intersect' }
  / KW_EXCEPT { return 'except' }

set_op_stmt
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
  = c:expr __ o:(KW_ASC / KW_DESC)? {
    return {
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

auth_option
  = 'IDENTIFIED' __ ap:('WITH'i __ ident)? __ 'BY'i __ 'RANDOM'i __ 'PASSWORD'i {
    const value = {
      prefix: 'by',
      type: 'origin',
      value: 'random password',
    }
    return {
      keyword: ['identified', ap && ap[0].toLowerCase()].filter(v => v).join(' '),
      auth_plugin: ap && ap[2],
      value
    }
  }
  / 'IDENTIFIED' __ ap:('WITH'i __ ident)? __ 'BY'i __ v:literal_string {
    v.prefix = 'by'
    return {
      keyword: ['identified', ap && ap[0].toLowerCase()].filter(v => v).join(' '),
      auth_plugin: ap && ap[2],
      value: v
    }
  }
  / 'IDENTIFIED' __ 'WITH'i __ ap:ident __ 'AS'i __ v:literal_string {
    v.prefix = 'as'
    return {
      keyword: 'identified with',
      auth_plugin: ap && ap[2],
      value: v
    }
  }
user_auth_option
  = u:user_or_role __ ap:(auth_option)? {
    return {
      user: u,
      auth_option: ap
    }
  }
user_auth_option_list
  = head:user_auth_option tail:(__ COMMA __ user_auth_option)* {
      return createList(head, tail)
    }
default_role
  = KW_DEFAULT __ 'role'i __ r:user_or_role_list {
    return {
      keyword: 'default role',
      value: r
    }
  }
tls_option
  = v:('NONE'i / 'SSL'i / 'X509'i) {
    return{
        type: 'origin',
        value: v
    }
  }
  / k:('CIPHER'i  / 'ISSUER'i / 'SUBJECT'i) __ v:literal_string {
    v.prefix = k.toLowerCase()
    return v
  }
tls_option_list
  = head:tls_option tail:(__ KW_AND __ tls_option)* {
    return createBinaryExprChain(head, tail)
  }
require_options
  = 'REQUIRE'i __ t:tls_option_list {
    return {
      keyword: 'require',
      value: t
    }
  }

resource_option
  = k:('MAX_QUERIES_PER_HOUR'i / 'MAX_UPDATES_PER_HOUR'i / 'MAX_CONNECTIONS_PER_HOUR'i / 'MAX_USER_CONNECTIONS'i) __ v:literal_numeric {
    v.prefix = k.toLowerCase()
    return v
  }
with_resource_option
  = KW_WITH __ r:resource_option t:(__ resource_option)* {
    const resourceOptions = [r]
    if (t) {
      for (const item of t) {
        resourceOptions.push(item[1])
      }
    }
    return {
      keyword: 'with',
      value: resourceOptions
    }
  }
password_option
  = 'PASSWORD'i __ 'EXPIRE'i __ v:('DEFAULT'i / 'NEVER'i / interval_expr) {
    return {
      keyword: 'password expire',
      value: typeof v === 'string' ? { type: 'origin', value: v } : v
    }
  }
  / 'PASSWORD'i __ 'HISTORY'i __ v:('DEFAULT'i / literal_numeric) {
    return {
      keyword: 'password history',
      value:  typeof v === 'string' ? { type: 'origin', value: v } : v
    }
  }
  / 'PASSWORD'i __ 'REUSE' __ v:interval_expr {
    return {
      keyword: 'password reuse',
      value: v
    }
  }
  / 'PASSWORD'i __ 'REQUIRE'i __ 'CURRENT'i __ v:('DEFAULT'i / 'OPTIONAL'i) {
    return {
      keyword: 'password require current',
      value: { type: 'origin', value: v }
    }
  }
  / 'FAILED_LOGIN_ATTEMPTS'i __ v:literal_numeric {
    return {
      keyword: 'failed_login_attempts',
      value: v
    }
  }
  / 'PASSWORD_LOCK_TIME'i __ v:(literal_numeric / 'UNBOUNDED'i) {
    return {
      keyword: 'password_lock_time',
      value: typeof v === 'string' ? { type: 'origin', value: v } : v
    }
  }

password_option_list
  = head:password_option tail:(__ password_option)* {
      return createList(head, tail, 1)
    }
user_lock_option
  = 'ACCOUNT'i __ v:('LOCK'i / 'UNLOCK'i) {
    const value = {
      type: 'origin',
      value: v.toLowerCase()
    }
    value.prefix = 'account'
    return value
  }
attribute
  = 'ATTRIBUTE'i __ v:literal_string {
    v.prefix = 'attribute'
    return v
  }
create_user_stmt
  = a:KW_CREATE __ k:KW_USER __ ife:if_not_exists_stmt? __ t:user_auth_option_list __
  d:default_role? __ r:require_options? __ wr:with_resource_option? __ p:password_option_list? __
  l:user_lock_option? __ c:keyword_comment? __ attr:attribute? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: a[0].toLowerCase(),
        keyword: 'user',
        if_not_exists: ife,
        user: t,
        default_role: d,
        require: r,
        resource_options: wr,
        password_options: p,
        lock_option: l,
        comment: c,
        attribute: attr
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
  = a:KW_CREATE __
  or:(KW_OR __ KW_REPLACE)? __
  al:("ALGORITHM"i __ KW_ASSIGIN_EQUAL __ ("UNDEFINED"i / "MERGE"i / "TEMPTABLE"i))? __
  df:trigger_definer? __
  ss:("SQL"i __ "SECURITY"i __ ("DEFINER"i / "INVOKER"i))? __
  KW_VIEW __ v:table_name __ c:(LPAREN __ column_list __ RPAREN)? __
  KW_AS __ s:select_stmt_nake __
  w:view_with? {
    v.view = v.table
    delete v.table
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: a[0].toLowerCase(),
        keyword: 'view',
        replace: or && 'or replace',
        algorithm: al && al[4],
        definer: df,
        sql_security: ss && ss[4],
        columns: c && c[2],
        select: s,
        view: v,
        with: w,
      }
    }
  }

create_index_stmt
  = a:KW_CREATE __
  kw:(KW_UNIQUE / KW_FULLTEXT / KW_SPATIAL)? __
  t:KW_INDEX __
  n:ident __
  um:index_type? __
  on:KW_ON __
  ta:table_name __
  LPAREN __ cols:column_order_list __ RPAREN __
  io:index_options? __
  al:ALTER_ALGORITHM? __
  lo:ALTER_LOCK? __ {
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
          index_using: um,
          index_options: io,
          algorithm_option: al,
          lock_option: lo,
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
    qe: set_op_stmt? {
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
  / ck:check_constraint_definition {
    return { check: ck }
  }
  / t:create_option_character_set_kw __ s:KW_ASSIGIN_EQUAL? __ v:ident_without_kw_type {
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
    g:generated? __
    cdo:column_definition_opt_list? {
      columnList.add(`create::${c.table}::${c.column}`)
      return {
        column: c,
        definition: d,
        generated: g,
        resource: 'column',
        ...(cdo || {})
      }
    }

trigger_definer
  =  'DEFINER'i __ KW_ASSIGIN_EQUAL __ u:(backticks_quoted_ident / literal_string) __ '@' __ h:(backticks_quoted_ident / literal_string) {
    const left = { type: 'origin', value: 'definer' }
    const operator = '='
    const right = createBinaryExpr(u, '@', h)
    return createBinaryExpr(operator, left, right)
  }
  / 'DEFINER'i __ KW_ASSIGIN_EQUAL __ KW_CURRENT_USER __ LPAREN __ RPAREN {
    const left = { type: 'origin', value: 'definer' }
    const operator = '='
    const right = {
      type: 'function',
      name: { name: [{ type: 'default', value: 'current_user' }] },
      args:{ type: 'expr_list', value: [] },
    }
    return createBinaryExpr(operator, left, right)
  }
  / 'DEFINER'i __ KW_ASSIGIN_EQUAL __ KW_CURRENT_USER  {
    const left = { type: 'origin', value: 'definer' }
    const operator = '='
    const right = {
      type: 'function',
      name: { name: [{ type: 'default', value: 'current_user' }] },
      args:{ type: 'expr_list', value: [] },
    }
    return createBinaryExpr(operator, left, right)
  }
trigger_time
  = 'BEFORE'i /  'AFTER'i
trigger_event
  = kw:(KW_INSERT / KW_UPDATE / KW_DELETE) {
    return {
      keyword: kw[0].toLowerCase(),
    }
  }
trigger_for_row
  = kw:'FOR'i __ e:('EACH'i)? __ ob:('ROW'i / 'STATEMENT'i) {
    return {
      keyword: e ? `${kw.toLowerCase()} ${e.toLowerCase()}` : kw.toLowerCase(),
      args: ob.toLowerCase()
    }
  }
trigger_order
  = f:('FOLLOWS'i / 'PRECEDES'i) __ t:ident_name {
    return {
      keyword: f,
      trigger: t
    }
  }
trigger_body
  = KW_SET __ s:set_list {
    return {
      type: 'set',
      expr: s
    }
  }

create_trigger_stmt
  = a:KW_CREATE __
    df:trigger_definer? __
    KW_TRIGGER __
    ife:if_not_exists_stmt? __
    t:table_name __
    tt:trigger_time __
    te:trigger_event __
    KW_ON __ tb:table_name __ fe:trigger_for_row __
    tr:trigger_order? __
    tbo:trigger_body {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          definer: df,
          keyword: 'trigger',
          for_each: fe,
          if_not_exists: ife,
          trigger: t,
          time: tt,
          events: [te],
          order: tr,
          table: tb,
          execute: tbo,
        }
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
    r:KW_VIEW __
    ife:if_exists? __
    t:table_ref_list __
    op:view_options? {
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
    r:(KW_DATABASE / KW_SCHEMA) __
    ife:if_exists? __
    t:ident_name {
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
    r:KW_TRIGGER __
    ife:if_exists? __
    t:table_base {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a.toLowerCase(),
          keyword: r.toLowerCase(),
          prefix: ife,
          name: [{
            schema: t.db,
            trigger: t.table
          }]
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
    t:table_name __
    e:alter_action_list {
      tableList.add(`alter::${t.db}::${t.table}`)
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'alter',
          table: [t],
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
  = ALTER_ADD_COLUMN
  / ALTER_DROP_KEY_INDEX
  / ALTER_DROP_COLUMN
  / ALTER_MODIFY_COLUMN
  / ALTER_ADD_INDEX_OR_KEY
  / ALTER_ADD_FULLETXT_SPARITAL_INDEX
  / ALTER_RENAME_COLUMN
  / ALTER_RENAME_TABLE
  / ALTER_ALGORITHM
  / ALTER_LOCK
  / ALTER_CHANGE_COLUMN
  / ALTER_OPERATE_PARTITION
  / t:table_option {
    t.resource = t.keyword
    t[t.keyword] = t.value
    delete t.value
    return {
      type: 'alter',
      ...t,
    }
  }

alter_table_add_partition
  = KW_PARTITION __ n:ident_without_kw_type __ KW_VALUES __ 'LESS'i __ 'THAN'i __ LPAREN __ v:literal_numeric __ RPAREN {
    return {
      name: n,
      value: {
        type: 'less than',
        expr: v,
        parentheses: true,
      }
    }
  }

alter_table_add_partition_list
  = head:alter_table_add_partition tail:(__ COMMA __ alter_table_add_partition)* {
    return createList(head, tail)
  }
ALTER_OPERATE_PARTITION
  = a:('DROP'i / 'TRUNCATE'i / 'DISCARD'i / 'IMPORT'i / 'COALESCE'i / 'ANALYZE'i / 'CHECK'i) __ kc:KW_PARTITION __ t:column_clause __ ts:'TABLESPACE'i? {
      const expr = {
        action: a.toLowerCase(),
        keyword: kc,
        resource: 'partition',
        type: 'alter',
        partitions: t,
      }
      if (ts) expr.suffix = {
        keyword: ts,
      }
      return expr
    }
  / KW_ADD __ kc:KW_PARTITION __ LPAREN __ e:alter_table_add_partition_list  __ RPAREN {
    const expr = {
        action: 'add',
        keyword: kc,
        resource: 'partition',
        type: 'alter',
        partitions: e,
      }
      return expr
  }

ALTER_ADD_COLUMN
  = KW_ADD __
    kc:KW_COLUMN? __
    ife:if_not_exists_stmt? __
    cd:create_column_definition __ af:alter_column_suffix? {
      return {
        action: 'add',
        ...cd,
        suffix: af,
        keyword: kc,
        if_not_exists:ife,
        resource: 'column',
        type: 'alter',
      }
    }
  / KW_ADD __
    cd:create_column_definition __ af:alter_column_suffix? {
      return {
        action: 'add',
        ...cd,
        suffix: af,
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

ALTER_DROP_COLUMN
  = KW_DROP __ kc:KW_COLUMN __ c:column_ref {
      return {
        action: 'drop',
        column: c,
        keyword: kc,
        resource: 'column',
        type: 'alter',
      }
    }
  / KW_DROP __ c:column_ref {
      return {
        action: 'drop',
        column: c,
        resource: 'column',
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

ALTER_ADD_INDEX_OR_KEY
  = KW_ADD __ id:create_index_definition {
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
column_idx_ref
  = col:column_without_kw __ LPAREN __ l:[0-9]+ __ RPAREN __ ob:(KW_ASC / KW_DESC)? {
      return {
        type: 'column_ref',
        column: col,
        suffix: `(${parseInt(l.join(''), 10)})`,
        order_by: ob
      };
    }
  / col:column_without_kw __ ob:(KW_ASC / KW_DESC)? {
      return {
        type: 'column_ref',
        column: col,
        order_by: ob
      };
    }

column_ref_idx_list
  = head:column_idx_ref tail:(__ COMMA __ column_idx_ref)* {
      return createList(head, tail);
    }

cte_idx_column_definition
  = LPAREN __ l:(column_ref_idx_list / expr_list) __ RPAREN {
      if (l.type) return l.value
      return l
    }

create_index_definition
  = kc:(KW_INDEX / KW_KEY) __
    c:column? __
    t:index_type? __
    de:cte_idx_column_definition __
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
    id: index_options? __ {
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
  de:cte_idx_column_definition __
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
  de:cte_idx_column_definition __
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
  t:table_ref_list __
  de:cte_column_definition __
  m:('MATCH FULL'i / 'MATCH PARTIAL'i / 'MATCH SIMPLE'i)? __
  od: on_reference? __
  ou: on_reference? {
    return {
        definition: de,
        table: t,
        keyword: kc.toLowerCase(),
        match:m && m.toLowerCase(),
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
view_options
  = kc:('RESTRICT'i / 'CASCADE'i) {
    return kc.toLowerCase()
  }

reference_option
  = kw:KW_CURRENT_TIMESTAMP __ LPAREN __ l:expr_list? __ RPAREN {
    return {
      type: 'function',
      name: { name: [{ type: 'origin', value: kw }]},
      args: l
    }
  }
  / kc:(view_options / 'SET NULL'i / 'NO ACTION'i / 'SET DEFAULT'i / KW_CURRENT_TIMESTAMP) {
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
  / kw:('CHECKSUM' / 'DELAY_KEY_WRITE') __  s:(KW_ASSIGIN_EQUAL) __ v:[01] {
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: v
    }
  }
  / kw:(KW_COMMENT / 'CONNECTION'i / 'ENGINE_ATTRIBUTE'i / 'SECONDARY_ENGINE_ATTRIBUTE'i ) __ s:(KW_ASSIGIN_EQUAL)? __ c:literal_string {
    return {
      keyword: kw.toLowerCase(),
      symbol: s,
      value: `'${c.value}'`
    }
  }
  / type:('DATA'i / 'INDEX'i) __ 'DIRECTORY'i __ s:(KW_ASSIGIN_EQUAL)? __ c:literal_string {
    return {
      keyword: type.toLowerCase() + " directory",
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
  / kw:'ROW_FORMAT'i __ s:(KW_ASSIGIN_EQUAL)? __ c:('DEFAULT'i / 'DYNAMIC'i / 'FIXED'i / 'COMPRESSED'i / 'REDUNDANT'i / 'COMPACT'i) {
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
  / KW_SHOW __ KW_TABLES {
    tableList.add(`show::null::null`)
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        keyword: 'tables'
      }
    }
  }
  / KW_SHOW __ keyword:('TRIGGERS'i / 'STATUS'i / 'PROCESSLIST'i) {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        keyword: keyword.toLowerCase()
      }
    }
  }
  / KW_SHOW __ keyword:('PROCEDURE'i / 'FUNCTION'i) __ 'STATUS'i {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'show',
        keyword: keyword.toLowerCase(),
        suffix: 'status',
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
  / KW_SHOW __ k:(('CHARACTER'i __ 'SET'i) / 'COLLATION'i / 'DATABASES'i) __ e:(like_op_right / where_clause)? {
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
  / KW_SHOW __ keyword:('COLUMNS'i / 'INDEXES'i / "INDEX"i) __ from:from_clause {
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'show',
          keyword: keyword.toLowerCase(),
          from
        }
      };
  }
  / KW_SHOW __ KW_CREATE __ k:(KW_VIEW / KW_TABLE / 'EVENT'i / KW_TRIGGER / 'PROCEDURE'i) __ t:table_name {
    const suffix = k.toLowerCase()
    return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: 'show',
          keyword: 'create',
          suffix,
          [suffix]: t
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

explain_stmt
  = KW_EXPLAIN __ t:select_stmt_nake {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'explain',
        expr: t
      }
    }
  }

transaction_mode_isolation_level
  = 'SERIALIZABLE'i {
    return {
      type: 'origin',
      value: 'serializable'
    }
  }
  / 'REPEATABLE'i __ 'READ'i {
    return {
      type: 'origin',
      value: 'repeatable read'
    }
  }
  / 'READ'i __ e:('COMMITTED'i / 'UNCOMMITTED'i) {
    return {
      type: 'origin',
      value: `read ${e.toLowerCase()}`
    }
  }

transaction_mode
  = 'ISOLATION'i __ 'LEVEL'i __ l:transaction_mode_isolation_level {
    return {
      type: 'origin',
      value: `isolation level ${l.value}`
    }
  }
  / 'READ'i __ e:('WRITE'i / 'ONLY'i) {
    return {
      type: 'origin',
      value: `read ${e.toLowerCase()}`
    }
  }
  / n:KW_NOT? __ 'DEFERRABLE'i {
    return {
      type: 'origin',
      value: n ? 'not deferrable' : 'deferrable'
    }
  }

transaction_mode_list
  = head: transaction_mode tail:(__ COMMA __ transaction_mode)* {
    return createList(head, tail)
  }
transaction_stmt
  = k:('commit'i / 'rollback'i) {
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

load_data_field
  = k:('FIELDS'i / 'COLUMNS'i) __ t:('TERMINATED'i __ 'BY'i __ ident_without_kw_type)? __ en:(('OPTIONALLY'i)? __ 'ENCLOSED'i __ 'BY'i __ ident_without_kw_type)? __ es:('ESCAPED'i __ 'BY'i __ ident_without_kw_type)? {
    if (t) t[4].prefix = 'TERMINATED BY'
    if (en) en[6].prefix = `${en[0] && en[0].toUpperCase() === 'OPTIONALLY' ? 'OPTIONALLY ' : ''}ENCLOSED BY`
    if (es) es[4].prefix = 'ESCAPED BY'
    return {
      keyword: k,
      terminated: t && t[4],
      enclosed: en && en[6],
      escaped: es && es[4]
    }
  }

load_data_line_starting
  = k:('STARTING'i / 'TERMINATED'i) __ 'BY'i __ s:ident_without_kw_type {
    s.prefix = `${k.toUpperCase()} BY`
    return {
      type: k.toLowerCase(),
      [k.toLowerCase()]: s
    }
  }
load_data_line
  = k:'LINES'i __ s:load_data_line_starting? __ t:load_data_line_starting? {
    if (s && t && s.type === t.type) throw new Error('LINES cannot be specified twice')
    if (s) Reflect.deleteProperty(s, 'type')
    if (t) Reflect.deleteProperty(t, 'type')
    return {
      keyword: k,
      ...(s || {}),
      ...(t || {})
    }
  }

load_data_stmt
  = 'LOAD'i __ 'DATA'i __ lc:('LOW_PRIORITY'i / 'CONCURRENT'i)? __ lo:('LOCAL'i)? __
  'INFILE'i __ file:ident_without_kw_type __ ri:replace_insert? __
  'INTO'i __ 'TABLE'i __ table:table_name __
  pa:insert_partition? __
  cs:(create_option_character_set_kw __ ident_without_kw_type)? __
  fields:load_data_field? __
  lines:load_data_line? __
  ig:(KW_IGNORE __ literal_numeric __ ('LINES'i / 'ROWS'i))? __
  co:column_clause? __
  set:(KW_SET __ set_list)? {
    return {
      type: 'load_data',
      mode: lc,
      local: lo,
      file: file,
      replace_ignore: ri,
      table: table,
      partition: pa,
      character_set: cs,
      fields: fields,
      lines: lines,
      ignore: ig && {
        count: ig[2],
        suffix: ig[4]
      },
      column: co,
      set: set && set[2]
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

priv_type_table
  =  p:(KW_ALL / KW_ALTER / KW_CREATE __ 'VIEW'i / KW_CREATE / KW_DELETE / KW_DROP / 'GRANT'i __ 'OPTION'i / KW_INDEX / KW_INSERT / KW_REFERENCES / KW_SELECT / KW_SHOW __ KW_VIEW / KW_TRIGGER / KW_UPDATE) {
    return {
      type: 'origin',
      value: Array.isArray(p) ? p[0] : p
    }
  }
priv_type_routine
  = p:(KW_ALTER __ 'ROUTINE'i / 'EXECUTE'i / 'GRANT'i __ 'OPTION'i / KW_CREATE __ 'ROUTINE'i) {
    return {
      type: 'origin',
      value: Array.isArray(p) ? p[0] : p
    }
  }
priv_type
  = priv_type_table / priv_type_routine
priv_item
  = p:priv_type __ c:(LPAREN __ column_ref_list __ RPAREN)? {
    return {
      priv: p,
      columns: c && c[2],
    }
  }
priv_list
  = head:priv_item tail:(__ COMMA __ priv_item)* {
      return createList(head, tail)
    }
object_type
  = o:(KW_TABLE / 'FUNCTION'i / 'PROCEDURE'i) {
    return {
      type: 'origin',
      value: o.toUpperCase()
    }
  }
priv_level
  = prefix:((ident / STAR) __ DOT)? __ name:(ident / STAR) {
      return {
          prefix: prefix && prefix[0],
          name,
      }
    }
user_or_role
  = i:ident __ ho:('@' __ ident)? {
    return {
      name: { type: 'single_quote_string', value: i },
      host: ho ? { type: 'single_quote_string', value: ho[2] } : null
    }
  }
user_or_role_list
  = head:user_or_role tail:(__ COMMA __ user_or_role)* {
      return createList(head, tail)
    }
with_grant_option
  = KW_WITH __ 'GRANT'i __ 'OPTION'i {
    return {
      type: 'origin',
      value: 'with grant option',
    }
  }
with_admin_option
  = KW_WITH __ 'ADMIN'i __ 'OPTION'i {
    return {
      type: 'origin',
      value: 'with admin option',
    }
  }
grant_stmt
  = 'GRANT'i __ pl:priv_list __ KW_ON __ ot:object_type? __ le:priv_level __ t:KW_TO __ to:user_or_role_list __ wo:with_grant_option? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'grant',
        keyword: 'priv',
        objects: pl,
        on: {
          object_type: ot,
          priv_level: [le]
        },
        to_from: t[0],
        user_or_roles: to,
        with: wo
      }
    }
  }
  / 'GRANT' __ 'PROXY' __ KW_ON __ on:user_or_role __ t:KW_TO __ to:user_or_role_list __ wo:with_admin_option? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'grant',
        keyword: 'proxy',
        objects: [{ priv: { type: 'origin', value: 'proxy' }}],
        on,
        to_from: t[0],
        user_or_roles: to,
        with: wo
      }
    }
  }
  / 'GRANT' __ o:ident_list __ t:KW_TO __ to:user_or_role_list __ wo:with_admin_option? {
    return {
      tableList: Array.from(tableList),
      columnList: columnListTableAlias(columnList),
      ast: {
        type: 'grant',
        keyword: 'role',
        objects: o.map(name => ({ priv: { type: 'string', value: name }})),
        to_from: t[0],
        user_or_roles: to,
        with: wo
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
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition tail:(__ COMMA __ cte_definition)* {
      cte.recursive = true;
      return createList(cte, tail);
    }

cte_definition
  = name:(literal_string / ident_name / table_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:(value_clause / set_op_stmt) __ RPAREN {
    if (typeof name === 'string') name = { type: 'default', value: name }
    if (name.table) name = { type: 'default', value: name.table }
    return { name, stmt, columns };
  }

cte_column_definition
  = LPAREN __ l:column_ref_index __ RPAREN {
      return l
    }

for_update
  = fu:('FOR'i __ KW_UPDATE) {
    return `${fu[0]} ${fu[2][0]}`
  }

lock_in_share_mode
  = m:('LOCK'i __ 'IN'i __ 'SHARE'i __ 'MODE'i) {
    return `${m[0]} ${m[2]} ${m[4]} ${m[6]}`
  }

lock_option
  = w:('WAIT'i __ literal_numeric) { return `${w[0]} ${w[2].value}` }
  / nw:'NOWAIT'i
  / sl:('SKIP'i __ 'LOCKED'i) { return `${sl[0]} ${sl[2]}` }

locking_read
  = t:(for_update / lock_in_share_mode) __ lo:lock_option? {
    return t + (lo ? ` ${lo}` : '')
  }

select_stmt_nake
  = __ cte:with_clause? __ KW_SELECT __
    opts:option_clause? __
    d:KW_DISTINCT?      __
    c:column_clause     __
    ci:into_clause?      __
    f:from_clause?      __
    fi:into_clause?      __
    w:where_clause?     __
    g:group_by_clause?  __
    h:having_clause?    __
    o:order_by_clause?  __
    ce:collate_expr? __
    l:limit_clause? __
    lr: locking_read? __
    win:window_clause? __
    li:into_clause?  {
      if ((ci && fi) || (ci && li) || (fi && li) || (ci && fi && li)) {
        throw new Error('A given SQL statement can contain at most one INTO clause')
      }
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
          into: {
            ...(ci || fi || li || {}),
            position: ci && 'column' || fi && 'from' || li && 'end'
          },
          from: f,
          where: w,
          groupby: g,
          having: h,
          orderby: o,
          collate: ce,
          limit: l,
          locking_read: lr && lr,
          window: win,
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

fulltext_search_mode
  = KW_IN __ 'NATURAL'i __ 'LANGUAGE'i __ 'MODE'i __ 'WITH'i __ 'QUERY'i __ 'EXPANSION'i  {
    return { type: 'origin', value: 'IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION' }
  }
  / KW_IN __ 'NATURAL'i __ 'LANGUAGE'i __ 'MODE'i {
    return { type: 'origin', value: 'IN NATURAL LANGUAGE MODE' }
  }
  / KW_IN __ 'BOOLEAN'i __ 'MODE'i {
    return { type: 'origin', value: 'IN BOOLEAN MODE' }
  }
  / KW_WITH __ 'QUERY'i __ 'EXPANSION'i {
    return { type: 'origin', value: 'WITH QUERY EXPANSION' }
  }

fulltext_search
  = 'MATCH'i __ LPAREN __ c:column_ref_list __ RPAREN __ 'AGAINST' __ LPAREN __ e:expr __ mo:fulltext_search_mode? __ RPAREN __ as:alias_clause? {
    const expr = {
      against: 'against',
      columns: c,
      expr: e,
      match: 'match',
      mode: mo,
      type: 'fulltext_search',
      as,
    }
    return expr
  }

column_list_item
  = fs:fulltext_search {
    const { as, ...expr } = fs
    return { expr, as }
  }
  / db:ident __ DOT __ table:ident __ DOT __ STAR {
      columnList.add(`select::${db}::${table}::(.*)`);
      return {
        expr: {
          type: 'column_ref',
          db: db,
          table: table,
          column: '*'
        },
        as: null
      };
    }
  / table:(ident __ DOT)? __ STAR {
      columnList.add(`select::${table}::(.*)`);
      return {
        expr: {
          type: 'column_ref',
          table: table && table[0] || null,
          column: '*'
        },
        as: null
      };
    }
  / a:select_assign_stmt __ alias:alias_clause? {
    return { expr: a, as: alias }
  }
  / e:binary_column_expr __ alias:alias_clause? {
      if (e.type === 'double_quote_string' || e.type === 'single_quote_string') {
        columnList.add(`select::null::${e.value}`)
      }
      return { expr: e, as: alias };
    }

alias_clause
  = KW_AS __ i:alias_ident { return i; }
  / KW_AS? __ i:ident { return i; }

into_clause
  = KW_INTO __ v:var_decl_list {
    return {
      keyword: 'var',
      type: 'into',
      expr: v
    }
  }
  / KW_INTO __ k:('OUTFILE'i / 'DUMPFILE'i)? __ f:(literal_string / ident) {
    return {
      keyword: k,
      type: 'into',
      expr: f
    }
  }

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
  = head:table_base tail:table_ref* {
      tail.unshift(head);
      tail.forEach(tableInfo => {
        const { table, as } = tableInfo
        tableAlias[table] = table
        if (as) tableAlias[as] = table
        refreshColumnList(columnList)
      })
      return tail;
    }
  / lp:LPAREN+ __ head:table_base tail:table_ref* __ rp:RPAREN+ __ jt:table_ref* {
      if (lp.length !== rp.length) throw new Error(`parentheses not match in from clause: ${lp.length} != ${rp.length}`)
      tail.unshift(head);
      tail.forEach(tableInfo => {
        const { table, as } = tableInfo
        tableAlias[table] = table
        if (as) tableAlias[as] = table
        refreshColumnList(columnList)
      })
      jt.forEach(tableInfo => {
        const { table, as } = tableInfo
        tableAlias[table] = table
        if (as) tableAlias[as] = table
        refreshColumnList(columnList)
      })
      return {
        expr: tail,
        parentheses: {
          length: rp.length
        },
        joins: jt
      }
    }

table_ref
  = __ COMMA __ t:table_base { return t; }
  / __ t:table_join { return t; }


table_join
  = op:join_op __ t:(table_base / table_ref_list) __ KW_USING __ LPAREN __ head:ident_without_kw_type tail:(__ COMMA __ ident_without_kw_type)* __ RPAREN {
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:(table_base / table_ref_list) __ expr:on_clause? {
      t.join = op;
      t.on   = expr;
      return t;
    }
  / op:(join_op / set_op) __ LPAREN __ stmt:set_op_stmt __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
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
  / LPAREN __ t:table_name __ alias:alias_clause? __ r:RPAREN {
    const parentheses =  true
      if (t.type === 'var') {
        t.as = alias;
        t.parentheses = parentheses
        return t;
      }
      return {
        db: t.db,
        table: t.table,
        as: alias,
        parentheses,
      };
    }
  / stmt:value_clause __ alias:alias_clause? {
    return {
      expr: stmt,
      as: alias
    };
  }
  / l:('LATERAL'i)? __ LPAREN __ stmt:(set_op_stmt / value_clause) __ RPAREN __ alias:alias_clause? {
      stmt.parentheses = true;
      const result = {
        expr: stmt,
        as: alias
      }
      if (l) result.prefix = l;
      return result
    }

join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { return 'FULL JOIN'; }
  / KW_CROSS __ KW_JOIN { return 'CROSS JOIN'; }
  / (KW_INNER __)? KW_JOIN { return 'INNER JOIN'; }

table_name
  = prefix:[_0-9]+ part:ident_without_kw tail:(__ DOT __ ident_without_kw)? {
      const dt = `${prefix.join('')}${part}`
      const obj = { db: null, table: dt }
      if (tail !== null) {
        obj.db = dt
        obj.table = tail[3]
      }
      return obj
    }
  / part:ident tail:(__ DOT __ ident_without_kw)? {
      const obj = { db: null, table: part }
      if (tail !== null) {
        obj.db = part
        obj.table = tail[3]
      }
      return obj
    }
  / v:var_decl {
      v.db = null;
      v.table = v.name;
      return v;
    }

on_clause
  = KW_ON __ e:or_and_expr { return e; }

where_clause
  = KW_WHERE __ e:or_and_where_expr {
    return e;
  }

with_rollup
  = KW_WITH __ 'ROLLUP'i {
    return {
      type: 'origin',
      value: 'with rollup'
    }
  }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list __ wr:with_rollup? {
    return {
      columns: e.value,
      modifiers: [wr],
    }
  }

column_ref_index
  = column_ref_list / literal_list

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
  / '?' {
    return {
      type: 'origin',
      value: '?'
    }
  }

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
  = __ cte:with_clause? __ KW_DELETE    __
    t:table_ref_list? __
    f:from_clause __
    w:where_clause? __
    r:returning_stmt? {
      if(f) {
        const tables = Array.isArray(f) ? f : f.expr
        tables.forEach(tableInfo => {
          const { db, as, table, join } = tableInfo
          const action = join ? 'select' : 'delete'
          if (table) tableList.add(`${action}::${db}::${table}`)
          if (!join) columnList.add(`delete::${table}::(.*)`);
        })
      }
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
          with: cte,
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
    return {
      type: k && k.toLowerCase() || 'returning',
      columns: c === '*' && [{ type: 'expr', expr: { type: 'column_ref', table: null, column: '*' }, as: null }] || c
    }
  }

insert_value_clause
  = value_clause
  / u:set_op_stmt {
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
    ig:KW_IGNORE? __
    it:KW_INTO?                 __
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
      let prefix = [ig, it].filter(v => v).map(v => v[0] && v[0].toLowerCase()).join(' ')
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: ri,
          table: [t],
          columns: c,
          values: v,
          partition: p,
          prefix,
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
    odp:on_duplicate_update_stmt? __
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
          type: ri,
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
    ig:KW_IGNORE? __
    it:KW_INTO? __
    t:table_name  __
    p:insert_partition? __
    KW_SET       __
    l:set_list   __
    odp:on_duplicate_update_stmt? __
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
          type: ri,
          table: [t],
          columns: null,
          partition: p,
          prefix,
          set: l,
          on_duplicate_update: odp,
          returning: r,
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
  = KW_VALUES __ l:value_list  { return { type: 'values', values: l } }

value_list
  = head:value_item tail:(__ COMMA __ value_item)* {
      return createList(head, tail);
    }

value_item
  = r:'ROW'i? __ LPAREN __ l:expr_list  __ RPAREN {
      l.prefix = r && r.toLowerCase();
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
  = or_expr / set_op_stmt


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

or_and_expr
	= head:expr tail:(__ (KW_AND / KW_OR) __ expr)* {
    const len = tail.length
    let result = head
    for (let i = 0; i < len; ++i) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3])
    }
    return result
  }

or_and_where_expr
	= head:expr tail:(__ (KW_AND / KW_OR / COMMA / LOGIC_OPERATOR) __ expr)* {
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
      el.value = Array.isArray(result) ? result : [result]
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
  / KW_NOT __ expr:not_expr {
      return createUnaryExpr('NOT', expr);
    }

comparison_expr
  = left:additive_expr __ rh:comparison_op_right? {
      if (rh === null) return left;
      else if (rh.type === 'arithmetic') {
        if (!rh.in) return createBinaryExprChain(left, rh.tail);
        const leftExpr = createBinaryExprChain(left, rh.tail);
        return createBinaryExpr(rh.in.op, leftExpr, rh.in.right);
      }
      else return createBinaryExpr(rh.op, left, rh.right);
    }
  / literal_string
  / column_ref

exists_expr
  = op:exists_op __ LPAREN __ stmt:set_op_stmt __ RPAREN {
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
  = l:(__ arithmetic_comparison_operator __ additive_expr)+ __ i:in_op_right? {
      return { type: 'arithmetic', tail: l, in: i };
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

regexp_op
  = n: KW_NOT? __ k:(KW_REGEXP / KW_RLIKE) {
    return n ? `${n} ${k}` : k
  }

like_op
  = nk:(KW_NOT __ KW_LIKE) { return nk[0] + ' ' + nk[2]; }
  / KW_LIKE

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

like_op_right
  = op:like_op __ right:(literal / param / comparison_expr) __ es:escape_op? {
    if (es) right.escape = es
    return { op: op, right: right };
  }


regexp_op_right
  = op:regexp_op __ b:'BINARY'i? __ e:(func_call / literal_string / column_ref) {
    return  { op: b ? `${op} ${b}` :  op, right: e };
  }

in_op_right
  = op:in_op __ LPAREN  __ l:expr_list __ RPAREN {
      return { op: op, right: l };
    }
  / op:in_op __ e:(var_decl / column_ref / literal_string) {
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
    tail:(__  (multiplicative_operator / LOGIC_OPERATOR)  __ unary_expr_or_primary)* {
      return createBinaryExprChain(head, tail)
    }

multiplicative_operator
  = "*" / "/" / "%" / "||"
  / k:("div"i / "mod"i) {
    return k.toUpperCase()
  }
  / '&' / '>>' / '<<' / '^' / '|'

unary_expr_or_primary
  = primary
  / op:(unary_operator) tail:(__ unary_expr_or_primary) {
    // if (op === '!') op = 'NOT'
    return createUnaryExpr(op, tail[1])
  }

unary_operator
  = '!' / '-' / '+' / '~'

primary
  = interval_expr
  / aggr_func
  / fulltext_search
  / func_call
  / cast_expr
  / case_expr
  / literal_basic
  / column_ref
  / literal_numeric
  / param
  / LPAREN __ list:or_and_where_expr __ RPAREN {
    list.parentheses = true;
    return list
  }
  / var_decl
  / __ prepared_symbol:'?' {
    return {
      type: 'origin',
      value: prepared_symbol
    }
  }

column_ref
  = db:(ident_name / backticks_quoted_ident) __ DOT __ tbl:(ident_name / backticks_quoted_ident) __ DOT __ col:column_without_kw ce:(__ collate_expr)? {
      columnList.add(`select::${db}::${tbl}::${col}`);
      return {
        type: 'column_ref',
        db: db,
        table: tbl,
        column: col,
        collate: ce && ce[1],
        ...getLocationObject(),
      }
    }
  / tbl:(ident_name / backticks_quoted_ident) __ DOT __ col:column_without_kw ce:(__ collate_expr)? {
      columnList.add(`select::${tbl}::${col}`);
      return {
        type: 'column_ref',
        table: tbl,
        column: col,
        collate: ce && ce[1],
        ...getLocationObject(),
      }
  }
  / col:column __ ce:(__ collate_expr)? {
      columnList.add(`select::null::${col}`);
      return {
        type: 'column_ref',
        table: null,
        column: col,
        collate: ce && ce[1],
        ...getLocationObject(),
      }
    }

column_list
  = head:column tail:(__ COMMA __ column)* {
      return createList(head, tail);
    }
ident_name_type
  = n:ident_name {
    return { type: 'default', value: n }
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
ident_without_kw
  = ident_name / quoted_ident
ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      return name;
    }
  / quoted_ident
ident_list
  = head:ident tail:(__ COMMA __ ident)* {
      return createList(head, tail)
    }
alias_ident
  = name:ident_name !{
      if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
      return false
    } {
      return name;
    }
  / quoted_ident

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
  = "'" chars:[^']* "'" {
    return {
      type: 'single_quote_string',
      value: chars.join('')
    }
  }

backticks_quoted_ident
  = "`" chars:([^`\\] / escape_char)+ "`" {
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
  / n:backticks_quoted_ident {
    return n.value
  }

column_name
  =  start:ident_start parts:column_part* { return start + parts.join(''); }
  / start:digits parts:column_part+ { return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* { return start + parts.join(''); }

// ident_start, ident_part, column_part are defined at the end of this file

param
  = l:(':' ident_name) {
      return { type: 'param', value: l[1] };
    }

aggr_func
  = aggr_fun_count
  / aggr_fun_smma

aggr_fun_smma
  = name:KW_SUM_MAX_MIN_AVG  __ LPAREN __ e:or_and_expr __ RPAREN __ bc:over_partition? {
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
  = KW_ON __ KW_UPDATE __ kw:KW_CURRENT_TIMESTAMP __ l:(LPAREN __ expr_list? __ RPAREN)? {
    const parentheses = l ? true : false
    const expr = l ? l[2] : null
    return {
      type: 'on update',
      keyword: kw,
      parentheses,
      expr,
    }
  }
  / KW_ON __ KW_UPDATE __ kw:'NOW'i __ LPAREN __ RPAREN {
    return {
      type: 'on update',
      keyword: kw,
      parentheses: true,
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
    return { type: 'origin', value: s.toUpperCase() }
  }
  / literal_numeric

aggr_fun_count
  = name:(KW_COUNT / KW_GROUP_CONCAT) __ LPAREN __ arg:count_arg __ RPAREN __ bc:over_partition? {
      return {
        type: 'aggr_func',
        name: name,
        args: arg,
        over: bc,
      };
    }

concat_separator
  = kw:'SEPARATOR'i? __ s:literal_string {
    return {
      keyword: kw,
      value: s
    }
  }

count_arg
  = e:star_expr { return { expr: e, ...getLocationObject() }; }
  / d:KW_DISTINCT? __ c:or_and_where_expr __ or:order_by_clause? __ s:concat_separator? {
    return {
      distinct: d,
      expr: c,
      orderby: or,
      separator: s,
      ...getLocationObject()
    };
  }

star_expr
  = "*" { return { type: 'star', value: '*' }; }
convert_args
  = c:proc_additive_expr __ COMMA __ ch:(character_string_type / datetime_type)  __ cs:create_option_character_set_kw __ v:ident_without_kw_type {
    const { dataType, length } = ch
    let dataTypeStr = dataType
    if (length !== undefined) dataTypeStr = `${dataTypeStr}(${length})`
    return {
      type: 'expr_list',
      value: [
        c,
        {
          type: 'origin',
          value: dataTypeStr,
          suffix: {
            prefix: cs,
            ...v,
          }
        },
      ]
    }
  }
  / c:proc_additive_expr __ COMMA __ d:(signedness / data_type) {
    const dataType = typeof d === 'string' ? { dataType: d } : d
    return {
      type: 'expr_list',
      value: [c, { type: 'datatype', ...dataType, }]
    }
  }
  / c:or_and_where_expr __ KW_USING __ d:ident_name {
    c.suffix = `USING ${d.toUpperCase()}`
    return {
      type: 'expr_list',
      value: [c]
    }
  }
extract_filed
  = f:(
    'YEAR_MONTH'i / 'DAY_HOUR'i / 'DAY_MINUTE'i / 'DAY_SECOND'i / 'DAY_MICROSECOND'i / 'HOUR_MINUTE'i / 'HOUR_SECOND'i/ 'HOUR_MICROSECOND'i / 'MINUTE_SECOND'i / 'MINUTE_MICROSECOND'i / 'SECOND_MICROSECOND'i / 'TIMEZONE_HOUR'i / 'TIMEZONE_MINUTE'i
    / 'CENTURY'i / 'DAY'i / 'DATE'i / 'DECADE'i / 'DOW'i / 'DOY'i / 'EPOCH'i / 'HOUR'i / 'ISODOW'i / 'ISOWEEK'i / 'ISOYEAR'i / 'MICROSECONDS'i / 'MILLENNIUM'i / 'MILLISECONDS'i / 'MINUTE'i / 'MONTH'i / 'QUARTER'i / 'SECOND'i / 'TIME'i / 'TIMEZONE'i / 'WEEK'i / 'YEAR'i
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
  = 'trim'i __ LPAREN __ tr:trim_rem? __ s:expr __ RPAREN {
    let args = tr || { type: 'expr_list', value: [] }
    args.value.push(s)
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'trim' }]},
        args,
        ...getLocationObject(),
    };
  }

func_call
  = extract_func / trim_func_clause
  / 'convert'i __ LPAREN __ l:convert_args __ RPAREN {
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'convert' }] },
        args: l,
        ...getLocationObject(),
    };
  }
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
  / name:proc_func_name &{ return !reservedFunctionName[name.name[0] && name.name[0].value.toLowerCase()] } __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
    if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
    if (((name.name[0] && name.name[0].value.toUpperCase() === 'TIMESTAMPDIFF') || (name.name[0] && name.name[0].value.toUpperCase() === 'TIMESTAMPADD')) && l.value && l.value[0]) l.value[0] = { type: 'origin', value: l.value[0].column }
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
  = c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ ch:character_string_type  __ cs:create_option_character_set_kw __ v:ident_without_kw_type __ RPAREN {
    const { dataType, length } = ch
    let dataTypeStr = dataType
    if (length !== undefined) dataTypeStr = `${dataTypeStr}(${length})`
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: [{
        dataType: dataTypeStr,
        suffix: [{ type: 'origin', value: cs }, v],
      }],
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
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
        dataType: [s, t].filter(Boolean).join(' ')
      }]
    };
  }

literal_basic
  = b:('binary'i / '_binary'i)? __ s:literal_string ca:(__ collate_expr)? {
    if (b) s.prefix = b.toLowerCase()
    if (ca) s.suffix = { collate: ca[1] }
    return s
  }
  / literal_bool
  / literal_null
  / literal_datetime

literal
  = literal_basic / literal_numeric

// literal_list, literal_null, literal_not_null, literal_bool, literal_numeric
// are imported from common/literal/basic.pegjs
@import 'common/literal/basic.pegjs'

// literal_string is imported from common/literal/string-basic.pegjs
@import 'common/literal/string-basic.pegjs'

// literal_datetime is imported from common/literal/datetime.pegjs
@import 'common/literal/datetime.pegjs'

// MariaDB specific: single_quote_char has extra [\n] at the end
single_quote_char
  = [^"\\\0-\x1F\x7f]
  / escape_char
  / [\n]

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
  / "''" { return "''" }
  / '""' { return '""' }
  / '``' { return '``' }

// line_terminator is defined at the end of this file with other identifier patterns

// MariaDB specific: number rules with bigint support
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

// Identifier patterns (MariaDB with unicode support)
ident_start = [A-Za-z_\u4e00-\u9fa5\u00C0-\u017F]
ident_part  = [A-Za-z0-9_$\u4e00-\u9fa5\u00C0-\u017F]
column_part  = [A-Za-z0-9_:\u4e00-\u9fa5\u00C0-\u017F]
line_terminator = [\n\r]

// MariaDB specific: LOGIC_OPERATOR with XOR
OPERATOR_XOR = 'XOR'i !ident_start { return 'XOR' }
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND / OPERATOR_XOR

// Import common modules
@import 'common/keyword/core.pegjs'
@import 'common/symbol.pegjs'
@import 'common/comment.pegjs'
@import 'common/expression/case.pegjs'

// MariaDB specific: interval_unit with WEEK
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
      return { stmt: s, vars: varList };
    }

// assign_stmt_list and assign_stmt are imported from common/procedure/assign.pegjs
@import 'common/procedure/assign.pegjs'

select_assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s:KW_ASSIGN __ e:proc_expr {
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
  = proc_func_call_args
  / literal
  / var_decl
  / column_ref
  / proc_fun_call_without_args
  / param
  / LPAREN __ e:proc_additive_expr __ RPAREN {
      e.parentheses = true;
      return e;
    }
proc_func_name
  = dt:(ident_name_type / backticks_quoted_ident) tail:(__ DOT __ ((ident_name_type / backticks_quoted_ident)))? {
      const result = { name: [dt] }
      if (tail !== null) {
        result.schema = dt
        result.name = [tail[3]]
      }
      return result
    }

proc_func_call_args
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
proc_fun_call_without_args
  = name:proc_func_name {
    return {
        type: 'function',
        name: name,
        args: null,
        ...getLocationObject(),
      };
  }
proc_func_call
  = proc_func_call_args / proc_fun_call_without_args

proc_primary_list
  = head:proc_primary tail:(__ COMMA __ proc_primary)* {
      return createList(head, tail);
    }

proc_array =
  LBRAKE __ l:proc_primary_list __ RBRAKE {
    return { type: 'array', value: l };
  }

var_decl_list
  = head:var_decl tail:(__ COMMA __ var_decl)* {
    return createList(head, tail)
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
  / enum_type
  / uuid_type
  / boolean_type
  / binary_type
  / blob_type
  / geometry_type




@import 'common/keyword/signedness.pegjs'
@import 'common/datatype/size.pegjs'
@import 'common/datatype/boolean.pegjs'
@import 'common/datatype/blob.pegjs'
@import 'common/datatype/binary.pegjs'
@import 'common/datatype/character.pegjs'
@import 'common/datatype/datetime.pegjs'
@import 'common/datatype/numeric.pegjs'
@import 'common/datatype/enum.pegjs'
@import 'common/datatype/json.pegjs'
@import 'common/datatype/text.pegjs'
@import 'common/datatype/uuid.pegjs'
@import 'common/datatype/geometry.pegjs'
