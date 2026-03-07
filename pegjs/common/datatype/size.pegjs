data_type_size
  = LPAREN __ l:[0-9]+ __ RPAREN __ s:numeric_type_suffix? {
    return {
      length: parseInt(l.join(''), 10),
      parentheses: true,
      suffix: s,
    };
  }
