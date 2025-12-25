// Common JOIN patterns shared across SQL dialects

// Join operators - covers most SQL dialects
join_op
  = KW_LEFT __ KW_OUTER? __ KW_JOIN { return 'LEFT JOIN'; }
  / KW_RIGHT __ KW_OUTER? __ KW_JOIN { return 'RIGHT JOIN'; }
  / KW_FULL __ KW_OUTER? __ KW_JOIN { return 'FULL JOIN'; }
  / KW_CROSS __ KW_JOIN { return 'CROSS JOIN'; }
  / KW_INNER __ KW_JOIN { return 'INNER JOIN'; }
  / KW_JOIN { return 'INNER JOIN'; }

// Table reference list with alias tracking
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

// Single table reference (comma or join)
table_ref
  = __ COMMA __ t:table_base { return t; }
  / __ t:table_join { return t; }

// Table join with ON/USING clause
table_join
  = op:join_op __ t:table_base __ KW_USING __ LPAREN __ head:ident_without_kw_type tail:(__ COMMA __ ident_without_kw_type)* __ RPAREN {
      t.join = op;
      t.using = createList(head, tail);
      return t;
    }
  / op:join_op __ t:table_base __ expr:on_clause? {
      t.join = op;
      t.on = expr;
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

// Base table reference (table, subquery, or DUAL)
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
  / LPAREN __ stmt:union_stmt __ RPAREN __ alias:alias_clause? {
      stmt.parentheses = true;
      return {
        expr: stmt,
        as: alias
      };
    }

// Table name with optional schema/database prefix
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

// ON clause for joins
on_clause
  = KW_ON __ e:or_and_where_expr { return e; }

// USING clause for joins
using_clause
  = KW_USING __ LPAREN __ head:ident_without_kw_type tail:(__ COMMA __ ident_without_kw_type)* __ RPAREN {
      return createList(head, tail);
    }

// Table list for rename operations
table_to_list
  = head:table_to_item tail:(__ COMMA __ table_to_item)* {
      return createList(head, tail);
    }

// Table rename item
table_to_item
  = head:table_name __ KW_TO __ tail:table_name {
      return [head, tail]
    }
