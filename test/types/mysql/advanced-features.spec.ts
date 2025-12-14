import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, AST, WindowExpr, NamedWindowExpr, From } from '../../../types.d.ts';
import { isSelect, isCreate } from './types.guard.ts';

const parser = new Parser();

test('Multiple statements return AST array', () => {
  const sql = 'SELECT 1; SELECT 2;';
  const ast = parser.astify(sql);
  
  assert.ok(Array.isArray(ast), 'Multiple statements should return an array');
  assert.strictEqual(ast.length, 2);
  assert.ok(isSelect(ast[0]));
  assert.ok(isSelect(ast[1]));
});

test('Named window expression in WINDOW clause', () => {
  const sql = 'SELECT id, ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.ok(selectAst.window, 'Should have window clause');
  assert.strictEqual(selectAst.window.keyword, 'window');
  assert.strictEqual(selectAst.window.type, 'window');
  assert.ok(Array.isArray(selectAst.window.expr));
  
  const namedWindow = selectAst.window.expr[0];
  assert.strictEqual(namedWindow.name, 'w');
  assert.ok(typeof namedWindow.as_window_specification === 'object');
  assert.ok('window_specification' in namedWindow.as_window_specification);
});

test('Window function references named window by string', () => {
  const sql = 'SELECT ROW_NUMBER() OVER w FROM t WINDOW w AS (ORDER BY id)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const col = selectAst.columns[0];
  assert.strictEqual(col.expr.type, 'function');
  
  if (col.expr.type === 'function') {
    assert.ok(col.expr.over);
    assert.strictEqual(col.expr.over.type, 'window');
    assert.strictEqual(typeof col.expr.over.as_window_specification, 'string');
    assert.strictEqual(col.expr.over.as_window_specification, 'w');
  }
});

test('Complex FROM with parentheses', () => {
  const sql = 'SELECT * FROM (t1, t2)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.ok(typeof selectAst.from === 'object' && !Array.isArray(selectAst.from));
  
  if (typeof selectAst.from === 'object' && !Array.isArray(selectAst.from) && 'expr' in selectAst.from) {
    assert.ok(Array.isArray(selectAst.from.expr));
    assert.strictEqual(selectAst.from.expr.length, 2);
    assert.ok('parentheses' in selectAst.from);
    assert.strictEqual(selectAst.from.parentheses.length, 1);
    assert.ok(Array.isArray(selectAst.from.joins));
  }
});

test('Set operation with UNION', () => {
  const sql = 'SELECT 1 UNION SELECT 2';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.set_op, 'union');
  assert.ok(selectAst._next);
  assert.ok(isSelect(selectAst._next));
});

test('CREATE INDEX with algorithm and lock options', () => {
  const sql = 'CREATE INDEX idx ON t (id) ALGORITHM = INPLACE LOCK = NONE';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as any;
  assert.strictEqual(createAst.type, 'create');
  assert.strictEqual(createAst.keyword, 'index');
  assert.ok(createAst.algorithm_option);
  assert.strictEqual(createAst.algorithm_option.keyword, 'algorithm');
  assert.strictEqual(createAst.algorithm_option.algorithm, 'INPLACE');
  assert.ok(createAst.lock_option);
  assert.strictEqual(createAst.lock_option.keyword, 'lock');
  assert.strictEqual(createAst.lock_option.lock, 'NONE');
});
