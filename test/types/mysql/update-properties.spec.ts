import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isUpdate, isFrom, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

test('Update.table as Array<From>', () => {
  const ast = parser.astify('UPDATE users SET name = "John"');
  assertType(isUpdate, ast);
  assertType(isFrom, ast.table[0]);
});

test('Update.where as Binary', () => {
  const ast = parser.astify('UPDATE users SET name = "John" WHERE id = 1');
  assertType(isUpdate, ast);
  assertType(isBinary, ast.where);
});

test('Update.where as Unary', () => {
  const ast = parser.astify('UPDATE users SET name = "John" WHERE NOT active');
  assertType(isUpdate, ast);
  assertType(isUnary, ast.where);
});

test('Update.where as Function', () => {
  const ast = parser.astify('UPDATE users SET name = "John" WHERE ISNULL(deleted_at)');
  assertType(isUpdate, ast);
  assertType(isFunction, ast.where);
});
