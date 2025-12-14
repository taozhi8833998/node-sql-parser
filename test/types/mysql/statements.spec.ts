import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Show, Explain, Call, Set, Lock, Unlock, Transaction, LockTable } from '../../types.d.ts';
import { isShow, isCall, isSet, isLock, isUnlock, isExplain, isTransaction } from './types.guard.ts';

const parser = new Parser();

test('SHOW statement', () => {
  const sql = 'SHOW TABLES';
  const ast = parser.astify(sql);
  
  assert.ok(isShow(ast), 'AST should be a Show type');
  const showAst = ast as Show;
  assert.strictEqual(showAst.type, 'show');
  assert.strictEqual(showAst.keyword, 'tables');
});

test('EXPLAIN statement', () => {
  const sql = 'EXPLAIN SELECT * FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isExplain(ast), 'AST should be an Explain type');
  const explainAst = ast as Explain;
  assert.strictEqual(explainAst.type, 'explain');
});

test('CALL statement', () => {
  const sql = 'CALL my_procedure()';
  const ast = parser.astify(sql);
  
  assert.ok(isCall(ast), 'AST should be a Call type');
  const callAst = ast as Call;
  assert.strictEqual(callAst.type, 'call');
  assert.strictEqual(callAst.expr.type, 'function');
});

test('SET statement', () => {
  const sql = 'SET @var = 1';
  const ast = parser.astify(sql);
  
  assert.ok(isSet(ast), 'AST should be a Set type');
  const setAst = ast as Set;
  assert.strictEqual(setAst.type, 'set');
  assert.ok(Array.isArray(setAst.expr));
});

test('LOCK TABLES statement', () => {
  const sql = 'LOCK TABLES users READ';
  const ast = parser.astify(sql);
  
  assert.ok(isLock(ast), 'AST should be a Lock type');
  const lockAst = ast as Lock;
  assert.strictEqual(lockAst.type, 'lock');
  assert.strictEqual(lockAst.keyword, 'tables');
  const lockTable = lockAst.tables[0] as LockTable;
  assert.ok(lockTable.table);
  assert.ok(lockTable.lock_type);
});

test('UNLOCK TABLES statement', () => {
  const sql = 'UNLOCK TABLES';
  const ast = parser.astify(sql);
  
  assert.ok(isUnlock(ast), 'AST should be an Unlock type');
  const unlockAst = ast as Unlock;
  assert.strictEqual(unlockAst.type, 'unlock');
  assert.strictEqual(unlockAst.keyword, 'tables');
});

test('Transaction statement', () => {
  const sql = 'START TRANSACTION';
  const ast = parser.astify(sql);
  
  assert.ok(isTransaction(ast), 'AST should be a Transaction type');
  const txAst = ast as Transaction;
  assert.strictEqual(txAst.type, 'transaction');
});
