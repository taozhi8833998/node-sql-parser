custom_types
  = schema:ident_name __ DOT __ name:ident_without_kw &{ return customTypes.has(`${schema}.${name}`) }  {
      return { schema: schema, dataType: name }
  }
  / name:ident_name &{ return customTypes.has(name) } {
      return { dataType: name }
  }
