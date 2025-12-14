import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTable, CreateColumnDefinition } from '../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('DataType suffix - UNSIGNED', () => {
  const sql = 'CREATE TABLE t (id INT UNSIGNED)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
  assert.ok(dataType.suffix);
  assert.ok(Array.isArray(dataType.suffix));
  assert.ok(dataType.suffix.includes('UNSIGNED'));
});

test('DataType suffix - ZEROFILL', () => {
  const sql = 'CREATE TABLE t (id INT ZEROFILL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
  assert.ok(dataType.suffix);
  assert.ok(Array.isArray(dataType.suffix));
  assert.ok(dataType.suffix.includes('ZEROFILL'));
});

test('DataType suffix - UNSIGNED ZEROFILL', () => {
  const sql = 'CREATE TABLE t (id INT UNSIGNED ZEROFILL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
  assert.ok(dataType.suffix);
  assert.ok(Array.isArray(dataType.suffix));
  assert.ok(dataType.suffix.includes('UNSIGNED'));
  assert.ok(dataType.suffix.includes('ZEROFILL'));
});

test('DataType suffix - Timezone NOT in MySQL', () => {
  // Timezone (WITH/WITHOUT TIME ZONE) is PostgreSQL syntax, not MySQL
  // This test documents that Timezone type in types.d.ts is not applicable to MySQL
  const sql = 'CREATE TABLE t (created_at TIMESTAMP)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast));
  const createTable = ast as CreateTable;
  const colDef = createTable.create_definitions?.[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef));
  const dataType = colDef.definition;
  // suffix should not be a Timezone tuple for MySQL
  if (dataType.suffix && Array.isArray(dataType.suffix)) {
    // Should be UNSIGNED/ZEROFILL array, not Timezone tuple
    assert.ok(dataType.suffix.every((s: string) => 
      s === 'UNSIGNED' || s === 'ZEROFILL'
    ));
  }
});
