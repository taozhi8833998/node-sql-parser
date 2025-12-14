import { describe, test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import { isDesc } from './types.guard.ts';

const parser = new Parser();

describe('Desc Statement', () => {
  test('DESCRIBE statement', () => {
    const ast = parser.astify("DESCRIBE users");
    
    assert.ok(isDesc(ast), 'Should be Desc type');
    assert.strictEqual(ast.type, 'desc');
    assert.strictEqual(ast.table, 'users');
  });

  test('DESC statement (short form)', () => {
    const ast = parser.astify("DESC users");
    
    assert.ok(isDesc(ast), 'Should be Desc type');
    assert.strictEqual(ast.type, 'desc');
    assert.strictEqual(ast.table, 'users');
  });
});
