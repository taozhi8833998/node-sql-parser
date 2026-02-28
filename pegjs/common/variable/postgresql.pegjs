var_decl_list
  = head:var_decl tail:(__ COMMA __ var_decl)* {
    // => var_decl[]
    return createList(head, tail)
  }

var_decl
  = p:KW_VAR_PRE_DOLLAR_DOUBLE d:[^$]* s:KW_VAR_PRE_DOLLAR_DOUBLE {
    // => { type: 'var'; name: string; prefix: string; suffix: string; }
    return {
      type: 'var',
      name: d.join(''),
      prefix: '$$',
      suffix: '$$'
    };
  }
  / KW_VAR_PRE_DOLLAR f:column KW_VAR_PRE_DOLLAR d:[^$]* KW_VAR_PRE_DOLLAR s:column !{ if (f !== s) return true } KW_VAR_PRE_DOLLAR {
    // => { type: 'var'; name: string; prefix: string; suffix: string; }
    return {
      type: 'var',
      name: d.join(''),
      prefix: `$${f}$`,
      suffix: `$${s}$`
    };
  }
  / p:KW_VAR_PRE d: without_prefix_var_decl {
    // => without_prefix_var_decl & { type: 'var'; prefix: string; }
    // push for analysis
    return {
      type: 'var',
      ...d,
      prefix: p
    };
  }

without_prefix_var_decl
  = p:'"'? name:ident_name m:mem_chain s:'"'? {
    // => { type: 'var'; prefix: string; name: ident_name; members: mem_chain; quoted: string | null }
    //push for analysis
    if ((p && !s) || (!p && s)) throw new Error('double quoted not match')
    varList.push(name);
    return {
      type: 'var',
      name: name,
      members: m,
      quoted: p && s ? '"' : null,
      prefix: null,
    };
  }
  / n:literal_numeric {
    // => { type: 'var'; prefix: null; name: number; members: []; quoted: null }
    return {
      type: 'var',
      name: n.value,
      members: [],
      quoted: null,
      prefix: null,
    }
  }