import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select, Create, CreateColumnDefinition, CreateConstraintPrimary } from '../../types.d.ts';
import { isSelect, isCreate, isCreateColumnDefinition, isCreateConstraintPrimary } from './types.guard.js';

const parser = new Parser();

test('ColumnRefExpr with AS alias', () => {
  const sql = 'SELECT (id) AS user_id FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'Should be Select');
  const select = ast as Select;
  assert.ok(Array.isArray(select.columns), 'Should have columns array');
  
  const col = select.columns[0];
  assert.strictEqual(col.as, 'user_id', 'Should have alias');
  
  // Check if expr is ColumnRef
  if (typeof col.expr === 'object' && col.expr !== null && 'type' in col.expr) {
    if (col.expr.type === 'expr') {
      // This is ColumnRefExpr
      assert.strictEqual(col.expr.type, 'expr', 'Should be expr type');
      assert.ok('expr' in col.expr, 'Should have expr property');
    }
  }
});

test('CollateExpr in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) COLLATE utf8_general_ci)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const colDef = ast.create_definitions[0];
  assert.strictEqual(colDef.resource, 'column', 'Should be column resource');
  
  if ('collate' in colDef && colDef.collate) {
    assert.strictEqual(colDef.collate.type, 'collate', 'Should have collate type');
    assert.strictEqual(colDef.collate.keyword, 'collate', 'Should have collate keyword');
    if (colDef.collate.collate) {
      assert.strictEqual(colDef.collate.collate.name, 'utf8_general_ci', 'Should have collate name');
    }
  }
});

test('KeywordComment in column definition', () => {
  const sql = "CREATE TABLE users (id INT COMMENT 'User ID')";
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const colDef = ast.create_definitions[0];
  assert.strictEqual(colDef.resource, 'column', 'Should be column resource');
  
  if ('comment' in colDef && colDef.comment) {
    assert.strictEqual(colDef.comment.type, 'comment', 'Should have comment type');
    assert.strictEqual(colDef.comment.keyword, 'comment', 'Should have comment keyword');
    if (typeof colDef.comment.value === 'object' && 'value' in colDef.comment.value) {
      assert.strictEqual(colDef.comment.value.value, 'User ID', 'Should have comment value');
    }
  }
});

test('IndexType in CREATE INDEX', () => {
  const sql = 'CREATE INDEX idx_name ON users (name) USING BTREE';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  
  if (ast.index_using) {
    assert.strictEqual(ast.index_using.keyword, 'using', 'Should have using keyword');
    assert.strictEqual(ast.index_using.type, 'btree', 'Should have btree type');
  }
});

test('IndexOption in CREATE INDEX', () => {
  const sql = 'CREATE INDEX idx_name ON users (name) KEY_BLOCK_SIZE = 8';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  
  if (ast.index_options && ast.index_options.length > 0) {
    const option = ast.index_options[0];
    assert.strictEqual(option.type, 'key_block_size', 'Should have key_block_size type');
    assert.strictEqual(option.symbol, '=', 'Should have = symbol');
    assert.ok('expr' in option, 'Should have expr property');
  }
});

test('ConstraintName in PRIMARY KEY', () => {
  const sql = 'CREATE TABLE users (id INT, CONSTRAINT pk_users PRIMARY KEY (id))';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const constraint = ast.create_definitions.find(def => 
    'constraint_type' in def && def.constraint_type === 'primary key'
  );
  
  assert.ok(constraint, 'Should have primary key constraint');
  assert.ok(isCreateConstraintPrimary(constraint), 'Should be CreateConstraintPrimary');
  
  if ('constraint' in constraint && constraint.constraint) {
    assert.strictEqual(constraint.constraint, 'pk_users', 'Should have constraint name');
  }
  if ('keyword' in constraint && constraint.keyword) {
    assert.strictEqual(constraint.keyword, 'constraint', 'Should have constraint keyword');
  }
});

test('OnReference in FOREIGN KEY', () => {
  const sql = 'CREATE TABLE orders (user_id INT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE RESTRICT)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const constraint = ast.create_definitions.find(def => 
    'constraint_type' in def && (def.constraint_type === 'foreign key' || def.constraint_type === 'FOREIGN KEY')
  );
  
  assert.ok(constraint, 'Should have foreign key constraint');
  
  if ('reference_definition' in constraint && constraint.reference_definition) {
    const refDef = constraint.reference_definition;
    assert.ok(refDef.on_action, 'Should have on_action');
    assert.ok(Array.isArray(refDef.on_action), 'on_action should be array');
    
    if (refDef.on_action.length > 0) {
      const onDelete = refDef.on_action.find(action => action.keyword === 'on delete');
      if (onDelete) {
        assert.strictEqual(onDelete.type, 'on_reference', 'Should have on_reference type');
        assert.strictEqual(onDelete.keyword, 'on delete', 'Should have on delete keyword');
        assert.strictEqual(onDelete.value, 'cascade', 'Should have cascade value');
      }
      
      const onUpdate = refDef.on_action.find(action => action.keyword === 'on update');
      if (onUpdate) {
        assert.strictEqual(onUpdate.type, 'on_reference', 'Should have on_reference type');
        assert.strictEqual(onUpdate.keyword, 'on update', 'Should have on update keyword');
        assert.strictEqual(onUpdate.value, 'restrict', 'Should have restrict value');
      }
    }
  }
});

test('LiteralNull in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const colDef = ast.create_definitions[0];
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  if ('nullable' in colDef && colDef.nullable) {
    assert.strictEqual(colDef.nullable.type, 'null', 'Should have null type');
    assert.strictEqual(colDef.nullable.value, 'null', 'Should have null value');
  }
});

test('LiteralNotNull in column definition', () => {
  const sql = 'CREATE TABLE users (name VARCHAR(50) NOT NULL)';
  const ast = parser.astify(sql);
  assert.ok(isCreate(ast), 'Should be Create');
  
  assert.strictEqual(ast.type, 'create', 'Should be Create type');
  assert.ok(ast.create_definitions, 'Should have create_definitions');
  
  const colDef = ast.create_definitions[0];
  assert.ok(isCreateColumnDefinition(colDef), 'Should be CreateColumnDefinition');
  
  if ('nullable' in colDef && colDef.nullable) {
    assert.strictEqual(colDef.nullable.type, 'not null', 'Should have not null type');
    assert.strictEqual(colDef.nullable.value, 'not null', 'Should have not null value');
  }
});

test('FunctionName with schema', () => {
  const sql = 'SELECT mydb.myfunc(id) FROM users';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'Should be Select');
  const select = ast as Select;
  assert.ok(Array.isArray(select.columns), 'Should have columns array');
  
  const col = select.columns[0];
  if (typeof col.expr === 'object' && col.expr !== null && 'type' in col.expr && col.expr.type === 'function') {
    const func = col.expr;
    assert.ok('name' in func, 'Should have name property');
    
    if (typeof func.name === 'object' && 'name' in func.name) {
      // FunctionName type
      if ('schema' in func.name && func.name.schema) {
        assert.ok('value' in func.name.schema, 'Schema should have value');
        assert.ok('type' in func.name.schema, 'Schema should have type');
      }
    }
  }
});
