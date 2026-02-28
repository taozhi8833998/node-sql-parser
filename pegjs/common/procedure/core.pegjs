// Common procedure/variable patterns shared across SQL dialects

// Procedure statements list
proc_stmts
  = proc_stmt*

// Single procedure statement
proc_stmt
  = &{ varList = []; return true; } __ s:(assign_stmt / return_stmt) {
      return { stmt: s, vars: varList };
    }

// Assignment statement list
assign_stmt_list
  = head:assign_stmt tail:(__ COMMA __ assign_stmt)* {
    return createList(head, tail);
  }

// Assignment statement
assign_stmt
  = va:(var_decl / without_prefix_var_decl) __ s:(KW_ASSIGN / KW_ASSIGIN_EQUAL) __ e:proc_expr {
    return {
      type: 'assign',
      left: va,
      symbol: s,
      right: e
    };
  }

// Return statement
return_stmt
  = KW_RETURN __ e:proc_expr {
      return { type: 'return', expr: e };
    }

// Procedure expression
proc_expr
  = select_stmt
  / proc_join
  / proc_additive_expr
  / proc_array

// Procedure additive expression
proc_additive_expr
  = head:proc_multiplicative_expr
    tail:(__ additive_operator __ proc_multiplicative_expr)* {
      return createBinaryExprChain(head, tail);
    }

// Procedure multiplicative expression
proc_multiplicative_expr
  = head:proc_primary
    tail:(__ multiplicative_operator __ proc_primary)* {
      return createBinaryExprChain(head, tail);
    }

// Procedure join
proc_join
  = lt:var_decl __ op:join_op __ rt:var_decl __ expr:on_clause {
      return {
        type: 'join',
        ltable: lt,
        rtable: rt,
        op: op,
        on: expr
      };
    }

// Procedure primary expression
proc_primary
  = literal
  / var_decl
  / proc_func_call
  / param
  / LPAREN __ e:proc_additive_expr __ RPAREN {
      e.parentheses = true;
      return e;
    }

// Procedure primary list
proc_primary_list
  = head:proc_primary tail:(__ COMMA __ proc_primary)* {
      return createList(head, tail);
    }

// Procedure array
proc_array
  = LBRAKE __ l:proc_primary_list __ RBRAKE {
    return { type: 'array', value: l };
  }

// Variable declaration with prefix (@, $, etc.)
var_decl
  = p:KW_VAR_PRE d:without_prefix_var_decl {
    return {
      type: 'var',
      ...d,
      prefix: p
    };
  }

// Variable declaration without prefix
without_prefix_var_decl
  = name:ident_name m:mem_chain {
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

// Member chain (for object.property access)
mem_chain
  = l:('.' ident_name)* {
    const s = [];
    for (let i = 0; i < l.length; i++) {
      s.push(l[i][1]);
    }
    return s;
  }

