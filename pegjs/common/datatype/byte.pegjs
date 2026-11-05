byte_type
  = t:KW_BYTES __ LPAREN __ l:([0-9]+ / "MAX" / "max" ) __ RPAREN { return { dataType: t }; }
  / t:KW_BYTEA { return { dataType: t }; }

bit_type
  = t:KW_BIT __ v:('varying'i)? __ num:(__ LPAREN __ [0-9]+ __ RPAREN)? {
    /* =>  data_type */
    let dataType = t
    if (v) {
      dataType += ' VARYING'
    }
    const result = { dataType }
    if (num) {
      result.length = parseInt(num[3].join(''), 10)
      result.parentheses = true
    }
    return result
  }
