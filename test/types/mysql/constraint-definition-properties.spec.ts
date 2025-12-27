import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateConstraintPrimary, isCreateConstraintUnique, isCreateConstraintForeign, isCreateConstraintCheck } from './types.guard';

const parser = new Parser();

test('CreateConstraintPrimary - basic properties', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - with constraint name', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - without constraint name', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - with index_type', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY USING BTREE (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - without index_type', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - with index_options', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY (id) KEY_BLOCK_SIZE = 8)');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - without index_options', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, PRIMARY KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[1]);
});

test('CreateConstraintPrimary - multiple columns', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, email VARCHAR(255), PRIMARY KEY (id, email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintPrimary, ast.create_definitions[2]);
});

test('CreateConstraintUnique - basic properties', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CreateConstraintUnique - constraint_type variants', () => {
  const ast1 = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))');
  assertType(isCreate, ast1);
  assertType(isCreateConstraintUnique, ast1.create_definitions[1]);

  const ast2 = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE INDEX (email))');
  assertType(isCreate, ast2);
  assertType(isCreateConstraintUnique, ast2.create_definitions[1]);

  const ast3 = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE (email))');
  assertType(isCreate, ast3);
  assertType(isCreateConstraintUnique, ast3.create_definitions[1]);
});

test('CreateConstraintUnique - with constraint name', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), CONSTRAINT uk_email UNIQUE KEY (email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CreateConstraintUnique - with index name', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY idx_email (email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CreateConstraintUnique - without index name', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CreateConstraintUnique - with index_type', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY USING HASH (email))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CreateConstraintUnique - with index_options', () => {
  const ast = parser.astify('CREATE TABLE users (email VARCHAR(255), UNIQUE KEY (email) VISIBLE)');
  assertType(isCreate, ast);
  assertType(isCreateConstraintUnique, ast.create_definitions[1]);
});

test('CreateConstraintForeign - basic properties', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CreateConstraintForeign - with constraint name', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CreateConstraintForeign - with index name', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, FOREIGN KEY fk_user_id (user_id) REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CreateConstraintForeign - without index name', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CreateConstraintForeign - with reference_definition', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CreateConstraintForeign - without reference_definition', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintForeign, ast.create_definitions[1]);
});

test('CreateConstraintCheck - basic properties', () => {
  const ast = parser.astify('CREATE TABLE products (price INT, CHECK (price > 0))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintCheck, ast.create_definitions[1]);
});

test('CreateConstraintCheck - with constraint name', () => {
  const ast = parser.astify('CREATE TABLE products (price INT, CONSTRAINT chk_price CHECK (price > 0))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintCheck, ast.create_definitions[1]);
});

test('CreateConstraintCheck - without constraint name', () => {
  const ast = parser.astify('CREATE TABLE products (price INT, CHECK (price > 0))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintCheck, ast.create_definitions[1]);
});

test('CreateConstraintCheck - definition is Binary array', () => {
  const ast = parser.astify('CREATE TABLE products (price INT, CHECK (price > 0))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintCheck, ast.create_definitions[1]);
});

test('CreateConstraintCheck - index_type for NOT FOR REPLICATION', () => {
  const ast = parser.astify('CREATE TABLE products (price INT, CHECK (price > 0))');
  assertType(isCreate, ast);
  assertType(isCreateConstraintCheck, ast.create_definitions[1]);
});
