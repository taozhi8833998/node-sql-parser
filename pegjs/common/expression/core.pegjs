// Core expression patterns shared across SQL dialects
// Operator precedence (highest to lowest):
// 1. Unary: +, -, !, ~
// 2. Multiplicative: *, /, %
// 3. Additive: +, -
// 4. Comparison: =, <, >, <=, >=, <>, !=, IS, LIKE, BETWEEN, IN
// 5. NOT
// 6. AND
// 7. OR

// Top-level expression (includes subqueries)
expr
  = _expr / union_stmt

_expr
  = or_expr
  / unary_expr

// Unary expression
unary_expr
  = op:additive_operator tail:(__ primary)+ {
    return createUnaryExpr(op, tail[0][1]);
  }

// Binary column expression for SELECT columns
binary_column_expr
  = head:expr tail:(__ (KW_AND / KW_OR / LOGIC_OPERATOR) __ expr)* {
    const ast = head.ast
    if (ast && ast.type === 'select') {
      if (!(head.parentheses_symbol || head.parentheses || head.ast.parentheses || head.ast.parentheses_symbol) || ast.columns.length !== 1 || ast.columns[0].expr.column === '*') throw new Error('invalid column clause with select statement')
    }
    if (!tail || tail.length === 0) return head
    const len = tail.length
    let result = tail[len - 1][3]
    for (let i = len - 1; i >= 0; i--) {
      const left = i === 0 ? head : tail[i - 1][3]
      result = createBinaryExpr(tail[i][1], left, result)
    }
    return result
  }

// OR/AND expression for WHERE clause (with comma support for lists)
or_and_where_expr
  = head:expr tail:(__ (KW_AND / KW_OR / COMMA) __ expr)* {
    const len = tail.length
    let result = head;
    let seperator = ''
    for (let i = 0; i < len; ++i) {
      if (tail[i][1] === ',') {
        seperator = ','
        if (!Array.isArray(result)) result = [result]
        result.push(tail[i][3])
      } else {
        result = createBinaryExpr(tail[i][1], result, tail[i][3]);
      }
    }
    if (seperator === ',') {
      const el = { type: 'expr_list' }
      el.value = result
      return el
    }
    return result
  }

// OR expression
or_expr
  = head:and_expr tail:(___ KW_OR __ and_expr)* {
      return createBinaryExprChain(head, tail);
    }

// AND expression
and_expr
  = head:not_expr tail:(___ KW_AND __ not_expr)* {
      return createBinaryExprChain(head, tail);
    }

// NOT expression (includes EXISTS)
not_expr
  = comparison_expr
  / exists_expr
  / (KW_NOT / "!" !"=") __ expr:not_expr {
      return createUnaryExpr('NOT', expr);
    }

// Comparison expression
comparison_expr
  = left:additive_expr __ rh:comparison_op_right? {
      if (rh === null) return left;
      else if (rh.type === 'arithmetic') return createBinaryExprChain(left, rh.tail);
      else return createBinaryExpr(rh.op, left, rh.right);
    }
  / literal_string
  / column_ref

// EXISTS expression
exists_expr
  = op:exists_op __ LPAREN __ stmt:union_stmt __ RPAREN {
    stmt.parentheses = true;
    return createUnaryExpr(op, stmt);
  }

exists_op
  = nk:(KW_NOT __ KW_EXISTS) { return nk[0] + ' ' + nk[2]; }
  / KW_EXISTS

// Comparison operators right side
comparison_op_right
  = arithmetic_op_right
  / in_op_right
  / between_op_right
  / is_op_right
  / like_op_right

// Arithmetic comparison
arithmetic_op_right
  = l:(__ arithmetic_comparison_operator __ additive_expr)+ {
      return { type: 'arithmetic', tail: l };
    }

arithmetic_comparison_operator
  = ">=" / ">" / "<=" / "<>" / "<" / "=" / "!="

// IS / IS NOT
is_op_right
  = KW_IS __ right:additive_expr {
      return { op: 'IS', right: right };
    }
  / (KW_IS __ KW_NOT) __ right:additive_expr {
      return { op: 'IS NOT', right: right };
  }

