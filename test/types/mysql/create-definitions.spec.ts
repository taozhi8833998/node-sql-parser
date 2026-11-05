import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition, isCreateIndexDefinition, isCreateFulltextSpatialIndexDefinition } from './types.guard.ts';

const parser = new Parser();

test('CREATE TABLE with column definition - INT NOT NULL', () => {
  const ast = parser.astify('CREATE TABLE users (id INT NOT NULL)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('CREATE TABLE with column definition - VARCHAR with DEFAULT', () => {
  const ast = parser.astify("CREATE TABLE users (name VARCHAR(255) DEFAULT 'unknown')");
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('CREATE TABLE with column definition - AUTO_INCREMENT', () => {
  const ast = parser.astify('CREATE TABLE users (id INT AUTO_INCREMENT)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('CREATE TABLE with INDEX definition', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, name VARCHAR(255), INDEX idx_name (name))');
  assertType(isCreate, ast);
  assertType(isCreateIndexDefinition, ast.create_definitions[2]);
});

test('CREATE TABLE with KEY definition', () => {
  const ast = parser.astify('CREATE TABLE users (id INT, KEY (id))');
  assertType(isCreate, ast);
  assertType(isCreateIndexDefinition, ast.create_definitions[1]);
});

test('CREATE TABLE with FULLTEXT INDEX', () => {
  const ast = parser.astify('CREATE TABLE articles (id INT, content TEXT, FULLTEXT INDEX ft_content (content))');
  assertType(isCreate, ast);
  assertType(isCreateFulltextSpatialIndexDefinition, ast.create_definitions[2]);
});
