import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('ReferenceDefinition.definition - column reference in inline REFERENCES', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});
