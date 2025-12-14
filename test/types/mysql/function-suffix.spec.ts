import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Function, OnUpdateCurrentTimestamp } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('Function suffix type is OnUpdateCurrentTimestamp or null', () => {
  const sql = 'SELECT CURRENT_TIMESTAMP() FROM dual';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const func = selectAst.columns[0].expr as Function;
  assert.strictEqual(func.type, 'function');
  // suffix can be OnUpdateCurrentTimestamp | null | undefined
  assert.ok(func.suffix === null || func.suffix === undefined || typeof func.suffix === 'object');
});

test('CURRENT_TIMESTAMP without function ()', () => {
  const sql = 'SELECT CURRENT_TIMESTAMP';
  const ast = parser.astify(sql);

  assert.ok(isSelect(ast), 'AST should be a Select type');
});
