import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isInsert_Replace, isSelect, isFrom } from './types.guard.ts';

const parser = new Parser();

test('Insert_Replace.table as From[] (array)', () => {
  const ast = parser.astify('INSERT INTO users (id) VALUES (1)');
  assertType(isInsert_Replace, ast);
  assertType(isFrom, ast.table[0]);
});

test('Insert_Replace.table as From (single)', () => {
  const ast = parser.astify('INSERT INTO db.users (id) VALUES (1)');
  assertType(isInsert_Replace, ast);
  assertType(isFrom, ast.table[0]);
});

test('Insert_Replace.values as Select', () => {
  const ast = parser.astify('INSERT INTO users (id, name) SELECT id, name FROM temp_users');
  assertType(isInsert_Replace, ast);
    assertType(isSelect, ast.values);
});
