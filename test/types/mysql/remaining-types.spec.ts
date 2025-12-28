import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition, isCreateConstraintPrimary } from './types.guard.js';

const parser = new Parser();

test('ConstraintName in PRIMARY KEY', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('LiteralNull in column definition', () => {
  const ast = parser.astify('CREATE TABLE users (name VARCHAR(50) NULL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('LiteralNotNull in column definition', () => {
  const ast = parser.astify('CREATE TABLE users (name VARCHAR(50) NOT NULL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});
