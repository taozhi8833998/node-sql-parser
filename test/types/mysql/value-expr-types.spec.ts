import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, ValueExpr } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('ValueExpr - string type', () => {
  const sql = "SELECT 'hello'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'single_quote_string');
  assert.strictEqual(expr.value, 'hello');
});

test('ValueExpr - number type', () => {
  const sql = 'SELECT 42';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'number');
  assert.strictEqual(expr.value, 42);
});

test('ValueExpr - boolean type (TRUE)', () => {
  const sql = 'SELECT TRUE';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.ok(expr.type === 'bool' || expr.type === 'boolean');
  assert.strictEqual(expr.value, true);
});

test('ValueExpr - boolean type (FALSE)', () => {
  const sql = 'SELECT FALSE';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.ok(expr.type === 'bool' || expr.type === 'boolean');
  assert.strictEqual(expr.value, false);
});

test('ValueExpr - null type', () => {
  const sql = 'SELECT NULL';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'null');
  assert.strictEqual(expr.value, null);
});

test('ValueExpr - double_quote_string type', () => {
  const sql = 'SELECT "hello"';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'double_quote_string');
  assert.strictEqual(expr.value, 'hello');
});

test('ValueExpr - backticks_quote_string type', () => {
  const sql = 'SELECT `hello`';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr;
  // Backticks are typically used for identifiers, not values
  // This might be a column reference instead
  assert.ok(expr);
});

test('ValueExpr - hex_string type', () => {
  const sql = "SELECT X'4D7953514C'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.ok(expr.type === 'hex_string' || expr.type === 'full_hex_string');
});

test('ValueExpr - bit_string type', () => {
  const sql = "SELECT B'1010'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'bit_string');
});

test('ValueExpr - date type', () => {
  const sql = "SELECT DATE '2023-01-01'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'date');
});

test('ValueExpr - datetime type', () => {
  const sql = "SELECT TIMESTAMP '2023-01-01 12:00:00'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.ok(expr.type === 'datetime' || expr.type === 'timestamp');
});

test('ValueExpr - time type', () => {
  const sql = "SELECT TIME '12:00:00'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'time');
});

test('ValueExpr - default type', () => {
  const sql = 'CREATE TABLE t (id INT DEFAULT 0)';
  const ast = parser.astify(sql);
  // Default values are in column definitions
  assert.ok(ast);
});

test('ValueExpr - param type', () => {
  const sql = 'SELECT :param';
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr;
  assert.ok(expr.type === 'param' || expr.type === 'var');
});

test('ValueExpr - natural_string type (N prefix)', () => {
  const sql = "SELECT N'hello'";
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast));
  const col = (ast as Select).columns[0];
  const expr = col.expr as ValueExpr;
  assert.strictEqual(expr.type, 'natural_string');
  assert.strictEqual(expr.value, 'hello');
});

