import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, AggrFunc } from '../../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('GROUP_CONCAT with separator', () => {
  const sql = "SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users";
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const col = (selectAst.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.strictEqual(aggrFunc.type, 'aggr_func');
  assert.ok(aggrFunc.args.separator);
  assert.strictEqual(typeof aggrFunc.args.separator, 'object');
});

test('COUNT without DISTINCT or ORDER BY - check if properties exist', () => {
  const sql = "SELECT COUNT(id) FROM users";
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const col = (selectAst.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.strictEqual(aggrFunc.type, 'aggr_func');
  assert.ok('distinct' in aggrFunc.args);
  assert.ok('orderby' in aggrFunc.args);
});

test('COUNT with DISTINCT', () => {
  const sql = "SELECT COUNT(DISTINCT id) FROM users";
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const col = (selectAst.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.strictEqual(aggrFunc.type, 'aggr_func');
  assert.strictEqual(aggrFunc.args.distinct, 'DISTINCT');
});

test('GROUP_CONCAT with ORDER BY', () => {
  const sql = "SELECT GROUP_CONCAT(name ORDER BY name) FROM users";
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  const col = (selectAst.columns as Column[])[0];
  const aggrFunc = col.expr as AggrFunc;
  assert.strictEqual(aggrFunc.type, 'aggr_func');
  assert.ok(aggrFunc.args.orderby);
  assert.ok(Array.isArray(aggrFunc.args.orderby));
});
