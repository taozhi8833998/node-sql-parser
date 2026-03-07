text_type
  = lb:LBRAKE? __ t:(KW_TINYTEXT / KW_TEXT / KW_NTEXT / KW_MEDIUMTEXT / KW_LONGTEXT) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t }
  }

json_type
  = lb:LBRAKE? __ t:KW_JSON __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t };
  }

numeric_type_suffix
  = un:signedness? __ ze:KW_ZEROFILL? {
    const result = []
    if (un) result.push(un)
    if (ze) result.push(ze)
    return result
  }

numeric_type
  = lb:LBRAKE? __ t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_REAL / KW_DOUBLE) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? {
    return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s };
  }
  / lb:LBRAKE? __ t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_REAL / KW_DOUBLE) rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ l:[0-9]+ __ s:numeric_type_suffix? {
    return { dataType: t, length: parseInt(l.join(''), 10), suffix: s };
  }
  / lb:LBRAKE? __ t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_REAL / KW_DOUBLE / KW_BIT / KW_MONEY / KW_SMALLMONEY) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ s:numeric_type_suffix? __{
    return { dataType: t, suffix: s };
  }

datetime_type
  = lb:LBRAKE? __ t:(KW_DATETIME2 / KW_DATETIMEOFFSET / KW_TIME) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN {
    return  {dataType: t, length: parseInt(l.join(''), 10), parentheses: true }
  }
  / lb:LBRAKE? __ t:(KW_DATE / KW_SMALLDATETIME / KW_DATETIME2 / KW_DATETIME / KW_DATETIMEOFFSET / KW_TIME / KW_TIMESTAMP) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t };
  }

character_binary_type
  = lb:LBRAKE? __ t:(KW_CHAR / KW_VARCHAR / KW_NCHAR / KW_NVARCHAR / KW_BINARY / KW_VARBINARY) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ LPAREN __ l:[0-9]+ __ RPAREN {
    return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true };
  }
  / lb:LBRAKE? __ t:(KW_NVARCHAR / KW_VARCHAR / KW_VARBINARY) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } __ LPAREN __ m:'MAX'i __ RPAREN {
    return {
      dataType: t,
      length: 'max'
    }
  }
  / lb:LBRAKE? __ t:(KW_CHAR / KW_VARCHAR / KW_BINARY / KW_VARBINARY) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t };
  }
