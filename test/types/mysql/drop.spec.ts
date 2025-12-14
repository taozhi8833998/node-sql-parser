import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Drop } from '../../types.d.ts';
import { isDrop } from './types.guard.ts';

const parser = new Parser();

test('DROP TABLE', () => {
  const sql = 'DROP TABLE users';
  const ast = parser.astify(sql);
  
  assert.ok(isDrop(ast), 'AST should be a Drop type');
  const dropAst = ast as Drop;
  assert.strictEqual(dropAst.type, 'drop');
  assert.strictEqual(dropAst.keyword, 'table');
  assert.ok(Array.isArray(dropAst.name));
});

test('DROP TABLE IF EXISTS', () => {
  const sql = 'DROP TABLE IF EXISTS users';
  const ast = parser.astify(sql);
  
  assert.ok(isDrop(ast), 'AST should be a Drop type');
  const dropAst = ast as Drop;
  assert.strictEqual(dropAst.type, 'drop');
  assert.strictEqual(dropAst.prefix, 'if exists');
});
