import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateConstraintPrimary, CreateConstraintUnique, CreateConstraintForeign, CreateConstraintCheck } from '../../types.d.ts';
import { isCreate, isCreateConstraintPrimary, isCreateConstraintUnique, isCreateConstraintForeign, isCreateConstraintCheck } from './types.guard.ts';

const parser = new Parser();

test('CREATE TABLE with PRIMARY KEY constraint', () => {
  const sql = 'CREATE TABLE users (id INT, PRIMARY KEY (id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const constraint = ast.create_definitions![1] as CreateConstraintPrimary;
  
  assert.ok(isCreateConstraintPrimary(constraint), 'Should be CreateConstraintPrimary');
  assert.strictEqual(constraint.constraint_type, 'primary key');
  assert.strictEqual(constraint.resource, 'constraint');
  assert.ok(Array.isArray(constraint.definition));
});

test('CREATE TABLE with UNIQUE constraint', () => {
  const sql = 'CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const constraint = ast.create_definitions![1] as CreateConstraintUnique;
  
  assert.ok(isCreateConstraintUnique(constraint), 'Should be CreateConstraintUnique');
  assert.strictEqual(constraint.constraint_type, 'unique key');
  assert.strictEqual(constraint.resource, 'constraint');
});

test('CREATE TABLE with FOREIGN KEY constraint', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const constraint = ast.create_definitions![1] as CreateConstraintForeign;
  
  assert.ok(isCreateConstraintForeign(constraint), 'Should be CreateConstraintForeign');
  assert.strictEqual(constraint.resource, 'constraint');
  assert.ok(constraint.reference_definition);
});

test('CREATE TABLE with CHECK constraint', () => {
  const sql = 'CREATE TABLE products (price INT, CHECK (price > 0))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const constraint = ast.create_definitions![1] as CreateConstraintCheck;
  
  assert.ok(isCreateConstraintCheck(constraint), 'Should be CreateConstraintCheck');
  assert.strictEqual(constraint.constraint_type, 'check');
  assert.strictEqual(constraint.resource, 'constraint');
  assert.ok(Array.isArray(constraint.definition));
});

test('CREATE TABLE with named constraint', () => {
  const sql = 'CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  const constraint = ast.create_definitions![1] as CreateConstraintPrimary;
  
  assert.ok(isCreateConstraintPrimary(constraint), 'Should be CreateConstraintPrimary');
  assert.strictEqual(constraint.constraint, 'pk_users');
  assert.strictEqual(constraint.keyword, 'constraint');
});
