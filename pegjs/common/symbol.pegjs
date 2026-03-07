// Common symbols and punctuation shared across SQL dialects

DOT       = '.'
COMMA     = ','
STAR      = '*'
LPAREN    = '('
RPAREN    = ')'

LBRAKE    = '['
RBRAKE    = ']'

LANGLE_BRACKET = '<'
RANGLE_BRACKET = '>'

SEMICOLON = ';'
SINGLE_ARROW = '->'
DOUBLE_ARROW = '->>'

OPERATOR_CONCATENATION = '||'
OPERATOR_AND = '&&'

// Note: The following are defined per-dialect since they vary:
// - ident_start, ident_part, column_part (different unicode support)
// - line_terminator
// - OPERATOR_XOR (only MySQL/MariaDB)
// - LOGIC_OPERATOR (some dialects include XOR)
