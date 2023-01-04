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
  ];

  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })
})
