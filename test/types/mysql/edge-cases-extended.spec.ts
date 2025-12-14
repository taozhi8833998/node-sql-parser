import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Insert_Replace, Drop, Create } from '../../types.d.ts';
import { isSelect, isInsert_Replace, isDrop, isCreate } from './types.guard.js';

const parser = new Parser();

test('LIMIT with OFFSET', () => {
  const sql = 'SELECT * FROM users LIMIT 10 OFFSET 20';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'Should be Select');
  const select = ast as Select;
  assert.ok(select.limit, 'Should have limit');
  assert.ok(Array.isArray(select.limit.value), 'Limit value should be array');
  assert.strictEqual(select.limit.value.length, 2, 'Should have 2 limit values');
  assert.strictEqual(select.limit.seperator, 'offset', 'Should have offset separator');
  assert.strictEqual(select.limit.value[0].value, 10, 'First value should be limit');
  assert.strictEqual(select.limit.value[1].value, 20, 'Second value should be offset');
});

test('LIMIT with comma syntax', () => {
  const sql = 'SELECT * FROM users LIMIT 20, 10';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'Should be Select');
  const select = ast as Select;
  assert.ok(select.limit, 'Should have limit');
  assert.strictEqual(select.limit.seperator, ',', 'Should have comma separator');
  assert.ok(Array.isArray(select.limit.value), 'Limit value should be array');
  assert.strictEqual(select.limit.value.length, 2, 'Should have 2 limit values');
});

test('CASE with multiple WHEN clauses', () => {
  const sql = 'SELECT CASE WHEN age < 13 THEN "child" WHEN age < 18 THEN "teen" WHEN age < 65 THEN "adult" ELSE "senior" END FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'Should be Select');
  const select = ast as Select;
  const col = select.columns[0];
  
  if (typeof col.expr === 'object' && col.expr !== null && 'type' in col.expr && col.expr.type === 'case') {
    assert.ok(Array.isArray(col.expr.args), 'Should have args array');
    assert.strictEqual(col.expr.args.length, 4, 'Should have 4 args (3 WHEN + 1 ELSE)');
    
    const whenClauses = col.expr.args.filter(arg => arg.type === 'when');
    assert.strictEqual(whenClauses.length, 3, 'Should have 3 WHEN clauses');
    
    const elseClause = col.expr.args.find(arg => arg.type === 'else');
    assert.ok(elseClause, 'Should have ELSE clause');
  }
});

test('DROP with IF EXISTS', () => {
  const sql = 'DROP TABLE IF EXISTS users';
  const ast = parser.astify(sql);
  
  assert.ok(isDrop(ast), 'Should be Drop');
  const drop = ast as Drop;
  assert.strictEqual(drop.prefix, 'if exists', 'Should have if exists prefix');
});

test('INSERT with IGNORE prefix', () => {
  const sql = 'INSERT IGNORE INTO users (name) VALUES ("John")';
  const ast = parser.astify(sql);
  
  assert.ok(isInsert_Replace(ast), 'Should be Insert_Replace');
  const insert = ast as Insert_Replace;
  assert.strictEqual(insert.prefix, 'ignore into', 'Should have ignore into prefix');
});

test('DataType with length and scale', () => {
  const sql = 'CREATE TABLE products (price DECIMAL(10, 2))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create', 'Should be Create type');
  assert.ok(createAst.create_definitions, 'Should have create_definitions');
  
  const colDef = createAst.create_definitions[0];
  if ('definition' in colDef) {
    const dataType = colDef.definition;
    assert.strictEqual(dataType.dataType, 'DECIMAL', 'Should be DECIMAL type');
    assert.strictEqual(dataType.length, 10, 'Should have length 10');
    assert.strictEqual(dataType.scale, 2, 'Should have scale 2');
  }
});

test('DataType with parentheses flag', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create', 'Should be Create type');
  assert.ok(createAst.create_definitions, 'Should have create_definitions');
  
  const colDef = createAst.create_definitions[0];
  if ('definition' in colDef) {
    const dataType = colDef.definition;
    assert.strictEqual(dataType.dataType, 'VARCHAR', 'Should be VARCHAR type');
    assert.strictEqual(dataType.length, 50, 'Should have length 50');
    assert.strictEqual(dataType.parentheses, true, 'Should have parentheses flag');
  }
});
