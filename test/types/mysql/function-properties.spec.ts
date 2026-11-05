import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isFunction, isExprList, isAggrFunc } from './types.guard.ts';

const parser = new Parser();

test('Function.name - FunctionName structure with name array', () => {
  const ast = parser.astify('SELECT UPPER(name) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
});

test('Function.name - FunctionName with schema property', () => {
  const ast = parser.astify('SELECT mydb.UPPER(name) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
});

test('Function.args - ExprList with single argument', () => {
  const ast = parser.astify('SELECT UPPER(name) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
  assertType(isExprList, ast.columns[0].expr.args);
});

test('Function.args - ExprList with multiple arguments', () => {
  const ast = parser.astify('SELECT CONCAT(first, last) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
  assertType(isExprList, ast.columns[0].expr.args);
});

test('Function.args - ExprList with empty array (no arguments)', () => {
  const ast = parser.astify('SELECT NOW() FROM dual');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
  assertType(isExprList, ast.columns[0].expr.args);
});

test('Function.over - null when no ON UPDATE or window', () => {
  const ast = parser.astify('SELECT UPPER(name) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
});

test('Function.over - window specification with AsWindowSpec', () => {
  const ast = parser.astify('SELECT ROW_NUMBER() OVER (ORDER BY id) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
});

test('Function.over - null for non-window functions', () => {
  const ast = parser.astify('SELECT CONCAT(first, last) FROM users');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
});

test('Function - all properties together (window function)', () => {
  const ast = parser.astify('SELECT ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary) FROM employees');
  assertType(isSelect, ast);
  assertType(isFunction, ast.columns[0].expr);
  assertType(isExprList, ast.columns[0].expr.args);
});

test('Function vs AggrFunc - COUNT is aggr_func not function', () => {
  const ast = parser.astify('SELECT COUNT(*) FROM users');
  assertType(isSelect, ast);
  assertType(isAggrFunc, ast.columns[0].expr);
});
