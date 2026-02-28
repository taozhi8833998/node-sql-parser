data_type
  = array_type
  / character_string_type
  / numeric_type
  / datetime_type
  / json_type
  / geometry_type
  / text_type
  / uuid_type
  / boolean_type
  / enum_type
  / serial_interval_type
  / binary_type
  / oid_type
  / record_type
  / custom_types


array_type
  = t:(numeric_type / character_string_type) __ LBRAKE __ RBRAKE __ LBRAKE __ RBRAKE {
    /* => data_type */
    return { ...t, array: 'two' }
  }
  / t:(numeric_type / character_string_type) __ LBRAKE __ RBRAKE {
    /* => data_type */
    return { ...t, array: 'one' }
  }

boolean_type
  = t:(KW_BOOL / KW_BOOLEAN) { /* => data_type */ return { dataType: t }}

binary_type
  = 'bytea'i { /* => data_type */ return { dataType: 'BYTEA' }; }

character_varying
  = KW_CHARACTER __ ('varying'i)? {
    // => string
    return 'CHARACTER VARYING'
  }
character_string_type
  = t:(KW_CHAR / KW_VARCHAR / character_varying) __ LPAREN __ l:[0-9]+ __ RPAREN {
    // => data_type
    return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true };
  }
  / t:(KW_CHAR / character_varying / KW_VARCHAR) { /* =>  data_type */ return { dataType: t }; }

numeric_type_suffix
  = un: KW_UNSIGNED? __ ze: KW_ZEROFILL? {
    // => any[];
    const result = []
    if (un) result.push(un)
    if (ze) result.push(ze)
    return result
  }
numeric_type
  = t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE __ 'PRECISION'i / KW_DOUBLE / KW_SERIAL / KW_BIGSERIAL /  KW_REAL) __ LPAREN __ l:[0-9]+ __ r:(COMMA __ [0-9]+)? __ RPAREN __ s:numeric_type_suffix? { /* =>  data_type */ return { dataType: Array.isArray(t) ? `${t[0].toUpperCase()} ${t[2].toUpperCase()}` : t, length: parseInt(l.join(''), 10), scale: r && parseInt(r[2].join(''), 10), parentheses: true, suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE __ 'PRECISION'i / KW_DOUBLE / KW_SERIAL / KW_BIGSERIAL /  KW_REAL)l:[0-9]+ __ s:numeric_type_suffix? { /* =>  data_type */ return { dataType: Array.isArray(t) ? `${t[0].toUpperCase()} ${t[2].toUpperCase()}` : t, length: parseInt(l.join(''), 10), suffix: s }; }
  / t:(KW_NUMERIC / KW_DECIMAL / KW_INT / KW_INTEGER / KW_SMALLINT / KW_TINYINT / KW_BIGINT / KW_FLOAT / KW_DOUBLE __ 'PRECISION'i / KW_DOUBLE / KW_SERIAL / KW_BIGSERIAL /  KW_REAL) __ s:numeric_type_suffix? __{ /* =>  data_type */ return { dataType: Array.isArray(t) ? `${t[0].toUpperCase()} ${t[2].toUpperCase()}` : t, suffix: s }; }

oid_type
  = t:(KW_OID / KW_REGCLASS / KW_REGCOLLATION / KW_REGCONFIG / KW_REGDICTIONARY / KW_REGNAMESPACE / KW_REGOPER / KW_REGOPERATOR / KW_REGPROC / KW_REGPROCEDURE / KW_REGROLE / KW_REGTYPE) { /* => data_type */ return { dataType: t }}

timezone
  = w:('WITHOUT'i / 'WITH'i) __ KW_TIME __ 'ZONE'i {
    // => string[];
    return [w.toUpperCase(), 'TIME', 'ZONE']
  }

time_type
  = t:(KW_TIME / KW_TIMESTAMP) __ LPAREN __ l:[0-9]+ __ RPAREN __ tz:timezone? { /* =>  data_type */ return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true, suffix: tz }; }
  / t:(KW_TIME / KW_TIMESTAMP) __ tz:timezone? { /* =>  data_type */  return { dataType: t, suffix: tz }; }

datetime_type
  = t:(KW_DATE / KW_DATETIME) __ LPAREN __ l:[0-9]+ __ RPAREN { /* =>  data_type */ return { dataType: t, length: parseInt(l.join(''), 10), parentheses: true }; }
  / t:(KW_DATE / KW_DATETIME) { /* =>  data_type */  return { dataType: t }; }
  / time_type

enum_type
  = t:KW_ENUM __ e:value_item {
    /* =>  data_type */
    e.parentheses = true
    return {
      dataType: t,
      expr: e
    }
  }

json_type
  = t:(KW_JSON / KW_JSONB) { /* =>  data_type */  return { dataType: t }; }

geometry_type
  = t:KW_GEOMETRY {/* =>  data_type */  return { dataType: t }; }

serial_interval_type
  = t:(KW_SERIAL / KW_INTERVAL) { /* =>  data_type */  return { dataType: t }; }

text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) LBRAKE __ RBRAKE { /* =>  data_type */ return { dataType: `${t}[]` }}
  / t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) { /* =>  data_type */ return { dataType: t }}

uuid_type
  = t:KW_UUID {/* =>  data_type */  return { dataType: t }}

record_type
  = 'RECORD'i {/* =>  data_type */  return { dataType: 'RECORD' }}

custom_types
  = name:ident_name &{ return customTypes.has(name) } {
      // => data_type
      return { dataType: name }
  }