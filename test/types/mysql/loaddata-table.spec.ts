import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { LoadData } from '../../types.d.ts';
import { isLoadData } from './types.guard.ts';

const parser = new Parser();

test('LOAD DATA table field structure', () => {
  const sql = "LOAD DATA INFILE '/tmp/data.csv' INTO TABLE users";
  const ast = parser.astify(sql);
  
  assert.ok(isLoadData(ast));
  const loadAst = ast as LoadData;
  
  // table should have db and table properties
  assert.ok('db' in loadAst.table);
  assert.ok('table' in loadAst.table);
  
  // table should NOT have as property (unlike From type)
  assert.strictEqual('as' in loadAst.table, false);
});
