const { expect } = require('chai')
const Parser = require('../src/parser').default
const { arrayStructValueToSQL } = require('../src/array-struct')
const { arrayStructTypeToSQL } = require('../src/util')

describe('BigQuery', () => {
  const parser = new Parser();
  const opt = {
    database: 'bigquery'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: 'select *',
      sql: [
        'SELECT * FROM (SELECT "apple" AS fruit, "carrot" AS vegetable);',
        "SELECT * FROM (SELECT 'apple' AS fruit, 'carrot' AS vegetable)"
      ]
    },
    {
      title: 'select expression.*',
      sql: [
        `WITH groceries AS
        (SELECT "milk" AS dairy,
          "eggs" AS protein,
          "bread" AS grain)
        SELECT g.*
        FROM groceries AS g;`,
        "WITH groceries AS (SELECT 'milk' AS dairy, 'eggs' AS protein, 'bread' AS grain) SELECT g.* FROM groceries AS g"
      ]
    },
    {
      title: 'select expression.* with struct',
      sql: [
        `WITH locations AS
        (SELECT STRUCT("Seattle" AS city, "Washington" AS state) AS location
        UNION ALL
        SELECT STRUCT("Phoenix" AS city, "Arizona" AS state) AS location)
      SELECT l.*
      FROM locations l;`,
        "WITH locations AS (SELECT STRUCT('Seattle' AS city, 'Washington' AS state) AS location UNION ALL SELECT STRUCT('Phoenix' AS city, 'Arizona' AS state) AS location) SELECT l.* FROM locations AS l"
      ]
    },
    {
      title: 'select expression.* with array struct',
      sql: [
        `WITH locations AS
        (SELECT ARRAY<STRUCT<city STRING, state STRING>>[("Seattle", "Washington"),
          ("Phoenix", "Arizona")] AS location)
      SELECT l.*
      FROM locations l;`,
        "WITH locations AS (SELECT ARRAY<STRUCT<city STRING, state STRING>>[('Seattle', 'Washington'), ('Phoenix', 'Arizona')] AS location) SELECT l.* FROM locations AS l"
      ]
    },
    {
      title: 'select * expect',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * EXCEPT (order_id)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * EXCEPT (order_id) FROM orders"
      ]
    },
    {
      title: 'select * replace',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * REPLACE ("widget" AS item_name)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * REPLACE ('widget' AS item_name) FROM orders"
      ]
    },
    {
      title: 'select * replace calculate',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * REPLACE (quantity/2 AS quantity)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * REPLACE (quantity / 2 AS quantity) FROM orders"
      ]
    },
    {
      title: 'select as struct',
      sql: [
        'SELECT AS STRUCT 1 x, 2, 3 xx',
        'SELECT AS STRUCT 1 AS x, 2, 3 AS xx'
      ]
    },
    {
      title: 'select as value',
      sql: [
        'SELECT AS VALUE STRUCT(1 AS x, 2, 3 AS x)',
        'SELECT AS VALUE STRUCT(1 AS x, 2, 3 AS x)'
      ]
    },
    {
      title: 'select as value from',
      sql: [
        'SELECT AS VALUE STRUCT(1 a, 2 b) xyz FROM ttt',
        'SELECT AS VALUE STRUCT(1 AS a, 2 AS b) AS xyz FROM ttt'
      ]
    },
    {
      title: 'select from project.dataset.table',
      sql: [
        'SELECT * FROM project.dataset.Roster;',
        'SELECT * FROM project.dataset.Roster'
      ]
    },
  ]

  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })

  it('should return empty str for non-array-struct', () => {
    expect(arrayStructValueToSQL({ type: 'non-array-struct' })).to.equal('')
  })

  it('should return undefined and dataType', () => {
    expect(arrayStructTypeToSQL()).to.equal(undefined)
    expect(arrayStructTypeToSQL({ dataType: 'array' })).to.equal('ARRAY undefined')
  })
})
