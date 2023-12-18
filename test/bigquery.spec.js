const { expect } = require('chai')
const Parser = require('../src/parser').default
const { arrayStructValueToSQL } = require('../src/array-struct')
const { operatorToSQL } = require('../src/tables')
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

  describe('operator type', () => {
    it('should return empty when type is unknown', () => {
      expect(operatorToSQL({ type: 'unknown'})).to.be.equals('')
    })
  })
  const SQL_LIST = [
    {
      title: 'select *',
      sql: [
        'SELECT * FROM (SELECT "apple" AS fruit, "carrot" AS vegetable);',
        "SELECT * FROM (SELECT 'apple' AS fruit, 'carrot' AS vegetable)"
      ]
    },
    {
      title: 'select simple column with parentheses',
      sql: [
        'SELECT ((aaa + bbb) / ccc) FROM xxx',
        "SELECT ((aaa + bbb) / ccc) FROM xxx"
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
      title: 'with expr, order',
      sql: [
        `with

        cte as (
            select *
            from product.organization
            order by id
            limit 10
        )

        select *
        from cte`,
        "WITH cte AS (SELECT * FROM product.organization ORDER BY id ASC LIMIT 10) SELECT * FROM cte"
      ]
    },
    {
      title: 'select expression.* with struct',
      sql: [
        `WITH locations AS
        (SELECT STRUCT("Seattle" AS city, "Washington" AS state) AS location
        UNION ALL
        SELECT STRUCT("Phoenix" AS city, "Arizona" AS state) AS location)
      SELECT l.locations.*
      FROM locations l;`,
        "WITH locations AS (SELECT STRUCT('Seattle' AS city, 'Washington' AS state) AS location UNION ALL SELECT STRUCT('Phoenix' AS city, 'Arizona' AS state) AS location) SELECT l.locations.* FROM locations AS l"
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
      title: 'select * except',
      sql: [
        `WITH orders AS
        (SELECT 5 as order_id,
        "sprocket" as item_name,
        200 as quantity)
      SELECT * EXCEPT (order_id), orders.* EXCEPT(order_time)
      FROM orders;`,
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * EXCEPT(order_id), orders.* EXCEPT(order_time) FROM orders"
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
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * REPLACE('widget' AS item_name) FROM orders"
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
        "WITH orders AS (SELECT 5 AS order_id, 'sprocket' AS item_name, 200 AS quantity) SELECT * REPLACE(quantity / 2 AS quantity) FROM orders"
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
    {
      title: 'select from table for system_time as of',
      sql: [
        'SELECT * FROM t FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR);',
        'SELECT * FROM t FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)'
      ]
    },
    {
      title: 'select from table for system_time as of string',
      sql: [
        "SELECT * FROM t FOR SYSTEM_TIME AS OF '2017-01-01 10:00:00-07:00';",
        "SELECT * FROM t FOR SYSTEM_TIME AS OF '2017-01-01 10:00:00-07:00'"
      ]
    },
    {
      title: 'select from table for system_time as of in',
      sql: [
        'SELECT * FROM t1 WHERE t1.a IN (SELECT t2.a FROM t2 FOR SYSTEM_TIME AS OF t1.timestamp_column);',
        'SELECT * FROM t1 WHERE t1.a IN (SELECT t2.a FROM t2 FOR SYSTEM_TIME AS OF t1.timestamp_column)'
      ]
    },
    {
      title: 'select from unnest array expr',
      sql: [
        "SELECT * FROM UNNEST(ARRAY<STRUCT<x INT64, y STRING>>[(1, 'foo'), (3, 'bar')]);",
        "SELECT * FROM UNNEST(ARRAY<STRUCT<x INT64, y STRING>>[(1, 'foo'), (3, 'bar')])"
      ]
    },
    {
      title: 'select from unnest array path',
      sql: [
        'SELECT * FROM UNNEST ([1, 2, 3]);',
        'SELECT * FROM UNNEST([1, 2, 3])'
      ]
    },
    {
      title: 'select from unnest JSON_EXTRACT_ARRAY',
      sql: [
        'SELECT a, b, c, ARRAY(SELECT * FROM UNNEST(JSON_EXTRACT_ARRAY(d))) AS d FROM e WHERE LOWER(f)=\'123\' GROUP BY a, b, c',
        'SELECT a, b, c, ARRAY(SELECT * FROM UNNEST(JSON_EXTRACT_ARRAY(d))) AS d FROM e WHERE LOWER(f) = \'123\' GROUP BY a, b, c'
      ]
    },
    {
      title: 'select from unnest with offset',
      sql: [
        'SELECT * FROM UNNEST ( ) AS abc WITH OFFSET AS num',
        'SELECT * FROM UNNEST() AS abc WITH OFFSET AS num'
      ]
    },
    {
      title: 'select with_query_name',
      sql: [
        `WITH
        subQ1 AS (SELECT * FROM Roster WHERE SchoolID = 52),
        subQ2 AS (SELECT SchoolID FROM subQ1)
      SELECT DISTINCT * FROM subQ2;`,
        'WITH subQ1 AS (SELECT * FROM Roster WHERE SchoolID = 52), subQ2 AS (SELECT SchoolID FROM subQ1) SELECT DISTINCT * FROM subQ2'
      ]
    },
    {
      title: 'select subquery',
      sql: [
        `SELECT AVG ( PointsScored )
        FROM
        ( SELECT PointsScored
          FROM Stats
          WHERE SchoolID = 77 )`,
        'SELECT AVG(PointsScored) FROM (SELECT PointsScored FROM Stats WHERE SchoolID = 77)'
      ]
    },
    {
      title: 'select subquery have alias',
      sql: [
        `SELECT r.LastName
        FROM
        ( SELECT * FROM Roster) AS r`,
        'SELECT r.LastName FROM (SELECT * FROM Roster) AS r'
      ]
    },
    {
      title: 'select implicit "comma cross join"',
      sql: [
        'SELECT * FROM Roster, TeamMascot',
        'SELECT * FROM Roster, TeamMascot'
      ]
    },
    {
      title: 'select cross join',
      sql: [
        'SELECT * FROM Roster cross join TeamMascot',
        'SELECT * FROM Roster CROSS JOIN TeamMascot'
      ]
    },
    {
      title: 'select inner join using',
      sql: [
        `SELECT FirstName
        FROM Roster INNER JOIN PlayerStats
        USING (LastName);`,
        'SELECT FirstName FROM Roster INNER JOIN PlayerStats USING (LastName)'
      ]
    },
    {
      title: 'inner could be omit when join',
      sql: [
        `select
          organization.name,
          count(*) as nb_payments
        from product.organization
        join product.payment on organization_id = organization.id
        group by 1
        order by 2 desc`,
        'SELECT organization.name, COUNT(*) AS nb_payments FROM product.organization JOIN product.payment ON organization_id = organization.id GROUP BY 1 ORDER BY 2 DESC'
      ]
    },
    {
      title: 'select order by using parentheses',
      sql: [
        `( SELECT * FROM Roster
          UNION ALL
          SELECT * FROM TeamMascot )
        ORDER BY SchoolID;`,
        '( SELECT * FROM Roster UNION ALL SELECT * FROM TeamMascot ) ORDER BY SchoolID ASC'
      ]
    },
    {
      title: 'select window clause',
      sql: [
        `SELECT item, purchases, category,
        LAST_VALUE(item)
        OVER (item_window) AS most_popular
        FROM Produce
        WINDOW item_window AS (
          PARTITION BY category
          ORDER BY purchases
          ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING)`,
        'SELECT item, purchases, category, LAST_VALUE(item) OVER (item_window) AS most_popular FROM Produce WINDOW item_window AS (PARTITION BY category ORDER BY purchases ASC ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING)'
      ]
    },
    {
      title: 'select window clause list',
      sql: [
        `SELECT item, purchases, category, LAST_VALUE(item)
        OVER d AS most_popular
      FROM Produce
      WINDOW
        a AS (PARTITION BY category),
        b AS (a ORDER BY purchases),
        c AS (b ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING),
        d AS (c)`,
        'SELECT item, purchases, category, LAST_VALUE(item) OVER d AS most_popular FROM Produce WINDOW a AS (PARTITION BY category), b AS (a ORDER BY purchases ASC), c AS (b ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING), d AS (c)'
      ]
    },
    {
      title: 'select window clause list over window',
      sql: [
        `SELECT item, purchases, category, LAST_VALUE(item)
        OVER (c ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS most_popular
      FROM Produce
      WINDOW
        a AS (PARTITION BY category),
        b AS (a ORDER BY purchases),
        c AS b`,
        'SELECT item, purchases, category, LAST_VALUE(item) OVER (c ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS most_popular FROM Produce WINDOW a AS (PARTITION BY category), b AS (a ORDER BY purchases ASC), c AS b'
      ]
    },
    {
      title: 'select unnest array limit',
      sql: [
        `SELECT *
        FROM UNNEST(ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter
        ORDER BY letter ASC LIMIT 2`,
        "SELECT * FROM UNNEST(ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter ORDER BY letter ASC LIMIT 2"
      ]
    },
    {
      title: 'select unnest array limit and offset',
      sql: [
        `SELECT *
        FROM UNNEST(ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter
        ORDER BY letter ASC LIMIT 2 OFFSET 1`,
        "SELECT * FROM UNNEST(ARRAY<STRING>['a', 'b', 'c', 'd', 'e']) AS letter ORDER BY letter ASC LIMIT 2 OFFSET 1"
      ]
    },
    {
      title: 'tail comma',
      sql: [
        `SELECT season as season,
        academic_year as academic_year,
        FROM source`,
        'SELECT season AS season, academic_year AS academic_year FROM source'
      ]
    },
    {
      title: 'select union distinct',
      sql: [
        `SELECT win_team_id AS winTeamID, win_market as market, winName as name from winners UNION DISTINCT (SELECT * from losers)`,
        'SELECT win_team_id AS winTeamID, win_market AS market, winName AS name FROM winners UNION DISTINCT (SELECT * FROM losers)'
      ]
    },
    {
      title: 'select offset',
      sql: [
        `WITH locations AS
        (SELECT ARRAY<STRUCT<city STRING, state STRING>>[("Seattle", "Washington"),
          ("Phoenix", "Arizona")] AS location)
      SELECT l.LOCATION[offset(0)].*
      FROM locations l;`,
        "WITH locations AS (SELECT ARRAY<STRUCT<city STRING, state STRING>>[('Seattle', 'Washington'), ('Phoenix', 'Arizona')] AS location) SELECT l.LOCATION[OFFSET(0)].* FROM locations AS l"
      ]
    },
    {
      title: 'select offset or ordinal',
      sql: [
        `WITH sequences AS
        (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
         UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
         UNION ALL SELECT [5, 10] AS some_numbers)
      SELECT some_numbers,
             some_numbers[0] as index_0,
             some_numbers[OFFSET(1)] AS offset_1,
             some_numbers[ORDINAL(1)] AS ordinal_1
      FROM sequences;`,
        "WITH sequences AS (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers UNION ALL SELECT [5, 10] AS some_numbers) SELECT some_numbers, some_numbers[0] AS index_0, some_numbers[OFFSET(1)] AS offset_1, some_numbers[ORDINAL(1)] AS ordinal_1 FROM sequences"
      ]
    },
    {
      title: 'select offset after funtion',
      sql: [
        "select split('To - be - split', ' - ')[OFFSET(0)] from abc",
        "SELECT split('To - be - split', ' - ')[OFFSET(0)] FROM abc"
      ]
    },
    {
      title: 'select scalar function with args',
      sql: [
        'SELECT CURRENT_DATE(\'America/New_York\') FROM table1;',
        "SELECT CURRENT_DATE('America/New_York') FROM table1"
      ]
    },
    {
      title: 'select extract function with args',
      sql: [
        "SELECT EXTRACT(DAY FROM DATE '2013-12-25') as the_day FROM table1;",
        "SELECT EXTRACT(DAY FROM DATE '2013-12-25') AS the_day FROM table1"
      ]
    },
    {
      title: 'select regex extract function with args',
      sql: [
        'SELECT REGEXP_EXTRACT(CAST(date AS String), r"^[0-9]+") AS regexp FROM table1',
        'SELECT REGEXP_EXTRACT(CAST(date AS STRING), r"^[0-9]+") AS regexp FROM table1'
      ]
    },
    {
      title: 'select regex substr function with args',
      sql: [
        'SELECT REGEXP_SUBSTR(CAST(date AS String), r"^[0-9]+", 2, 10) AS regexp FROM table1',
        'SELECT REGEXP_SUBSTR(CAST(date AS STRING), r"^[0-9]+", 2, 10) AS regexp FROM table1'
      ]
    },
    {
      title: 'select with timestamp prefix',
      sql: [
        `SELECT
        DATETIME(2008, 12, 25, 05, 30, 00) as datetime_ymdhms,
        DATETIME(TIMESTAMP "2008-12-25 05:30:00+00", "America/Los_Angeles") as datetime_tstz;`,
        "SELECT DATETIME(2008, 12, 25, 5, 30, 0) AS datetime_ymdhms, DATETIME(TIMESTAMP '2008-12-25 05:30:00+00', 'America/Los_Angeles') AS datetime_tstz"
      ]
    },
    {
      title: 'select with datetime prefix',
      sql: [
        `SELECT
        DATETIME "2008-12-25 15:30:00" as original_date,
        DATETIME_ADD(DATETIME "2008-12-25 15:30:00", INTERVAL 10 MINUTE) as later;`,
        "SELECT DATETIME '2008-12-25 15:30:00' AS original_date, DATETIME_ADD(DATETIME '2008-12-25 15:30:00', INTERVAL 10 MINUTE) AS later"
      ]
    },
    {
      title: 'select with datetime_diff',
      sql: [
        `SELECT
        DATETIME "2010-07-07 10:20:00" as first_datetime,
        DATETIME "2008-12-25 15:30:00" as second_datetime,
        DATETIME_DIFF(DATETIME "2010-07-07 10:20:00",
          DATETIME "2008-12-25 15:30:00", DAY) as difference;`,
        "SELECT DATETIME '2010-07-07 10:20:00' AS first_datetime, DATETIME '2008-12-25 15:30:00' AS second_datetime, DATETIME_DIFF(DATETIME '2010-07-07 10:20:00', DATETIME '2008-12-25 15:30:00', DAY) AS difference"
      ]
    },
    {
      title: 'select with row_number',
      sql: [
        `select ROW_NUMBER() OVER(PARTITION BY column1 ORDER BY column2)`,
        "SELECT ROW_NUMBER() OVER (PARTITION BY column1 ORDER BY column2 ASC)"
      ]
    },
    {
      title: 'select as backticks_quoted_ident',
      sql: [
        'select 1 as `from`',
        'SELECT 1 AS `from`'
      ]
    },
    {
      title: 'select from with',
      sql: [
        `SELECT * FROM (
          WITH temp AS (
              SELECT * FROM test
          )
          SELECT * FROM temp
      )`,
        'SELECT * FROM (WITH temp AS (SELECT * FROM test) SELECT * FROM temp)'
      ]
    },
    {
      title: 'select from unnest item',
      sql: [
        `SELECT *
        FROM product.organization, unnest(array[1,2])
        LIMIT 10`,
        'SELECT * FROM product.organization, UNNEST(ARRAY[1, 2]) LIMIT 10'
      ]
    },
    {
      title: 'strikethrough in tablename',
      sql: [
        'SELECT previous_block FROM raintank-dev.bitcoin_blockchain.blocks LIMIT 1',
        'SELECT previous_block FROM raintank-dev.bitcoin_blockchain.blocks LIMIT 1'
      ]
    },
    {
      title: 'over window spec',
      sql: [
        `select
        date_week,
        avg(nb_users) over (
          order by date_week
          rows between 3 preceding and current row
      ) as nb_users_ma
      from active_users_per_week`,
        'SELECT date_week, AVG(nb_users) OVER (ORDER BY date_week ASC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) AS nb_users_ma FROM active_users_per_week'
      ]
    },
    {
      title: 'session user',
      sql:[
        'select session_user()',
        'SELECT SESSION_USER()'
      ]
    },
    {
      title: 'from pivot operator',
      sql:[
        "SELECT sales, quarter FROM Produce PIVOT(sum(sales) FOR quarter IN ('Q1', 'Q2', 'Q3', 'Q4'))",
        "SELECT sales, quarter FROM Produce PIVOT(SUM(sales) FOR quarter IN ('Q1', 'Q2', 'Q3', 'Q4'))"
      ]
    },
    {
      title: 'from pivot operator with as',
      sql:[
        "SELECT sales, quarter FROM Produce PIVOT(sum(sales) FOR quarter IN ('Q1', 'Q2', 'Q3', 'Q4')) as abc",
        "SELECT sales, quarter FROM Produce PIVOT(SUM(sales) FOR quarter IN ('Q1', 'Q2', 'Q3', 'Q4')) AS abc"
      ]
    },
    {
      title: 'select distinct parentheses',
      sql:[
        `select count (
          distinct (
            case
              when order_purchase_timestamp between '2018-01-01' and '2018-12-31' then order_id
            end
          )
        ) as nb_orders
        from retail.orders`,
        "SELECT COUNT(DISTINCT(CASE WHEN order_purchase_timestamp BETWEEN '2018-01-01' AND '2018-12-31' THEN order_id END)) AS nb_orders FROM retail.orders"
      ]
    },
    {
      title: 'select column and star',
      sql: [
        'select row_number() over(), * from retail.orders',
        'SELECT row_number() OVER (), * FROM retail.orders'
      ]
    },
    {
      title: 'function name with more dot',
      sql: [
        'SELECT bqutil.fn.degrees(3.141592653589793) is_this_pi',
        'SELECT bqutil.fn.degrees(3.141592653589793) AS is_this_pi'
      ]
    },
    {
      title: 'extract date',
      sql:[
        `SELECT
        CONCAT('transaction ',transaction_id,' from ',
        EXTRACT(date from TIMESTAMP_SECONDS(CAST(CAST(event_timestamp AS INT64)/1000000 AS INT64))))
      FROM
        transactions`,
        "SELECT CONCAT('transaction ', transaction_id, ' from ', EXTRACT(DATE FROM TIMESTAMP_SECONDS(CAST(CAST(event_timestamp AS INT64) / 1000000 AS INT64)))) FROM transactions"
      ]
    },
    {
      title: 'schema table and column',
      sql: [
        'SELECT * FROM t LEFT JOIN e ON (t.a = e.x.y)',
        'SELECT * FROM t LEFT JOIN e ON (t.a = e.x.y)'
      ]
    },
    {
      title: 'schema table and nested column fields',
      sql: [
        'SELECT * FROM t LEFT JOIN e ON (t.a = e.x.y.z.b.c)',
        'SELECT * FROM t LEFT JOIN e ON (t.a = e.x.y.z.b.c)'
      ]
    },
    {
      title: 'extract time',
      sql: [
        'SELECT extract(time from ts) FROM events',
        'SELECT EXTRACT(TIME FROM ts) FROM events'
      ]
    },
    {
      title: 'key as column name',
      sql: [
        'select key from x',
        'SELECT key FROM x',
      ]
    },
    {
      title: 'or operator in column',
      sql: [
        `SELECT
        a OR b
      FROM
        ds.tbl`,
        'SELECT a OR b FROM ds.tbl',
      ]
    },
    {
      title: 'right as function name',
      sql: [
        "select right('lorem ipsum', 2)",
        "SELECT right('lorem ipsum', 2)"
      ]
    },
    {
      title: 'extract function',
      sql: [
        'select extract(year from current_date())',
        'SELECT EXTRACT(YEAR FROM CURRENT_DATE())'
      ]
    },
    {
      title: 'and preceding after between in over clause',
      sql: [
        'SELECT MAX(amount) OVER (ORDER BY invoice_date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND 3 PRECEDING) FROM invoice',
        'SELECT MAX(amount) OVER (ORDER BY invoice_date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND 3 PRECEDING) FROM invoice',
      ]
    },
    {
      title: 'multiple statement',
      sql: [
        'select abc from table1; select def from table2',
        'SELECT abc FROM table1 ; SELECT def FROM table2'
      ]
    },
    {
      title: 'current date time without parentheses',
      sql: [
        'select current_date',
        'SELECT CURRENT_DATE'
      ]
    },
    {
      title: 'count distinct case when without parentheses',
      sql: [
        `SELECT
        COUNT(
          DISTINCT CASE WHEN active IS TRUE THEN id END
        ) AS nb_active
      FROM
        dataset.users`,
        'SELECT COUNT(DISTINCT CASE WHEN active IS TRUE THEN id END) AS nb_active FROM dataset.users'
      ]
    },
    {
      title: 'qualify clause',
      sql: [
        `SELECT
          item,
          RANK() OVER (PARTITION BY category ORDER BY purchases DESC) as rank
        FROM Produce
        WHERE Produce.category = 'vegetable'
        QUALIFY rank <= 3`,
        "SELECT item, RANK() OVER (PARTITION BY category ORDER BY purchases DESC) AS rank FROM Produce WHERE Produce.category = 'vegetable' QUALIFY rank <= 3"
      ]
    },
    {
      title: 'keyword in table name',
      sql: [
        'select * from a_dataset.table',
        'SELECT * FROM a_dataset.table'
      ]
    },
    {
      title: 'keyword in with clause table name',
      sql: [
        `with table as (
          select *
          from unnest(array[1, 2])
      )
      select * from table`,
        'WITH table AS (SELECT * FROM UNNEST(ARRAY[1, 2])) SELECT * FROM table'
      ]
    },
    {
      title: 'keyword in column',
      sql: [
        "SELECT * FROM shop.clothes WHERE type = 'shoe'",
        "SELECT * FROM shop.clothes WHERE type = 'shoe'"
      ]
    },
    {
      title: 'alias clause using keyword',
      sql: [
        "select 'hello' as session",
        "SELECT 'hello' AS session",
      ]
    },
    {
      title: 'unset parameter using @',
      sql: [
        'select * from unnest(@whatever)',
        'SELECT * FROM UNNEST(@whatever)'
      ]
    },
    {
      title: 'count distinct',
      sql: [
        'select count(distinct id || name) from product.organization',
        'SELECT COUNT(DISTINCT id || name) FROM product.organization'
      ]
    },
    {
      title: 'integer type',
      sql: [
        "select cast ('2' as integer)",
        "SELECT CAST('2' AS INTEGER)"
      ],
    },
    {
      title: 'data_trunc function column',
      sql: [
        'SELECT DATE_TRUNC(my_date, YEAR)',
        'SELECT DATE_TRUNC(my_date, YEAR)'
      ],
    },
    {
      title: 'safe cast',
      sql: [
        'SELECT SAFE_CAST(1 AS STRING)',
        'SELECT SAFE_CAST(1 AS STRING)'
      ],
    },
    {
      title: 'extract timestamp',
      sql: [
        'select extract(year from timestamp)',
        'SELECT EXTRACT(YEAR FROM timestamp)',
      ]
    },
    {
      title: 'in unset expr',
      sql: [
        'select a from x where a in unnest(:param)',
        'SELECT a FROM x WHERE a IN UNNEST(:param)'
      ],
    },
    {
      title: 'logical operator in where clause',
      sql: [
        `select *
        from
            unnest([ ('a'), ('b'), ('c'), ('ab')]) as col
        where col = 'a' || 'b'`,
        "SELECT * FROM UNNEST([('a'), ('b'), ('c'), ('ab')]) AS col WHERE col = 'a' || 'b'"
      ]
    },
    {
      title: 'any_value function',
      sql: [
        'SELECT ANY_VALUE(x having max y)',
        'SELECT ANY_VALUE(x HAVING MAX y)'
      ]
    },
    {
      title: 'any_value function with over',
      sql: [
        'SELECT ANY_VALUE(x) OVER (PARTITION BY column1 ORDER BY column2 ASC)',
        'SELECT ANY_VALUE(x) OVER (PARTITION BY column1 ORDER BY column2 ASC)'
      ]
    },
    {
      title: 'preserving double parenthesis',
      sql: [
        'SELECT COUNT(( SELECT x))',
        'SELECT COUNT((SELECT x))'
      ]
    },
    {
      title: 'interval isoyear',
      sql: [
        'SELECT DATE_TRUNC(CURRENT_DATE(), INTERVAL 1 ISOYEAR)',
        'SELECT DATE_TRUNC(CURRENT_DATE(), INTERVAL 1 ISOYEAR)'
      ]
    },
    {
      title: 'extract field',
      sql: [
        'SELECT TIMESTAMP(DATE_SUB(CURRENT_DATETIME(), INTERVAL EXTRACT(DAYOFWEEK FROM CURRENT_DATETIME())-1 DAY))',
        'SELECT TIMESTAMP(DATE_SUB(CURRENT_DATETIME(), INTERVAL EXTRACT(DAYOFWEEK FROM CURRENT_DATETIME()) - 1 DAY))'
      ]
    },
    {
      title: 'create table',
      sql: [
        'CREATE TABLE mydataset.newtable ( x INT64 );',
        'CREATE TABLE mydataset.newtable (x INT64)'
      ]
    },
    {
      title: 'create table with multiple options',
      sql: [
        `CREATE OR REPLACE TEMP TABLE
        table1
      DEFAULT COLLATE 'und:ci'
      PARTITION BY
        DATE(event_time)
      CLUSTER BY
        id
      OPTIONS (
        require_partition_filter = TRUE
      )
      AS
      SELECT
        table2.id,
        table2.value,
        table2.event_time
      FROM
        table2;`,
        "CREATE OR REPLACE TEMP TABLE table1 DEFAULT COLLATE 'und:ci' PARTITION BY DATE(event_time) CLUSTER BY id OPTIONS (require_partition_filter = TRUE) AS SELECT table2.id, table2.value, table2.event_time FROM table2"
      ]
    },
    {
      title: 'string_agg function',
      sql: [
        'SELECT string_agg(DISTINCT column1) as some_column1, string_agg(column2) as some_column1 from table1',
        'SELECT string_agg(DISTINCT column1) AS some_column1, string_agg(column2) AS some_column1 FROM table1'
      ]
    },
    {
      title: 'if multiple parentheses',
      sql: [
        'select if(((a)), b, null)',
        'SELECT if(((a)), b, NULL)'
      ]
    },
    {
      title: 'offset column with dot',
      sql: [
        `WITH your_table AS (
          SELECT [STRUCT(1 AS id, 'John' AS name), STRUCT(2 AS id, 'Jane' AS name)] AS some_array_column
        )
        SELECT some_array_column[SAFE_OFFSET(0)].id from your_table where 1=1 and check_run.pull_requests[SAFE_OFFSET(0)].number = 6097 and check_run.status = 'completed' and check_run.output.title IS NOT NULL AND check_run.pull_requests[SAFE_OFFSET(0)].id is not null`,
        "WITH your_table AS (SELECT [STRUCT(1 AS id, 'John' AS name), STRUCT(2 AS id, 'Jane' AS name)] AS some_array_column) SELECT some_array_column[SAFE_OFFSET(0)].id FROM your_table WHERE 1 = 1 AND check_run.pull_requests[SAFE_OFFSET(0)].number = 6097 AND check_run.status = 'completed' AND check_run.output.title IS NOT NULL AND check_run.pull_requests[SAFE_OFFSET(0)].id IS NOT NULL"
      ]
    },
    {
      title: 'json expr',
      sql: [
        `SELECT json_value.class.students[0]['name'] AS first_student
        FROM
          UNNEST(
            [
              JSON '{"class" : {"students" : [{"name" : "Jane"}]}}',
              JSON '{"class" : {"students" : []}}',
              JSON '{"class" : {"students" : [{"name" : "John"}, {"name": "Jamie"}]}}'])
        AS json_value`,
        `SELECT json_value.class.students[0]['name'] AS first_student FROM UNNEST([JSON '{"class" : {"students" : [{"name" : "Jane"}]}}', JSON '{"class" : {"students" : []}}', JSON '{"class" : {"students" : [{"name" : "John"}, {"name": "Jamie"}]}}']) AS json_value`
      ]
    }
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

  it('should support schema in bigquery from clause', () => {
    const catalog = 'project'
    const schema = 'retail'
    const table = 'customers'
    const sql = `select * from ${catalog}.${schema}.${table} limit 3`
    const ast = parser.astify(sql, opt)
    const fromClause = ast.from[0]
    expect(fromClause.catalog).to.be.equal(catalog)
    expect(fromClause.db).to.be.equal(catalog)
    expect(fromClause.schema).to.be.equal(schema)
    expect(fromClause.table).to.be.equal(table)
    expect(parser.sqlify(ast, opt)).to.be.equal('SELECT * FROM project.retail.customers LIMIT 3')
  })

  it('should return empty column list for extract column only', () => {
    const sql = "SELECT EXTRACT(DAY FROM DATE '2013-12-25') as the_day FROM table1;"
    const { columnList } = parser.parse(sql, opt)
    expect(columnList).to.be.eql([])
  })

  it(SQL_LIST[16].title, () => {
    const ast = parser.astify(SQL_LIST[16].sql[0], opt)
    const expr = ast[0].from[0].expr
    expr.parentheses = false
    expr.expr_list = {
      type: 'string',
      value: 'abc'
    }
    expect(arrayStructValueToSQL(expr)).to.equal(`['${expr.expr_list.value}']`)
    expr.brackets = false
    expr.parentheses = false
    expect(arrayStructValueToSQL(expr)).to.equal(`'${expr.expr_list.value}'`)
  })

  it('should return undefined and dataType', () => {
    expect(arrayStructTypeToSQL()).to.equal(undefined)
    expect(arrayStructTypeToSQL({ dataType: 'array' })).to.equal('ARRAY undefined')
  })

  it('should support record type access', () => {
    const sql = 'select a.b.c.d.e.f from a'
    const ast = parser.astify(sql, opt)
    const column = {
      expr: {
        type: 'column_ref',
        table: 'a',
        column: 'b',
        subFields: [
          'c',
          'd',
          'e',
          'f'
        ]
      },
      as: null
    }
    expect(ast.columns[0]).to.eql(column)
  })

  it('should get the correct column list', () => {
    let sql = 'SELECT EXTRACT(ISOWEEK FROM mydate)'
    let ast = parser.parse(sql, opt)
    expect(ast.columnList).to.be.eql(['select::null::mydate'])
    sql = 'SELECT DATE_TRUNC(my_date, YEAR)'
    ast = parser.parse(sql, opt)
    expect(ast.columnList).to.be.eql(['select::null::my_date'])
  })
})
