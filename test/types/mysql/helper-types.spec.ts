import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Parser } from './parser-loader.mjs';
import {
  isSelect,
  isCreate,
  isWindowExpr,
  isNamedWindowExpr,
  isTriggerEvent,
  isTableOption,
} from './types.guard.js';
import type { Select, Create } from '../../types.js';

const parser = new Parser();

describe('Helper Types', () => {
  test('WindowExpr in SELECT with WINDOW clause', () => {
    const sql = `SELECT id, ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)`;
    const ast = parser.astify(sql);
    
    assert(isSelect(ast), 'AST should be a Select type');
    const selectAst = ast as Select;
    assert(typeof selectAst === 'object' && selectAst !== null);
    assert(selectAst.type === 'select');
    assert(selectAst.window !== undefined && selectAst.window !== null);
    assert(isWindowExpr(selectAst.window));
    assert(selectAst.window.keyword === 'window');
    assert(Array.isArray(selectAst.window.expr));
    assert(selectAst.window.expr.length > 0);
    assert(isNamedWindowExpr(selectAst.window.expr[0]));
  });

  test('TriggerEvent in CREATE TRIGGER', () => {
    const sql = `CREATE TRIGGER my_trigger BEFORE INSERT ON t FOR EACH ROW SET x = 1`;
    const ast = parser.astify(sql);
    
    assert(isCreate(ast), 'AST should be a Create type');
    const createAst = ast as Create;
    assert(typeof createAst === 'object' && createAst !== null);
    assert(createAst.type === 'create');
    assert(createAst.events !== undefined && createAst.events !== null);
    assert(Array.isArray(createAst.events));
    assert(createAst.events.length > 0);
    assert(isTriggerEvent(createAst.events[0]));
    assert(createAst.events[0].keyword === 'insert');
  });

  test('TableOption in CREATE TABLE', () => {
    const sql = `CREATE TABLE t (id INT) ENGINE=InnoDB AUTO_INCREMENT=100`;
    const ast = parser.astify(sql);
    
    assert(isCreate(ast), 'AST should be a Create type');
    const createAst = ast as Create;
    assert(typeof createAst === 'object' && createAst !== null);
    assert(createAst.type === 'create');
    assert(createAst.table_options !== undefined && createAst.table_options !== null);
    assert(Array.isArray(createAst.table_options));
    assert(createAst.table_options.length > 0);
    assert(isTableOption(createAst.table_options[0]));
  });
});
