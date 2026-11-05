// Top-level literal rule
literal
  = literal_string
  / literal_numeric
  / literal_bool
  / literal_null
  / literal_datetime

literal_list
  = head:literal tail:(__ COMMA __ literal)* {
    // => literal[]
      return createList(head, tail);
    }

literal_null
  = KW_NULL {
    // => { type: 'null'; value: null }
      return { type: 'null', value: null };
    }

literal_not_null
  = KW_NOT_NULL {
    // => { type: 'not null'; value: 'not null' }
    return {
      type: 'not null',
      value: 'not null',
    }
  }

literal_bool
  = KW_TRUE {
      // => { type: 'bool', value: true }
      return { type: 'bool', value: true };
    }
  / KW_FALSE {
      //=> { type: 'bool', value: false }
      return { type: 'bool', value: false };
    }

literal_string
  = ca:("'" single_char* "'") [\n]+ __ fs:("'" single_char* "'") {
      // => { type: 'single_quote_string'; value: string; }
      return {
        type: 'single_quote_string',
        value: `${ca[1].join('')}${fs[1].join('')}`
      };
    }
  / ca:("'" single_char* "'") {
      // => { type: 'single_quote_string'; value: string; }
      return {
        type: 'single_quote_string',
        value: ca[1].join('')
      };
    }
  / literal_double_quoted_string

literal_double_quoted_string
  = ca:("\"" single_quote_char* "\"") !DOT {
      // => { type: 'string'; value: string; }
      return {
        type: 'double_quote_string',
        value: ca[1].join('')
      };
    }

literal_datetime
  = type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("'" single_char* "'") {
      // => { type: 'TIME' | 'DATE' | 'TIMESTAMP' | 'DATETIME', value: string }
      return {
        type: type.toLowerCase(),
        value: ca[1].join('')
      };
    }
  / type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("\"" single_quote_char* "\"") {
    // => { type: 'TIME' | 'DATE' | 'TIMESTAMP' | 'DATETIME', value: string }
      return {
        type: type.toLowerCase(),
        value: ca[1].join('')
      };
    }

literal_numeric
  = n:number {
    // => number | { type: 'bigint'; value: string; }
      if (n && n.type === 'bigint') return n
      return { type: 'number', value: n };
    }

number
  = int_:int? frac:frac exp:exp {
    const numStr = (int_ || '') + frac + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int? frac:frac {
    // => IGNORE
    const numStr = (int_ || '') + frac
    if (int_ && isBigInt(int_)) return {
      type: 'bigint',
      value: numStr
    }
    return parseFloat(numStr);
  }
  / int_:int exp:exp {
    // => IGNORE
    const numStr = int_ + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int {
    // => IGNORE
    if (isBigInt(int_)) return {
      type: 'bigint',
      value: int_
    }
    return parseFloat(int_);
  }

int
  = digits / digit
  / op:("-" / "+" ) digits:digits { return op + digits; }
  / op:("-" / "+" ) digit:digit { return op + digit; }

digits
  = digits:digit+ { return digits.join(""); }

digit = [0-9]

frac
  = "." digits:digits { return "." + digits; }

exp
  = e:e digits:digits { return e + digits; }

hexDigit
  = [0-9a-fA-F]

e
  = e:[eE] sign:[+-]? { return e + (sign !== null ? sign: ''); }

// Character parsing rules
single_quote_char
  = [^"\\\0-\x1F\x7f]
  / escape_char

single_char
  = [^'\\] // remove \0-\x1F\x7f pnCtrl char [^'\\\0-\x1F\x7f]
  / escape_char

escape_char
  = "\\'"  { return "\\'";  }
  / '\\"'  { return '\\"';  }
  / "\\\\" { return "\\\\"; }
  / "\\/"  { return "\\/";  }
  / "\\b"  { return "\b"; }
  / "\\f"  { return "\f"; }
  / "\\n"  { return "\n"; }
  / "\\r"  { return "\r"; }
  / "\\t"  { return "\t"; }
  / "\\u" h1:hexDigit h2:hexDigit h3:hexDigit h4:hexDigit {
      return String.fromCharCode(parseInt("0x" + h1 + h2 + h3 + h4));
    }
  / "\\" { return "\\"; }
  / "''" { return "''" }
  / '""' { return '""' }
  / '``' { return '``' }