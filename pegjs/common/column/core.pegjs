// Core column reference patterns shared across SQL dialects
// This module contains common column reference patterns that are consistent across most SQL dialects

// Column reference with optional table/schema qualification
column_ref
  = tbl:ident_name __ DOT __ col:column_without_kw {
      return {
        type: 'column_ref',
        table: tbl,
        column: col
      };
    }
  / col:column_without_kw {
      return {
        type: 'column_ref',
        table: null,
        column: col
      };
    }

// Three-part column reference (database.table.column)
column_ref_qualified
  = schema:ident_name __ DOT __ tbl:ident_name __ DOT __ col:column_without_kw {
      return {
        type: 'column_ref',
        schema: schema,
        table: tbl,
        column: col
      };
    }
  / tbl:ident_name __ DOT __ col:column_without_kw {
      return {
        type: 'column_ref',
        table: tbl,
        column: col
      };
    }
  / col:column_without_kw {
      return {
        type: 'column_ref',
        table: null,
        column: col
      };
    }

// Column without reserved keywords
column_without_kw
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / quoted_ident

// Column name patterns
column_name
  = start:ident_start parts:ident_part* { return start + parts.join(''); }

// Column list patterns
column_clause
  = KW_ALL { return '*'; }
  / STAR { return '*'; }
  / head:column_list_item tail:(__ COMMA __ column_list_item)* {
      return createList(head, tail);
    }

column_list_item
  = tbl:ident __ DOT __ STAR {
      return {
        expr: {
          type: 'column_ref',
          table: tbl,
          column: '*'
        },
        as: null
      };
    }
  / expr:additive_expr __ alias:alias_clause? {
      return {
        expr: expr,
        as: alias
      };
    }

// Parenthesized column list
paren_column_list
  = LPAREN __ l:column_ref_list __ RPAREN { return l; }

// Column reference list (for SELECT, INSERT, etc.)
column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
      return createList(head, tail);
    }

// Column definition for CREATE TABLE
column_definition
  = name:column_name __ datatype:data_type __ constraints:column_constraint* {
      return {
        column: name,
        definition: datatype,
        constraints: constraints
      };
    }

// Common column constraint patterns
column_constraint
  = constraint_primary_key
  / constraint_not_null
  / constraint_null
  / constraint_default
  / constraint_unique
  / constraint_check
  / constraint_references

constraint_primary_key
  = KW_PRIMARY __ KW_KEY {
      return { type: 'primary key' };
    }

constraint_not_null
  = KW_NOT __ KW_NULL {
      return { type: 'not null' };
    }

constraint_null
  = KW_NULL {
      return { type: 'null' };
    }

constraint_unique
  = KW_UNIQUE {
      return { type: 'unique' };
    }