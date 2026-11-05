import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('UNION - basic', () => {
  const ast = parser.astify('SELECT id FROM users UNION SELECT id FROM customers');
  assertType(isSelect, ast);
  assertType(isSelect, ast._next);
});

test('UNION ALL', () => {
  const ast = parser.astify('SELECT id FROM users UNION ALL SELECT id FROM customers');
  assertType(isSelect, ast);
  assertType(isSelect, ast._next);
});

test('UNION DISTINCT', () => {
  const ast = parser.astify('SELECT id FROM users UNION DISTINCT SELECT id FROM customers');
  assertType(isSelect, ast);
  assertType(isSelect, ast._next);
});

test('Multiple UNION operations', () => {
  const ast = parser.astify('SELECT id FROM users UNION SELECT id FROM customers UNION SELECT id FROM vendors');
  assertType(isSelect, ast);
  assertType(isSelect, ast._next);
  assertType(isSelect, ast._next._next);
});
