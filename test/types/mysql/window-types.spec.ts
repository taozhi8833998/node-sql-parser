import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, AggrFunc, WindowSpec, AsWindowSpec, WindowExpr, NamedWindowExpr } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Window function - OVER with PARTITION BY', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY user_id ORDER BY date) FROM orders';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const col = (ast.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.ok(aggrFunc.over);
  assert.strictEqual('type' in aggrFunc.over, true, 'type should be present');
  assert.strictEqual('as_window_specification' in aggrFunc.over, true, 'as_window_specification should be present');
});

test('Window function - OVER with window name', () => {
  const sql = 'SELECT SUM(amount) OVER w FROM orders WINDOW w AS (PARTITION BY user_id)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const col = (ast.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.ok(aggrFunc.over);
});

test('WindowSpec - check properties', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY user_id ORDER BY date) FROM orders';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const col = (ast.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  
  if (aggrFunc.over && typeof aggrFunc.over === 'object' && 'as_window_specification' in aggrFunc.over) {
    const asSpec = aggrFunc.over.as_window_specification as any;
    if (typeof asSpec === 'object' && 'window_specification' in asSpec) {
      const spec = asSpec.window_specification as WindowSpec;
      assert.strictEqual('name' in spec, true, 'name should be present');
      assert.strictEqual('partitionby' in spec, true, 'partitionby should be present');
      assert.strictEqual('orderby' in spec, true, 'orderby should be present');
      assert.strictEqual('window_frame_clause' in spec, true, 'window_frame_clause should be present');
    }
  }
});

test('WindowExpr - WINDOW clause', () => {
  const sql = 'SELECT SUM(amount) OVER w FROM orders WINDOW w AS (PARTITION BY user_id)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  if (ast.window) {
    assert.strictEqual('keyword' in ast.window, true, 'keyword should be present');
    assert.strictEqual('type' in ast.window, true, 'type should be present');
    assert.strictEqual('expr' in ast.window, true, 'expr should be present');
  }
});

test('NamedWindowExpr - check properties', () => {
  const sql = 'SELECT SUM(amount) OVER w FROM orders WINDOW w AS (PARTITION BY user_id)';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  if (ast.window) {
    const namedExpr = ast.window.expr[0] as NamedWindowExpr;
    assert.strictEqual('name' in namedExpr, true, 'name should be present');
    assert.strictEqual('as_window_specification' in namedExpr, true, 'as_window_specification should be present');
  }
});

test('Window function - with frame clause', () => {
  const sql = 'SELECT SUM(amount) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const col = (ast.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  
  if (aggrFunc.over && typeof aggrFunc.over === 'object' && 'as_window_specification' in aggrFunc.over) {
    const asSpec = aggrFunc.over.as_window_specification as any;
    if (typeof asSpec === 'object' && 'window_specification' in asSpec) {
      const spec = asSpec.window_specification as WindowSpec;
      if (spec.window_frame_clause) {
        assert.strictEqual('type' in spec.window_frame_clause, true, 'window_frame_clause should have type');
      }
    }
  }
});
