import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreateIndex, isIndexOption } from './types.guard';

const parser = new Parser();

test('IndexOption - KEY_BLOCK_SIZE variant', () => {
  const ast = parser.astify('CREATE INDEX idx1 ON users (name) KEY_BLOCK_SIZE = 8');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - USING BTREE variant', () => {
  const ast = parser.astify('CREATE INDEX idx1 ON users (name) USING BTREE');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - USING HASH variant', () => {
  const ast = parser.astify('CREATE INDEX idx1 ON users (name) USING HASH');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - WITH PARSER variant (FULLTEXT only)', () => {
  const ast = parser.astify('CREATE FULLTEXT INDEX idx1 ON articles (content) WITH PARSER ngram');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - VISIBLE variant', () => {
  const ast = parser.astify('CREATE INDEX idx1 ON users (name) VISIBLE');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - INVISIBLE variant', () => {
  const ast = parser.astify('CREATE INDEX idx1 ON users (name) INVISIBLE');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - COMMENT variant', () => {
  const ast = parser.astify("CREATE INDEX idx1 ON users (name) COMMENT 'my index'");
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
});

test('IndexOption - multiple options', () => {
  const ast = parser.astify('CREATE INDEX idx1 ON users (name) USING BTREE KEY_BLOCK_SIZE = 8');
  assertType(isCreateIndex, ast);
  assertType(isIndexOption, ast.index_options[0]);
  assertType(isIndexOption, ast.index_options[1]);
});
