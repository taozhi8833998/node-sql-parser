// Common string character parsing rules (minimal version for Trino)
// Only has '' escape, no "" or `` escapes

single_quote_char
  = [^"\\\0-\x1F\x7f]
  / escape_char

single_char
  = [^'\\]
  / escape_char

escape_char
  = "\\'"  { return "\\'";  }
  / '\\"'  { return '\\"';  }
  / "\\\\" { return "\\\\"; }
  / "\\/"  { return "\\/";  }
  / "\\" { return "\\"; }
  / "''" { return "''" }

