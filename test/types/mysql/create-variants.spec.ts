import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create } from '../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('CREATE DATABASE', () => {
  const sql = 'CREATE DATABASE mydb';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'database');
});

test('CREATE SCHEMA', () => {
  const sql = 'CREATE SCHEMA myschema';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'schema');
});

test('CREATE INDEX', () => {
  const sql = 'CREATE INDEX idx_name ON users (name)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'index');
  assert.strictEqual(createAst.index, 'idx_name');
  assert.ok(createAst.index_columns);
});

test('CREATE UNIQUE INDEX', () => {
  const sql = 'CREATE UNIQUE INDEX idx_email ON users (email)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'index');
  assert.strictEqual(createAst.index_type, 'unique');
});
