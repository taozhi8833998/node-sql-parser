import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateColumnDefinition } from '../../types.d.ts';
import { isCreate, isCreateColumnDefinition } from './types.guard.js';

const parser = new Parser();

test('DataType with UNSIGNED suffix', () => {
  const sql = 'CREATE TABLE users (age INT UNSIGNED)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create', 'Should be Create type');
  assert.ok(createAst.create_definitions, 'Should have create_definitions');
  
  const colDef = createAst.create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  const dataType = colDef.definition;
  assert.strictEqual(dataType.dataType, 'INT', 'Should be INT type');
  assert.ok(Array.isArray(dataType.suffix), 'Suffix should be array');
  assert.ok(dataType.suffix.includes('UNSIGNED'), 'Should include UNSIGNED');
});

test('DataType with UNSIGNED ZEROFILL suffix', () => {
  const sql = 'CREATE TABLE users (age INT UNSIGNED ZEROFILL)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create', 'Should be Create type');
  assert.ok(createAst.create_definitions, 'Should have create_definitions');
  
  const colDef = createAst.create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  const dataType = colDef.definition;
  assert.strictEqual(dataType.dataType, 'INT', 'Should be INT type');
  assert.ok(Array.isArray(dataType.suffix), 'Suffix should be array');
  assert.ok(dataType.suffix.includes('UNSIGNED'), 'Should include UNSIGNED');
  assert.ok(dataType.suffix.includes('ZEROFILL'), 'Should include ZEROFILL');
});

test('DataType with ON UPDATE in reference_definition', () => {
  const sql = 'CREATE TABLE users (updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create', 'Should be Create type');
  assert.ok(createAst.create_definitions, 'Should have create_definitions');
  
  const colDef = createAst.create_definitions[0] as CreateColumnDefinition;
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  const dataType = colDef.definition;
  assert.strictEqual(dataType.dataType, 'TIMESTAMP', 'Should be TIMESTAMP type');
  
  // ON UPDATE CURRENT_TIMESTAMP is stored in reference_definition.on_action, not in DataType.suffix
  if ('reference_definition' in colDef && colDef.reference_definition) {
    const refDef = colDef.reference_definition as any;
    assert.ok(refDef.on_action, 'Should have on_action');
    assert.ok(Array.isArray(refDef.on_action), 'on_action should be array');
    const onUpdate = refDef.on_action[0];
    assert.strictEqual(onUpdate.type, 'on update', 'Should be on update type');
  }
});
