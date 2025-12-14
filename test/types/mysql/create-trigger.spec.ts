import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { CreateTrigger, TriggerEvent } from '../../../types.d.ts';
import { isCreateTrigger, isBinary } from './types.guard.ts';

const parser = new Parser();

test('CreateTrigger - basic BEFORE INSERT', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.strictEqual(ast.type, 'create');
  assert.strictEqual(ast.keyword, 'trigger');
  assert.strictEqual(ast.time, 'BEFORE');
  assert.ok(Array.isArray(ast.events));
  assert.strictEqual(ast.events![0].keyword, 'insert');
});

test('CreateTrigger - AFTER UPDATE', () => {
  const sql = 'CREATE TRIGGER update_trigger AFTER UPDATE ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.strictEqual(ast.time, 'AFTER');
  assert.strictEqual(ast.events![0].keyword, 'update');
});

test('CreateTrigger - AFTER DELETE', () => {
  const sql = 'CREATE TRIGGER delete_trigger AFTER DELETE ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.strictEqual(ast.time, 'AFTER');
  assert.strictEqual(ast.events![0].keyword, 'delete');
});

test('CreateTrigger - with definer', () => {
  const sql = "CREATE DEFINER = 'admin'@'localhost' TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()";
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.definer, 'Should have definer');
  assert.ok(isBinary(ast.definer), 'Definer should be Binary');
});

test('CreateTrigger - trigger with db.table name', () => {
  const sql = 'CREATE TRIGGER mydb.my_trigger BEFORE INSERT ON mydb.users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.trigger);
  assert.strictEqual(ast.trigger!.db, 'mydb');
  assert.strictEqual(ast.trigger!.table, 'my_trigger');
});

test('CreateTrigger - table property', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.table);
});

test('CreateTrigger - for_each property', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.for_each);
  assert.strictEqual(typeof ast.for_each, 'object');
  assert.strictEqual(ast.for_each.keyword, 'for each');
  assert.strictEqual(ast.for_each.args, 'row');
});

test('CreateTrigger - for_each with STATEMENT', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH STATEMENT SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.for_each);
  assert.strictEqual(ast.for_each.args, 'statement');
});

test('CreateTrigger - execute property', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.execute);
  assert.strictEqual(ast.execute.type, 'set');
  assert.ok(Array.isArray(ast.execute.expr));
});

test('CreateTrigger - with FOLLOWS order', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW FOLLOWS other_trigger SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.order);
  assert.strictEqual(ast.order.keyword, 'FOLLOWS');
  assert.strictEqual(ast.order.trigger, 'other_trigger');
});

test('CreateTrigger - with PRECEDES order', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW PRECEDES other_trigger SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  assert.ok(ast.order);
  assert.strictEqual(ast.order.keyword, 'PRECEDES');
  assert.strictEqual(ast.order.trigger, 'other_trigger');
});

test('CreateTrigger - TriggerEvent type', () => {
  const sql = 'CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isCreateTrigger(ast), 'Should be CreateTrigger');
  const event = ast.events![0] as TriggerEvent;
  assert.strictEqual(event.keyword, 'insert');
  assert.strictEqual(event.args, undefined);
});
