// Common identifier handling patterns shared across SQL dialects
// Note: ident_start, ident_part, column_part are dialect-specific and defined in each dialect file

// Identifier with reserved word check (uses dialect's reservedMap)
ident
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      return name;
    }
  / name:quoted_ident {
      return name;
    }

// Identifier type with reserved word check
ident_type
  = name:ident_name !{ return reservedMap[name.toUpperCase()] === true; } {
      return { type: 'default', value: name }
    }
  / quoted_ident_type

// Identifier type without reserved word check
ident_without_kw_type
  = n:ident_name {
    return { type: 'default', value: n }
  }
  / quoted_ident_type

// Alias identifier with error on reserved words
alias_ident
  = name:ident_name !{
      if (reservedMap[name.toUpperCase()] === true) throw new Error("Error: "+ JSON.stringify(name)+" is a reserved word, can not as alias clause");
      return false
    } {
      return name;
    }
  / name:quoted_ident {
      return name;
    }

// Quoted identifier types
quoted_ident_type
  = double_quoted_ident / single_quoted_ident / backticks_quoted_ident

quoted_ident
  = v:(double_quoted_ident / single_quoted_ident / backticks_quoted_ident) {
    return v.value
  }

double_quoted_ident
  = '"' chars:[^"]+ '"' {
    return {
      type: 'double_quote_string',
      value: chars.join('')
    }
  }

single_quoted_ident
  = "'" chars:[^']+ "'" {
    return {
      type: 'single_quote_string',
      value: chars.join('')
    }
  }

backticks_quoted_ident
  = "`" chars:[^`]+ "`" {
    return {
      type: 'backticks_quote_string',
      value: chars.join('')
    }
  }

// Identifier name construction
ident_name
  = start:ident_start parts:ident_part* { return start + parts.join(''); }

// Column name construction
column_name
  = start:ident_start parts:column_part* { return start + parts.join(''); }

// Column with reserved word check
column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / quoted_ident

// Column without keyword restriction
column_without_kw
  = name:column_name {
    return name;
  }
  / quoted_ident

// Column list
column_list
  = head:column tail:(__ COMMA __ column)* {
      return createList(head, tail);
    }

// Column reference with optional table prefix
column_ref
  = tbl:ident __ DOT __ col:column_without_kw {
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

// Column reference list
column_ref_list
  = head:column_ref tail:(__ COMMA __ column_ref)* {
      return createList(head, tail);
    }

// Column reference index (for index definitions)
column_ref_index
  = column_ref_list
  / literal_list

// Alias clause
alias_clause
  = KW_AS __ i:alias_ident { return i; }
  / KW_AS? __ i:ident { return i; }

// Parameter placeholder
param
  = l:(':' ident_name) {
      return { type: 'param', value: l[1] };
    }

