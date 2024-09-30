# API Documentation

###  Parser
Parser is the core class of node-sql-parser.

- what state will this class possess?
- how many method you can use?

Most class returns some representative type of object: AST, expr, ...
If you need to manupilate the content of them, you can access directory as object or array to extract or insert/update/delete you need.


#### new Parser()

- You requires no parmeter to provide to instatitiate this class.
- the instances never possess any state. therefore you can use it as just set of methods and convert multiple query in one object.

```
parser = new Parser()
```

#### astify(sql:string, opt:): AST
Receives SQL as plain text and returns AST.
You can also provide optional parameter as OPT.


#### sqlify(ast:): string
Its works inversely in astfy. so this methods


#### exprToSQL


#### parse
-- TBD: check if it's published for user


#### whiteListCheck
-- TBD: check if it's published for user

#### tableList
-- TBD: check if it's published for user

#### columnList
-- TBD: check if it's published for user

### Util
util is a set of utility methods you can call it functianally, it all offers functonal.


#### arrayStructTypeToSQL
-- TBD: check if the auther intended to published it for user

#### autoIncrementToSQL
-- TBD: check if the auther intended to published it for user


#### columnOrderListToSQL
-- TBD: check if the auther intended to published it for user


#### commonKeywordArgsToSQL
-- TBD: check if the auther intended to published it for user


#### commonOptionConnector,
-- TBD: check if the auther intended to published it for user


#### commonTypeValue
-- TBD: check if the auther intended to published it for user


#### commentToSQL
-- TBD: check if the auther intended to published it for user


#### createBinaryExpr,
-- TBD: check if the auther intended to published it for user


#### createValueExpr
-- TBD: check if the auther intended to published it for user


#### dataTypeToSQL
-- TBD: check if the auther intended to published it for user


#### DEFAULT_OPT
-- TBD: check if the auther intended to published it for user


#### escape
-- TBD: check if the auther intended to published it for user


#### literalToSQL
-- TBD: check if it's published for user

#### columnIdentifierToSql,
-- TBD: check if it's published for user

#### getParserOpt
-- TBD: check if it's published for user

#### identifierToSql
-- TBD: check if it's published for user

#### onPartitionsToSQL
-- TBD: check if it's published for user

#### replaceParams
-- TBD: check if it's published for user

#### returningToSQL,
-- TBD: check if it's published for user

#### hasVal
-- TBD: check if it's published for user

#### setParserOpt
-- TBD: check if it's published for user

#### toUpper
-- TBD: check if it's published for user

#### topToSQL
-- TBD: check if it's published for user

#### triggerEventToSQL,
-- TBD: check if it's published for user


## Type Documentation

### AST

In this library, type AST(abstruct syntax tree)  corresponds

### expr

### OPTION


