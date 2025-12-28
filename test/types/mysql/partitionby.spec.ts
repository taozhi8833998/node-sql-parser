import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isSelect, isPartitionBy, isWindowSpec } from './types.guard.ts';

const parser = new Parser();

test('PARTITION BY in window function', () => {
  const ast = parser.astify('SELECT ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary) FROM employees');
  assertType(isSelect, ast);
  assertType(isPartitionBy, ast.columns[0].expr.over.as_window_specification.window_specification.partitionby);
});

test('WindowSpec with PARTITION BY', () => {
  const ast = parser.astify('SELECT SUM(amount) OVER (PARTITION BY category, region ORDER BY date) FROM sales');
  assertType(isSelect, ast);
  assertType(isWindowSpec, ast.columns[0].expr.over.as_window_specification.window_specification);
});
