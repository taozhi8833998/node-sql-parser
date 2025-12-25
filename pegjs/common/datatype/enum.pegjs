enum_type
  = t:(KW_ENUM / KW_SET) __ e:value_item {
    e.parentheses = true
    return {
      dataType: t,
      expr: e
    }
  }
