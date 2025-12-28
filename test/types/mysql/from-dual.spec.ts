import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isDual } from './types.guard.ts';

const parser = new Parser();

test('FROM DUAL - basic usage', () => {
  const ast = parser.astify('SELECT 1 FROM DUAL');
  assertType(isSelect, ast);
  assertType(isDual, ast.from[0]);
});

test('FROM DUAL - with expression', () => {
  const ast = parser.astify('SELECT NOW() FROM DUAL');
  assertType(isSelect, ast);
  assertType(isDual, ast.from[0]);
});

