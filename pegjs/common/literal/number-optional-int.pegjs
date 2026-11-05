// Common number parsing rules (optional int version for Snowflake, Trino, Redshift)
// Supports numbers like .5 without leading 0

number
  = int_:int? frac:frac exp:exp {
    const numStr = (int_ || '') + frac + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int? frac:frac {
    const numStr = (int_ || '') + frac
    if (int_ && isBigInt(int_)) return {
      type: 'bigint',
      value: numStr
    }
    return parseFloat(numStr).toFixed(frac.length - 1);
  }
  / int_:int exp:exp {
    const numStr = int_ + exp
    return {
      type: 'bigint',
      value: numStr
    }
  }
  / int_:int {
    if (isBigInt(int_)) return {
      type: 'bigint',
      value: int_
    }
    return parseFloat(int_);
  }

int
  = digits
  / digit:digit
  / op:("-" / "+" ) digits:digits { return op + digits; }
  / op:("-" / "+" ) digit:digit { return op + digit; }

frac
  = "." digits:digits { return "." + digits; }

exp
  = e:e digits:digits { return e + digits; }

digits
  = digits:digit+ { return digits.join(""); }

digit   = [0-9]

hexDigit
  = [0-9a-fA-F]

e
  = e:[eE] sign:[+-]? { return e + (sign !== null ? sign: ''); }

