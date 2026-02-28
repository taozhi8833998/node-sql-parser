blob_type
  = b:('blob'i / 'tinyblob'i / 'mediumblob'i / 'longblob'i) { return { dataType: b.toUpperCase() }; }
