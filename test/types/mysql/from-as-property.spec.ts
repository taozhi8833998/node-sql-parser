import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, BaseFrom } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('FROM without alias has as property set to null', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const from = selectAst.from as BaseFrom[];
  assert.strictEqual(from[0].as, null);
  // Verify the property exists (not undefined)
  assert.ok('as' in from[0]);
});

test('FROM with alias has as property set to string', () => {
  const sql = 'SELECT * FROM users AS u';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const from = selectAst.from as BaseFrom[];
  assert.strictEqual(from[0].as, 'u');
});

test('JOIN without alias has as property', () => {
  const sql = 'SELECT * FROM users JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const from = selectAst.from as BaseFrom[];
  assert.ok('as' in from[0]);
  assert.ok('as' in from[1]);
});
