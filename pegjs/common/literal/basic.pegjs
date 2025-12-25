// Common basic literal rules

literal_null
  = KW_NULL {
      return { type: 'null', value: null };
    }

literal_not_null
  = KW_NOT_NULL {
    return {
      type: 'not null',
      value: 'not null',
    }
  }

literal_bool
  = KW_TRUE {
      return { type: 'bool', value: true };
    }
  / KW_FALSE {
      return { type: 'bool', value: false };
    }

literal_numeric
  = n:number {
      if (n && n.type === 'bigint') return n
      return { type: 'number', value: n };
    }

literal_list
  = head:literal tail:(__ COMMA __ literal)* {
      return createList(head, tail);
    }

