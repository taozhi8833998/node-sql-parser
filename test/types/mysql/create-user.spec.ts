import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateUser, UserAuthOption } from '../../../types.d.ts';
import { isCreateUser, isValueExpr } from './types.guard.ts';

const parser = new Parser();

test('CreateUser - basic user creation', () => {
  const sql = "CREATE USER 'testuser'@'localhost'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'user');
  assert.ok(Array.isArray(ast.user));
});

test('CreateUser - with password', () => {
  const sql = "CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'password'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  const user = ast.user![0] as UserAuthOption;
  assert.ok(user.user);
  assert.ok(user.auth_option);
  assert.strictEqual(user.auth_option!.keyword, 'identified');
  assert.strictEqual(user.auth_option!.value.prefix, 'by');
});

test('CreateUser - with IF NOT EXISTS', () => {
  const sql = "CREATE USER IF NOT EXISTS 'testuser'@'localhost'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  assert.strictEqual(ast.if_not_exists, 'IF NOT EXISTS');
});

test('CreateUser - UserAuthOption user property', () => {
  const sql = "CREATE USER 'testuser'@'localhost'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  const user = ast.user![0] as UserAuthOption;
  assert.ok(user.user);
  assert.ok(user.user.name);
  assert.strictEqual(user.user.name.type, 'single_quote_string');
  assert.ok(user.user.host);
  assert.strictEqual(user.user.host.type, 'single_quote_string');
});

test('CreateUser - multiple users', () => {
  const sql = "CREATE USER 'user1'@'localhost', 'user2'@'%'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreateUser(ast), 'Should be CreateUser');
  assert.ok(Array.isArray(ast.user));
  assert.strictEqual(ast.user!.length, 2);
});
