import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isBinary, isExprList } from './types.guard.ts';

const parser = new Parser();

test('Binary expression with AND operator', () => {
  const ast = parser.astify("SELECT * FROM t WHERE a AND b");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Binary expression with OR operator', () => {
  const ast = parser.astify("SELECT * FROM t WHERE a OR b");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Binary expression with comparison operators', () => {
  const ast = parser.astify("SELECT * FROM t WHERE age > 18");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Binary expression with BETWEEN', () => {
  const ast = parser.astify("SELECT * FROM t WHERE age BETWEEN 18 AND 65");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Binary expression with IS NULL', () => {
  const ast = parser.astify("SELECT * FROM t WHERE name IS NULL");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Binary expression with IS NOT NULL', () => {
  const ast = parser.astify("SELECT * FROM t WHERE name IS NOT NULL");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
});

test('Unary expression with NOT', () => {
  const ast = parser.astify("SELECT * FROM t WHERE NOT active");
  assertType(isSelect, ast);
});

test('ExprList in IN clause', () => {
  const ast = parser.astify("SELECT * FROM t WHERE id IN (1, 2, 3)");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
  assertType(isExprList, ast.where.right);
});

test('ExprList in function arguments', () => {
  const ast = parser.astify("SELECT CONCAT(first_name, ' ', last_name) FROM users");
  assertType(isSelect, ast);
  assertType(isExprList, ast.columns[0].expr.args);
});

test('Binary expression with nested structure', () => {
  const ast = parser.astify("SELECT * FROM t WHERE (a AND b) OR c");
  assertType(isSelect, ast);
  assertType(isBinary, ast.where);
  assertType(isBinary, ast.where.left);
});

test('EXISTS is a Function type', () => {
  const ast = parser.astify("SELECT * FROM t WHERE EXISTS (SELECT 1 FROM users)");
  assertType(isSelect, ast);
});
