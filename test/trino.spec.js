const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('trino', () => {
  const parser = new Parser();
  const opt = {
    database: 'trino'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: 'lambda expression',
      sql: [
        `SELECT numbers,
        transform(numbers, n -> n * n) as squared_numbers
        FROM (
            VALUES
                (ARRAY[1, 2]),
                (ARRAY[3, 4]),
                (ARRAY[5, 6, 7])
        ) AS t(numbers);`,
        'SELECT numbers, transform(numbers, n -> n * n) AS "squared_numbers" FROM (VALUES (ARRAY[1,2]), (ARRAY[3,4]), (ARRAY[5,6,7])) AS "t(numbers)"'
      ]
    },
    {
      title: 'lambda expression args',
      sql: [
        `SELECT reduce_agg(value, 0, (a, b) -> a + b, (a, b) -> a + b) sum_values
        FROM (
            VALUES (1), (2), (3), (4), (5)
        ) AS t(value);`,
        'SELECT reduce_agg(value, 0, (a, b) -> a + b, (a, b) -> a + b) AS "sum_values" FROM (VALUES (1), (2), (3), (4), (5)) AS "t(value)"'
      ]
    },
    {
      title: 'lambda expression in where clause',
      sql: [
        `SELECT numbers
        FROM (
            VALUES
                (ARRAY[1,NULL,3]),
                (ARRAY[10,20,30]),
                (ARRAY[100,200,300])
        ) AS t(numbers)
        WHERE any_match(numbers, n ->  COALESCE(n, 0) > 100);`,
        'SELECT numbers FROM (VALUES (ARRAY[1,NULL,3]), (ARRAY[10,20,30]), (ARRAY[100,200,300])) AS "t(numbers)" WHERE any_match(numbers, n -> COALESCE(n, 0) > 100)'
      ]
    },
    {
      title: 'lambda expression complex function',
      sql: [
        `SELECT xvalues,
        a,
        b,
        transform(xvalues, x -> IF(x > 0, a * x + b, a * (-x) + b)) as linear_function_values
        FROM (
            VALUES
                (ARRAY[1, 2], 10, 5),
                (ARRAY[3, 4], 4, 2)
        ) AS t(xvalues, a, b);`,
        'SELECT xvalues, a, b, transform(xvalues, x -> IF(x > 0, a * x + b, a * (-x) + b)) AS "linear_function_values" FROM (VALUES (ARRAY[1,2],10,5), (ARRAY[3,4],4,2)) AS "t(xvalues, a, b)"'
      ]
    },
    {
      title: 'window function',
      sql: [
        'select sum(a) over (partition by b rows between unbounded preceding and current row)',
        'SELECT SUM(a) OVER (PARTITION BY b ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'

      ]
    }
  ]
  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })
  it('should throw error when lambda expression is invalid', () => {
    let sql = 'SELECT numbers, transform(numbers, n -> max(n)) as squared_numbers FROM (VALUES (ARRAY[1, 2]),(ARRAY[3, 4]),(ARRAY[5, 6, 7])) AS t(numbers);'
    expect(parser.astify.bind(parser, sql, opt)).to.throw('Aggregations are not supported in lambda expressions')
    sql = 'SELECT numbers, transform(numbers, n -> 2 + (select 3)) as squared_numbers FROM (VALUES (ARRAY[1, 2]),(ARRAY[3, 4]),(ARRAY[5, 6, 7])) AS t(numbers);'
    expect(parser.astify.bind(parser, sql, opt)).to.throw('Subqueries are not supported in lambda expressions')
  })
})
