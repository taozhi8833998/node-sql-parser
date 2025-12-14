import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, TriggerEvent, UserAuthOption } from '../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('CREATE TRIGGER', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'trigger');
  assert.ok(createAst.for_each);
  assert.ok(Array.isArray(createAst.events));
  const event = createAst.events![0] as TriggerEvent;
  assert.strictEqual(event.keyword, 'insert');
});

test('CREATE VIEW', () => {
  const sql = 'CREATE VIEW user_view AS SELECT id, name FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'view');
  assert.ok(createAst.view);
  assert.ok(createAst.select);
});

test('CREATE USER - user is UserAuthOption array', () => {
  const sql = "CREATE USER 'testuser'@'localhost' IDENTIFIED BY 'password'";
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'user');
  assert.ok(Array.isArray(createAst.user));
  const user = createAst.user![0] as UserAuthOption;
  assert.ok(user);
  assert.ok(user.auth_option);
});
