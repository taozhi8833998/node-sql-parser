import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isInterval, isParam, isValueExpr, isSelect, isColumnRef } from './types.guard.ts';

const parser = new Parser();

test('Interval expression', () => {
  const ast = parser.astify("SELECT DATE_ADD('2020-01-01', INTERVAL 1 DAY)");
  assertType(isSelect, ast);
  assertType(isInterval, ast.columns[0].expr.args.value[1]);
});

test('Param expression', () => {
  const ast = parser.astify("SELECT * FROM t WHERE id = :id");
  assertType(isSelect, ast);
  assertType(isParam, ast.where.right);
});

test('Column ref with star', () => {
  const ast = parser.astify("SELECT * FROM t");
  assertType(isSelect, ast);
  assertType(isColumnRef, ast.columns[0].expr);
});

test('ValueExpr type - string', () => {
  const ast = parser.astify("SELECT 'hello'");
  assertType(isSelect, ast);
  assertType(isValueExpr, ast.columns[0].expr);
});

test('ValueExpr type - number', () => {
  const ast = parser.astify("SELECT 42");
  assertType(isSelect, ast);
  assertType(isValueExpr, ast.columns[0].expr);
});

test('ValueExpr type - boolean', () => {
  const ast = parser.astify("SELECT TRUE");
  assertType(isSelect, ast);
  assertType(isValueExpr, ast.columns[0].expr);
});

test('ValueExpr type - null', () => {
  const ast = parser.astify("SELECT NULL");
  assertType(isSelect, ast);
  assertType(isValueExpr, ast.columns[0].expr);
});
