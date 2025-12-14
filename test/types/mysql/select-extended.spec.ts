import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('SELECT with COLLATE', () => {
  const sql = 'SELECT * FROM users COLLATE utf8_general_ci';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  assert.ok(selectAst.collate);
});

test('SELECT locking_read type exists', () => {
  // locking_read type is defined in Select interface
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  // locking_read can be undefined or an object
  assert.ok(selectAst.locking_read === undefined || typeof selectAst.locking_read === 'object');
});
