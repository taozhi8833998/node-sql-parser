import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('ColumnDefinitionOptList.nullable - NOT NULL', () => {
  const ast = parser.astify('CREATE TABLE t (id INT NOT NULL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.nullable - NULL', () => {
  const ast = parser.astify('CREATE TABLE t (id INT NULL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.nullable - absent when not specified', () => {
  const ast = parser.astify('CREATE TABLE t (id INT)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.default_val - string literal', () => {
  const ast = parser.astify("CREATE TABLE t (name VARCHAR(50) DEFAULT 'unknown')");
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.default_val - numeric literal', () => {
  const ast = parser.astify('CREATE TABLE t (age INT DEFAULT 0)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.default_val - NULL', () => {
  const ast = parser.astify('CREATE TABLE t (data VARCHAR(50) DEFAULT NULL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.default_val - CURRENT_TIMESTAMP', () => {
  const ast = parser.astify('CREATE TABLE t (created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.auto_increment - present', () => {
  const ast = parser.astify('CREATE TABLE t (id INT AUTO_INCREMENT)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.auto_increment - absent', () => {
  const ast = parser.astify('CREATE TABLE t (id INT)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.unique - UNIQUE', () => {
  const ast = parser.astify('CREATE TABLE t (email VARCHAR(100) UNIQUE)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.unique - UNIQUE KEY', () => {
  const ast = parser.astify('CREATE TABLE t (email VARCHAR(100) UNIQUE KEY)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.primary_key - PRIMARY KEY', () => {
  const ast = parser.astify('CREATE TABLE t (id INT PRIMARY KEY)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.primary_key - KEY', () => {
  const ast = parser.astify('CREATE TABLE t (id INT KEY)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.comment - present', () => {
  const ast = parser.astify("CREATE TABLE t (id INT COMMENT 'Primary key')");
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.collate - present', () => {
  const ast = parser.astify('CREATE TABLE t (name VARCHAR(50) COLLATE utf8mb4_unicode_ci)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.column_format - FIXED', () => {
  const ast = parser.astify('CREATE TABLE t (data VARCHAR(50) COLUMN_FORMAT FIXED)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.column_format - DYNAMIC', () => {
  const ast = parser.astify('CREATE TABLE t (data VARCHAR(50) COLUMN_FORMAT DYNAMIC)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.storage - DISK', () => {
  const ast = parser.astify('CREATE TABLE t (data VARCHAR(50) STORAGE DISK)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.storage - MEMORY', () => {
  const ast = parser.astify('CREATE TABLE t (data VARCHAR(50) STORAGE MEMORY)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.reference_definition - basic foreign key', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT REFERENCES users(id))');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.reference_definition - with ON DELETE CASCADE', () => {
  const ast = parser.astify('CREATE TABLE orders (user_id INT REFERENCES users(id) ON DELETE CASCADE)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.character_set - present', () => {
  const ast = parser.astify('CREATE TABLE t (name VARCHAR(50) CHARACTER SET utf8mb4)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.character_set - with equals sign', () => {
  const ast = parser.astify('CREATE TABLE t (name VARCHAR(50) CHARACTER SET = utf8mb4)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.check - basic check constraint', () => {
  const ast = parser.astify('CREATE TABLE t (age INT CHECK (age >= 0))');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.check - named constraint', () => {
  const ast = parser.astify('CREATE TABLE t (age INT CONSTRAINT chk_age CHECK (age >= 0))');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.check - enforced', () => {
  const ast = parser.astify('CREATE TABLE t (age INT CHECK (age >= 0) ENFORCED)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.check - not enforced', () => {
  const ast = parser.astify('CREATE TABLE t (age INT CHECK (age >= 0) NOT ENFORCED)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.generated - GENERATED ALWAYS AS', () => {
  const ast = parser.astify('CREATE TABLE t (full_name VARCHAR(100) GENERATED ALWAYS AS (CONCAT(first_name, " ", last_name)))');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.generated - STORED', () => {
  const ast = parser.astify('CREATE TABLE t (full_name VARCHAR(100) AS (CONCAT(first_name, " ", last_name)) STORED)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList.generated - VIRTUAL', () => {
  const ast = parser.astify('CREATE TABLE t (full_name VARCHAR(100) AS (CONCAT(first_name, " ", last_name)) VIRTUAL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('ColumnDefinitionOptList - multiple properties combined', () => {
  const ast = parser.astify("CREATE TABLE t (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY COMMENT 'ID column')");
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});