// BETWEEN / NOT BETWEEN
between_op_right
  = op:between_or_not_between_op __ begin:additive_expr __ KW_AND __ end:additive_expr {
      return {
        op: op,
        right: {
          type: 'expr_list',
          value: [begin, end]
        }
      };
    }

between_or_not_between_op
  = nk:(KW_NOT __ KW_BETWEEN) { return nk[0] + ' ' + nk[2]; }
  / KW_BETWEEN

// LIKE / NOT LIKE
like_op
  = nk:(KW_NOT __ KW_LIKE) { return nk[0] + ' ' + nk[2]; }
  / KW_LIKE

like_op_right
  = op:like_op __ right:(literal / comparison_expr) {
      return { op: op, right: right };
    }

// IN / NOT IN
in_op
  = nk:(KW_NOT __ KW_IN) { return nk[0] + ' ' + nk[2]; }
  / KW_IN

in_op_right
  = op:in_op __ LPAREN __ l:expr_list __ RPAREN {
      return { op: op, right: l };
    }
  / op:in_op __ e:(var_decl / literal_string / func_call) {
      return { op: op, right: e };
    }

// Additive expression (+, -)
additive_expr
  = head:multiplicative_expr
    tail:(__ additive_operator __ multiplicative_expr)* {
      if (tail && tail.length && head.type === 'column_ref' && head.column === '*') throw new Error(JSON.stringify({
        message: 'args could not be star column in additive expr',
        ...getLocationObject(),
      }))
      return createBinaryExprChain(head, tail);
    }

additive_operator
  = "+" / "-"

// Multiplicative expression (*, /, %)
multiplicative_expr
  = head:unary_expr_or_primary
    tail:(__ (multiplicative_operator / LOGIC_OPERATOR) __ unary_expr_or_primary)* {
      return createBinaryExprChain(head, tail)
    }

multiplicative_operator
  = "*" / "/" / "%"

// Primary expression (terminals)
primary
  = cast_expr
  / literal
  / interval_expr
  / aggr_func
  / func_call
  / case_expr
  / column_ref
  / param
  / LPAREN __ list:or_and_where_expr __ RPAREN {
      list.parentheses = true;
      return list;
    }
  / var_decl

// Unary operators
unary_expr_or_primary
  = jsonb_expr
  / op:unary_operator tail:(__ unary_expr_or_primary) {
    return createUnaryExpr(op, tail[1])
  }

unary_operator
  = '!' / '-' / '+' / '~'

// JSON/JSONB operators
jsonb_expr
  = head:primary __ tail:(__ ('?|' / '?&' / '?' / '#-' / '#>>' / '#>' / DOUBLE_ARROW / SINGLE_ARROW / '@>' / '<@') __ primary)* {
    if (!tail || tail.length === 0) return head
    return createBinaryExprChain(head, tail)
  }

// OR/AND expression (basic version without comma)
or_and_expr
  = head:expr tail:(__ (KW_AND / KW_OR) __ expr)* {
    const len = tail.length
    let result = head
    for (let i = 0; i < len; ++i) {
      result = createBinaryExpr(tail[i][1], result, tail[i][3])
    }
    return result
  }

// INTERVAL expression
interval_expr
  = KW_INTERVAL __
    e:expr __
    u:interval_unit {
      return {
        type: 'interval',
        expr: e,
        unit: u.toLowerCase(),
      }
    }

// CASE expression
case_expr
  = KW_CASE __
    condition_list:case_when_then_list __
    otherwise:case_else? __
    KW_END __ KW_CASE? {
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: null,
        args: condition_list
      };
    }
  / KW_CASE __
    expr:expr __
    condition_list:case_when_then_list __
    otherwise:case_else? __
    KW_END __ KW_CASE? {
      if (otherwise) condition_list.push(otherwise);
      return {
        type: 'case',
        expr: expr,
        args: condition_list
      };
    }

case_when_then_list
  = head:case_when_then __ tail:(__ case_when_then)* {
    return createList(head, tail, 1)
  }

case_when_then
  = KW_WHEN __ condition:or_and_where_expr __ KW_THEN __ result:expr {
    return {
      type: 'when',
      cond: condition,
      result: result
    };
  }

case_else
  = KW_ELSE __ result:expr {
    return { type: 'else', result: result };
  }
