// Comment rules for MySQL and MariaDB.
// Same as comment.pegjs, but `--` starts a comment only when it is followed by
// whitespace, a control character or the end of input, so `b--1` is `b - -1`.
// https://dev.mysql.com/doc/refman/8.4/en/ansi-diff-comments.html

whitespace =
  [ \t\n\r]

EOL
  = EOF
  / [\n\r]+

EOF = !.

char = .
__
  = (whitespace / comment)*

___
  = (whitespace / comment)+

comment
  = block_comment
  / line_comment
  / pound_sign_comment

block_comment
  = "/*" (!"*/" char)* "*/"

line_comment
  = "--" &([\x00-\x20\x7F] / EOF) (!EOL char)*

pound_sign_comment
  = "#" (!EOL char)*

keyword_comment
  = k:KW_COMMENT __ s:KW_ASSIGIN_EQUAL? __ c:literal_string {
    // => { type: 'comment'; keyword: 'comment'; symbol: '='; value: literal_string; }
    return {
      type: k.toLowerCase(),
      keyword: k.toLowerCase(),
      symbol: s,
      value: c,
    }
  }

