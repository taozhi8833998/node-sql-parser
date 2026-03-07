// Common DML (Data Manipulation Language) patterns shared across SQL dialects
// Includes INSERT, UPDATE, DELETE statements

// UPDATE statement
update_stmt
  = KW_UPDATE __
    t:table_ref_list __
    KW_SET __
    l:set_list __
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

// DELETE statement
delete_stmt
  = KW_DELETE __
    t:table_ref_list? __
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

// SET clause list
set_list
  = head:set_item tail:(__ COMMA __ set_item)* {
      return createList(head, tail);
    }

// SET clause item
set_item
  = tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ v:expr {
      return { column: c, value: v, table: tbl && tbl[0] };
    }
  / tbl:(ident __ DOT)? __ c:column_without_kw __ '=' __ KW_VALUES __ LPAREN __ v:column_ref __ RPAREN {
      return { column: c, value: v, table: tbl && tbl[0], keyword: 'values' };
  }

// INSERT value clause
insert_value_clause
  = value_clause
  / u:union_stmt {
      return u.ast
  }

// INSERT partition clause
insert_partition
  = KW_PARTITION __ LPAREN __ head:ident_name tail:(__ COMMA __ ident_name)* __ RPAREN {
      return createList(head, tail)
    }
  / KW_PARTITION __ v:value_item {
    return v
  }

// INSERT/REPLACE with column list
replace_insert_stmt
  = ri:replace_insert __
    KW_INTO? __
    t:table_name __
    p:insert_partition? __ LPAREN __ c:column_list __ RPAREN __
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

// INSERT/REPLACE without column list
insert_no_columns_stmt
  = ri:replace_insert __
    ig:KW_IGNORE? __
    it:KW_INTO? __
    t:table_name __
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

// INSERT INTO ... SET
insert_into_set
  = ri:replace_insert __
    KW_INTO __
    t:table_name __
    p:insert_partition? __
    KW_SET __
    l:set_list __
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

// ON DUPLICATE KEY UPDATE
on_duplicate_update_stmt
  = KW_ON __ 'DUPLICATE'i __ KW_KEY __ KW_UPDATE __ s:set_list {
    return {
      keyword: 'on duplicate key update',
      set: s
    }
  }

// INSERT or REPLACE keyword
replace_insert
  = KW_INSERT { return 'insert'; }
  / KW_REPLACE { return 'replace'; }

// VALUES clause
value_clause
  = KW_VALUES __ l:value_list { return { type: 'values', values: l } }

// List of value items
value_list
  = head:value_item tail:(__ COMMA __ value_item)* {
      return createList(head, tail);
    }

// Single value item (parenthesized expression list)
value_item
  = LPAREN __ l:expr_list __ RPAREN {
      return l;
    }

