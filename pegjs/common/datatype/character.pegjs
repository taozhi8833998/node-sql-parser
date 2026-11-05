character_varying
  = KW_CHARACTER __ ('varying'i)? {
    return 'CHARACTER VARYING'
  }

character_string_type
  = t:(KW_CHAR / KW_VARCHAR / character_varying) num:(__ LPAREN __ [0-9]+ __ RPAREN __ ('ARRAY'i)?)? {
    const result = { dataType: t }
    if (num) {
      result.length = parseInt(num[3].join(''), 10)
      result.parentheses = true
      result.suffix = num[7] && ['ARRAY']
    }
    return result
  }
  / t:KW_STRING s:(__ LPAREN __ l:[0-9]+ __ RPAREN)* {
    const result = { dataType: t }
    if (!s || s.length === 0) return result
    return { ...result, length: parseInt(s[3].join(''), 10), parentheses: true  };
  }
