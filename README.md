# Nodejs SQL Parser

[![Build Status](https://travis-ci.org/taozhi8833998/node-sql-parser.svg?branch=master)](https://travis-ci.org/taozhi8833998/node-sql-parser)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/dff0b2ee1b964d2d88fe6947c4f5c649)](https://app.codacy.com/app/taozhi8833998/node-sql-parser?utm_source=github.com&utm_medium=referral&utm_content=taozhi8833998/node-sql-parser&utm_campaign=Badge_Grade_Dashboard)
[![Coverage Status](https://img.shields.io/coveralls/github/taozhi8833998/node-sql-parser/master.svg)](https://coveralls.io/github/taozhi8833998/node-sql-parser?branch=master)
[![Dependencies](https://img.shields.io/david/taozhi8833998/node-sql-parser.svg)](https://img.shields.io/david/taozhi8833998/node-sql-parser)
[![Known Vulnerabilities](https://snyk.io/test/github/taozhi8833998/node-sql-parser/badge.svg?targetFile=package.json)](https://snyk.io/test/github/taozhi8833998/node-sql-parser?targetFile=package.json)
[![](https://img.shields.io/badge/Powered%20by-ganjiang-brightgreen.svg)](https://github.com/taozhi8833998/node-sql-parser)

[![npm version](https://badge.fury.io/js/node-sql-parser.svg)](https://badge.fury.io/js/node-sql-parser)
[![NPM downloads](http://img.shields.io/npm/dm/node-sql-parser.svg?style=flat-square)](http://www.npmtrends.com/node-sql-parser)

[![](https://img.shields.io/gitter/room/taozhi8833998/node-sql-parser.svg)](https://gitter.im/node-sql-parser/community)
[![issues](https://img.shields.io/github/issues/taozhi8833998/node-sql-parser.svg)](https://github.com/taozhi8833998/node-sql-parser/issues)

[![TypeScript definitions on DefinitelyTyped](http://definitelytyped.org/badges/standard.svg)](http://definitelytyped.org)
[![license](https://img.shields.io/badge/license-GPLv2-blue.svg)](https://github.com/taozhi8833998/node-sql-parser/blob/master/LICENSE)

**Parse simple SQL statements into an abstract syntax tree (AST) with the visited tableList, columnList and convert it back to SQL.**

## :star: Features

- support multiple sql statement seperate by semicolon
- support select, delete, update and insert type
- output the table and column list that the sql visited with the corresponding authority
- support typescript

## :tada: Install

```bash
npm install node-sql-parser --save

or

yarn add node-sql-parser
```

**Install the following type module for typescript usage**

```bash
npm install @types/node-sql-parser --save-dev

or

yarn add @types/node-sql-parser --dev
```

## :rocket: Usage

### Create AST for SQL statement

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const ast = parser.astify('SELECT * FROM t');

console.log(ast);
```

- `ast` for `SELECT * FROM t`

```json
{
  "tableList": [
    "select::null::t"
  ],
  "columnList": [
    "select::null::(.*)"
  ],
  "ast": {
    "with": null,
    "type": "select",
    "options": null,
    "distinct": null,
    "columns": "*",
    "from": [
      {
        "db": null,
        "table": "t",
        "as": null
      }
    ],
    "where": null,
    "groupby": null,
    "having": null,
    "orderby": null,
    "limit": null
  }
}
```

### Convert AST back to SQL

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser()
const ast = parser.astify('SELECT * FROM t');
const sql = parse.sqlify(ast);

console.log(sql); // SELECT * FROM `t`
```

### TableList, ColumnList, Ast

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser()
const { tableList, columnList, ast } = parser.parse('SELECT * FROM t');
```

### Get the SQL visited tables

-  get the table list that the sql visited
-  the format is **{type}::{dbName}::{tableName}** // type could be select, update, delete or insert

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const tableList = parser.tableList('SELECT * FROM t');

console.log(tableList); // ["select::null::t"]
```

### Get the SQL visited columns

- get the column list that the sql visited
- the format is **{type}::{tableName}::{columnName}** // type could be select, update, delete or insert
- for `select *`, `delete` and `insert into tableName values()` without specified columns, the `.*` column authority regex is required

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const columnList = parser.columnList('SELECT t.id FROM t');

console.log(columnList); // ["select::t::id"]
```

### Check the SQL with Authority List

- check table authority
- `whiteListCheck` function check on `table` mode by default

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
const whiteTableList = ['(select|update)::(.*)::(a|b)'] // array that contain multiple authorities
parser.whiteListCheck(sql, whiteTableList, 'table') // if check failed, an error would be thrown with relevant error message, if passed it would return undefined
```

- check column authority

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
const whiteColumnList = ['select::null::name', 'update::a::id'] // array that contain multiple authorities
parser.whiteListCheck(sql, whiteColumnList, 'column') // if check failed, an error would be thrown with relevant error message, if passed it would return undefined
```

## :kissing_heart: Acknowledgement

This project is based on the SQL parser extracted from [flora-sql-parser](https://github.com/godmodelabs/flora-sql-parser) module.

## License

[GPLv2](LICENSE)
