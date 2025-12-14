import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Insert_Replace, From } from '../../types.d.ts';
import { isInsert_Replace } from './types.guard.ts';

const parser = new Parser();

test('INSERT with VALUES', () => {
  const sql = "INSERT INTO users (id, name) VALUES (1, 'John')";
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'AST should be an Insert_Replace type');
  const insertAst = ast as Insert_Replace;
  assert.strictEqual(insertAst.type, 'insert');
  assert.ok(Array.isArray(insertAst.table));
  assert.strictEqual((insertAst.table as From[])[0].table, 'users');
  assert.ok(Array.isArray(insertAst.columns));
  assert.deepStrictEqual(insertAst.columns, ['id', 'name']);
  assert.strictEqual(insertAst.values.type, 'values');
});

test('INSERT without columns', () => {
  const sql = "INSERT INTO users VALUES (1, 'John')";
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'AST should be an Insert_Replace type');
  const insertAst = ast as Insert_Replace;
  assert.strictEqual(insertAst.type, 'insert');
  assert.strictEqual(insertAst.columns, null);
  assert.strictEqual(insertAst.values.type, 'values');
});
