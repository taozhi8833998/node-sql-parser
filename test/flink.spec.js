const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('Flink', () => {
  const parser = new Parser();
  const opt = {
    database: 'flinksql'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: "select current_date",
      sql: [
        "SELECT CURRENT_DATE FROM mytable",
        "SELECT CURRENT_DATE FROM `mytable`",
      ],
    },
    {
      title: "trim function",
      sql: [
        `SELECT TRIM('.' from "....test.....") AS TrimmedString;`,
        "SELECT TRIM('.' FROM '....test.....') AS `TrimmedString`",
      ],
    },
    {
      title: "trim function with position",
      sql: [
        `SELECT TRIM(BOTH '.' from "....test.....") AS TrimmedString;`,
        "SELECT TRIM(BOTH '.' FROM '....test.....') AS `TrimmedString`",
      ],
    },
    {
      title: "trim function with position",
      sql: [
        `SELECT TRIM(TRAILING  from " test ") AS TrimmedString;`,
        "SELECT TRIM(TRAILING FROM ' test ') AS `TrimmedString`",
      ],
    },
    {
      title: "trim function without config",
      sql: [
        `SELECT TRIM(" test ") AS TrimmedString;`,
        "SELECT TRIM(' test ') AS `TrimmedString`",
      ],
    },
    {
      title: "status as column name",
      sql: [
        `SELECT status FROM users;`,
        "SELECT `status` FROM `users`",
      ],
    },
    {
      title: "UNION",
      sql: [
        `(SELECT s FROM t1) UNION (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) UNION (SELECT `s` FROM `t2`)",
      ],
    },
    {
      title: "UNION ALL",
      sql: [
        `(SELECT s FROM t1) UNION ALL (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) UNION ALL (SELECT `s` FROM `t2`)",
      ],
    },
    {
      title: "INTERSECT",
      sql: [
        `(SELECT s FROM t1) INTERSECT (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) INTERSECT (SELECT `s` FROM `t2`)",
      ],
    },
    {
      title: "INTERSECT ALL",
      sql: [
        `(SELECT s FROM t1) INTERSECT ALL (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) INTERSECT ALL (SELECT `s` FROM `t2`)",
      ],
    },
    {
      title: "EXCEPT",
      sql: [
        `(SELECT s FROM t1) EXCEPT (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) EXCEPT (SELECT `s` FROM `t2`)",
      ],
    },
    {
      title: "EXCEPT ALL",
      sql: [
        `(SELECT s FROM t1) EXCEPT ALL (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) EXCEPT ALL (SELECT `s` FROM `t2`)",
      ],
    },
    {
      title: "nested INTERSECT",
      sql: [
        `SELECT *
           FROM (
             (SELECT user FROM Orders WHERE a % 2 = 0)
           INTERSECT
             (SELECT user FROM Orders WHERE b = 0)
         )`,
        "SELECT * FROM ((SELECT `user` FROM `Orders` WHERE `a` % 2 = 0) INTERSECT (SELECT `user` FROM `Orders` WHERE `b` = 0))",
      ],
    },
    {
      title: "IN",
      sql: [
        `
          SELECT user, amount
          FROM Orders
          WHERE product IN (
            SELECT product FROM NewProducts
          )
        `,
        "SELECT `user`, `amount` FROM `Orders` WHERE `product` IN (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "NOT IN",
      sql: [
        `
          SELECT user, amount
          FROM Orders
          WHERE product NOT IN (
            SELECT product FROM NewProducts
          )
        `,
        "SELECT `user`, `amount` FROM `Orders` WHERE `product` NOT IN (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "EXISTS",
      sql: [
        `
          SELECT user, amount
          FROM Orders
          WHERE product EXISTS (
              SELECT product FROM NewProducts
          )
        `,
        "SELECT `user`, `amount` FROM `Orders` WHERE `product` EXISTS (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "NOT EXISTS",
      sql: [
        `
          SELECT user, amount
          FROM Orders
          WHERE product NOT EXISTS (
              SELECT product FROM NewProducts
          )
        `,
        "SELECT `user`, `amount` FROM `Orders` WHERE `product` NOT EXISTS (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "string concatenation function",
      sql: [
        `SELECT a || b FROM users WHERE a || b = 'ab';`,
        "SELECT `a` || `b` FROM `users` WHERE `a` || `b` = 'ab'",
      ],
    },
  ];

  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })
})
