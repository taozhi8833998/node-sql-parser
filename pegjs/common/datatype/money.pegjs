money_type
  = t:(KW_MONEY) { /* => data_type */ return { dataType: t } }
