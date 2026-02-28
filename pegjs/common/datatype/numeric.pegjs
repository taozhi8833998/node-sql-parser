numeric_type_suffix
  = un:signedness? __ ze:KW_ZEROFILL? {
    const result = []
    if (un) result.push(un)
    if (ze) result.push(ze)
    return result
  }

KW_DOUBLE_PRECISION
  = KW_DOUBLE p:(__ KW_PRECISION)? {
    if (p) {
      return 'DOUBLE PRECISION'
    }
    return 'DOUBLE'
  }

numeric_type
  = t:(KW_NUMBER / KW_NUMERIC / KW_DECIMAL / KW_INT / KW_BYTEINT / KW_INTEGER / KW_SMALLINT / KW_MEDIUMINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_FLOAT4 / KW_FLOAT8 / KW_DOUBLE_PRECISION / KW_SERIAL / KW_BIGSERIAL / KW_BIT / KW_REAL) __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? {
    return { dataType: t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s };
  }
  // for bigquery int64 not int(64)
  / t: KW_INT_64 __ s:numeric_type_suffix? __ {
      return { dataType: t, suffix: s };
  }
  / t:(KW_NUMBER / KW_NUMERIC / KW_DECIMAL / KW_INT / KW_BYTEINT /KW_INTEGER / KW_SMALLINT / KW_MEDIUMINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_FLOAT4 / KW_FLOAT8 / KW_DOUBLE_PRECISION / KW_SERIAL / KW_BIGSERIAL / KW_BIT / KW_REAL)l:[0-9]+ __ s:numeric_type_suffix? {
    return { dataType: t, length: parseInt(l.join(''), 10), suffix: s };
  }
  / t:(KW_NUMBER / KW_NUMERIC / KW_DECIMAL / KW_INT / KW_BYTEINT / KW_INTEGER / KW_FLOAT_64 / KW_SMALLINT / KW_MEDIUMINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_FLOAT4 / KW_FLOAT8 / KW_DOUBLE_PRECISION / KW_SERIAL / KW_BIGSERIAL / KW_BIT / KW_REAL) __ s:numeric_type_suffix? __ {
    return { dataType: t, suffix: s };
  }
