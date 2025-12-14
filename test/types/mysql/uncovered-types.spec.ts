import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Transaction, LoadData, Create, CreateColumnDefinition } from '../../types.d.ts';
import { isTransaction, isLoadData, isCreate } from './types.guard.ts';

const parser = new Parser();

test('Transaction with isolation level', () => {
  const sql = 'START TRANSACTION ISOLATION LEVEL READ COMMITTED';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast), 'Should be Transaction type');
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.type, 'transaction');
  assert.ok(txAst.expr.modes, 'Should have modes');
  assert.ok(Array.isArray(txAst.expr.modes), 'modes should be array');
  assert.strictEqual(txAst.expr.modes.length, 1);
  // Note: Parser returns this as a single ValueExpr, not TransactionIsolationLevel object
  assert.strictEqual(txAst.expr.modes[0].type, 'origin');
  assert.strictEqual(txAst.expr.modes[0].value, 'isolation level read committed');
});

test('LoadData with FIELDS options', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users FIELDS TERMINATED BY ',' ENCLOSED BY '\"' ESCAPED BY '\\\\'";
  const ast = parser.astify(sql);
  
  assert.ok(isLoadData(ast), 'Should be LoadData type');
  const loadAst = ast as LoadData;
  assert.strictEqual(loadAst.type, 'load_data');
  assert.ok(loadAst.fields, 'Should have fields');
  assert.strictEqual(loadAst.fields.keyword, 'FIELDS');
  assert.ok(loadAst.fields.terminated, 'Should have terminated');
  assert.strictEqual(loadAst.fields.terminated.value, ',');
  assert.ok(loadAst.fields.enclosed, 'Should have enclosed');
  assert.strictEqual(loadAst.fields.enclosed.value, '"');
  assert.ok(loadAst.fields.escaped, 'Should have escaped');
  assert.strictEqual(loadAst.fields.escaped.value, '\\\\');
});

test('LoadData with LINES options', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users LINES STARTING BY 'xxx' TERMINATED BY '\\n'";
  const ast = parser.astify(sql);
  
  assert.ok(isLoadData(ast), 'Should be LoadData type');
  const loadAst = ast as LoadData;
  assert.strictEqual(loadAst.type, 'load_data');
  assert.ok(loadAst.lines, 'Should have lines');
  assert.strictEqual(loadAst.lines.keyword, 'LINES');
  assert.ok(loadAst.lines.starting, 'Should have starting');
  assert.strictEqual(loadAst.lines.starting.value, 'xxx');
  assert.ok(loadAst.lines.terminated, 'Should have terminated');
  assert.strictEqual(loadAst.lines.terminated.value, '\\n');
});

test('CREATE USER with REQUIRE SSL', () => {
  const sql = "CREATE USER 'user'@'localhost' REQUIRE SSL";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'user');
  assert.ok(ast.require, 'Should have require');
  assert.strictEqual(ast.require.keyword, 'require');
  assert.ok(ast.require.value, 'Should have require value');
  assert.strictEqual(ast.require.value.type, 'origin');
  assert.strictEqual(ast.require.value.value, 'SSL');
});

test('CREATE USER with resource options', () => {
  const sql = "CREATE USER 'user'@'localhost' WITH MAX_QUERIES_PER_HOUR 100";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'user');
  assert.ok(ast.resource_options, 'Should have resource_options');
  assert.strictEqual(ast.resource_options.keyword, 'with');
  assert.ok(Array.isArray(ast.resource_options.value), 'resource_options.value should be array');
  assert.strictEqual(ast.resource_options.value[0].prefix, 'max_queries_per_hour');
  assert.strictEqual(ast.resource_options.value[0].value, 100);
});

test('CREATE TABLE with ENGINE option', () => {
  const sql = "CREATE TABLE users (id INT) ENGINE=InnoDB";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(ast.table_options, 'Should have table_options');
  assert.ok(Array.isArray(ast.table_options), 'table_options should be array');
  assert.strictEqual(ast.table_options[0].keyword, 'engine');
  assert.strictEqual(ast.table_options[0].symbol, '=');
  assert.strictEqual(ast.table_options[0].value, 'INNODB');
});

test('Column with GENERATED ALWAYS AS', () => {
  const sql = "CREATE TABLE users (full_name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED)";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  const colDef = ast.create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.generated, 'Should have generated');
  assert.strictEqual(colDef.generated.type, 'generated');
  assert.ok(colDef.generated.expr, 'Should have generated expr');
  assert.strictEqual(colDef.generated.value, 'generated always as');
  assert.strictEqual(colDef.generated.storage_type, 'stored');
});

test('Column with CHARACTER SET', () => {
  const sql = "CREATE TABLE users (name VARCHAR(100) CHARACTER SET utf8mb4)";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  const colDef = ast.create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.character_set, 'Should have character_set');
  assert.strictEqual(colDef.character_set.type, 'CHARACTER SET');
  assert.ok(colDef.character_set.value, 'Should have character_set value');
  assert.strictEqual(colDef.character_set.value.type, 'default');
  assert.strictEqual(colDef.character_set.value.value, 'utf8mb4');
});

test('Column with COLUMN_FORMAT', () => {
  const sql = "CREATE TABLE users (id INT COLUMN_FORMAT FIXED)";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  const colDef = ast.create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.column_format, 'Should have column_format');
  assert.strictEqual(colDef.column_format.type, 'column_format');
  assert.strictEqual(colDef.column_format.value, 'fixed');
});

test('Column with STORAGE', () => {
  const sql = "CREATE TABLE users (id INT STORAGE DISK)";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'table');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  const colDef = ast.create_definitions[0] as CreateColumnDefinition;
  assert.ok(colDef.storage, 'Should have storage');
  assert.strictEqual(colDef.storage.type, 'storage');
  assert.strictEqual(colDef.storage.value, 'disk');
});
