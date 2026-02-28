timezone
  = w:('WITHOUT'i / 'WITH'i) __ KW_TIME __ 'ZONE'i {
    // => string[];
    return [w.toUpperCase(), 'TIME', 'ZONE']
  }

time_type
  = t:(KW_TIME / KW_TIMESTAMP / KW_TIMESTAMPTZ / KW_TIMESTAMP_TZ / KW_TIMESTAMP_NTZ) __ LPAREN __ l:[0-9]+ __ RPAREN __ tz:timezone? { return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true, suffix: tz }; }
  / t:(KW_TIME / KW_TIMESTAMP / KW_TIMESTAMPTZ / KW_TIMESTAMP_TZ / KW_TIMESTAMP_NTZ) __ tz:timezone? { return { dataType: t, suffix: tz }; }

datetime_type
  = t:(KW_DATE / KW_DATETIME / KW_YEAR) num:(__ LPAREN __ [0-6] __ RPAREN __ numeric_type_suffix?)? {
    const result = { dataType: t }
    if (num) {
      result.length = parseInt(num[3], 10)
      result.parentheses = true
      result.suffix = num[7]
    }
    return result
  }
  / time_type
