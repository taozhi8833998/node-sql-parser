import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isSelect, isBinary, isExprList } from './types.guard.ts';

const parser = new Parser();

describe('Binary, Unary, and ExprList Types', () => {
  test('Binary expression with AND operator', () => {
    const ast = parser.astify("SELECT * FROM t WHERE a AND b");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'AND');
  });

  test('Binary expression with OR operator', () => {
    const ast = parser.astify("SELECT * FROM t WHERE a OR b");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'OR');
  });

  test('Binary expression with comparison operators', () => {
    const ast = parser.astify("SELECT * FROM t WHERE age > 18");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, '>');
  });

  test('Binary expression with BETWEEN', () => {
    const ast = parser.astify("SELECT * FROM t WHERE age BETWEEN 18 AND 65");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'BETWEEN');
  });

  test('Binary expression with IS NULL', () => {
    const ast = parser.astify("SELECT * FROM t WHERE name IS NULL");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'IS');
  });

  test('Binary expression with IS NOT NULL', () => {
    const ast = parser.astify("SELECT * FROM t WHERE name IS NOT NULL");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'IS NOT');
  });

  test('Unary expression with NOT', () => {
    const ast = parser.astify("SELECT * FROM t WHERE NOT active");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.strictEqual(where.type, 'unary_expr');
    assert.strictEqual(where.operator, 'NOT');
    assert.ok(where.expr, 'Should have expr property');
  });

  test('ExprList in IN clause', () => {
    const ast = parser.astify("SELECT * FROM t WHERE id IN (1, 2, 3)");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'IN');
    assert.ok(isExprList(where.right), 'Right side should be ExprList');
    assert.strictEqual(where.right.type, 'expr_list');
    assert.strictEqual(where.right.value.length, 3);
  });

  test('ExprList in function arguments', () => {
    const ast = parser.astify("SELECT CONCAT(first_name, ' ', last_name) FROM users");
    assert.ok(isSelect(ast), 'Should be Select');
    const column = ast.columns[0];
    assert.strictEqual(column.expr.type, 'function');
    const args = column.expr.args;
    assert.ok(isExprList(args), 'Function args should be ExprList');
    assert.strictEqual(args.value.length, 3);
  });

  test('Binary expression with nested structure', () => {
    const ast = parser.astify("SELECT * FROM t WHERE (a AND b) OR c");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.ok(isBinary(where), 'WHERE clause should be Binary');
    assert.strictEqual(where.operator, 'OR');
    assert.ok(isBinary(where.left), 'Left side should be Binary');
    assert.strictEqual(where.left.operator, 'AND');
  });

  test('EXISTS is a Function type', () => {
    const ast = parser.astify("SELECT * FROM t WHERE EXISTS (SELECT 1 FROM users)");
    assert.ok(isSelect(ast), 'Should be Select');
    const where = ast.where;
    assert.strictEqual(where.type, 'function');
    assert.strictEqual(where.name.name[0].value, 'EXISTS');
  });
});
