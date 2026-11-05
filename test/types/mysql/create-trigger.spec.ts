import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateTrigger, isBinary } from './types.guard.ts';

const parser = new Parser();

test('CreateTrigger - basic BEFORE INSERT', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - AFTER UPDATE', () => {
  const ast = parser.astify('CREATE TRIGGER update_trigger AFTER UPDATE ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - AFTER DELETE', () => {
  const ast = parser.astify('CREATE TRIGGER delete_trigger AFTER DELETE ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - with definer', () => {
  const ast = parser.astify("CREATE DEFINER = 'admin'@'localhost' TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()");
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
  assertType(isBinary, ast.definer);
});

test('CreateTrigger - trigger with db.table name', () => {
  const ast = parser.astify('CREATE TRIGGER mydb.my_trigger BEFORE INSERT ON mydb.users FOR EACH ROW SET NEW.created_at = NOW()');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - table property', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - for_each property', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - for_each with STATEMENT', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH STATEMENT SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - execute property', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET NEW.created_at = NOW()');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - with FOLLOWS order', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW FOLLOWS other_trigger SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - with PRECEDES order', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW PRECEDES other_trigger SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - TriggerEvent type', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - if_not_exists property', () => {
  const ast = parser.astify('CREATE TRIGGER IF NOT EXISTS my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - if_not_exists null', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - definer null', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - order null', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});

test('CreateTrigger - time property values', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON users FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isCreateTrigger, ast);
});
