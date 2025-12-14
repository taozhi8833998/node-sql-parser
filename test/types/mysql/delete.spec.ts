import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Delete, From, Binary } from '../../types.d.ts';
import { isDelete, isBinary } from './types.guard.ts';

const parser = new Parser();

test('DELETE with WHERE', () => {
  const sql = 'DELETE FROM users WHERE id = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isDelete(ast), 'AST should be a Delete type');
  const deleteAst = ast as Delete;
  assert.strictEqual(deleteAst.type, 'delete');
  assert.ok(Array.isArray(deleteAst.from));
  assert.strictEqual((deleteAst.from as From[])[0].table, 'users');
  assert.ok(deleteAst.where);
  assert.ok(isBinary(deleteAst.where), 'WHERE should be a Binary expression');
  const where = deleteAst.where as Binary;
  assert.strictEqual(where.type, 'binary_expr');
});

test('DELETE without WHERE', () => {
  const sql = 'DELETE FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isDelete(ast), 'AST should be a Delete type');
  const deleteAst = ast as Delete;
  assert.strictEqual(deleteAst.type, 'delete');
  assert.ok(Array.isArray(deleteAst.from));
  assert.strictEqual(deleteAst.where, null);
});
