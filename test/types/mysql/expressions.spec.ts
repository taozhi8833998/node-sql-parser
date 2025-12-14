import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Column, Function, AggrFunc, Case, Cast } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('SELECT with function', () => {
  const sql = 'SELECT UPPER(name) FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  const cols = selectAst.columns as Column[];
  const func = cols[0].expr as Function;
  assert.strictEqual(func.type, 'function');
});

test('SELECT with aggregate function', () => {
  const sql = 'SELECT COUNT(*) FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  const cols = selectAst.columns as Column[];
  const aggr = cols[0].expr as AggrFunc;
  assert.strictEqual(aggr.type, 'aggr_func');
  assert.strictEqual(aggr.name, 'COUNT');
});

test('SELECT with CASE expression', () => {
  const sql = 'SELECT CASE WHEN age > 18 THEN "adult" ELSE "minor" END FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  const cols = selectAst.columns as Column[];
  const caseExpr = cols[0].expr as Case;
  assert.strictEqual(caseExpr.type, 'case');
  assert.ok(Array.isArray(caseExpr.args));
});

test('SELECT with CAST', () => {
  const sql = 'SELECT CAST(id AS VARCHAR) FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  const cols = selectAst.columns as Column[];
  const cast = cols[0].expr as Cast;
  assert.strictEqual(cast.type, 'cast');
  assert.strictEqual(cast.keyword, 'cast');
});
