import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

test('AggrFunc - with DISTINCT', () => {
  const ast = parser.astify('SELECT COUNT(DISTINCT user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc - without DISTINCT', () => {
  const ast = parser.astify('SELECT COUNT(user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc - with ORDER BY (GROUP_CONCAT)', () => {
  const ast = parser.astify('SELECT GROUP_CONCAT(name ORDER BY name ASC) FROM users');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc - with SEPARATOR (GROUP_CONCAT)', () => {
  const ast = parser.astify("SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users");
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc - with DISTINCT, ORDER BY, and SEPARATOR', () => {
  const ast = parser.astify("SELECT GROUP_CONCAT(DISTINCT name ORDER BY name SEPARATOR ', ') FROM users");
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc - with OVER clause', () => {
  const ast = parser.astify('SELECT SUM(amount) OVER (PARTITION BY user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});
