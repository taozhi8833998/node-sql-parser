// Common SQL clause patterns shared across dialects
// Includes FROM, WHERE, HAVING, ON, ORDER BY clauses

from_clause
  = KW_FROM __ l:table_ref_list { return l; }

on_clause
  = KW_ON __ e:or_and_where_expr { return e; }

where_clause
  = KW_WHERE __ e:or_and_where_expr { return e; }

having_clause
  = KW_HAVING __ e:or_and_where_expr { return e; }

order_by_clause
  = KW_ORDER __ KW_BY __ l:order_by_list { return l; }

order_by_list
  = head:order_by_element tail:(__ COMMA __ order_by_element)* {
      return createList(head, tail);
    }

