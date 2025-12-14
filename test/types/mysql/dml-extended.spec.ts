import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Insert_Replace, Delete, From } from '../../types.d.ts';
import { isInsert_Replace, isDelete } from './types.guard.ts';

const parser = new Parser();

test('INSERT with ON DUPLICATE KEY UPDATE', () => {
  const sql = 'INSERT INTO users (id, name) VALUES (1, "John") ON DUPLICATE KEY UPDATE name = "Jane"';
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'AST should be an Insert_Replace type');
  const insertAst = ast as Insert_Replace;
  assert.strictEqual(insertAst.type, 'insert');
  assert.ok(insertAst.on_duplicate_update);
  assert.strictEqual(insertAst.on_duplicate_update.keyword, 'on duplicate key update');
  assert.ok(Array.isArray(insertAst.on_duplicate_update.set));
});

test('INSERT with SET', () => {
  const sql = 'INSERT INTO users SET name = "John", email = "john@example.com"';
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'AST should be an Insert_Replace type');
  const insertAst = ast as Insert_Replace;
  assert.strictEqual(insertAst.type, 'insert');
  assert.ok(insertAst.set);
  assert.ok(Array.isArray(insertAst.set));
});

test('DELETE with table addition flag', () => {
  const sql = 'DELETE t1 FROM users t1 JOIN orders t2 ON t1.id = t2.user_id';
  const ast = parser.astify(sql);
  
  assert.ok(isDelete(ast), 'AST should be a Delete type');
  const deleteAst = ast as Delete;
  assert.strictEqual(deleteAst.type, 'delete');
  assert.ok(Array.isArray(deleteAst.table));
  const table = deleteAst.table![0] as From & { addition?: boolean };
  assert.ok(table);
});
