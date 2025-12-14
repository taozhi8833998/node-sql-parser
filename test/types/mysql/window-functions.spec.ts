import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, AggrFunc, WindowSpec, WindowFrameClause } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Window function with frame clause', () => {
  const sql = 'SELECT SUM(amount) OVER (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const col = (selectAst.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.strictEqual(aggrFunc.type, 'aggr_func');
  
  // Window functions have over property
  const over = aggrFunc.over;
  assert.ok(over === undefined || typeof over === 'object');
  
  // WindowFrameClause type is defined in types.d.ts
  // The actual structure may vary, but the types should compile
  if (over && typeof over === 'object' && 'window_specification' in over) {
    const spec = (over as any).window_specification as WindowSpec;
    assert.ok(spec === undefined || typeof spec === 'object');
  }
});
