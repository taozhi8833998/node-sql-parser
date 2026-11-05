import { test } from 'node:test';
import { assertType } from './assert-type';
import { Parser } from './parser-loader.mjs';
import { isCreate, isCreateColumnDefinition } from './types.guard.ts';

const parser = new Parser();

test('DataType.dataType - string value', () => {
  const ast = parser.astify('CREATE TABLE users (id INT)');
  assertType(isCreate, ast);
  assertType(isCreateColumnDefinition, ast.create_definitions[0]);
});

test('DataType.dataType - various types', () => {
  const types = [
    'INT', 'VARCHAR', 'CHAR', 'TEXT', 'DECIMAL', 'FLOAT', 'DOUBLE',
    'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR', 'BOOLEAN',
    'BLOB', 'JSON', 'ENUM', 'SET', 'BINARY', 'VARBINARY'
  ];
  
  for (const type of types) {
    let sql = `CREATE TABLE t (col ${type}`;
    if (type === 'VARCHAR' || type === 'CHAR' || type === 'VARBINARY' || type === 'BINARY') {
      sql += '(10)';
    } else if (type === 'ENUM' || type === 'SET') {
      sql += "('a', 'b')";
    }
    sql += ')';
    
    const ast = parser.astify(sql);
    assertType(isCreate, ast);
    assertType(isCreateColumnDefinition, ast.create_definitions[0]);
  }
});

test('DataType.suffix - empty array or null when not present', () => {
  const ast1 = parser.astify('CREATE TABLE users (id INT)');
  assertType(isCreate, ast1);
  
  const ast2 = parser.astify('CREATE TABLE users (name VARCHAR(255))');
  assertType(isCreate, ast2);
});
