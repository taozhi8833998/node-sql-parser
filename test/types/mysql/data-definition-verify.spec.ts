import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition, CreateIndexDefinition, DataType } from '../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('DataType - simple INT', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  const dataType = colDef.definition as DataType;
  assert.strictEqual('dataType' in dataType, true, 'dataType should be present');
});

test('DataType - VARCHAR with length', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(255))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  const dataType = colDef.definition as DataType;
  assert.strictEqual(dataType.length, 255);
});

test('DataType - TEXT', () => {
  const sql = 'CREATE TABLE articles (content TEXT)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  const dataType = colDef.definition as DataType;
  assert.ok(dataType);
});

test('CreateColumnDefinition - simple', () => {
  const sql = 'CREATE TABLE users (id INT)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  assert.strictEqual('column' in colDef, true, 'column should be present');
  assert.strictEqual('definition' in colDef, true, 'definition should be present');
  assert.strictEqual('resource' in colDef, true, 'resource should be present');
});

test('CreateColumnDefinition - with NOT NULL', () => {
  const sql = 'CREATE TABLE users (id INT NOT NULL)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const colDef = ast.create_definitions![0] as CreateColumnDefinition;
  assert.ok(colDef.nullable);
});

test('CreateIndexDefinition - simple', () => {
  const sql = 'CREATE TABLE users (id INT, INDEX idx_id (id))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const indexDef = ast.create_definitions![1] as CreateIndexDefinition;
  assert.strictEqual('resource' in indexDef, true, 'resource should be present');
  assert.strictEqual('keyword' in indexDef, true, 'keyword should be present');
  assert.strictEqual('definition' in indexDef, true, 'definition should be present');
  assert.strictEqual('index' in indexDef, true, 'index should be present');
  assert.strictEqual('index_type' in indexDef, true, 'index_type should be present');
  assert.strictEqual('index_options' in indexDef, true, 'index_options should be present');
});

test('CreateIndexDefinition - without name', () => {
  const sql = 'CREATE TABLE users (id INT, INDEX (id))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const indexDef = ast.create_definitions![1] as CreateIndexDefinition;
  assert.strictEqual('index' in indexDef, true, 'index should be present even without name');
});
