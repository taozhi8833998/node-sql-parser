boolean_type
  = t:(KW_BOOL / KW_BOOLEAN) {
    return { dataType: t }
  }
