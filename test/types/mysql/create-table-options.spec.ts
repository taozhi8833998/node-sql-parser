import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Create, TableOption } from '../../types.d.ts';
import { isCreate } from './types.guard.ts';

const parser = new Parser();

test('CREATE TABLE with table options', () => {
  const sql = 'CREATE TABLE users (id INT) ENGINE=InnoDB DEFAULT CHARSET=utf8';
  const ast = parser.astify(sql);
  
  assert.ok(isCreate(ast), 'AST should be a Create type');
  const createAst = ast as Create;
  assert.strictEqual(createAst.type, 'create');
  assert.ok(Array.isArray(createAst.table_options));
  const option = createAst.table_options![0] as TableOption;
  assert.ok(option.keyword);
  assert.ok(option.value);
});
