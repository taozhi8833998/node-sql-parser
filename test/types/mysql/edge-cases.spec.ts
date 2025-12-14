import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Insert_Replace, Alter, Lock, Create } from '../../types.d.ts';
import { isSelect, isBinary, isInsert_Replace, isAlter, isLock, isCreate } from './types.guard.ts';

const parser = new Parser();

test('Select with INTO has full structure', () => {
  const sql = 'SELECT id INTO @var FROM t';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.ok(selectAst.into);
  assert.strictEqual(selectAst.into.keyword, 'var');
  assert.strictEqual(selectAst.into.type, 'into');
  assert.ok(Array.isArray(selectAst.into.expr));
  assert.strictEqual(selectAst.into.position, 'column');
});

test('Select with HAVING is Binary not array', () => {
  const sql = 'SELECT COUNT(*) FROM t GROUP BY id HAVING COUNT(*) > 1';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.ok(selectAst.having);
  assert.ok(isBinary(selectAst.having));
  assert.strictEqual(selectAst.having.operator, '>');
});

test('Insert with PARTITION is string array', () => {
  const sql = 'INSERT INTO t PARTITION (p0) VALUES (1)';
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'AST should be an Insert_Replace type');
  const insertAst = ast as Insert_Replace;
  assert.strictEqual(insertAst.type, 'insert');
  assert.ok(Array.isArray(insertAst.partition));
  assert.strictEqual(insertAst.partition[0], 'p0');
});

test('Alter expr is an array', () => {
  const sql = 'ALTER TABLE t ADD COLUMN c INT';
  const ast = parser.astify(sql);
  
  assert.ok(isAlter(ast), 'AST should be an Alter type');
  const alterAst = ast as Alter;
  assert.strictEqual(alterAst.type, 'alter');
  assert.ok(Array.isArray(alterAst.expr));
  assert.strictEqual(alterAst.expr[0].action, 'add');
  assert.strictEqual(alterAst.expr[0].keyword, 'COLUMN');
});

test('Lock tables has object lock_type', () => {
  const sql = 'LOCK TABLES t1 READ, t2 WRITE';
  const ast = parser.astify(sql);
  
  assert.ok(isLock(ast), 'AST should be a Lock type');
  const lockAst = ast as Lock;
  assert.strictEqual(lockAst.type, 'lock');
  assert.ok(Array.isArray(lockAst.tables));
  assert.strictEqual(lockAst.tables.length, 2);
  assert.strictEqual(typeof lockAst.tables[0].lock_type, 'object');
  assert.strictEqual(lockAst.tables[0].lock_type.type, 'read');
  assert.strictEqual(lockAst.tables[1].lock_type.type, 'write');
});

test('Create table LIKE has From array', () => {
  const sql = 'CREATE TABLE t2 LIKE t1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.ok(createAst.like);
  assert.strictEqual(createAst.like.type, 'like');
  assert.ok(Array.isArray(createAst.like.table));
  assert.strictEqual(createAst.like.table[0].table, 't1');
});

test('Create view with DEFINER is Binary', () => {
  const sql = "CREATE DEFINER = 'user'@'host' VIEW v AS SELECT 1";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.ok(createAst.definer);
  assert.ok(isBinary(createAst.definer));
  assert.strictEqual(createAst.definer.operator, '=');
});

test('Select with GROUP BY modifiers', () => {
  const sql = 'SELECT COUNT(*) FROM t GROUP BY id WITH ROLLUP';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.ok(selectAst.groupby);
  assert.ok(Array.isArray(selectAst.groupby.modifiers));
  assert.strictEqual(selectAst.groupby.modifiers[0].type, 'origin');
  assert.strictEqual(selectAst.groupby.modifiers[0].value, 'with rollup');
});
