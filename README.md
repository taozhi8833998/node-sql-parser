# GanJiang SQL Parser

[![](https://img.shields.io/badge/Powered%20by-ganjiang-brightgreen.svg)](https://github.com/taozhi8833998/node-sql-parser)
[![Build Status](https://travis-ci.org/taozhi8833998/node-sql-parser.svg?branch=master)](https://travis-ci.org/taozhi8833998/node-sql-parser)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/taozhi8833998/node-sql-parser/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/node-sql-parser.svg)](https://badge.fury.io/js/node-sql-parser)
[![NPM downloads](http://img.shields.io/npm/dm/node-sql-parser.svg?style=flat-square)](http://www.npmtrends.com/node-sql-parser)
[![Coverage Status](https://img.shields.io/coveralls/github/taozhi8833998/node-sql-parser/master.svg)](https://coveralls.io/github/taozhi8833998/node-sql-parser?branch=master)
[![Dependencies](https://img.shields.io/david/taozhi8833998/node-sql-parser.svg)](https://img.shields.io/david/taozhi8833998/node-sql-parser)
[![issues](https://img.shields.io/github/issues/taozhi8833998/node-sql-parser.svg)](https://github.com/taozhi8833998/node-sql-parser/issues)


**Parse simple SQL statements into an abstract syntax tree (AST) with the visited tableList and convert it back to SQL.**

## :star: Features

- support multiple sql statement seperate by semicolon
- support select, delete, update and insert type
- output the table list that the sql visited with the corresponding authority

## :rocket: Usage

### Create AST for SQL statement

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const ast = parser.sqlToAst('SELECT * FROM t');

console.log(ast);
```

### Get the SQL visited tables

- get the table list that the sql visited
- the format is **{type}::{dbName}::{tableName}** // type could be select, update, delete or insert

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const tableList = parser.tableList('SELECT * FROM t');

console.log(tableList); // ["select::null::t"]
```

### Check the SQL with Authority List

```javascript
const { Parser } = require('node-sql-parser');
const parser = new Parser();
const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
const whiteList = ['(select|update)::(.*)::(a|b)'] // array that contain multiple authorities
parser.whiteListCheck(sql, whiteList) // if check failed, an error would be thrown with relevant error message, if passed it would return undefined
```

### Convert AST back to SQL

- **Only SELECT SQL statements are supported for converting ast back to sql currently**

```javascript
const { Parser, util } = require('node-sql-parser');
const parser = new Parser()
const ast = parser.sqlToAst('SELECT * FROM t');
const sql = util.astToSQL(ast);

console.log(sql); // SELECT * FROM `t`
```


## :kissing_heart: Acknowledgement

This project is based on the SQL parser extracted from [flora-sql-parser](https://github.com/godmodelabs/flora-sql-parser) module.

## License

[MIT](LICENSE)
