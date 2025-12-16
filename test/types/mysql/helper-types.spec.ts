import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isCreate, isWindowExpr, isNamedWindowExpr, isTriggerEvent, isTableOption } from './types.guard.js';

const parser = new Parser();

test('WindowExpr in SELECT with WINDOW clause', () => {
  const ast = parser.astify('SELECT id, ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)');
  assertType(isSelect, ast);
  assertType(isWindowExpr, ast.window);
  assertType(isNamedWindowExpr, ast.window.expr[0]);
});

test('TriggerEvent in CREATE TRIGGER', () => {
  const ast = parser.astify('CREATE TRIGGER my_trigger BEFORE INSERT ON t FOR EACH ROW SET x = 1');
  assertType(isCreate, ast);
  assertType(isTriggerEvent, ast.events[0]);
});

test('TableOption in CREATE TABLE', () => {
  const ast = parser.astify('CREATE TABLE t (id INT) ENGINE=InnoDB AUTO_INCREMENT=100');
  assertType(isCreate, ast);
  assertType(isTableOption, ast.table_options[0]);
});
