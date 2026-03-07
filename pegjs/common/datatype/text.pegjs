text_type
  = t:(KW_TINYTEXT / KW_TEXT / KW_MEDIUMTEXT / KW_LONGTEXT) num:data_type_size? {
    return { dataType: t, ...(num || {}) }
  }
