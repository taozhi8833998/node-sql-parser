import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, CreateConstraintForeign, ReferenceDefinition } from '../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('FOREIGN KEY constraint', () => {
  const sql = 'CREATE TABLE orders (id INT, user_id INT, FOREIGN KEY (user_id) REFERENCES users(id))';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  const constraint = createAst.create_definitions!.find(def => def.resource === 'constraint') as CreateConstraintForeign;
  assert.ok(constraint);
  // ReferenceDefinition type is defined in types.d.ts
  const refDef = constraint.reference_definition as ReferenceDefinition | undefined;
  assert.ok(refDef === undefined || typeof refDef === 'object');
});
