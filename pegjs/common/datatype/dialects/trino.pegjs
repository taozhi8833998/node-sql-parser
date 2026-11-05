text_type
   = lb:LBRAKE? __ t:(KW_TINYTEXT / KW_TEXT / KW_NTEXT / KW_MEDIUMTEXT / KW_LONGTEXT) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t }
  }
