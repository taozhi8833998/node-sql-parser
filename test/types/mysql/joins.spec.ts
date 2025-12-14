import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Join, From } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('SELECT with INNER JOIN', () => {
  const sql = 'SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  assert.ok(Array.isArray(selectAst.from));
  const from = selectAst.from as From[];
  assert.strictEqual(from.length, 2);
  const join = from[1] as Join;
  assert.strictEqual(join.join, 'INNER JOIN');
  assert.ok(join.on);
});

test('SELECT with LEFT JOIN', () => {
  const sql = 'SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  const from = selectAst.from as From[];
  const join = from[1] as Join;
  assert.strictEqual(join.join, 'LEFT JOIN');
});

test('SELECT with RIGHT JOIN', () => {
  const sql = 'SELECT * FROM users RIGHT JOIN orders ON users.id = orders.user_id';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  const from = selectAst.from as From[];
  const join = from[1] as Join;
  assert.strictEqual(join.join, 'RIGHT JOIN');
});
