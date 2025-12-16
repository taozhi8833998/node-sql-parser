import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateConstraintPrimary, isCreateConstraintUnique, isCreateConstraintForeign, isCreateConstraintCheck } from './types.guard.ts';

const parser = new Parser();

test('CREATE TABLE with PRIMARY KEY constraint', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CREATE TABLE with UNIQUE constraint', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CREATE TABLE with FOREIGN KEY constraint', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CREATE TABLE with CHECK constraint', () => {
  const ast = parser.astify('CREATE TABLE products (price INT, CHECK (price > 0))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintCheck, ast.create_definitions[1]);
});

test('CREATE TABLE with named constraint', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});
