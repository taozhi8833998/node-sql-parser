// Common assign statement rules (standard version)
// Used by: db2, hive, athena, sqlite, flinksql, bigquery, mariadb, mysql, snowflake, trino, noql

assign_stmt_list
  = head:assign_stmt tail:(__ COMMA __ assign_stmt)* {
    return createList(head, tail);
  }

assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s:(KW_ASSIGN / KW_ASSIGIN_EQUAL) __ e:proc_expr {
    return {
      type: 'assign',
      left: va,
      symbol: s,
      right: e
    };
  }

