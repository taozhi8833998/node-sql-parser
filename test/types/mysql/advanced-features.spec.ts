import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isSelect } from './types.guard.ts';

const parser = new Parser();

test('Multiple statements return AST array', () => {
  const sql = 'SELECT 1; SELECT 2;';
  const ast = parser.astify(sql);
  assertType(isSelect,ast[0]);
  assertType(isSelect,ast[1]);
});
test('Multiple statements return AST array diff types', () => {
  const sql = 'SELECT 1; CREATE TABLE foo (bar INT);';
  const ast = parser.astify(sql);
  assertType(isSelect,ast[0]);
  assertType(isCreate,ast[1]);
});
