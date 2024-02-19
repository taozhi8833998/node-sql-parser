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
  = c:expr o:(KW_ASC / KW_DESC)? {
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
    t:ident_name __
    c:create_db_definition? {
      return {
        tableList: Array.from(tableList),
        columnList: columnListTableAlias(columnList),
        ast: {
          type: a[0].toLowerCase(),
          keyword: 'database',
          if_not_exists:ife,
          database: t,
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
  = 'DEFINER'i __ KW_ASSIGIN_EQUAL __ u:literal_string __ '@' __ h:literal_string {
    const userNameSymbol = u.type === 'single_quote_string' ? '\'' : '"'
    const hostSymbol = h.type === 'single_quote_string' ? '\'' : '"'
    return `DEFINER = ${userNameSymbol}${u.value}${userNameSymbol}@${hostSymbol}${h.value}${hostSymbol}`
  }
  / 'DEFINER'i __ KW_ASSIGIN_EQUAL __ KW_CURRENT_USER __ LPAREN __ RPAREN {
    return `DEFINER = CURRENT_USER()`
  }
  / 'DEFINER'i __ KW_ASSIGIN_EQUAL __ KW_CURRENT_USER  {
    return `DEFINER = CURRENT_USER`
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
          options: [{ type: 'origin', value: op }],
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
  / t:table_option {
    t.resource = t.keyword
    t[t.keyword] = t.value
    delete t.value
    return {
      type: 'alter',
      ...t,
    }
  }

ALTER_ADD_COLUMN
  = KW_ADD __
    kc:KW_COLUMN? __
    ife:if_not_exists_stmt? __
    cd:create_column_definition {
      return {
        action: 'add',
        ...cd,
        keyword: kc,
        if_not_exists:ife,
        resource: 'column',
        type: 'alter',
      }
    }
  / KW_ADD __
    cd:create_column_definition {
      return {
        action: 'add',
        ...cd,
        resource: 'column',
        type: 'alter',
      }
    }

ALTER_MODIFY_COLUMN
  = KW_MODIFY __
    kc:KW_COLUMN? __
    cd:create_column_definition {
      return {
        action: 'modify',
        keyword: kc,
        ...cd,
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
  = 'CHANGE'i __ kc:KW_COLUMN? __ od:column_ref __ cd:create_column_definition __ fa:(('FIRST'i / 'AFTER'i) __ column_ref)? {
    return {
        action: 'change',
        old_column: od,
        ...cd,
        keyword: kc,
        resource: 'column',
        type: 'alter',
        first_after: fa && {
          keyword: fa[0],
          column: fa[2]
        },
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
  = LPAREN __ l:column_ref_idx_list __ RPAREN {
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
      name: kw,
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
  / kw:'ROW_FORMAT'i __ s:(KW_ASSIGIN_EQUAL)? __ c:(KW_DEFAULT / 'DYNAMIC'i / 'FIXED'i / 'COMPRESSED'i / 'REDUNDANT'i / 'COMPACT'i) {
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
  / __ KW_WITH __ KW_RECURSIVE __ cte:cte_definition {
      cte.recursive = true;
      return [cte]
    }

cte_definition
  = name:(literal_string / ident_name / table_name) __ columns:cte_column_definition? __ KW_AS __ LPAREN __ stmt:set_op_stmt __ RPAREN {
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
  = __ cte:with_clause? __ KW_SELECT ___
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
    l:limit_clause? __
    lr: locking_read? __
    win:window_clause? __
    li:into_clause?  {
      if ((ci && fi) || (ci && li) || (fi && li) || (ci && fi && li)) {
        throw new Error('A given SQL statement can contain at most one INTO clause')
      }
      if(f) f.forEach(info => info.table && tableList.add(`select::${info.db}::${info.table}`));
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
  / a:select_assign_stmt {
    return { expr: a, as: null }
  }
  / e:binary_column_expr __ alias:alias_clause? {
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
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
      t.join = op;
      t.on   = expr;
      return t;
    }
  / op:join_op __ LPAREN __ stmt:set_op_stmt __ RPAREN __ alias:alias_clause? __ expr:on_clause? {
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
  / LPAREN __ t:table_name __ r:RPAREN __ alias:alias_clause? {
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
      expr: { type: 'values', values: stmt, prefix: 'row' },
      as: alias
    };
  }
  / LPAREN __ stmt:(set_op_stmt / value_clause) __ RPAREN __ alias:alias_clause? {
      if (Array.isArray(stmt)) stmt = { type: 'values', values: stmt, prefix: 'row' }
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
  / KW_CROSS __ KW_JOIN { return 'CROSS JOIN'; }
  / (KW_INNER __)? KW_JOIN { return 'INNER JOIN'; }

table_name
    = prefix:[_0-9]* part:ident tail:(__ DOT __ ident)? {
      const dt = prefix ? `${prefix.join('')}${part}` : part
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

on_clause
  = KW_ON __ e:or_and_expr { return e; }

where_clause
  = KW_WHERE __ e:(or_and_where_expr) { return e; }

group_by_clause
  = KW_GROUP __ KW_BY __ e:expr_list { return e.value; }

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
          with: cte,
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
    ig:KW_IGNORE? __
    it:KW_INTO?                 __
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
    odp:on_duplicate_update_stmt? {
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
    ig:KW_IGNORE? __
    it:KW_INTO? __
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
  = 'ROW'i? __ LPAREN __ l:expr_list  __ RPAREN {
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

expr
  = _expr / set_op_stmt

logic_operator_expr
  = head:primary tail:(__ LOGIC_OPERATOR __ primary)+ __ rh:comparison_op_right? {
    const logicExpr = createBinaryExprChain(head, tail)
    if (rh === null) return logicExpr
    else if (rh.type === 'arithmetic') return createBinaryExprChain(logicExpr, rh.tail)
    else return createBinaryExpr(rh.op, logicExpr, rh.right)
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
  / KW_NOT __ expr:not_expr {
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
  = op:like_op __ right:(literal / param / comparison_expr ) __ ca:(__ collate_expr)? __ es:escape_op? {
    if (es) right.escape = es
    if (ca) right.suffix = { collate: ca[1] }
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
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

multiplicative_expr
  = head:unary_expr_or_primary
    tail:(__ multiplicative_operator  __ unary_expr_or_primary)* {
      return createBinaryExprChain(head, tail)
    }

multiplicative_operator
  = "*" / "/" / "%" / "||"
  / "div"i {
    return 'DIV'
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
  = cast_expr
  / literal
  / fulltext_search
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
  / __ prepared_symbol:'?' {
    return {
      type: 'origin',
      value: prepared_symbol
    }
  }

column_ref
  = db:(ident_name / backticks_quoted_ident) __ DOT __ tbl:(ident_name / backticks_quoted_ident) __ DOT __ col:column_without_kw {
      columnList.add(`select::${db}::${tbl}::${col}`);
      return {
        type: 'column_ref',
        db: db,
        table: tbl,
        column: col
      };
    }
  / tbl:(ident_name / backticks_quoted_ident) __ DOT __ col:column_without_kw {
      columnList.add(`select::${tbl}::${col}`);
      return {
        type: 'column_ref',
        table: tbl,
        column: col
      };
  }
  / col:column {
      columnList.add(`select::null::${col}`);
      return {
        type: 'column_ref',
        table: null,
        column: col
      };
    }

column_list
  = head:column tail:(__ COMMA __ column)* {
      return createList(head, tail);
    }

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

quoted_ident
  = double_quoted_ident
  / single_quoted_ident
  / backticks_quoted_ident

double_quoted_ident
  = '"' chars:[^"]+ '"' { return chars.join(''); }

single_quoted_ident
  = "'" chars:[^']+ "'" { return chars.join(''); }

backticks_quoted_ident
  = "`" chars:([^`\\] / escape_char)+ "`" { return chars.join(''); }

column_without_kw
  = name:column_name {
    return name;
  }
  / quoted_ident

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / backticks_quoted_ident

column_name
  =  start:ident_start parts:column_part* { return start + parts.join(''); }

ident_name
  =  start:ident_start parts:ident_part* { return start + parts.join(''); }

ident_start = [A-Za-z_]

ident_part  = [A-Za-z0-9_$]

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
        over: bc,
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
    // => string
    return `rows ${s.value}`
  }
  / KW_ROWS __ KW_BETWEEN __ p:window_frame_preceding __ KW_AND __ f:window_frame_following {
    // => string
    return `rows between ${p.value} and ${f.value}`
  }

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
  = e:star_expr { return { expr: e }; }
  / d:KW_DISTINCT? __ LPAREN __ c:expr __ RPAREN tail:(__ (KW_AND / KW_OR) __ expr)* __ or:order_by_clause? __ s:concat_separator? {
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
  / d:KW_DISTINCT? __ c:or_and_expr __ or:order_by_clause? __ s:concat_separator? { return { distinct: d, expr: c, orderby: or, separator: s }; }

star_expr
  = "*" { return { type: 'star', value: '*' }; }
convert_args
  = c:proc_primary __ COMMA __ ch:character_string_type  __ cs:create_option_character_set_kw __ v:ident_name {
    const { dataType, length } = ch
    let dataTypeStr = dataType
    if (length !== undefined) dataTypeStr = `${dataTypeStr}(${length})`
    return {
      type: 'expr_list',
      value: [
        c,
        {
          type: 'origin',
          value: `${dataTypeStr} ${cs} ${v}`
        }
      ]
    }
  }
  / c:proc_primary __ COMMA __ d:data_type {
    return {
      type: 'expr_list',
      value: [c, { type: 'datatype', ...d, }]
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
        }
    }
  }
  / kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ s:expr __ RPAREN {
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          source: s,
        }
    }
  }
  / 'DATE_TRUNC'i __  LPAREN __ e:expr __ COMMA __ f:extract_filed __ RPAREN {
    return {
        type: 'function',
        name: 'DATE_TRUNC',
        args: { type: 'expr_list', value: [e, { type: 'origin', value: f }] },
        over: null,
      };
  }

trim_position
  = 'BOTH'i / 'LEADING'i / 'TRAILING'i

trim_rem
  = p:trim_position? __ rm:literal_string? __ k:KW_FROM {
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
        name: 'TRIM',
        args,
    };
  }

func_call
  = extract_func / trim_func_clause
  / 'convert'i __ LPAREN __ l:convert_args __ RPAREN __ ca:collate_expr? {
    return {
        type: 'function',
        name: 'CONVERT',
        args: l,
        collate: ca,
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
  / f:scalar_time_func __ up:on_update_current_timestamp? {
    return {
        type: 'function',
        name: f,
        over: up
    }
  }
  / name:proc_func_name &{ return name.toLowerCase() !== 'convert' && !reservedFunctionName[name.toLowerCase()] } __ LPAREN __ l:or_and_where_expr? __ RPAREN __ bc:over_partition? {
    if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
    if ((name.toUpperCase() === 'TIMESTAMPDIFF' || name.toUpperCase() === 'TIMESTAMPADD') && l.value && l.value[0]) l.value[0] = { type: 'origin', value: l.value[0].column }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc,
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
  = c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ ch:character_string_type  __ cs:create_option_character_set_kw __ v:ident_name __ RPAREN __ ca:collate_expr? {
    const { dataType, length } = ch
    let dataTypeStr = dataType
    if (length !== undefined) dataTypeStr = `${dataTypeStr}(${length})`
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      symbol: 'as',
      target: {
        dataType: `${dataTypeStr} ${cs} ${v.toUpperCase()}`
      },
      collate: ca,
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ t:data_type __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
      target: t
    };
  }
  / c:KW_CAST __ LPAREN __ e:expr __ KW_AS __ KW_DECIMAL __ LPAREN __ precision:int __ RPAREN __ RPAREN {
    return {
      type: 'cast',
      keyword: c.toLowerCase(),
      expr: e,
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
      target: {
        dataType: s + (t ? ' ' + t: '')
      }
    };
  }

signedness
  = KW_SIGNED
  / KW_UNSIGNED

literal
  = b:('binary'i / '_binary'i)? __ s:literal_string ca:(__ collate_expr)? {
    if (b) s.prefix = b.toLowerCase()
    if (ca) s.suffix = { collate: ca[1] }
    return s
  }
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
  = b:('_binary'i / '_latin1'i)? __ r:'X'i ca:("'" [0-9A-Fa-f]* "'") {
      return {
        type: 'hex_string',
        prefix: b,
        value: ca[1].join('')
      };
    }
  / b:('_binary'i / '_latin1'i)? __ r:'b'i ca:("'" [0-9A-Fa-f]* "'") {
      return {
        type: 'bit_string',
        prefix: b,
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
  / r:'N'i ca:("'" single_char* "'") {
    return {
        type: 'natural_string',
        value: ca[1].join('')
      };
  }
  / ca:("'" single_char* "'") {
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
KW_TRIGGER    = "TRIGGER"i      !ident_start { return 'TRIGGER'; }
KW_TABLES   = "TABLES"i     !ident_start { return 'TABLES'; }
KW_DATABASE = "DATABASE"i      !ident_start { return 'DATABASE'; }
KW_SCHEMA   = "SCHEMA"i      !ident_start { return 'SCHEMA'; }
KW_COLLATE  = "COLLATE"i    !ident_start { return 'COLLATE'; }

KW_ON       = "ON"i       !ident_start
KW_LEFT     = "LEFT"i     !ident_start
KW_RIGHT    = "RIGHT"i    !ident_start
KW_FULL     = "FULL"i     !ident_start
KW_INNER    = "INNER"i    !ident_start
KW_CROSS    = "CROSS"i    !ident_start
KW_JOIN     = "JOIN"i     !ident_start
KW_OUTER    = "OUTER"i    !ident_start
KW_OVER     = "OVER"i     !ident_start
KW_UNION    = "UNION"i    !ident_start
KW_MINUS    = "MINUS"i    !ident_start
KW_INTERSECT    = "INTERSECT"i    !ident_start
KW_VALUES   = "VALUES"i   !ident_start
KW_USING    = "USING"i    !ident_start

KW_WHERE    = "WHERE"i      !ident_start
KW_WITH     = "WITH"i       !ident_start

KW_GROUP    = "GROUP"i      !ident_start
KW_BY       = "BY"i         !ident_start
KW_ORDER    = "ORDER"i      !ident_start
KW_HAVING   = "HAVING"i     !ident_start

KW_LIMIT    = "LIMIT"i      !ident_start
KW_OFFSET   = "OFFSET"i     !ident_start { return 'OFFSET'; }

KW_ASC      = "ASC"i        !ident_start { return 'ASC'; }
KW_DESC     = "DESC"i       !ident_start { return 'DESC'; }
KW_DESCRIBE = "DESCRIBE"i       !ident_start { return 'DESCRIBE'; }

KW_ALL      = "ALL"i        !ident_start { return 'ALL'; }
KW_DISTINCT = "DISTINCT"i   !ident_start { return 'DISTINCT';}

KW_BETWEEN  = "BETWEEN"i    !ident_start { return 'BETWEEN'; }
KW_IN       = "IN"i         !ident_start { return 'IN'; }
KW_IS       = "IS"i         !ident_start { return 'IS'; }
KW_LIKE     = "LIKE"i       !ident_start { return 'LIKE'; }
KW_RLIKE    = "RLIKE"i      !ident_start { return 'RLIKE'; }
KW_REGEXP   = "REGEXP"i     !ident_start { return 'REGEXP'; }
KW_EXISTS   = "EXISTS"i     !ident_start { return 'EXISTS'; }

KW_NOT      = "NOT"i        !ident_start { return 'NOT'; }
KW_AND      = "AND"i        !ident_start { return 'AND'; }
KW_OR       = "OR"i         !ident_start { return 'OR'; }

KW_COUNT    = "COUNT"i      !ident_start { return 'COUNT'; }
KW_GROUP_CONCAT = "GROUP_CONCAT"i  !ident_start { return 'GROUP_CONCAT'; }
KW_MAX      = "MAX"i        !ident_start { return 'MAX'; }
KW_MIN      = "MIN"i        !ident_start { return 'MIN'; }
KW_SUM      = "SUM"i        !ident_start { return 'SUM'; }
KW_AVG      = "AVG"i        !ident_start { return 'AVG'; }

KW_EXTRACT  = "EXTRACT"i    !ident_start { return 'EXTRACT'; }
KW_CALL     = "CALL"i       !ident_start { return 'CALL'; }

KW_CASE     = "CASE"i       !ident_start
KW_WHEN     = "WHEN"i       !ident_start
KW_THEN     = "THEN"i       !ident_start
KW_ELSE     = "ELSE"i       !ident_start
KW_END      = "END"i        !ident_start

KW_CAST     = "CAST"i       !ident_start { return 'CAST' }

KW_BINARY    = "BINARY"i    !ident_start { return 'BINARY'; }
KW_VARBINARY = "VARBINARY"i !ident_start { return 'VARBINARY'; }
KW_BIT      = "BIT"i      !ident_start { return 'BIT'; }
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
KW_MEDIUMINT = "MEDIUMINT"i !ident_start { return 'MEDIUMINT'; }
KW_TINYINT  = "TINYINT"i  !ident_start { return 'TINYINT'; }
KW_TINYTEXT = "TINYTEXT"i !ident_start { return 'TINYTEXT'; }
KW_TEXT     = "TEXT"i     !ident_start { return 'TEXT'; }
KW_MEDIUMTEXT = "MEDIUMTEXT"i  !ident_start { return 'MEDIUMTEXT'; }
KW_LONGTEXT  = "LONGTEXT"i  !ident_start { return 'LONGTEXT'; }
KW_BIGINT   = "BIGINT"i   !ident_start { return 'BIGINT'; }
KW_ENUM     = "ENUM"i   !ident_start { return 'ENUM'; }
KW_FLOAT   = "FLOAT"i   !ident_start { return 'FLOAT'; }
KW_DOUBLE   = "DOUBLE"i   !ident_start { return 'DOUBLE'; }
KW_DATE     = "DATE"i     !ident_start { return 'DATE'; }
KW_DATETIME     = "DATETIME"i     !ident_start { return 'DATETIME'; }
KW_ROWS     = "ROWS"i     !ident_start { return 'ROWS'; }
KW_TIME     = "TIME"i     !ident_start { return 'TIME'; }
KW_TIMESTAMP= "TIMESTAMP"i!ident_start { return 'TIMESTAMP'; }
KW_YEAR = "YEAR"i !ident_start { return 'YEAR'; }
KW_TRUNCATE = "TRUNCATE"i !ident_start { return 'TRUNCATE'; }
KW_USER     = "USER"i     !ident_start { return 'USER'; }

KW_CURRENT_DATE     = "CURRENT_DATE"i !ident_start { return 'CURRENT_DATE'; }
KW_ADD_DATE         = "ADDDATE"i !ident_start { return 'ADDDATE'; }
KW_INTERVAL         = "INTERVAL"i !ident_start { return 'INTERVAL'; }
KW_UNIT_YEAR        = "YEAR"i !ident_start { return 'YEAR'; }
KW_UNIT_MONTH       = "MONTH"i !ident_start { return 'MONTH'; }
KW_UNIT_WEEK        = "WEEK"i !ident_start { return 'WEEK'; }
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
KW_VIEW           = "VIEW"i    !ident_start { return 'VIEW'; }

KW_GEOMETRY             = "GEOMETRY"i    !ident_start { return 'GEOMETRY'; }
KW_POINT                = "POINT"i    !ident_start { return 'POINT'; }
KW_LINESTRING           = "LINESTRING"i    !ident_start { return 'LINESTRING'; }
KW_POLYGON              = "POLYGON"i    !ident_start { return 'POLYGON'; }
KW_MULTIPOINT           = "MULTIPOINT"i    !ident_start { return 'MULTIPOINT'; }
KW_MULTILINESTRING      = "MULTILINESTRING"i    !ident_start { return 'MULTILINESTRING'; }
KW_MULTIPOLYGON         = "MULTIPOLYGON"i    !ident_start { return 'MULTIPOLYGON'; }
KW_GEOMETRYCOLLECTION   = "GEOMETRYCOLLECTION"i    !ident_start { return 'GEOMETRYCOLLECTION'; }

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
KW_MODIFY   = "MODIFY"i  !ident_start { return 'MODIFY'; }
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

OPERATOR_CONCATENATION = '||'
OPERATOR_AND = '&&'
OPERATOR_XOR = 'XOR'i !ident_start { return 'XOR' }
LOGIC_OPERATOR = OPERATOR_CONCATENATION / OPERATOR_AND / OPERATOR_XOR

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
  / KW_UNIT_WEEK
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

assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s: (KW_ASSIGN / KW_ASSIGIN_EQUAL) __ e:proc_expr {
    return {
      type: 'assign',
      left: va,
      symbol: s,
      right: e
    };
  }

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
  = dt:(ident_name / quoted_ident) tail:(__ DOT __ (ident_name / quoted_ident))? {
      let name = dt
      if (tail !== null) {
        name = `${dt}.${tail[3]}`
      }
      return name;
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
        }
      };
    }
proc_fun_call_without_args
  = name:proc_func_name {
    return {
        type: 'function',
        name: name,
        args: null
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
  / boolean_type
  / binary_type
  / blob_type
  / geometry_type

boolean_type
  = 'boolean'i { return { dataType: 'BOOLEAN' }; }

blob_type
  = b:('blob'i / 'tinyblob'i / 'mediumblob'i / 'longblob'i) { return { dataType: b.toUpperCase() }; }

binary_type
  = t:(KW_BINARY / KW_VARBINARY) __ LPAREN __ l:[0-9]+ __ RPAREN {
    return { dataType: t, length: parseInt(l.join(''), 10) };
  }
  / t:KW_BINARY { return { dataType: t }; }


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
  = t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_MEDIUMINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE / KW_BIT) __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? { return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_MEDIUMINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE)l:[0-9]+ __ s:numeric_type_suffix? { return { dataType: t, length: parseInt(l.join(''), 10), suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_MEDIUMINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE) __ s:numeric_type_suffix? __{ return { dataType: t, suffix: s }; }

datetime_type
  = t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP / KW_YEAR) __ LPAREN __ l:[0-6] __ RPAREN __ s:numeric_type_suffix? { return { dataType: t, length: parseInt(l, 10), parentheses: true }; }
  / t:(KW_DATE / KW_DATETIME / KW_TIME / KW_TIMESTAMP / KW_YEAR) { return { dataType: t }; }

enum_type
  = t:(KW_ENUM / KW_SET) __ e:value_item {
    e.parentheses = true
    return {
      dataType: t,
      expr: e
    }
  }
json_type
  = t:KW_JSON { return { dataType: t }; }

text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) { return { dataType: t }}

geometry_type
  = t:(KW_GEOMETRY / KW_POINT / KW_LINESTRING / KW_POLYGON / KW_MULTIPOINT / KW_MULTILINESTRING / KW_MULTIPOLYGON / KW_GEOMETRYCOLLECTION ) { return { dataType: t }}
