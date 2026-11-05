import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isWith, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

test('Select.with - With[] when WITH clause present', () => {
  const ast = parser.astify('WITH cte AS (SELECT id FROM users) SELECT * FROM cte');
  assertType(isSelect, ast);
  assertType(isWith, ast.with[0]);
});

test('Select.where - Binary expression', () => {
  const ast = parser.astify('SELECT * FROM users WHERE id = 1');
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Select.where - Unary expression', () => {
  const ast = parser.astify('SELECT * FROM users WHERE NOT active');
  assertType(isSelect, ast);
});

test('Select.where - Function expression', () => {
  const ast = parser.astify('SELECT * FROM users WHERE ISNULL(name)');
  assertType(isSelect, ast);
  assertType(isFunction, ast.where);
});

test('Select.having - Binary expression', () => {
  const ast = parser.astify('SELECT dept, COUNT(*) FROM users GROUP BY dept HAVING COUNT(*) > 5');
  assertType(isSelect, ast);
  assertType(isBinary, ast.having);
});

test('Select._next and set_op - UNION', () => {
  const ast = parser.astify('SELECT id FROM users UNION SELECT id FROM admins');
  assertType(isSelect, ast);
  assertType(isSelect, ast._next);
});
