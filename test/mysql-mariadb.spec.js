const { expect } = require('chai');
const Parser = require('../src/parser').default
const { selectIntoToSQL } = require('../src/select')

describe('mysql', () => {
  const parser = new Parser();
  function getParsedSql(sql, opt) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }
  const mariadb = { database: 'mariadb' }

  describe('select', () => {
    const SQL_LIST = [
      {
        title: 'basic regexp',
        sql: [
          "SELECT 'Michael!' REGEXP '.*';",
          "SELECT 'Michael!' REGEXP '.*'"
        ]
      },
      {
        title: 'basic regexp with newline',
        sql: [
          "SELECT 'new*\n*line' REGEXP 'new\\*.\\*line';",
          `SELECT 'new*\n*line' REGEXP 'new\\*.\\*line'`
        ]
      },
      {
        title: 'basic regexp with binary',
        sql: [
          "SELECT 'a' REGEXP '^[a-d]', 'a' REGEXP BINARY 'A';",
          "SELECT 'a' REGEXP '^[a-d]', 'a' REGEXP BINARY 'A'"
        ]
      },
      {
        title: 'regexp_instr',
        sql: [
          "SELECT REGEXP_INSTR('dog cat dog', 'dog');",
          "SELECT REGEXP_INSTR('dog cat dog', 'dog')"
        ]
      },
      {
        title: 'regexp_instr with pos',
        sql: [
          "SELECT REGEXP_INSTR('dog cat dog', 'dog', 2);",
          "SELECT REGEXP_INSTR('dog cat dog', 'dog', 2)"
        ]
      },
      {
        title: 'regexp_like',
        sql: [
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE');",
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE')"
        ]
      },
      {
        title: 'regexp_like with regex',
        sql: [
          "SELECT REGEXP_LIKE('fo\r\nfo', '^f.*$', 'm');",
          "SELECT REGEXP_LIKE('fo\r\nfo', '^f.*$', 'm')"
        ]
      },
      {
        title: 'regexp_like with collate',
        sql: [
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE' COLLATE utf8mb4_0900_as_cs);",
          "SELECT REGEXP_LIKE('CamelCase', 'CAMELCASE' COLLATE UTF8MB4_0900_AS_CS)"
        ]
      },
      {
        title: 'regexp_like with binary',
        sql: [
          "SELECT REGEXP_LIKE('a', 'A'), REGEXP_LIKE('a', BINARY 'A');",
          "SELECT REGEXP_LIKE('a', 'A'), REGEXP_LIKE('a', BINARY 'A')"
        ]
      },
      {
        title: 'regexp_replace',
        sql: [
          "SELECT REGEXP_REPLACE('abc def ghi', '[a-z]+', 'X', 1, 3);",
          "SELECT REGEXP_REPLACE('abc def ghi', '[a-z]+', 'X', 1, 3)"
        ]
      },
      {
        title: 'regexp_substr',
        sql: [
          "SELECT REGEXP_SUBSTR('abc def ghi', '[a-z]+', 1, 3);",
          "SELECT REGEXP_SUBSTR('abc def ghi', '[a-z]+', 1, 3)"
        ]
      },
      {
        title: 'window function',
        sql: [
          `SELECT
          store.NAME AS store,
          p1.date,
          sum( p1.show_num ) AS show_num,
          sum( p1.click_num ) AS click_num,
          round( sum( p1.click_num ) / sum( p1.show_num ), 4 ) AS click_rate,
          round( sum( p1.cost ) / sum( p1.click_num ), 2 ) AS cpc,
          round(
            sum( p1.cost ) / sum( p1.click_num ) * (
            sum( p1.click_num ) / sum( p1.show_num )) * 1000,
            2
          ) AS cpm,
          round( sum( p1.cost ) / sum( p1.add_cart_num ), 2 ) AS add_cart_cost,
          sum( p1.add_cart_num ) AS add_cart_num,
          round( sum( p1.add_cart_num ) / sum( p1.click_num ), 4 ) AS add_cart_rate,
          sum( p1.paid_order_num ) AS paid_order_num,
          round( sum( p1.cost ), 2 ) AS cost,
          round( sum( p1.paid_order_zmount ), 2 ) AS final_paid_order_amount,
          round( sum( sum( p1.cost )) over w, 2 ) AS cumulative_cost,
          round( sum( sum( p1.paid_order_zmount )) over w, 2 ) AS cumulative_final_paid_order_amount,
          round(( sum( sum( p1.paid_order_zmount )) over w )/( sum( sum( p1.cost )) over w ), 2 ) AS cumulative_roi,
          p3.second_day_paid_order_zmount AS second_day_paid_order_amount,
          round( p3.second_day_paid_order_zmount / sum( p1.cost ), 2 ) AS second_day_roi,
          round( sum( p1.paid_order_zmount )/ sum( p1.cost ), 2 ) AS final_roi
        FROM
          model_plangroup_15click AS p1
          LEFT JOIN (
          SELECT
            store,
            date,
            plan_group_name,
            max( upload_date ) AS max_upload_date
          FROM
            model_plangroup_15click
          WHERE
            model_plangroup_15click.upload_date IS NOT NULL
          GROUP BY
            store,
            date,
            plan_group_name
          ) AS p2 ON p1.store = p2.store
          AND p1.date = p2.date
          AND p1.plan_group_name = p2.plan_group_name
          AND p1.upload_date = p2.max_upload_date
          LEFT JOIN model_store AS store ON store.id = p1.store
          LEFT JOIN (
          SELECT
            p.store,
            p.date,
            round( sum( ifnull( paid_order_zmount, 0 )), 2 ) AS second_day_paid_order_zmount
          FROM
            model_plangroup_15click AS p
          WHERE
            DATEDIFF( p.upload_date, p.date ) = 1
          GROUP BY
            p.store,
            p.date
          ORDER BY
            p.store,
            p.date DESC
          ) AS p3 ON p1.store = p3.store
          AND p1.date = p3.date
        WHERE
          p2.max_upload_date IS NOT NULL
        GROUP BY
          p1.store,
          p1.date window w AS ( PARTITION BY p1.store, date_format( p1.date, "%Y%m" ) ORDER BY p1.date ROWS UNBOUNDED PRECEDING)
        ORDER BY
          p1.store,
          p1.date DESC`,
          "SELECT `store`.`NAME` AS `store`, `p1`.`date`, SUM(`p1`.`show_num`) AS `show_num`, SUM(`p1`.`click_num`) AS `click_num`, round(SUM(`p1`.`click_num`) / SUM(`p1`.`show_num`), 4) AS `click_rate`, round(SUM(`p1`.`cost`) / SUM(`p1`.`click_num`), 2) AS `cpc`, round(SUM(`p1`.`cost`) / SUM(`p1`.`click_num`) * (SUM(`p1`.`click_num`) / SUM(`p1`.`show_num`)) * 1000, 2) AS `cpm`, round(SUM(`p1`.`cost`) / SUM(`p1`.`add_cart_num`), 2) AS `add_cart_cost`, SUM(`p1`.`add_cart_num`) AS `add_cart_num`, round(SUM(`p1`.`add_cart_num`) / SUM(`p1`.`click_num`), 4) AS `add_cart_rate`, SUM(`p1`.`paid_order_num`) AS `paid_order_num`, round(SUM(`p1`.`cost`), 2) AS `cost`, round(SUM(`p1`.`paid_order_zmount`), 2) AS `final_paid_order_amount`, round(SUM(SUM(`p1`.`cost`)) OVER w, 2) AS `cumulative_cost`, round(SUM(SUM(`p1`.`paid_order_zmount`)) OVER w, 2) AS `cumulative_final_paid_order_amount`, round(SUM(SUM(`p1`.`paid_order_zmount`)) OVER w / SUM(SUM(`p1`.`cost`)) OVER w, 2) AS `cumulative_roi`, `p3`.`second_day_paid_order_zmount` AS `second_day_paid_order_amount`, round(`p3`.`second_day_paid_order_zmount` / SUM(`p1`.`cost`), 2) AS `second_day_roi`, round(SUM(`p1`.`paid_order_zmount`) / SUM(`p1`.`cost`), 2) AS `final_roi` FROM `model_plangroup_15click` AS `p1` LEFT JOIN (SELECT `store`, `date`, `plan_group_name`, MAX(`upload_date`) AS `max_upload_date` FROM `model_plangroup_15click` WHERE `model_plangroup_15click`.`upload_date` IS NOT NULL GROUP BY `store`, `date`, `plan_group_name`) AS `p2` ON `p1`.`store` = `p2`.`store` AND `p1`.`date` = `p2`.`date` AND `p1`.`plan_group_name` = `p2`.`plan_group_name` AND `p1`.`upload_date` = `p2`.`max_upload_date` LEFT JOIN `model_store` AS `store` ON `store`.`id` = `p1`.`store` LEFT JOIN (SELECT `p`.`store`, `p`.`date`, round(SUM(ifnull(`paid_order_zmount`, 0)), 2) AS `second_day_paid_order_zmount` FROM `model_plangroup_15click` AS `p` WHERE DATEDIFF(`p`.`upload_date`, `p`.`date`) = 1 GROUP BY `p`.`store`, `p`.`date` ORDER BY `p`.`store` ASC, `p`.`date` DESC) AS `p3` ON `p1`.`store` = `p3`.`store` AND `p1`.`date` = `p3`.`date` WHERE `p2`.`max_upload_date` IS NOT NULL GROUP BY `p1`.`store`, `p1`.`date` WINDOW w AS (PARTITION BY `p1`.`store`, date_format(`p1`.`date`, '%Y%m') ORDER BY `p1`.`date` ASC ROWS UNBOUNDED PRECEDING) ORDER BY `p1`.`store` ASC, `p1`.`date` DESC"
        ]
      },
      {
        title: 'support on clause with function and expr',
        sql: [
          `select * from pg_database a
          join pg_database b
          on upper(a.datctype) = upper(b.datctype) AND a.oid = b.oid`,
          "SELECT * FROM `pg_database` AS `a` INNER JOIN `pg_database` AS `b` ON upper(`a`.`datctype`) = upper(`b`.`datctype`) AND `a`.`oid` = `b`.`oid`"
        ]
      },
      {
        title: 'support trim function',
        sql: [
          `SELECT TRIM('.' from "....test.....") AS TrimmedString;`,
          "SELECT TRIM('.' FROM '....test.....') AS `TrimmedString`"
        ]
      },
      {
        title: 'support trim function with position',
        sql: [
          `SELECT TRIM(BOTH '.' from "....test.....") AS TrimmedString;`,
          "SELECT TRIM(BOTH '.' FROM '....test.....') AS `TrimmedString`"
        ]
      },
      {
        title: 'support trim function with position',
        sql: [
          `SELECT TRIM(TRAILING  from " test ") AS TrimmedString;`,
          "SELECT TRIM(TRAILING FROM ' test ') AS `TrimmedString`"
        ]
      },
      {
        title: 'support trim function without config',
        sql: [
          `SELECT TRIM(" test ") AS TrimmedString;`,
          "SELECT TRIM(' test ') AS `TrimmedString`"
        ]
      },
      {
        title: 'column with start',
        sql: [
          `SELECT abc, * from tableName`,
          "SELECT `abc`, * FROM `tableName`"
        ]
      },
    ]
    SQL_LIST.forEach(sqlInfo => {
      const { title, sql } = sqlInfo
      it(`should support ${title}`, () => {
        expect(getParsedSql(sql[0])).to.equal(sql[1])
      })
      it(`should support ${title} in mariadb`, () => {
        expect(getParsedSql(sql[0], mariadb)).to.equal(sql[1])
      })
    })

    describe('into', () => {
      it('should support select into variables', () => {
        let sql = 'SELECT * INTO @myvar FROM t1;'
        let parsedSQL = 'SELECT * INTO @myvar FROM `t1`'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
        sql = 'SELECT * FROM t1 INTO @myvar FOR UPDATE;'
        parsedSQL = 'SELECT * FROM `t1` INTO @myvar FOR UPDATE'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
        sql = 'SELECT * FROM t1 FOR UPDATE INTO @myvar;'
        parsedSQL = 'SELECT * FROM `t1` FOR UPDATE INTO @myvar'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
        sql = 'SELECT id, data INTO @x, @y FROM test.t1 LIMIT 1;'
        parsedSQL = 'SELECT `id`, `data` INTO @x, @y FROM `test`.`t1` LIMIT 1'
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
      })

      it('should support select into outfile', () => {
        const sql = `SELECT * FROM (VALUES ROW(1,2,3),ROW(4,5,6),ROW(7,8,9)) AS t
        INTO OUTFILE '/tmp/select-values.txt';`
        const parsedSQL = "SELECT * FROM (VALUES ROW(1,2,3), ROW(4,5,6), ROW(7,8,9)) AS `t` INTO OUTFILE '/tmp/select-values.txt'"
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
      })

      it('should support select into dumpfile', () => {
        const sql = `SELECT * FROM (VALUES ROW(1,2,3),ROW(4,5,6),ROW(7,8,9)) AS t
        INTO DUMPFILE '/tmp/select-values.txt';`
        const parsedSQL = "SELECT * FROM (VALUES ROW(1,2,3), ROW(4,5,6), ROW(7,8,9)) AS `t` INTO DUMPFILE '/tmp/select-values.txt'"
        expect(getParsedSql(sql)).to.equal(parsedSQL)
        expect(getParsedSql(sql, mariadb)).to.equal(parsedSQL)
      })

      it('should return empty when into is null', () => {
        expect(selectIntoToSQL()).to.be.undefined
        expect(selectIntoToSQL({})).to.be.undefined
      })
    })
  })

})