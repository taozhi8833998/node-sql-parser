import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Alter, AlterExpr } from '../../types.d.ts';
import { isAlter } from './types.guard.ts';

const parser = new Parser();

test('ALTER TABLE - ADD COLUMN', () => {
  const sql = 'ALTER TABLE users ADD COLUMN email VARCHAR(255)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'add');
  assert.strictEqual(expr.keyword, 'COLUMN');
  assert.strictEqual(expr.resource, 'column');
  assert.ok(expr.column);
  assert.ok(expr.definition);
});

test('ALTER TABLE - ADD COLUMN without COLUMN keyword', () => {
  const sql = 'ALTER TABLE users ADD email VARCHAR(255)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'add');
  assert.strictEqual(expr.resource, 'column');
  assert.ok(expr.column);
  assert.ok(expr.definition);
});

test('ALTER TABLE - DROP COLUMN', () => {
  const sql = 'ALTER TABLE users DROP COLUMN email';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.keyword, 'COLUMN');
  assert.strictEqual(expr.resource, 'column');
  assert.ok(expr.column);
});

test('ALTER TABLE - DROP COLUMN without COLUMN keyword', () => {
  const sql = 'ALTER TABLE users DROP email';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'column');
  assert.ok(expr.column);
});

test('ALTER TABLE - MODIFY COLUMN', () => {
  const sql = 'ALTER TABLE users MODIFY COLUMN email TEXT';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'modify');
  assert.strictEqual(expr.keyword, 'COLUMN');
  assert.strictEqual(expr.resource, 'column');
});

test('ALTER TABLE - CHANGE COLUMN', () => {
  const sql = 'ALTER TABLE users CHANGE COLUMN old_email new_email VARCHAR(255)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'change');
  assert.strictEqual(expr.keyword, 'COLUMN');
  assert.strictEqual(expr.resource, 'column');
});

test('ALTER TABLE - RENAME TABLE', () => {
  const sql = 'ALTER TABLE users RENAME TO customers';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'rename');
  assert.strictEqual(expr.resource, 'table');
  assert.strictEqual(expr.keyword, 'to');
});

test('ALTER TABLE - RENAME COLUMN', () => {
  const sql = 'ALTER TABLE users RENAME COLUMN old_name TO new_name';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'rename');
  assert.strictEqual(expr.resource, 'column');
  assert.strictEqual(expr.keyword, 'column');
});

test('ALTER TABLE - ADD INDEX', () => {
  const sql = 'ALTER TABLE users ADD INDEX idx_email (email)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'add');
  assert.strictEqual(expr.resource, 'index');
  assert.strictEqual(expr.keyword, 'index');
});

test('ALTER TABLE - DROP INDEX', () => {
  const sql = 'ALTER TABLE users DROP INDEX idx_email';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'index');
  assert.strictEqual(expr.keyword, 'index');
});

test('ALTER TABLE - DROP PRIMARY KEY', () => {
  const sql = 'ALTER TABLE users DROP PRIMARY KEY';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'key');
  assert.strictEqual(expr.keyword, 'primary key');
});

test('ALTER TABLE - DROP FOREIGN KEY', () => {
  const sql = 'ALTER TABLE users DROP FOREIGN KEY fk_user';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'key');
  assert.strictEqual(expr.keyword, 'foreign key');
});

test('ALTER TABLE - ADD CONSTRAINT', () => {
  const sql = 'ALTER TABLE users ADD CONSTRAINT pk_id PRIMARY KEY (id)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'add');
  assert.strictEqual(expr.resource, 'constraint');
  assert.ok(expr.create_definitions);
});

test('ALTER TABLE - DROP CONSTRAINT', () => {
  const sql = 'ALTER TABLE users DROP CONSTRAINT chk_age';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'constraint');
  assert.strictEqual(expr.keyword, 'constraint');
});

test('ALTER TABLE - DROP CHECK', () => {
  const sql = 'ALTER TABLE users DROP CHECK chk_age';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'constraint');
  assert.strictEqual(expr.keyword, 'check');
});

test('ALTER TABLE - ALGORITHM', () => {
  const sql = 'ALTER TABLE users ALGORITHM = INPLACE, ADD COLUMN email VARCHAR(255)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.type, 'alter');
  assert.strictEqual(expr.keyword, 'algorithm');
  assert.strictEqual(expr.resource, 'algorithm');
});

test('ALTER TABLE - LOCK', () => {
  const sql = 'ALTER TABLE users LOCK = NONE, ADD COLUMN email VARCHAR(255)';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.type, 'alter');
  assert.strictEqual(expr.keyword, 'lock');
  assert.strictEqual(expr.resource, 'lock');
});

test('ALTER TABLE - ADD PARTITION', () => {
  const sql = 'ALTER TABLE users ADD PARTITION (PARTITION p3 VALUES LESS THAN (2000))';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'add');
  assert.strictEqual(expr.resource, 'partition');
  assert.strictEqual(expr.keyword, 'PARTITION');
});

test('ALTER TABLE - DROP PARTITION', () => {
  const sql = 'ALTER TABLE users DROP PARTITION p0';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.action, 'drop');
  assert.strictEqual(expr.resource, 'partition');
  assert.strictEqual(expr.keyword, 'PARTITION');
});

test('ALTER TABLE - table option ENGINE', () => {
  const sql = 'ALTER TABLE users ENGINE = InnoDB';
  const ast = parser.astify(sql);
  assert.ok(isAlter(ast));
  const expr = (ast as Alter).expr[0];
  assert.strictEqual(expr.type, 'alter');
  assert.strictEqual(expr.resource, 'engine');
});

