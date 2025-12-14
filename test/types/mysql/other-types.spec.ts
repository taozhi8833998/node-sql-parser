import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Update, Delete, Use, Returning, CollateExpr, OnUpdateCurrentTimestamp } from '../../types.d.ts';
import { isUpdate, isUse, isCreate } from './types.guard.ts';

const parser = new Parser();

test('Use - USE database', () => {
  const sql = 'USE mydb';
  const ast = parser.astify(sql);
  
  assert.ok(isUse(ast), 'AST should be a Use type');
  assert.strictEqual('type' in ast, true, 'type should be present');
  assert.strictEqual('db' in ast, true, 'db should be present');
});

test('CollateExpr - in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255) COLLATE utf8_general_ci)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const colDef = (ast as any).create_definitions[0];
  const collate = colDef.collate as CollateExpr;
  
  if (collate) {
    assert.strictEqual('type' in collate, true, 'type should be present');
    assert.strictEqual('keyword' in collate, true, 'keyword should be present');
    assert.strictEqual('collate' in collate, true, 'collate nested object should be present');
  }
});

test('OnUpdateCurrentTimestamp - in column definition', () => {
  const sql = 'CREATE TABLE users (updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
});
