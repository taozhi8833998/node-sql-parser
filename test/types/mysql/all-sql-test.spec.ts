import { test } from 'node:test';
import assert from 'node:assert';
import { assertType } from './assert-type';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Parser } from './parser-loader.mjs';
import {
  isSelect, isInsert_Replace, isUpdate, isDelete, isCreate, isDrop, isAlter, isTruncate,
  isRename, isGrant, isDesc, isShow, isUse, isSet, isLock, isUnlock, isCall, isLoadData, isExplain
} from './types.guard';

const parser = new Parser();

function astify(sql: string) {
  try {
    return parser.astify(sql);
  } catch (e) {
    console.log("astify failed:", sql, e);
  }
  assert.ok(false, sql);
}

function readSqlFile(filename: string): string[] {
  const content = readFileSync(join(__dirname, filename), 'utf8');
  const statements = content.split(';\n').filter(s => s.trim().length > 0);

  const bad_list = [];
  for(const sql of statements) {
    try {
      parser.astify(sql);
    } catch (e) {
      bad_list.push(sql);
    }
  }
  if (bad_list.length > 0) {
    for( const sql of bad_list) {
      console.log("parse failed:", sql);
    }
    assert.ok(false, `${bad_list.length} statements failed to parse`);
  }
  return statements;
}

test('alter.sql statements', () => {
  const statements = readSqlFile('alter.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isAlter, ast, `isAlter: ${sql}`);
  }
});

test('call.sql statements', () => {
  const statements = readSqlFile('call.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isCall, ast, `isCall: ${sql}`);
  }
});

test('create.sql statements', () => {
  const statements = readSqlFile('create.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    const checkAst = Array.isArray(ast) ? ast[0] : ast;
    assertType(isCreate, checkAst, `isCreate: ${sql}`);
  }
});

test('delete.sql statements', () => {
  const statements = readSqlFile('delete.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isDelete, ast, `isDelete: ${sql}`);
  }
});

test('desc.sql statements', () => {
  const statements = readSqlFile('desc.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isDesc, ast, `isDesc: ${sql}`);
  }
});

test('drop.sql statements', () => {
  const statements = readSqlFile('drop.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isDrop, ast, `isDrop: ${sql}`);
  }
});

test('explain.sql statements', () => {
  const statements = readSqlFile('explain.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isExplain, ast, `isExplain: ${sql}`);
  }
});

test('grant.sql statements', () => {
  const statements = readSqlFile('grant.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isGrant, ast, `isGrant: ${sql}`);
  }
});

test('insert.sql statements', () => {
  const statements = readSqlFile('insert.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isInsert_Replace, ast, `isInsert_Replace: ${sql}`);
  }
});

test('load.sql statements', () => {
  const statements = readSqlFile('load.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isLoadData, ast, `isLoadData: ${sql}`);
  }
});

test('lock.sql statements', () => {
  const statements = readSqlFile('lock.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isLock, ast, `isLock: ${sql}`);
  }
});

test('rename.sql statements', () => {
  const statements = readSqlFile('rename.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isRename, ast, `isRename: ${sql}`);
  }
});

test('replace.sql statements', () => {
  const statements = readSqlFile('replace.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isInsert_Replace, ast, `isInsert_Replace: ${sql}`);
  }
});

test('select.sql statements', () => {
  const statements = readSqlFile('select.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isSelect, ast, `isSelect: ${sql}`);
  }
});

test('set.sql statements', () => {
  const statements = readSqlFile('set.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isSet, ast, `isSet: ${sql}`);
  }
});

test('show.sql statements', () => {
  const statements = readSqlFile('show.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isShow, ast, `isShow: ${sql}`);
  }
});

test('truncate.sql statements', () => {
  const statements = readSqlFile('truncate.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isTruncate, ast, `isTruncate: ${sql}`);
  }
});

test('unlock.sql statements', () => {
  const statements = readSqlFile('unlock.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isUnlock, ast, `isUnlock: ${sql}`);
  }
});

test('update.sql statements', () => {
  const statements = readSqlFile('update.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isUpdate, ast, `isUpdate: ${sql}`);
  }
});

test('use.sql statements', () => {
  const statements = readSqlFile('use.sql');
  for (const sql of statements) {
    const ast = astify(sql);
    assertType(isUse, ast, `isUse: ${sql}`);
  }
});
