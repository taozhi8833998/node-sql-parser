trim_position
  = 'BOTH'i / 'LEADING'i / 'TRAILING'i

trim_rem
  = p:trim_position? __ rm:expr? __ k:KW_FROM {
    // => expr_list
    let value = []
    if (p) value.push({type: 'origin', value: p })
    if (rm) value.push(rm)
    value.push({type: 'origin', value: 'from' })
    return {
      type: 'expr_list',
      value,
    }
  }

trim_func_clause
  = 'trim'i __ LPAREN __ tr:trim_rem? __ s:expr __ RPAREN {
    // => { type: 'function'; name: proc_func_name; args: expr_list; }
    let args = tr || { type: 'expr_list', value: [] }
    args.value.push(s)
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: 'trim' }] },
        args,
    };
  }

tablefunc_clause
  = name:('crosstab'i / 'jsonb_to_recordset'i / 'jsonb_to_record'i /  'json_to_recordset'i / 'json_to_record'i) __ LPAREN __ s:expr_list __ RPAREN __ d:(KW_AS __ ident_name __ LPAREN __ column_data_type_list __ RPAREN)? {
    // => { type: 'tablefunc'; name: proc_func_name; args: expr_list; as: func_call }
    return {
      type: 'tablefunc',
      name: { name: [{ type: 'default', value: name }] },
      args: s,
      as: d && {
          type: 'function',
          name: { name: [{ type: 'default', value: d[2] }]},
          args: { type: 'expr_list', value: d[6].map(v => ({ ...v, type: 'column_definition' })) },
        }
    }
  }

func_call
  = trim_func_clause / tablefunc_clause
  / name:'now'i __ LPAREN __ l:expr_list? __ RPAREN __ 'at'i __ KW_TIME __ 'zone'i __ z:literal_string {
    // => { type: 'function'; name: proc_func_name; args: expr_list; suffix: literal_string; }
      z.prefix = 'at time zone'
      return {
        type: 'function',
        name: { name: [{ type: 'default', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        suffix: z
      };
    }
  / name:scalar_func __ LPAREN __ l:expr_list? __ RPAREN __ bc:over_partition? {
    // => { type: 'function'; name: proc_func_name; args: expr_list; over?: over_partition; }
      return {
        type: 'function',
        name: { name: [{ type: 'origin', value: name }] },
        args: l ? l: { type: 'expr_list', value: [] },
        over: bc
      };
    }
  / extract_func
  / f:scalar_time_func __ up:on_update_current_timestamp? {
    // => { type: 'function'; name: proc_func_name; over?: on_update_current_timestamp; }
    return {
        type: 'function',
        name: { name: [{ type: 'origin', value: f }] },
        over: up
    }
  }
  / name:proc_func_name __ LPAREN __ l:or_and_where_expr? __ RPAREN {
      // => { type: 'function'; name: proc_func_name; args: expr_list; }
      if (l && l.type !== 'expr_list') l = { type: 'expr_list', value: [l] }
      return {
        type: 'function',
        name: name,
        args: l ? l: { type: 'expr_list', value: [] }
      };
    }

extract_filed
  = f:('CENTURY'i / 'DAY'i / 'DATE'i / 'DECADE'i / 'DOW'i / 'DOY'i / 'EPOCH'i / 'HOUR'i / 'ISODOW'i / 'ISOYEAR'i / 'MICROSECONDS'i / 'MILLENNIUM'i / 'MILLISECONDS'i / 'MINUTE'i / 'MONTH'i / 'QUARTER'i / 'SECOND'i / 'TIMEZONE'i / 'TIMEZONE_HOUR'i / 'TIMEZONE_MINUTE'i / 'WEEK'i / 'YEAR'i) {
    // => 'string'
    return f
  }
extract_func
  = kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ t:(KW_TIMESTAMP / KW_INTERVAL / KW_TIME / KW_DATE)? __ s:expr __ RPAREN {
    // => { type: 'extract'; args: { field: extract_filed; cast_type: 'TIMESTAMP' | 'INTERVAL' | 'TIME'; source: expr; }}
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          cast_type: t,
          source: s,
        }
    }
  }
  / kw:KW_EXTRACT __ LPAREN __ f:extract_filed __ KW_FROM __ s:expr __ RPAREN {
    // => { type: 'extract'; args: { field: extract_filed; source: expr; }}
    return {
        type: kw.toLowerCase(),
        args: {
          field: f,
          source: s,
        }
    }
  }

scalar_time_func
  = KW_CURRENT_DATE
  / KW_CURRENT_TIME
  / KW_CURRENT_TIMESTAMP

scalar_func
  = scalar_time_func
  / KW_CURRENT_USER
  / KW_USER
  / KW_SESSION_USER
  / KW_SYSTEM_USER
  / "NTILE"i