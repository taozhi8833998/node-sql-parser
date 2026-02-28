// Common datetime literal rule

literal_datetime
  = type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("'" single_char* "'") {
      return {
        type: type.toLowerCase(),
        value: ca[1].join('')
      };
    }
  / type:(KW_TIME / KW_DATE / KW_TIMESTAMP / KW_DATETIME) __ ca:("\"" single_quote_char* "\"") {
      return {
        type: type.toLowerCase(),
        value: ca[1].join('')
      };
    }

