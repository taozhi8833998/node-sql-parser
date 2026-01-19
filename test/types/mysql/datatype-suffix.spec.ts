import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition } from './types.guard.js';

const parser = new Parser();

test('DataType with UNSIGNED suffix', () => {
  const ast = parser.astify('CREATE TABLE users (age INT UNSIGNED)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('DataType with UNSIGNED ZEROFILL suffix', () => {
  const ast = parser.astify('CREATE TABLE users (age INT UNSIGNED ZEROFILL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('DataType with ON UPDATE in reference_definition', () => {
  const ast = parser.astify('CREATE TABLE users (updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});
