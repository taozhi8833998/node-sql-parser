// Common basic literal rules (without literal_numeric)
// For dialects that have custom literal_numeric implementations

literal_null
  = KW_NULL {
      return { type: 'null', value: null, ...getLocationObject() };
    }

literal_not_null
  = KW_NOT_NULL {
    return {
      type: 'not null',
      value: 'not null',
      ...getLocationObject(),
    }
  }

literal_bool
  = KW_TRUE {
      return { type: 'bool', value: true, ...getLocationObject() };
    }
  / KW_FALSE {
      return { type: 'bool', value: false, ...getLocationObject() };
    }

literal_list
  = head:literal tail:(__ COMMA __ literal)* {
      return createList(head, tail);
    }


