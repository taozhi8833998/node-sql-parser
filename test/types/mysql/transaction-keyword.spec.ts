import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Transaction } from '../../types.d.ts';
import { isTransaction } from './types.guard.ts';

const parser = new Parser();

test('START TRANSACTION has keyword property', () => {
  const sql = 'START TRANSACTION';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast));
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.expr.keyword, 'TRANSACTION');
});

test('COMMIT does not have keyword property', () => {
  const sql = 'COMMIT';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast));
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.expr.keyword, undefined);
});

test('Transaction with modes', () => {
  const sql = 'START TRANSACTION READ ONLY';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast), 'Should be a transaction');
  const txAst = ast as Transaction;
  
  // Check if modes exists and is an array
  if (txAst.expr.modes) {
    assert.ok(Array.isArray(txAst.expr.modes), 'modes should be an array');
    assert.strictEqual(txAst.expr.modes.length, 1, 'modes should have 1 element');
  } else {
    assert.fail('modes should not be null or undefined');
  }
});
