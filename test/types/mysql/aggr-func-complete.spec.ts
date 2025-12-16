import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

test('AggrFunc.name - string value', () => {
  const ast = parser.astify('SELECT COUNT(*) FROM users');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.name - all aggregate function names', () => {
  const functions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'GROUP_CONCAT'];
  for (const fn of functions) {
    const ast = parser.astify(`SELECT ${fn}(id) FROM users`);
    assertType(isSelect, ast);
    assertType(isAggrFunc, ast.columns[0].expr);
  }
});

test('AggrFunc.args.expr - ExpressionValue', () => {
  const ast = parser.astify('SELECT COUNT(user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.expr - star expression', () => {
  const ast = parser.astify('SELECT COUNT(*) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.distinct - DISTINCT present', () => {
  const ast = parser.astify('SELECT COUNT(DISTINCT user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.distinct - null when not present', () => {
  const ast = parser.astify('SELECT COUNT(user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.orderby - OrderBy[] present', () => {
  const ast = parser.astify('SELECT GROUP_CONCAT(name ORDER BY name ASC) FROM users');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.orderby - null when not present', () => {
  const ast = parser.astify('SELECT COUNT(user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.parentheses - boolean (always true for function calls)', () => {
  const ast = parser.astify('SELECT COUNT(user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.separator - object variant with keyword and value', () => {
  const ast = parser.astify("SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users");
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.args.separator - null when not present', () => {
  const ast = parser.astify('SELECT GROUP_CONCAT(name) FROM users');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.over - window specification present', () => {
  const ast = parser.astify('SELECT SUM(amount) OVER (PARTITION BY user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc.over - null when not present', () => {
  const ast = parser.astify('SELECT COUNT(user_id) FROM orders');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});

test('AggrFunc - all properties combined', () => {
  const ast = parser.astify("SELECT GROUP_CONCAT(DISTINCT name ORDER BY name DESC SEPARATOR '|') OVER (PARTITION BY category) FROM products");
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});
