network_address_type
  = t:(KW_INET / KW_CIDR / KW_MACADDR8 / KW_MACADDR) {/* =>  data_type */  return { dataType: t }}
