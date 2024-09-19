const { expect } = require('chai')
const Parser = require('../src/parser').default
const tableTumbleToSQL = require('../src/tables').tableTumbleToSQL

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
        'SELECT TRIM(\'.\' FROM "....test.....") AS `TrimmedString`',
      ],
    },
    {
      title: "trim function with position",
      sql: [
        `SELECT TRIM(BOTH '.' from "....test.....") AS TrimmedString;`,
        'SELECT TRIM(BOTH \'.\' FROM "....test.....") AS `TrimmedString`',
      ],
    },
    {
      title: "trim function with position",
      sql: [
        `SELECT TRIM(TRAILING  from " test ") AS TrimmedString;`,
        'SELECT TRIM(TRAILING FROM " test ") AS `TrimmedString`',
      ],
    },
    {
      title: "trim function without config",
      sql: [
        `SELECT TRIM(" test ") AS TrimmedString;`,
        'SELECT TRIM(" test ") AS `TrimmedString`',
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
      title: "UNION DISTINCT",
      sql: [
        `(SELECT s FROM t1) UNION DISTINCT (SELECT s FROM t2)`,
        "(SELECT `s` FROM `t1`) UNION DISTINCT (SELECT `s` FROM `t2`)",
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
             (SELECT user_id FROM Orders WHERE a % 2 = 0)
           INTERSECT
             (SELECT user_id FROM Orders WHERE b = 0)
         )`,
        "SELECT * FROM ((SELECT `user_id` FROM `Orders` WHERE `a` % 2 = 0) INTERSECT (SELECT `user_id` FROM `Orders` WHERE `b` = 0))",
      ],
    },
    {
      title: "IN",
      sql: [
        `
          SELECT user_id, amount
          FROM Orders
          WHERE product IN (
            SELECT product FROM NewProducts
          )
        `,
        "SELECT `user_id`, `amount` FROM `Orders` WHERE `product` IN (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "NOT IN",
      sql: [
        `
          SELECT user_id, amount
          FROM Orders
          WHERE product NOT IN (
            SELECT product FROM NewProducts
          )
        `,
        "SELECT `user_id`, `amount` FROM `Orders` WHERE `product` NOT IN (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "EXISTS",
      sql: [
        `
          SELECT user_id, amount
          FROM Orders
          WHERE product EXISTS (
              SELECT product FROM NewProducts
          )
        `,
        "SELECT `user_id`, `amount` FROM `Orders` WHERE `product` EXISTS (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "NOT EXISTS",
      sql: [
        `
          SELECT user_id, amount
          FROM Orders
          WHERE product NOT EXISTS (
              SELECT product FROM NewProducts
          )
        `,
        "SELECT `user_id`, `amount` FROM `Orders` WHERE `product` NOT EXISTS (SELECT `product` FROM `NewProducts`)",
      ],
    },
    {
      title: "like with escape",
      sql: [
        `SELECT * FROM users WHERE a LIKE '%abc%' ESCAPE '-'`,
        "SELECT * FROM `users` WHERE `a` LIKE '%abc%' ESCAPE '-'",
      ],
    },
    {
      title: "DISTINCT FROM",
      sql: [
        `SELECT * FROM users WHERE a IS DISTINCT FROM 'b'`,
        "SELECT * FROM `users` WHERE `a` IS DISTINCT FROM 'b'",
      ],
    },
    {
      title: "NOT DISTINCT FROM",
      sql: [
        `SELECT * FROM users WHERE a IS NOT DISTINCT FROM b`,
        "SELECT * FROM `users` WHERE `a` IS NOT DISTINCT FROM `b`",
      ],
    },
    {
      title: "DISTINCT FROM NULL",
      sql: [
        `SELECT * FROM users WHERE a IS DISTINCT FROM NULL`,
        "SELECT * FROM `users` WHERE `a` IS DISTINCT FROM NULL",
      ],
    },
    {
      title: "JOIN",
      sql: [
        `SELECT * FROM Orders JOIN Product ON Orders.productId = Product.id`,
        "SELECT * FROM `Orders` JOIN `Product` ON `Orders`.`productId` = `Product`.`id`",
      ],
    },
    {
      title: "NATURAL JOIN",
      sql: [
        `SELECT * FROM Orders NATURAL JOIN Product`,
        "SELECT * FROM `Orders` NATURAL JOIN `Product`",
      ],
    },
    {
      title: "INNER JOIN",
      sql: [
        `SELECT * FROM Orders INNER JOIN Product ON Orders.productId = Product.id`,
        "SELECT * FROM `Orders` INNER JOIN `Product` ON `Orders`.`productId` = `Product`.`id`",
      ],
    },
    {
      title: "LEFT JOIN",
      sql: [
        `SELECT * FROM Orders LEFT JOIN Product ON Orders.product_id = Product.id`,
        "SELECT * FROM `Orders` LEFT JOIN `Product` ON `Orders`.`product_id` = `Product`.`id`",
      ],
    },
    {
      title: "RIGHT JOIN",
      sql: [
        `SELECT * FROM Orders RIGHT JOIN Product ON Orders.product_id = Product.id`,
        "SELECT * FROM `Orders` RIGHT JOIN `Product` ON `Orders`.`product_id` = `Product`.`id`",
      ],
    },
    {
      title: "FULL OUTER JOIN",
      sql: [
        `SELECT * FROM Orders FULL OUTER JOIN Product ON Orders.product_id = Product.id`,
        "SELECT * FROM `Orders` FULL OUTER JOIN `Product` ON `Orders`.`product_id` = `Product`.`id`",
      ],
    },
    {
      title: "CROSS JOIN",
      sql: [
        `SELECT column_list FROM A CROSS JOIN B`,
        "SELECT `column_list` FROM `A` CROSS JOIN `B`",
      ],
    },
    {
      title: "CROSS APPLY",
      sql: [
        `SELECT  t1.*, t2o.*
         FROM    t1
         CROSS APPLY
                (
                SELECT  *
                FROM    t2
                WHERE   t2.t1_id = t1.id
                ) t2o
        `,
        "SELECT `t1`.*, `t2o`.* FROM `t1` CROSS APPLY (SELECT * FROM `t2` WHERE `t2`.`t1_id` = `t1`.`id`) AS `t2o`",
      ],
    },
    {
      title: "complex JOINs",
      sql: [
        `SELECT * FROM (SELECT * FROM table1) t1 FULL OUTER JOIN ( SELECT * FROM ( SELECT * FROM table2 ) JOIN db.table3 ON table2.id=table3.id ) t2 ON t1.id=t2.id`,
        "SELECT * FROM (SELECT * FROM `table1`) AS `t1` FULL OUTER JOIN (SELECT * FROM (SELECT * FROM `table2`) JOIN `db`.`table3` ON `table2`.`id` = `table3`.`id`) AS `t2` ON `t1`.`id` = `t2`.`id`",
      ],
    },
    {
      title: "WITH clause",
      sql: [
        `WITH orders_with_total AS (SELECT order_id, price + tax AS total FROM Orders)
         SELECT order_id, SUM(total) FROM orders_with_total GROUP BY order_id;`,
        "WITH `orders_with_total` AS (SELECT `order_id`, `price` + `tax` AS `total` FROM `Orders`) SELECT `order_id`, SUM(`total`) FROM `orders_with_total` GROUP BY `order_id`",
      ],
    },
    {
      title: "string concatenation function",
      sql: [
        `SELECT a || b FROM users WHERE a || b = 'ab';`,
        "SELECT `a` || `b` FROM `users` WHERE `a` || `b` = 'ab'",
      ],
    },
    {
      title: "SIMILAR TO",
      sql: [
        `SELECT * FROM users WHERE a SIMILAR TO '%[^a-z0-9 .]%'`,
        "SELECT * FROM `users` WHERE `a` SIMILAR TO '%[^a-z0-9 .]%'",
      ],
    },
    {
      title: "NOT SIMILAR TO",
      sql: [
        `SELECT * FROM users WHERE a NOT SIMILAR TO 'abc'`,
        "SELECT * FROM `users` WHERE `a` NOT SIMILAR TO 'abc'",
      ],
    },
    {
      title: "SIMILAR with escape",
      sql: [
        `SELECT * FROM users WHERE a SIMILAR TO '%[^a-z0-9 .]%' ESCAPE '-'`,
        "SELECT * FROM `users` WHERE `a` SIMILAR TO '%[^a-z0-9 .]%' ESCAPE '-'",
      ],
    },
    {
      title: "POSITION",
      sql: [
        `SELECT * FROM users WHERE POSITION('a' IN a) = 2`,
        "SELECT * FROM `users` WHERE POSITION('a' IN `a`) = 2",
      ],
    },
    {
      title: "POSITION with start",
      sql: [
        `SELECT * FROM users WHERE POSITION('a' IN a FROM 3) = 2`,
        "SELECT * FROM `users` WHERE POSITION('a' IN `a` FROM 3) = 2",
      ],
    },
    {
      title: "SUBSTRING",
      sql: [
        `SELECT * FROM users WHERE SUBSTRING('abcde' FROM 2) = 'llo'`,
        "SELECT * FROM `users` WHERE SUBSTRING('abcde' FROM 2) = 'llo'",
      ],
    },
    {
      title: "SUBSTRING with length",
      sql: [
        `SELECT * FROM users WHERE SUBSTRING(a FROM 2 FOR 2) = 'll'`,
        "SELECT * FROM `users` WHERE SUBSTRING(`a` FROM 2 FOR 2) = 'll'",
      ],
    },
    {
      title: "CAST",
      sql: [
        `SELECT SHA512(CAST(CONCAT(a, b, c) AS VARCHAR)) AS Hashed FROM v`,
        "SELECT SHA512(CAST(CONCAT(`a`, `b`, `c`) AS VARCHAR)) AS `Hashed` FROM `v`",
      ],
    },
    {
      title: "TRY_CAST",
      sql: [
        `SELECT SHA512(TRY_CAST(CONCAT(a, b, c) AS VARCHAR)) AS Hashed FROM v`,
        "SELECT SHA512(TRY_CAST(CONCAT(`a`, `b`, `c`) AS VARCHAR)) AS `Hashed` FROM `v`",
      ],
    },
    {
      title: "OVERLAY",
      sql: [
        `SELECT OVERLAY(a PLACING 'a' FROM 3) FROM users`,
        "SELECT OVERLAY(`a` PLACING 'a' FROM 3) FROM `users`",
      ],
    },
    {
      title: "OVERLAY with length",
      sql: [
        `SELECT * FROM users WHERE OVERLAY(a PLACING 'abc' FROM 3 FOR 2) = 'abcde'`,
        "SELECT * FROM `users` WHERE OVERLAY(`a` PLACING 'abc' FROM 3 FOR 2) = 'abcde'",
      ],
    },
    {
      title: 'tumble table',
      sql: [
        `SELECT
          window_start,
          window_end,
          http_status,
          count(*) as count_http_status
        FROM
        TABLE (
          TUMBLE (
            TABLE parsed_logs,
            DESCRIPTOR (_operationTs),
            INTERVAL '60' SECONDS
          )
        )`,
        "SELECT `window_start`, `window_end`, `http_status`, COUNT(*) AS `count_http_status` FROM TABLE(TUMBLE(TABLE `parsed_logs` DESCRIPTOR(`_operationTs`) INTERVAL '60' SECONDS))"
      ]
    },
    {
      title: 'map object',
      sql: [
        `insert into sink_soc_10086_node_11(
          pk
          , f1
          )
          select
          CAST(map['uri',uri] as VARCHAR)
          , uri
          from view_soc_10086_node_8
          ;`,
        "INSERT INTO `sink_soc_10086_node_11` (pk, f1) SELECT CAST(MAP['uri', uri] AS VARCHAR), `uri` FROM `view_soc_10086_node_8`"
      ]
    },
    {
      title: 'json_object',
      sql: [
        `select name, eventTime, eventDetail
        from (
            select
            concat('AK中文信息') as name,
            cast(event_time as varchar) as eventTime,
            json_object(
                'risk-tag' value risk_tag,
                'abc' VALUE (10 * 2),
                'user-agent' value JSON_OBJECT('city' VALUE 'New York' on null null, 'postalCode' VALUE '10001' on null absent)
            ) as eventDetail
        from check_risk
        );`,
        "SELECT `name`, `eventTime`, `eventDetail` FROM (SELECT concat('AK中文信息') AS `name`, CAST(`event_time` AS VARCHAR) AS `eventTime`, JSON_OBJECT('risk-tag' VALUE `risk_tag`, 'abc' VALUE (10 * 2), 'user-agent' VALUE JSON_OBJECT('city' VALUE 'New York' ON NULL NULL, 'postalCode' VALUE '10001' ON NULL ABSENT)) AS `eventDetail` FROM `check_risk`)"
      ]
    },
    {
      title: "create table",
      sql: [
        "CREATE TABLE Orders (`user` BIGINT)",
        "CREATE TABLE `Orders` (`user` BIGINT)",
      ],
    },
    {
      title: "create table with options",
      sql: [
        "CREATE TABLE Orders (`user` BIGINT) WITH ('connector' = 'kafka')",
        "CREATE TABLE `Orders` (`user` BIGINT) WITH ('connector' = 'kafka')",
      ],
    }
  ];

  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })

  describe('test function', () => {
    it('should return empty when tumble info is null', () => {
      expect(tableTumbleToSQL(null)).to.be.equals('')
    })
  })
})
