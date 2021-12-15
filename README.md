# Nodejs SQL Parser

[![Build Status](https://travis-ci.org/taozhi8833998/node-sql-parser.svg?branch=master)](https://travis-ci.org/taozhi8833998/node-sql-parser)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d923c9f2853f44f295c383d9943b56cc)](https://www.codacy.com/manual/taozhi8833998/node-sql-parser?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=taozhi8833998/node-sql-parser&amp;utm_campaign=Badge_Grade)
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
- support drop, truncate and rename command
- output the table and column list that the sql visited with the corresponding authority
- support various databases engine

## :tada: Install

### From [npmjs](https://www.npmjs.org/)

```bash
npm install node-sql-parser --save

or

yarn add node-sql-parser
```

### From [GitHub Package Registry](https://npm.pkg.github.com/)

```bash
npm install @taozhi8833998/node-sql-parser --registry=https://npm.pkg.github.com/
```

### From Browser

Import the JS file in your page:

```javascript
// support all database parser, but file size is about 750K
<script src="https://unpkg.com/node-sql-parser/umd/index.umd.js"></script>

// or you can import specified database parser only, it's about 150K

<script src="https://unpkg.com/node-sql-parser/umd/mysql.umd.js"></script>

<script src="https://unpkg.com/node-sql-parser/umd/postgresql.umd.js"></script>
```
- `NodeSQLParser` object is on `window`

```html
<!DOCTYPE html>
<html lang="en" >
  <head>
    <title>node-sql-parser</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <p><em>Check console to see the output</em></p>
    <script src="https://unpkg.com/node-sql-parser/umd/mysql.umd.js"></script>
    <script>
      window.onload = function () {
        // Example parser
        const parser = new NodeSQLParser.Parser()
        const ast = parser.astify("select id, name from students where age < 18")
        console.log(ast)
        const sql = parser.sqlify(ast)
        console.log(sql)
      }
    </script>
  </body>
</html>
```

## :rocket: Usage

### Supported Database SQL Syntax

- BigQuery
- DB2
- Hive
- MariaDB
- MySQL
- PostgresQL
- Sqlite(developing)
- TransactSQL
- [FlinkSQL](https://ci.apache.org/projects/flink/flink-docs-stable/dev/table/sql/)
- New issue could be made for other new database.

### Create AST for SQL statement

```javascript
// import Parser for all databases
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const ast = parser.astify('SELECT * FROM t'); // mysql sql grammer parsed by default

console.log(ast);
```

- `ast` for `SELECT * FROM t`

```json
{
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
```

### Convert AST back to SQL

```javascript
const opt = {
  database: 'MySQL' // MySQL is the default database
}
// import mysql parser only
const { Parser } = require('node-sql-parser/build/mysql');
const parser = new Parser()
// opt is optional
const ast = parser.astify('SELECT * FROM t', opt);
const sql = parse.sqlify(ast, opt);

console.log(sql); // SELECT * FROM `t`
```

### Get TableList, ColumnList, Ast by `parse` function

```javascript
const opt = {
  database: 'MariaDB' // MySQL is the default database
}
const { Parser } = require('node-sql-parser/build/mariadb');
const parser = new Parser()
// opt is optional
const { tableList, columnList, ast } = parser.parse('SELECT * FROM t', opt);
```

### Get the SQL visited tables

-  get the table list that the sql visited
-  the format is **{type}::{dbName}::{tableName}** // type could be select, update, delete or insert

```javascript
const opt = {
  database: 'MySQL'
}
const { Parser } = require('node-sql-parser/build/mysql');
const parser = new Parser();
// opt is optional
const tableList = parser.tableList('SELECT * FROM t', opt);

console.log(tableList); // ["select::null::t"]
```

### Get the SQL visited columns

- get the column list that the sql visited
- the format is **{type}::{tableName}::{columnName}** // type could be select, update, delete or insert
- for `select *`, `delete` and `insert into tableName values()` without specified columns, the `.*` column authority regex is required

```javascript
const opt = {
  database: 'MySQL'
}
const { Parser } = require('node-sql-parser/build/mysql');
const parser = new Parser();
// opt is optional
const columnList = parser.columnList('SELECT t.id FROM t', opt);

console.log(columnList); // ["select::t::id"]
```

### Check the SQL with Authority List

- check table authority
- `whiteListCheck` function check on `table` mode and `MySQL` database by default

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
const whiteTableList = ['(select|update)::(.*)::(a|b)'] // array that contain multiple authorities
const opt = {
  database: 'MySQL',
  type: 'table',
}
// opt is optional
parser.whiteListCheck(sql, whiteTableList, opt) // if check failed, an error would be thrown with relevant error message, if passed it would return undefined
```

- check column authority

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
const whiteColumnList = ['select::null::name', 'update::a::id'] // array that contain multiple authorities
const opt = {
  database: 'MySQL',
  type: 'column',
}
// opt is optional
parser.whiteListCheck(sql, whiteColumnList, opt) // if check failed, an error would be thrown with relevant error message, if passed it would return undefined
```

## :kissing_heart: Acknowledgement

This project is based on the SQL parser extracted from [flora-sql-parser](https://github.com/godmodelabs/flora-sql-parser) module.

## License

[GPLv2](LICENSE)

## Buy me a Coffee

If you like my project, **Star** in the corresponding project right corner. Your support is my biggest encouragement! ^_^

You can also scan the qr code below or open paypal link to donate to Author.

### Paypal

Donate money by [paypal](https://www.paypal.me/taozhi8833998/5) to my account [taozhi8833998@163.com](taozhi8833998@163.com)

### AliPay(支付宝)

<p align="center">
    <img src="https://github.com/taozhi8833998/node-sql-parser/blob/master/img/alipay.jpg" width="300" hight="300">
</p>


### Wechat(微信)

<p align="center">
    <img src="https://github.com/taozhi8833998/node-sql-parser/blob/master/img/wechat_pay.jpg" width="300" hight="300">
</p>

### Explain

If you have made a donation, you can leave your name and email in the issue, your name will be written to the donation list.


## [Donation list](https://github.com/taozhi8833998/node-sql-parser/blob/master/DONATIONLIST.md)
