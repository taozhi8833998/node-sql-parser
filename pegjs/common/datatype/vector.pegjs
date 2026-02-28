vector_type
  = t:KW_VECTOR __ num: data_type_size? {
    return {
      dataType: t,
    ...(num || {})
    };
  }
