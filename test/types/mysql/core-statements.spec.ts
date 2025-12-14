import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Use, Explain, Transaction, Select } from '../../types.d.ts';
import { isUse, isExplain, isTransaction, isSelect } from './types.guard.ts';

const parser = new Parser();

test('USE statement', () => {
  const sql = 'USE mydb';
  const ast = parser.astify(sql);
  
  assert.ok(isUse(ast), 'AST should be a Use type');
  const useAst = ast as Use;
  assert.strictEqual(useAst.type, 'use');
  assert.strictEqual(useAst.db, 'mydb');
});

test('EXPLAIN statement', () => {
  const sql = 'EXPLAIN SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isExplain(ast), 'AST should be an Explain type');
  const explainAst = ast as Explain;
  assert.strictEqual(explainAst.type, 'explain');
  assert.ok(explainAst.expr);
  assert.ok(isSelect(explainAst.expr), 'Expr should be a Select type');
});

test('Transaction START', () => {
  const sql = 'START TRANSACTION';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast), 'AST should be a Transaction type');
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.type, 'transaction');
  assert.strictEqual(txAst.expr.action.value, 'start');
  assert.strictEqual(txAst.expr.keyword, 'TRANSACTION');
});

test('Transaction COMMIT', () => {
  const sql = 'COMMIT';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast), 'AST should be a Transaction type');
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.type, 'transaction');
  assert.strictEqual(txAst.expr.action.value, 'COMMIT');
});

test('Transaction ROLLBACK', () => {
  const sql = 'ROLLBACK';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast), 'AST should be a Transaction type');
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.type, 'transaction');
  assert.strictEqual(txAst.expr.action.value, 'ROLLBACK');
});
