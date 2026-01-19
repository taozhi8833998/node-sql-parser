import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isTableColumnAst } from './types.guard.ts';

const parser = new Parser();

test('TableColumnAst.tableList - verify string[]', () => {
  const ast = parser.astify('SELECT (SELECT id FROM users) AS user_id');
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[0].expr);
});

test('TableColumnAst.ast - verify AST[] | AST', () => {
  const ast = parser.astify('SELECT (SELECT id FROM users) AS user_id');
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[0].expr);
  assertType(isSelect, ast.columns[0].expr.ast);
});

test('TableColumnAst.parentheses - verify boolean | undefined', () => {
  const ast = parser.astify('SELECT (SELECT id FROM users) AS user_id');
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[0].expr);
});

test('TableColumnAst.loc - verify LocationRange | undefined', () => {
  const ast = parser.astify('SELECT (SELECT id FROM users) AS user_id', { parseOptions: { includeLocations: true } });
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[0].expr);
});

test('TableColumnAst - complex subquery with joins', () => {
  const ast = parser.astify('SELECT (SELECT u.id FROM users u JOIN orders o ON u.id = o.user_id) AS data');
  assertType(isSelect, ast);
  assertType(isTableColumnAst, ast.columns[0].expr);
  assertType(isSelect, ast.columns[0].expr.ast);
});

test('TableColumnAst - in WHERE clause with IN', () => {
  const ast = parser.astify('SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)');
  assertType(isSelect, ast);
  assertType(isSelect,ast.where.right.value[0].ast);
});
