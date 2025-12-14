import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, OrderBy, Limit, LimitValue } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('OrderBy - ASC', () => {
  const sql = 'SELECT * FROM users ORDER BY name ASC';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const orderby = ast.orderby as OrderBy[];
  assert.ok(orderby);
  assert.strictEqual(orderby[0].type, 'ASC');
  assert.strictEqual('expr' in orderby[0], true, 'expr should be present');
});

test('OrderBy - DESC', () => {
  const sql = 'SELECT * FROM users ORDER BY name DESC';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const orderby = ast.orderby as OrderBy[];
  assert.strictEqual(orderby[0].type, 'DESC');
});

test('OrderBy - no direction (default)', () => {
  const sql = 'SELECT * FROM users ORDER BY name';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const orderby = ast.orderby as OrderBy[];
  assert.strictEqual('type' in orderby[0], true, 'type should be present');
});

test('Limit - single value', () => {
  const sql = 'SELECT * FROM users LIMIT 10';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const limit = ast.limit as Limit;
  assert.ok(limit);
  assert.strictEqual('seperator' in limit, true, 'seperator should be present');
  assert.strictEqual('value' in limit, true, 'value should be present');
  assert.ok(Array.isArray(limit.value));
  assert.strictEqual(limit.value.length, 1);
});

test('Limit - offset and count', () => {
  const sql = 'SELECT * FROM users LIMIT 10, 20';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const limit = ast.limit as Limit;
  assert.strictEqual(limit.value.length, 2);
  assert.strictEqual(limit.seperator, ',');
});

test('LimitValue - check properties', () => {
  const sql = 'SELECT * FROM users LIMIT 10';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const limit = ast.limit as Limit;
  const limitValue = limit.value[0] as LimitValue;
  assert.strictEqual('type' in limitValue, true, 'type should be present');
  assert.strictEqual('value' in limitValue, true, 'value should be present');
});

test('GroupBy - simple', () => {
  const sql = 'SELECT COUNT(*) FROM users GROUP BY status';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  assert.ok(ast.groupby);
  assert.strictEqual('columns' in ast.groupby, true, 'columns should be present');
  assert.strictEqual('modifiers' in ast.groupby, true, 'modifiers should be present');
  assert.ok(Array.isArray(ast.groupby.columns));
  assert.ok(Array.isArray(ast.groupby.modifiers));
});

test('Having - with GROUP BY', () => {
  const sql = 'SELECT COUNT(*) as cnt FROM users GROUP BY status HAVING cnt > 5';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  assert.ok(ast.having);
});
