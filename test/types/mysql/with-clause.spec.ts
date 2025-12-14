import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, With, ColumnRef } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('WITH clause columns type', () => {
  const sql = 'WITH cte (id, name) AS (SELECT id, name FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  assert.ok(Array.isArray(selectAst.with));
  const withClause = selectAst.with![0] as With;
  assert.ok(Array.isArray(withClause.columns));
  const col = withClause.columns![0] as ColumnRef;
  assert.ok(col);
});

test('WITH clause without columns', () => {
  const sql = 'WITH cte AS (SELECT id, name FROM users) SELECT * FROM cte';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const withClause = ast.with![0] as With;
  assert.strictEqual('columns' in withClause, true, 'columns should be present');
  assert.strictEqual('name' in withClause, true, 'name should be present');
  assert.strictEqual('stmt' in withClause, true, 'stmt should be present');
});
