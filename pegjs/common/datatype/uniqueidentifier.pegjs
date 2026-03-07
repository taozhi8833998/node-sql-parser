uniqueidentifier_type
  = lb:LBRAKE? __ t:(KW_UNIQUEIDENTIFIER) __ rb:RBRAKE? !{ return (lb && !rb) || (!lb && rb) } {
    return { dataType: t }
  }
