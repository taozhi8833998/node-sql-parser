# TypeScript Type Tests

This directory contains TypeScript tests that verify the type definitions in `types.d.ts` match the actual runtime behavior of the SQL parser.

## Type Guards

Type guards are automatically generated using `ts-auto-guard` and stored in `types.guard.ts`.

### Generating Guards

To regenerate the type guards after modifying `types.d.ts`:

```bash
npm run generate-guards
```

This will:
1. Run `ts-auto-guard` on `types.d.ts`
2. Move the generated `types.guard.ts` file to `test/types/`

### Using Guards in Tests

Import the guards you need from `types.guard.ts`:

```typescript
import { isSelect, isUpdate, isDelete } from './types.guard.ts';

test('example', () => {
  const ast = parser.astify(sql);
  assert.ok(isSelect(ast), 'AST should be a Select type');
  // Now safely use ast as Select
});
```

### Available Guards

All exported types from `types.d.ts` have corresponding guard functions with the naming pattern `is{TypeName}`.

Examples:
- `isSelect(obj)` - checks if obj is a Select type
- `isUpdate(obj)` - checks if obj is an Update type
- `isDelete(obj)` - checks if obj is a Delete type
- `isInsert_Replace(obj)` - checks if obj is an Insert_Replace type
- `isBinary(obj)` - checks if obj is a Binary type
- `isColumnRef(obj)` - checks if obj is a ColumnRef type

## Running the Tests

```bash
npx tsx --test test/types/*.spec.ts
```

Or use the shorthand:

```bash
tsx --test test/types/**.spec.ts
```

## Test Files

- `select.spec.ts` - Tests for SELECT statement types
- `insert.spec.ts` - Tests for INSERT statement types
- `update.spec.ts` - Tests for UPDATE statement types
- `delete.spec.ts` - Tests for DELETE statement types
- `expressions.spec.ts` - Tests for expression types (functions, aggregates, CASE, CAST)
- `joins.spec.ts` - Tests for JOIN types

## How It Works

The tests use a parser loader (`parser-loader.mjs`) that:
1. Loads the compiled MySQL parser from `build/mysql.js`
2. Wraps it in a simple Parser class
3. Extracts the AST from the parser result

Each test:
1. Provides a SQL string
2. Parses it using the parser
3. Uses type guards to verify the AST type at runtime
4. Verifies the resulting AST matches the TypeScript type definitions

## Adding New Tests

To add new tests:

1. Create a new `.spec.ts` file in this directory
2. Import the Parser from `./parser-loader.mjs`
3. Import the relevant types from `../../types.d.ts`
4. Import the relevant guards from `./types.guard.ts`
5. Write tests using Node.js test runner (`node:test`)
6. Use type guards to verify types at runtime

Example:

```typescript
import { test } from 'node:test';
import assert from 'node:assert';
import { Parser } from './parser-loader.mjs';
import type { Select } from '../../types.d.ts';
import { isSelect } from './types.guard.ts';

const parser = new Parser();

test('My SQL test', () => {
  const sql = 'SELECT 1';
  const ast = parser.astify(sql);
  
  assert.ok(isSelect(ast), 'AST should be a Select type');
  const selectAst = ast as Select;
  assert.strictEqual(selectAst.type, 'select');
  // Add more assertions...
});
```
