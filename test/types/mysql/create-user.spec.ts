import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateUser } from './types.guard.ts';

const parser = new Parser();

test('CreateUser - basic user creation', () => {
  const ast = parser.astify("CREATE USER 'testuser'@'localhost'");
  assertType(isCreate, ast);
  assertType(isCreateUser, ast);
});

test('CreateUser - with password', () => {
  const ast = parser.astify("CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'password'");
  assertType(isCreate, ast);
  assertType(isCreateUser, ast);
});

test('CreateUser - with IF NOT EXISTS', () => {
  const ast = parser.astify("CREATE USER IF NOT EXISTS 'testuser'@'localhost'");
  assertType(isCreate, ast);
  assertType(isCreateUser, ast);
});

test('CreateUser - UserAuthOption user property', () => {
  const ast = parser.astify("CREATE USER 'testuser'@'localhost'");
  assertType(isCreate, ast);
  assertType(isCreateUser, ast);
});

test('CreateUser - multiple users', () => {
  const ast = parser.astify("CREATE USER 'user1'@'localhost', 'user2'@'%'");
  assertType(isCreate, ast);
  assertType(isCreateUser, ast);
});
