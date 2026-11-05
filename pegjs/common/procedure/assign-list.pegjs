// Common assign_stmt_list rule only
// Used by dialects that need custom assign_stmt (e.g., postgresql)

assign_stmt_list
  = head:assign_stmt tail:(__ COMMA __ assign_stmt)* {
    return createList(head, tail);
  }

