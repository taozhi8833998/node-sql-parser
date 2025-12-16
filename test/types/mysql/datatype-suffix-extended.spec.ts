import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('DataType suffix - UNSIGNED', () => {
  const ast = parser.astify('CREATE TABLE t (id INT UNSIGNED)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('DataType suffix - ZEROFILL', () => {
  const ast = parser.astify('CREATE TABLE t (id INT ZEROFILL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('DataType suffix - UNSIGNED ZEROFILL', () => {
  const ast = parser.astify('CREATE TABLE t (id INT UNSIGNED ZEROFILL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('DataType suffix - Timezone NOT in MySQL', () => {
  const ast = parser.astify('CREATE TABLE t (created_at TIMESTAMP)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});
