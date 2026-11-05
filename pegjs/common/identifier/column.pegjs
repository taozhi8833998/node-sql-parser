// Common column and identifier name rules
// Used by: db2, sqlite, flinksql, snowflake, trino, transactsql

column_without_kw
  = name:column_name {
    return name;
  }
  / quoted_ident

column
  = name:column_name !{ return reservedMap[name.toUpperCase()] === true; } { return name; }
  / quoted_ident

column_name
  = start:ident_start parts:column_part* { return start + parts.join(''); }

ident_name
  = start:ident_start parts:ident_part* { return start + parts.join(''); }

param
  = l:(':' ident_name) {
      return { type: 'param', value: l[1] };
    }

