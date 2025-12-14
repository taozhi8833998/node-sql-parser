import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { PartitionBy, WindowSpec } from '../../types.d.ts';
import { isSelect, isPartitionBy, isWindowSpec } from './types.guard.ts';

const parser = new Parser();

test('PARTITION BY in window function', () => {
  const sql = 'SELECT ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary) FROM employees';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast), 'Should be Select');
  const windowSpec = ast.columns![0].expr.over!.as_window_specification!.window_specification as WindowSpec;
  
  assert.ok(windowSpec.partitionby);
  assert.ok(isPartitionBy(windowSpec.partitionby), 'Should be PartitionBy');
  assert.ok(Array.isArray(windowSpec.partitionby));
  assert.strictEqual(windowSpec.partitionby.length, 1);
});

test('WindowSpec with PARTITION BY', () => {
  const sql = 'SELECT SUM(amount) OVER (PARTITION BY category, region ORDER BY date) FROM sales';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast), 'Should be Select');
  const windowSpec = ast.columns![0].expr.over!.as_window_specification!.window_specification as WindowSpec;
  
  assert.ok(isWindowSpec(windowSpec), 'Should be WindowSpec');
  assert.ok(windowSpec.partitionby);
  assert.strictEqual(windowSpec.partitionby.length, 2);
});
