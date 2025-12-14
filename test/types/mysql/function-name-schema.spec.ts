import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Function, FunctionName } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('FunctionName - simple function name', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const func = col.expr as Function;
  assert.strictEqual(func.type, 'function');
  assert.ok(func.name);
  assert.ok(Array.isArray(func.name.name));
});

test('FunctionName - schema-qualified function (if supported)', () => {
  const sql = 'SELECT mydb.UPPER(name) FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const func = col.expr as Function;
  if (func.type === 'function') {
    const funcName = func.name as FunctionName;
    // Check if schema property exists
    assert.ok('schema' in funcName);
  }
});

test('FunctionName - multi-part name', () => {
  const sql = 'SELECT JSON_EXTRACT(data, "$.name") FROM users';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const func = col.expr as Function;
  assert.strictEqual(func.type, 'function');
  assert.ok(func.name);
});
