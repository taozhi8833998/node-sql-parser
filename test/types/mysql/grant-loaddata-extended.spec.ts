import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Grant, LoadData } from '../../types.d.ts';
import { isGrant, isLoadData } from './types.guard.ts';

const parser = new Parser();

test('GRANT statement', () => {
  const sql = 'GRANT SELECT ON mydb.* TO user1';
  const ast = parser.astify(sql);
  
  assert.ok(isGrant(ast), 'AST should be a Grant type');
  const grantAst = ast as Grant;
  assert.strictEqual(grantAst.type, 'grant');
});

test('GRANT - objects with priv and columns', () => {
  const sql = 'GRANT SELECT, INSERT ON mydb.* TO user1';
  const ast = parser.astify(sql);
  assert.ok(isGrant(ast));
  const grantAst = ast as Grant;
  assert.strictEqual(grantAst.objects.length, 2);
  assert.strictEqual(grantAst.objects[0].priv.value, 'SELECT');
  assert.strictEqual(grantAst.objects[0].columns, null);
});

test('GRANT - on with object_type and priv_level', () => {
  const sql = 'GRANT SELECT ON mydb.* TO user1';
  const ast = parser.astify(sql);
  assert.ok(isGrant(ast));
  const grantAst = ast as Grant;
  assert.strictEqual(grantAst.on.object_type, null);
  assert.strictEqual(grantAst.on.priv_level[0].prefix, 'mydb');
  assert.strictEqual(grantAst.on.priv_level[0].name, '*');
});

test('GRANT - user_or_roles with name and host', () => {
  const sql = 'GRANT SELECT ON mydb.* TO user1@localhost';
  const ast = parser.astify(sql);
  assert.ok(isGrant(ast));
  const grantAst = ast as Grant;
  assert.strictEqual(grantAst.user_or_roles[0].name.value, 'user1');
  assert.ok(grantAst.user_or_roles[0].host);
  assert.strictEqual(grantAst.user_or_roles[0].host.value, 'localhost');
});

test('GRANT - to_from property', () => {
  const sql = 'GRANT SELECT ON mydb.* TO user1';
  const ast = parser.astify(sql);
  assert.ok(isGrant(ast));
  const grantAst = ast as Grant;
  assert.strictEqual(grantAst.to_from, 'TO');
});

test('LOAD DATA statement', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users";
  const ast = parser.astify(sql);
  
  assert.ok(isLoadData(ast), 'AST should be a LoadData type');
  const loadAst = ast as LoadData;
  assert.strictEqual(loadAst.type, 'load_data');
});

test('LOAD DATA - mode, local, file properties', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users";
  const ast = parser.astify(sql);
  assert.ok(isLoadData(ast));
  const loadAst = ast as LoadData;
  assert.strictEqual(loadAst.mode, null);
  assert.strictEqual(loadAst.local, null);
  assert.strictEqual(loadAst.file.value, '/tmp/data.csv');
});

test('LOAD DATA - table property', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE mydb.users";
  const ast = parser.astify(sql);
  assert.ok(isLoadData(ast));
  const loadAst = ast as LoadData;
  assert.strictEqual(loadAst.table.db, 'mydb');
  assert.strictEqual(loadAst.table.table, 'users');
});

test('LOAD DATA - fields property', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users FIELDS TERMINATED BY ','";
  const ast = parser.astify(sql);
  assert.ok(isLoadData(ast));
  const loadAst = ast as LoadData;
  assert.ok(loadAst.fields);
  assert.strictEqual(loadAst.fields.keyword, 'FIELDS');
  assert.ok(loadAst.fields.terminated);
  assert.strictEqual(loadAst.fields.terminated.value, ',');
});

test('LOAD DATA - lines property', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users LINES TERMINATED BY '\\n'";
  const ast = parser.astify(sql);
  assert.ok(isLoadData(ast));
  const loadAst = ast as LoadData;
  assert.ok(loadAst.lines);
  assert.strictEqual(loadAst.lines.keyword, 'LINES');
  assert.ok(loadAst.lines.terminated);
});
