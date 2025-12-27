import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isTableColumnAst, isSelect } from './types.guard.ts';

const parser = new Parser();

test('Subquery in column returns TableColumnAst', () => {
  const ast = parser.astify("SELECT id, (SELECT name FROM users WHERE users.id = t.user_id) as user_name FROM t");
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[1].expr);
});

test('Subquery ast is Select type', () => {
  const ast = parser.astify("SELECT id, (SELECT name FROM users) as user_name FROM t");
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[1].expr);
  assertType(isSelect, ast.columns[1].expr.ast);
});

test('Multiple subqueries in SELECT', () => {
  const ast = parser.astify("SELECT (SELECT COUNT(*) FROM orders WHERE orders.user_id = u.id) as order_count, (SELECT MAX(created_at) FROM orders WHERE orders.user_id = u.id) as last_order FROM users u");
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[0].expr);
  assertType(isTableColumnAst, ast.columns[1].expr);
});
