const { expect } = require('chai')
const Parser = require('../src/parser').default

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
    }
  ]

  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })
})
