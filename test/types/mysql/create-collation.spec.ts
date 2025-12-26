import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition, isCreateDatabase } from './types.guard.ts';
import type { CreateTable, CreateDatabase, CreateColumnDefinition } from '../../../types/mysql.d.ts';

const parser = new Parser();

test('CREATE TABLE with column COLLATE and CHARACTER SET', () => {
  const ast = parser.astify('CREATE TABLE t (name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, (ast as CreateTable).create_definitions![0]);
});

test('CREATE DATABASE with multiple options', () => {
  const ast = parser.astify('CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  assertType(isCreate, ast);
  assertType(isCreateDatabase, ast);
});
