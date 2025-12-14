import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Update, Insert_Replace, Column, SetList, InsertReplaceValue, Star } from '../../types.d.ts';
import { isSelect, isUpdate, isInsert_Replace } from './types.guard.ts';

const parser = new Parser();

test('Column - simple', () => {
  const sql = 'SELECT id FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const col = (ast.columns as Column[])[0];
  assert.strictEqual('expr' in col, true, 'expr should be present');
  assert.strictEqual('as' in col, true, 'as should be present');
});

test('Column - with alias', () => {
  const sql = 'SELECT id AS user_id FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const col = (ast.columns as Column[])[0];
  assert.strictEqual(col.as, 'user_id');
});

test('SetList - UPDATE', () => {
  const sql = 'UPDATE users SET name = "John" WHERE id = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isUpdate(ast), 'AST should be an Update type');
  const setItem = ast.set[0] as SetList;
  assert.strictEqual('column' in setItem, true, 'column should be present');
  assert.strictEqual('value' in setItem, true, 'value should be present');
  assert.strictEqual('table' in setItem, true, 'table should be present');
});

test('SetList - with table prefix', () => {
  const sql = 'UPDATE users SET users.name = "John" WHERE id = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isUpdate(ast), 'AST should be an Update type');
  const setItem = ast.set[0] as SetList;
  assert.ok(setItem.table);
});

test('InsertReplaceValue - INSERT VALUES', () => {
  const sql = 'INSERT INTO users VALUES (1, "John")';
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'AST should be an Insert_Replace type');
  if (ast.values && typeof ast.values === 'object' && 'values' in ast.values) {
    const valuesArray = (ast.values as any).values as InsertReplaceValue[];
    const value = valuesArray[0];
    assert.strictEqual('type' in value, true, 'type should be present');
    assert.strictEqual('value' in value, true, 'value should be present');
    assert.strictEqual('prefix' in value, true, 'prefix should be present');
  }
});

test('Star - SELECT *', () => {
  const sql = 'SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  if (ast.columns === '*') {
    // It's just a string
  } else if (Array.isArray(ast.columns)) {
    // It's an array of columns
  } else if (typeof ast.columns === 'object' && ast.columns !== null) {
    const star = ast.columns as Star;
    if ('type' in star && star.type === 'star') {
      assert.strictEqual('value' in star, true, 'value should be present');
    }
  }
});
