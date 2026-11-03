// Unified literal_string covering all SQL dialects
// Includes: hex, bit, full_hex, natural (N), unicode (u&), regex (R), newline continuation

literal_string
  = b:('_binary'i / '_latin1'i)? __ r:'X'i ca:("'" [0-9A-Fa-f]* "'") {
      return {
        type: 'hex_string',
        prefix: b,
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
  / b:('_binary'i / '_latin1'i)? __ r:'b'i ca:("'" [0-9A-Fa-f]* "'") {
      return {
        type: 'bit_string',
        prefix: b,
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
  / b:('_binary'i / '_latin1'i)? __ r:'0x'i ca:([0-9A-Fa-f]*) {
    return {
        type: 'full_hex_string',
        prefix: b,
        value: ca.join(''),
        ...getLocationObject(),
      };
  }
  / r:'N'i ca:("'" single_char* "'") {
    return {
        type: 'natural_string',
        value: ca[1].join(''),
        ...getLocationObject(),
      };
  }
  / r:'u&'i ca:("'" single_char* "'") {
      return {
        type: 'unicode_string',
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
  / r:'R'i __ ca:("'" single_char* "'") {
      return {
        type: 'regex_string',
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
  / r:'R'i __ ca:("\"" single_quote_char* "\"") {
      return {
        type: 'regex_string',
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
  / ca:("'" single_char* "'") [\n]+ __ fs:("'" single_char* "'") {
      return {
        type: 'single_quote_string',
        value: `${ca[1].join('')}${fs[1].join('')}`,
        ...getLocationObject(),
      };
    }
  / ca:("'" single_char* "'") {
      return {
        type: 'single_quote_string',
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
  / literal_double_quoted_string

literal_double_quoted_string
  = ca:("\"" single_quote_char* "\"") __ !(DOT / LPAREN) {
      return {
        type: 'double_quote_string',
        value: ca[1].join(''),
        ...getLocationObject(),
      };
    }
