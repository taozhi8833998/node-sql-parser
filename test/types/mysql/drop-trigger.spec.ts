import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { DropTrigger } from '../../../types.d.ts';
import { isDropTrigger } from './types.guard.ts';

const parser = new Parser();

test('DropTrigger - basic', () => {
  const sql = 'DROP TRIGGER my_trigger';
  const ast = parser.astify(sql);
  
  assert.ok(isDropTrigger(ast), 'Should be DropTrigger');
  assert.strictEqual(ast.type, 'drop');
  assert.strictEqual(ast.keyword, 'trigger');
  assert.ok(Array.isArray(ast.name));
});

test('DropTrigger - with IF EXISTS', () => {
  const sql = 'DROP TRIGGER IF EXISTS my_trigger';
  const ast = parser.astify(sql);
  
  assert.ok(isDropTrigger(ast), 'Should be DropTrigger');
  assert.strictEqual(ast.prefix, 'if exists');
});

test('DropTrigger - with schema', () => {
  const sql = 'DROP TRIGGER mydb.my_trigger';
  const ast = parser.astify(sql);
  
  assert.ok(isDropTrigger(ast), 'Should be DropTrigger');
  assert.ok(Array.isArray(ast.name));
  assert.strictEqual(ast.name[0].schema, 'mydb');
  assert.strictEqual(ast.name[0].trigger, 'my_trigger');
});
