binary_type
  = t:(KW_BINARY / KW_VARBINARY) __ num:data_type_size? {
    return { dataType: t, ...(num || {}) }
  }
