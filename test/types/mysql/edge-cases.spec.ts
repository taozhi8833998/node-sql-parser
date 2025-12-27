import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isBinary, isCreate } from './types.guard.ts';

const parser = new Parser();

test('Select with HAVING is Binary not array', () => {
  const ast = parser.astify('SELECT COUNT(*) FROM t GROUP BY id HAVING COUNT(*) > 1');
  assertType(isSelect, ast);
  assertType(isBinary, ast.having);
});

test('Create view with DEFINER is Binary', () => {
  const ast = parser.astify("CREATE DEFINER = 'user'@'host' VIEW v AS SELECT 1");
  assertType(isCreate, ast);
  assertType(isBinary, ast.definer);
});
