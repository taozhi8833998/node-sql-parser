json_type
  = t:(KW_JSON / KW_JSONB) {
    return { dataType: t };
  }
