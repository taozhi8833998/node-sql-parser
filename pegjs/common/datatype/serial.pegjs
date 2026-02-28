serial_type
  = t:(KW_SERIAL / KW_SMALLSERIAL) { return { dataType: t }; }
