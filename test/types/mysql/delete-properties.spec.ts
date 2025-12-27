import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isDelete, isFrom, isBinary, isUnary, isFunction } from './types.guard.ts';

const parser = new Parser();

test('Delete.from as Array<From>', () => {
  const ast = parser.astify('DELETE FROM users');
  assertType(isDelete, ast);
  assertType(isFrom, ast.from[0]);
});

test('Delete.where as Binary', () => {
  const ast = parser.astify('DELETE FROM users WHERE id = 1');
  assertType(isDelete, ast);
  assertType(isBinary, ast.where);
});

test('Delete.where as Unary', () => {
  const ast = parser.astify('DELETE FROM users WHERE NOT active');
  assertType(isDelete, ast);
  assertType(isUnary, ast.where);
});

test('Delete.where as Function', () => {
  const ast = parser.astify('DELETE FROM users WHERE ISNULL(deleted_at)');
  assertType(isDelete, ast);
  assertType(isFunction, ast.where);
});
