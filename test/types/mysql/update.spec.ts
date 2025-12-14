import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Update, SetList } from '../../types.d.ts';
import { isUpdate } from './types.guard.ts';

const parser = new Parser();

test('UPDATE with SET', () => {
  const sql = "UPDATE users SET name = 'Jane' WHERE id = 1";
  const ast = parser.astify(sql);
  
  assert.ok(isUpdate(ast), 'AST should be an Update type');
  const updateAst = ast as Update;
  assert.strictEqual(updateAst.type, 'update');
  assert.ok(Array.isArray(updateAst.set));
  const setList = updateAst.set as SetList[];
  assert.strictEqual(setList[0].column, 'name');
  assert.ok(updateAst.where);
});

test('UPDATE multiple columns', () => {
  const sql = "UPDATE users SET name = 'Jane', age = 30 WHERE id = 1";
  const ast = parser.astify(sql);
  
  assert.ok(isUpdate(ast), 'AST should be an Update type');
  const updateAst = ast as Update;
  assert.strictEqual(updateAst.type, 'update');
  assert.strictEqual(updateAst.set.length, 2);
  assert.strictEqual(updateAst.set[0].column, 'name');
  assert.strictEqual(updateAst.set[1].column, 'age');
});
