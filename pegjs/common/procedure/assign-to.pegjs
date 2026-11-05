// Assign statement with KW_TO support (PostgreSQL, Redshift)
// Used by: postgresql, redshift

assign_stmt_list
  = head:assign_stmt tail:(__ COMMA __ assign_stmt)* {
    return createList(head, tail);
  }

assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s:(KW_ASSIGN / KW_ASSIGIN_EQUAL / KW_TO) __ e:proc_expr {
    return {
      type: 'assign',
      left: va,
      symbol: Array.isArray(s) ? s[0] : s,
      right: e
    };
  }

