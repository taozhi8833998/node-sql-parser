const { expect } = require('chai')
const { conflictToSQL } = require('../src/insert')
const { procToSQL } = require('../src/proc')
const Parser = require('../src/parser').default

describe('Postgres', () => {
  const parser = new Parser();
  const opt = {
    database: 'postgresql'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: 'select with_query_name',
      sql: [
        `WITH
        subQ1 AS (SELECT * FROM Roster WHERE SchoolID = 52),
        subQ2 AS (SELECT SchoolID FROM subQ1)
      SELECT DISTINCT * FROM subQ2;`,
      `WITH "subQ1" AS (SELECT * FROM "Roster" WHERE SchoolID = 52), "subQ2" AS (SELECT SchoolID FROM "subQ1") SELECT DISTINCT * FROM "subQ2"`
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
        'SELECT AVG(PointsScored) FROM (SELECT PointsScored FROM "Stats" WHERE SchoolID = 77)'
      ]
    },
    {
      title: 'select subquery have alias',
      sql: [
        `SELECT r.LastName
        FROM
        ( SELECT * FROM Roster) AS r`,
        'SELECT "r".LastName FROM (SELECT * FROM "Roster") AS "r"'
      ]
    },
    {
      title: 'select implicit "comma cross join"',
      sql: [
        'SELECT * FROM Roster, TeamMascot',
        'SELECT * FROM "Roster", "TeamMascot"'
      ]
    },
    {
      title: 'select inner join using',
      sql: [
        `SELECT FirstName
        FROM Roster INNER JOIN PlayerStats
        USING (LastName);`,
        'SELECT FirstName FROM "Roster" INNER JOIN "PlayerStats" USING ("LastName")'
      ]
    },
    {
      title: 'set op UNION',
      sql: [
        `(SELECT s FROM t1) UNION (SELECT s FROM t2)`,
        '(SELECT s FROM "t1") UNION (SELECT s FROM "t2")',
      ],
    },
    {
      title: 'set op UNION ALL',
      sql: [
        `(SELECT s FROM t1) UNION ALL (SELECT s FROM t2)`,
        '(SELECT s FROM "t1") UNION ALL (SELECT s FROM "t2")',
      ],
    },
    {
      title: 'set op UNION DISTINCT',
      sql: [
        `(SELECT s FROM t1) UNION DISTINCT (SELECT s FROM t2)`,
        '(SELECT s FROM "t1") UNION DISTINCT (SELECT s FROM "t2")',
      ],
    },
    {
        title: 'Window Fns with qualified frame clause',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at DESC) AS age_window
          FROM roster`,
          'SELECT first_name, SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at DESC) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at) AS age_window
          FROM roster`,
          'SELECT first_name, SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS following',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at ASC
                ROWS 1 FOLLOWING
            ) AS age_window
          FROM roster`,
          'SELECT first_name, SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at ASC ROWS 1 FOLLOWING) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS unbounded following',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ROWS UNbounded FOLLOWING
            ) AS age_window
          FROM roster`,
          'SELECT first_name, SUM(user_age) OVER (PARTITION BY user_city ROWS UNBOUNDED FOLLOWING) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS unbounded preceding',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at ASC
                ROWS UNbounded preceding
            ) AS age_window
          FROM roster`,
          'SELECT first_name, SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at ASC ROWS UNBOUNDED PRECEDING) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS between',
        sql: [
          `SELECT
            "first_name",
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at DESC
                ROWS BETWEEN 1 preceding AND 5 FOLLOWING
            ) AS age_window,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at DESC
                ROWS BETWEEN unbounded preceding AND unbounded following
            ) AS age_window2
          FROM roster`,
          'SELECT "first_name", SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at DESC ROWS BETWEEN 1 PRECEDING AND 5 FOLLOWING) AS "age_window", SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS "age_window2" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS unbounded preceding + current row',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at, user_id ASC
                ROWS BETWEEN UNbounded preceding AND CURRENT ROW
            ) AS age_window
          FROM roster`,
          'SELECT first_name, SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at ASC, user_id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + RANKING',
        sql: [
          `SELECT
            ROW_NUMBER() OVER (
                PARTITION BY user_city
                ORDER BY created_at
            ) AS age_window
          FROM roster`,
          'SELECT ROW_NUMBER() OVER (PARTITION BY user_city ORDER BY created_at ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + DENSE_RANK w/ empty OVER',
        sql: [
          `SELECT
            DENSE_RANK() OVER () AS age_window
          FROM roster`,
          'SELECT DENSE_RANK() OVER () AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + LAG',
        sql: [
          `SELECT
            LAG(user_name, 10) OVER (
                PARTITION BY user_city
                ORDER BY created_at
            ) AS age_window
          FROM roster`,
          'SELECT LAG(user_name, 10) OVER (PARTITION BY user_city ORDER BY created_at ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
      title: 'Window Fns + LEAD',
      sql: [
        `SELECT
          LEAD("user_name", 10) OVER (
              PARTITION BY user_city
              ORDER BY "created_at"
          ) AS age_window
        FROM roster`,
        'SELECT LEAD("user_name", 10) OVER (PARTITION BY user_city ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
      ]
    },
    {
      title: 'Window Fns + NTH_VALUE',
      sql: [
        `SELECT
        NTH_VALUE(user_name, 10) OVER (
              PARTITION BY user_city
              ORDER BY created_at
          ) AS age_window
        FROM roster`,
        'SELECT NTH_VALUE(user_name, 10) OVER (PARTITION BY user_city ORDER BY created_at ASC) AS "age_window" FROM "roster"'
      ]
    },
    {
        title: 'Window Fns + LAG + explicit NULLS',
        sql: [
          `SELECT
            LAG(user_name) ignore NULLS OVER (
                PARTITION BY user_city
                ORDER BY created_at
            ) AS age_window
          FROM roster`,
          'SELECT LAG(user_name) IGNORE NULLS OVER (PARTITION BY user_city ORDER BY created_at ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + FIRST_VALUE',
        sql: [
          `SELECT
            FIRST_VALUE(user_name ignore NULLS) OVER (
                PARTITION BY user_city
                ORDER BY created_at, ranking
            ) AS age_window
          FROM roster`,
          'SELECT FIRST_VALUE(user_name IGNORE NULLS) OVER (PARTITION BY user_city ORDER BY created_at ASC, ranking ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
      title: 'array column',
      sql: [
        "SELECT ARRAY[col1, col2, 1, 'str_literal'] from tableb",
        `SELECT ARRAY[col1,col2,1,'str_literal'] FROM "tableb"`
      ]
    },
    {
      title: 'array column index',
      sql: [
        "select (array['a', 'b', 'c'])[2]",
        `SELECT (ARRAY['a','b','c'])[2]`
      ]
    },
    {
      title: 'array cast column index',
      sql: [
        "select ('{a, b, c}'::text[])[2]",
        `SELECT ('{a, b, c}'::TEXT[])[2]`
      ]
    },
    {
      title: 'column array index',
      sql: [
        `with t as (
          select array['a', 'b', 'c'] as a
        )
        select a[2]
        from t`,
        `WITH "t" AS (SELECT ARRAY['a','b','c'] AS "a") SELECT a[2] FROM "t"`
      ]
    },
    {
      title: 'row function column',
      sql: [
        "SELECT ROW(col1, col2, 'literal', 1) from tableb",
        `SELECT ROW(col1, col2, 'literal', 1) FROM "tableb"`
      ]
    },
    {
      title: 'json column',
      sql: [
        `SELECT
        d.metadata->>'communication_status' as communication_status
      FROM
        device d
      WHERE d.metadata->>'communication_status' IS NOT NULL
      LIMIT 10;`,
        `SELECT "d".metadata ->> 'communication_status' AS "communication_status" FROM "device" AS "d" WHERE "d".metadata ->> 'communication_status' IS NOT NULL LIMIT 10`
      ]
    },
    {
      title: 'case when in pg',
      sql: [
        `SELECT SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) FROM tablename`,
        `SELECT SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) FROM "tablename"`
      ]
    },
    {
      title: 'case when multiple condition in pg',
      sql: [
        `select case
        when
          ee.start_time <= current_timestamp
          and ee.end_time > current_timestamp
        then
          true
        else
          false
        end
          is_live,
          is_upcoming from abc`,
        `SELECT CASE WHEN "ee".start_time <= CURRENT_TIMESTAMP AND "ee".end_time > CURRENT_TIMESTAMP THEN TRUE ELSE FALSE END AS "is_live", is_upcoming FROM "abc"`
      ]
    },
    {
      title: 'key keyword in pg',
      sql: [
        `SELECT * FROM partitions WHERE location IS NULL AND code like 'XX-%' AND key <> 1;`,
        `SELECT * FROM "partitions" WHERE location IS NULL AND code LIKE 'XX-%' AND key <> 1`
      ]
    },
    {
      title: 'a multi-line single-quoted string',
      sql: [
        `SELECT 'Hello '
            'world!' AS x;`,
        `SELECT 'Hello world!' AS "x"`
      ]
    },
    {
      title: 'left join',
      sql: [
        `select
        person.first_name,
        department.dept_name
      from
        person
      left join department on person.dept_id = department.dept_id`,
        'SELECT "person".first_name, "department".dept_name FROM "person" LEFT JOIN "department" ON "person".dept_id = "department".dept_id'
      ]
    },
    {
      title: 'create table with serial',
      sql: [
        `create table posts(id serial primary key, name varchar(128))`,
        `CREATE TABLE "posts" (id SERIAL PRIMARY KEY, name VARCHAR(128))`
      ]
    },
    {
      title: 'cast to interval',
      sql: [
        `select '1 week'::interval`,
        `SELECT '1 week'::INTERVAL`
      ]
    },
    {
      title: 'with clause support double quote',
      sql: [
        `with "cte name" as (
          select 1
        )
        select * from "cte name"`,
        `WITH "cte name" AS (SELECT 1) SELECT * FROM "cte name"`
      ]
    },
    {
      title: 'select from values as',
      sql: [
        `select *
        from (values (0, 0), (1, null), (null, 2), (3, 4)) as t(a,b)
        where a is distinct from "b"`,
        `SELECT * FROM (VALUES (0,0), (1,NULL), (NULL,2), (3,4)) AS "t(a, b)" WHERE a IS DISTINCT FROM "b"`
      ]
    },
    {
      title: 'select from values as without parentheses',
      sql: [
        `select last(col) FROM VALUES(10),(5),(20) AS tab(col)`,
        `SELECT last(col) FROM VALUES (10), (5), (20) AS "tab(col)"`
      ]
    },
    {
      title: 'aggr_fun percentile_cont',
      sql: [
        `select percentile_cont(0.25) within group (order by a asc) as p25
        from (values (0),(0),(1),(2),(3),(4)) as t(a)`,
        `SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY a ASC) AS "p25" FROM (VALUES (0), (0), (1), (2), (3), (4)) AS "t(a)"`
      ]
    },
    {
      title: 'aggr_fun percentile_cont with array args',
      sql: [
        `select percentile_cont(array[0.5, 1]) within group (order by a asc) as p25
        from (values (0),(0),(1),(2),(3),(4)) as t(a)`,
        `SELECT PERCENTILE_CONT(ARRAY[0.5,1]) WITHIN GROUP (ORDER BY a ASC) AS "p25" FROM (VALUES (0), (0), (1), (2), (3), (4)) AS "t(a)"`
      ]
    },
    {
      title: 'aggr_fun mode',
      sql: [
        `select mode() within group (order by a asc) as p25
        from (values (0),(0),(1),(2),(3),(4)) as t(a)`,
        `SELECT MODE() WITHIN GROUP (ORDER BY a ASC) AS "p25" FROM (VALUES (0), (0), (1), (2), (3), (4)) AS "t(a)"`
      ]
    },
    {
      title: 'similar to keyword in pg',
      sql: [
        `select name similar to 'John%' from (values ('John Doe'),('Jane Doe'),('Bob John')) as t(name)`,
        `SELECT name SIMILAR TO 'John%' FROM (VALUES ('John Doe'), ('Jane Doe'), ('Bob John')) AS "t(name)"`
      ]
    },
    {
      title: 'show tables',
      sql: [
        `show tables`,
        `SHOW TABLES`
      ]
    },
    {
      title: 'String Constants',
      sql: [
        `select ''''`,
        `SELECT ''''`
      ]
    },
    {
      title: 'String Constants',
      sql: [
        `SELECT '''To be, or not'', it starts.' AS x;`,
        `SELECT '''To be, or not'', it starts.' AS "x"`
      ]
    },
    {
      title: 'String Constants',
      sql: [
        `SELECT 'foo'
        'bar';`,
        `SELECT 'foobar'`
      ]
    },
    {
      title: 'String Constants with C-Style Escapes',
      sql: [
        `SELECT E'\\''`,
        `SELECT E'\\''`
      ]
    },
    {
      title: 'schema prefix',
      sql: [
        `SELECT "public"."Property"."id",
          "public"."Property"."title",
          "public"."Property"."description",
          "public"."Property"."views",
          "public"."Property"."saves",
          "public"."Property"."postcode",
          "public"."Property"."createdAt"
        FROM "public"."Property"
        WHERE 1 = 1
        ORDER BY "public"."Property"."createdAt"`,
        `SELECT "public"."Property"."id", "public"."Property"."title", "public"."Property"."description", "public"."Property"."views", "public"."Property"."saves", "public"."Property"."postcode", "public"."Property"."createdAt" FROM "public"."Property" WHERE 1 = 1 ORDER BY "public"."Property"."createdAt" ASC`
      ]
    },
    {
      title: 'cast to datatype array',
      sql: [
        "select '{1,2,3}'::int[]",
        "SELECT '{1,2,3}'::INT[]"
      ]
    },
    {
      title: 'cast to datatype two dimension array',
      sql: [
        "select '{{1,2},{2,3},{3,4}}'::int[][]",
        "SELECT '{{1,2},{2,3},{3,4}}'::INT[][]"
      ]
    },
    {
      title: 'a newline before cast symbol',
      sql: [
        `select round(0.598736
          ::numeric, 2)`,
        "SELECT round(0.598736::NUMERIC, 2)"
      ]
    },
    {
      title: 'access array index in func parameter',
      sql: [
        'select round(arr[1])',
        'SELECT round(arr[1])'
      ]
    },
    {
      title: 'access array index in where clause',
      sql: [
        'SELECT * FROM a INNER JOIN b ON c = d[1]',
        'SELECT * FROM "a" INNER JOIN "b" ON c = d[1]'
      ]
    },
    {
      title: 'distinct on',
      sql: [
        'SELECT DISTINCT ON (a, b) a, b, c FROM tbl',
        'SELECT DISTINCT ON (a, b) a, b, c FROM "tbl"'
      ]
    },
    {
      title: 'select current_date only',
      sql: [
        'select current_date',
        'SELECT CURRENT_DATE'
      ]
    },
    {
      title: 'window function',
      sql: [
        `SELECT sum(salary) OVER w, avg(salary) OVER w
        FROM empsalary
        WINDOW w AS (PARTITION BY depname ORDER BY salary DESC);`,
        'SELECT SUM(salary) OVER w, AVG(salary) OVER w FROM "empsalary" WINDOW w AS (PARTITION BY depname ORDER BY salary DESC)'
      ]
    },
    {
      title: '$ field id with parameters',
      sql: [
        'SELECT * FROM tablea WHERE comment_id = $<3>;',
        'SELECT * FROM "tablea" WHERE comment_id = $<3>'
      ]
    },
    {
      title: 'cast with binary expr',
      sql: [
        'select (3-2)::float / (2 * 123) + 111',
        'SELECT (3 - 2)::FLOAT / (2 * 123) + 111'
      ]
    },
    {
      title: 'cast with binary expr and cast',
      sql: [
        'select (2)::float/(3)::float',
        'SELECT (2)::FLOAT / (3)::FLOAT'
      ]
    },
    {
      title: 'on expr with and',
      sql: [
        `select *
        from organization
        JOIN payment ON organization.id = payment.organization_id and createdat = month`,
        'SELECT * FROM "organization" INNER JOIN "payment" ON "organization".id = "payment".organization_id AND createdat = month'
      ]
    },
    {
      title: 'support tablesample',
      sql: [
        'select * from product.organization tablesample bernoulli(1)',
        'SELECT * FROM "product"."organization" TABLESAMPLE bernoulli(1)'
      ]
    },
    {
      title: 'support on clause with function and expr',
      sql: [
        `select * from pg_database a
        join pg_database b
        on a.oid = b.oid AND upper(a.datctype) = upper(b.datctype)`,
        'SELECT * FROM "pg_database" AS "a" INNER JOIN "pg_database" AS "b" ON "a".oid = "b".oid AND upper("a".datctype) = upper("b".datctype)'
      ]
    },
    {
      title: 'support trim function',
      sql: [
        `SELECT TRIM('.' from '....test.....') AS TrimmedString;`,
        `SELECT TRIM('.' FROM '....test.....') AS "TrimmedString"`
      ]
    },
    {
      title: 'from values without as',
      sql: [
        `with statuses as (
          select a
          from (
            values ('Closed'), ('Verified'), ('Done')
          ) s(a)
        ) select * from statuses`,
        `WITH "statuses" AS (SELECT a FROM (VALUES ('Closed'), ('Verified'), ('Done')) AS "s(a)") SELECT * FROM "statuses"`
      ]
    },
    {
      title: 'double dollar-quoted string',
      sql: [
        'SELECT $$foo bar$$;',
        'SELECT $$foo bar$$'
      ]
    },
    {
      title: 'single dollar-quoted string',
      sql: [
        "select $SomeTag$Dianne's horse$SomeTag$",
        "SELECT $SomeTag$Dianne's horse$SomeTag$"
      ]
    },
    {
      title: 'nested block comments',
      sql: [
        "select /* /* */ */ col from tbl",
        'SELECT col FROM "tbl"'
      ]
    },
    {
      title: 'select into',
      sql: [
        "select c1, c2 into t1 from t2",
        'SELECT c1, c2 INTO "t1" FROM "t2"'
      ]
    },
    {
      title: 'select;',
      sql: [
        "select;",
        'SELECT'
      ]
    },
    {
      title: 'with insert',
      sql: [
        `CREATE TABLE stuff(id SERIAL PRIMARY KEY, name VARCHAR);

        WITH new_stuff AS (
            INSERT INTO stuff (name) VALUES ('foo'), ('bar') RETURNING id
        )
        SELECT id
        FROM new_stuff;`,
        `CREATE TABLE "stuff" (id SERIAL PRIMARY KEY, name VARCHAR) ; WITH "new_stuff" AS (INSERT INTO "stuff" (name) VALUES ('foo'), ('bar') RETURNING id) SELECT id FROM "new_stuff"`
      ]
    },
    {
      title: 'offset without limit',
      sql: [
        'select c1 from t1 offset 11',
        'SELECT c1 FROM "t1" OFFSET 11'
      ]
    },
    {
      title: 'support empty space after ::',
      sql: [
        'SELECT (COALESCE(wp.weight,  0))::double(10) as net_weight , wp.gross_weight:: double(10) FROM  wp ;',
        'SELECT (COALESCE("wp".weight, 0))::DOUBLE(10) AS "net_weight", "wp".gross_weight::DOUBLE(10) FROM "wp"'
      ]
    },
    {
      title: 'support nested json traversal',
      sql: [
        "SELECT meta.data->'foo'->'bar' as value FROM meta;",
        `SELECT "meta".data -> 'foo' -> 'bar' AS "value" FROM "meta"`
      ]
    },
    {
      title: 'support nulls first or last after order by',
      sql: [
        'SELECT has_geometry FROM rooms WHERE rooms.index = 200 ORDER BY has_geometry DESC NULLS LAST;',
        'SELECT has_geometry FROM "rooms" WHERE "rooms".index = 200 ORDER BY has_geometry DESC NULLS LAST'
      ]
    },
    {
      title: 'support nulls after order by with default val',
      sql: [
        'SELECT has_geometry FROM rooms WHERE rooms.index = 200 ORDER BY has_geometry ASC NULLS;',
        'SELECT has_geometry FROM "rooms" WHERE "rooms".index = 200 ORDER BY has_geometry ASC NULLS'
      ]
    },
    {
      title: 'support lateral with subquery',
      sql: [
        'SELECT * FROM foo, LATERAL (SELECT * FROM bar WHERE bar.id = foo.bar_id) ss;',
        'SELECT * FROM "foo", LATERAL (SELECT * FROM "bar" WHERE "bar".id = "foo".bar_id) AS "ss"'
      ]
    },
    {
      title: 'support lateral with function',
      sql: [
        `SELECT p1.id, p2.id, v1, v2
        FROM polygons p1, polygons p2,
             LATERAL vertices(p1.poly) v1,
             LATERAL vertices(p2.poly) v2
        WHERE (v1 - v2) < 10 AND p1.id != p2.id;`,
        'SELECT "p1".id, "p2".id, v1, v2 FROM "polygons" AS "p1", "polygons" AS "p2", LATERAL vertices("p1".poly) AS "v1", LATERAL vertices("p2".poly) AS "v2" WHERE (v1 - v2) < 10 AND "p1".id != "p2".id'
      ]
    },
    {
      title: 'support lateral with join',
      sql: [
        `SELECT m.name
        FROM manufacturers m LEFT JOIN LATERAL get_product_names(m.id) pname ON true
        WHERE pname IS NULL;`,
        'SELECT "m".name FROM "manufacturers" AS "m" LEFT JOIN LATERAL get_product_names("m".id) AS "pname" ON TRUE WHERE pname IS NULL'
      ]
    },
    {
      title: 'support escape char patten matching',
      sql: [
        "select c1 from t1 where c2 like 'abc' escape '!'",
        `SELECT c1 FROM "t1" WHERE c2 LIKE 'abc' ESCAPE '!'`
      ]
    },
    {
      title: 'with or without timezone',
      sql: [
        'select cast(c as time with time zone)',
        'SELECT CAST(c AS TIME WITH TIME ZONE)'
      ]
    },
    {
      title: 'with or without timezone',
      sql: [
        'select cast(c as timestamp without time zone)',
        'SELECT CAST(c AS TIMESTAMP WITHOUT TIME ZONE)'
      ]
    },
    {
      title: 'bytea datatype',
      sql: [
        'SELECT \'abc \\153\\154\\155 \\052\\251\\124\'::bytea;',
        "SELECT 'abc \\153\\154\\155 \\052\\251\\124'::BYTEA"
      ]
    },
    {
      title: 'deallocate statement',
      sql: [
        'DEALLOCATE pdo_stmt_1',
        'DEALLOCATE pdo_stmt_1'
      ]
    },
    {
      title: 'deallocate statement with prepare',
      sql: [
        'DEALLOCATE PREPARE ALL',
        'DEALLOCATE PREPARE ALL'
      ]
    },
    {
      title: 'filter after aggregate expression',
      sql: [
        "SELECT date_trunc('month', buy_window) AS month_window, marketplace, SUM(currency_amount_a) FILTER (WHERE currency_symbol_a IN ('REN', 'EUR')) + SUM(currency_amount_b) FILTER (WHERE currency_symbol_b IN ('REN', 'EUR')) as volume FROM currency.forex WHERE buy_window >= to_timestamp(1522540800) GROUP BY project, month",
        `SELECT date_trunc('month', buy_window) AS "month_window", marketplace, SUM(currency_amount_a) FILTER (WHERE currency_symbol_a IN ('REN', 'EUR')) + SUM(currency_amount_b) FILTER (WHERE currency_symbol_b IN ('REN', 'EUR')) AS "volume" FROM "currency"."forex" WHERE buy_window >= to_timestamp(1522540800) GROUP BY project, month`,
      ]
    },
    {
      title: 'decimal without prefix 0',
      sql: [
        `SELECT date_trunc('month', time_window) , SUM(ren) * .999 as ren_normalized FROM currencies."forex" WHERE memory_address = '\x881d40237659c251811cec9c364ef91dc08d300c' GROUP BY 1`,
        `SELECT date_trunc('month', time_window), SUM(ren) * 0.999 AS "ren_normalized" FROM "currencies"."forex" WHERE memory_address = '1d40237659c251811cec9c364ef91dc08d300c' GROUP BY 1`
      ]
    },
    {
      title: 'values as table name',
      sql: [
        `with values as (
          select 1 as value
        )
        select * from values`,
        'WITH "values" AS (SELECT 1 AS "value") SELECT * FROM "values"',
      ]
    },
    {
      title: 'bigserial datatype',
      sql: [
        'create table if not exists "users" ( "id" bigserial, "name" varchar(128) not null, "second_name" varchar(128) default null )',
        'CREATE TABLE IF NOT EXISTS "users" ("id" BIGSERIAL, "name" VARCHAR(128) NOT NULL, "second_name" VARCHAR(128) DEFAULT NULL)',
      ]
    },
    {
      title: 'delete statement',
      sql: [
        'DELETE FROM users WHERE id = 2;',
        'DELETE FROM "users" WHERE id = 2',
      ]
    },
    {
      title: 'column quoted data type',
      sql: [
        `select 'a'::"char" as b;`,
        `SELECT 'a'::"CHAR" AS "b"`
      ]
    },
    {
      title: 'set with quoted string',
      sql: [
        `set "foo.bar" = 'a';`,
        `SET "foo.bar" = 'a'`
      ]
    },
    {
      title: 'show stmt',
      sql: [
        'show "foo.bar";',
        'SHOW "foo.bar"'
      ]
    },
    {
      title: 'create now at time zone',
      sql: [
        `CREATE TABLE IF NOT EXISTS "users" ( "id"           BIGSERIAL PRIMARY KEY, "date_created" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'), "first_name"   VARCHAR(128) NOT NULL );`,
        `CREATE TABLE IF NOT EXISTS "users" ("id" BIGSERIAL PRIMARY KEY, "date_created" TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc'), "first_name" VARCHAR(128) NOT NULL)`
      ]
    },
    {
      title: 'from clause in update',
      sql: [
        `UPDATE t1 SET c1 = 'x' FROM t2 WHERE c3 = t2.c2`,
        `UPDATE "t1" SET c1 = 'x' FROM "t2" WHERE c3 = "t2".c2`,
      ]
    },
    {
      title: 'from clause in update with select',
      sql: [
        `UPDATE t1 SET c1 = 'x' FROM (select c2 from t2) WHERE c3 = c2`,
        `UPDATE "t1" SET c1 = 'x' FROM (SELECT c2 FROM "t2") WHERE c3 = c2`,
      ]
    },
    {
      title: 'drop index',
      sql: [
        'drop index concurrently title_index cascade',
        'DROP INDEX CONCURRENTLY title_index CASCADE'
      ],
    },
    {
      title: 'with clause in update',
      sql: [
        `WITH olds AS (SELECT test_field_1, test_field_2 FROM test_tbl WHERE test_field_1=5)
        UPDATE test_tbl SET test_field_2 ='tested!' WHERE test_field_1=5
        RETURNING (SELECT test_field_1 FROM olds) AS test_field_1_old,
        (SELECT test_field_2 FROM olds) AS test_field_2_old;`,
        `WITH "olds" AS (SELECT test_field_1, test_field_2 FROM "test_tbl" WHERE test_field_1 = 5) UPDATE "test_tbl" SET test_field_2 = 'tested!' WHERE test_field_1 = 5 RETURNING (SELECT test_field_1 FROM "olds") AS "test_field_1_old", (SELECT test_field_2 FROM "olds") AS "test_field_2_old"`
      ]
    },
    {
      title: 'string concatenator in where clause',
      sql: [
        "SELECT * from tests where name = 'test' || 'abc';",
        `SELECT * FROM "tests" WHERE name = 'test' || 'abc'`
      ]
    },
    {
      title: 'alter table add constraint',
      sql: [
        'ALTER TABLE if exists only address ADD CONSTRAINT user_id_address_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE RESTRICT;',
        'ALTER TABLE IF EXISTS ONLY "address" ADD CONSTRAINT "user_id_address_fk" FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE ON UPDATE RESTRICT'
      ]
    },
    {
      title: 'table constructor in join',
      sql: [
        `select last_name, salary, title
        from employees e left join (
            salaries s inner join titles t on s.emp_no = t.emp_no
        ) on e.emp_no = s.emp_no`,
        'SELECT last_name, salary, title FROM "employees" AS "e" LEFT JOIN ("salaries" AS "s" INNER JOIN "titles" AS "t" ON "s".emp_no = "t".emp_no) ON "e".emp_no = "s".emp_no'
      ]
    },
    {
      title: 'table constructor in from',
      sql: [
        `select last_name, salary
        from (
           employees inner join salaries on employees.emp_no = salaries.emp_no
        );`,
        'SELECT last_name, salary FROM ("employees" INNER JOIN "salaries" ON "employees".emp_no = "salaries".emp_no)'
      ]
    },
    {
      title: 'select from scheme.table.column',
      sql: [
        'select public.t1.* from public.t1;',
        'SELECT public.t1.* FROM "public"."t1"'
      ]
    },
    {
      title: 'ntile function',
      sql: [
        `SELECT  name,
        amount,
        NTILE(2) OVER (
            ORDER BY amount
        ) ntile,
        unset(_id)
        FROM function-test-data
        WHERE testId='bugfix.ntile.case1'`,
        `SELECT name, amount, NTILE(2) OVER (ORDER BY amount ASC) AS "ntile", unset(_id) FROM "function-test-data" WHERE testId = 'bugfix.ntile.case1'`
      ]
    },
    {
      title: 'support character data type',
      sql: [
        "SELECT 'x'::character varying;",
        `SELECT 'x'::CHARACTER VARYING`
      ]
    },
    {
      title: 'cast to jsonb and select key',
      sql: [
        "SELECT TextColumn::JSONB->>'name' FROM table1",
        `SELECT TextColumn::JSONB ->> 'name' FROM "table1"`
      ]
    },
    {
      title: 'cast to jsonb and select key in function',
      sql: [
        "SELECT CAST(properties AS JSONB)->>'name' FROM table1",
        `SELECT CAST(properties AS JSONB) ->> 'name' FROM "table1"`
      ]
    },
    {
      title: 'test !~ operator',
      sql: [
        `SELECT * FROM partitions WHERE code !~ xyz;`,
        `SELECT * FROM "partitions" WHERE code !~ xyz`
      ]
    },
    {
      title: 'test ~ operator',
      sql: [
        `SELECT * FROM partitions WHERE code ~ xyz;`,
        `SELECT * FROM "partitions" WHERE code ~ xyz`
      ]
    },
    {
      title: 'insert stmt',
      sql: [
        `insert into table1 (id, firstname, lastname, email)
        values ($id, $firstname, $lastname, $email)
        RETURNING *`,
        'INSERT INTO "table1" (id, firstname, lastname, email) VALUES ($id,$firstname,$lastname,$email) RETURNING *'
      ]
    },
    {
      title: 'insert with on conflict do update',
      sql: [
        `insert into table1 (id, firstname, lastname, email)
        values ($id, $firstname, $lastname, $email)
        on conflict (id)
        do
        update set
        firstname = $firstname,
        lastname = $lastname,
        email = $email,
        updatedon = CURRENT_TIMESTAMP
        RETURNING *`,
        'INSERT INTO "table1" (id, firstname, lastname, email) VALUES ($id,$firstname,$lastname,$email) ON CONFLICT (id) DO UPDATE SET firstname = $firstname, lastname = $lastname, email = $email, updatedon = CURRENT_TIMESTAMP RETURNING *'
      ]
    },
    {
      title: 'insert with on conflict do nothing',
      sql: [
        `insert into table1 (id, "firstname", "lastname", email)
        values ($id, $firstname, $lastname, $email)
        on conflict
        do nothing
        RETURNING *`,
        'INSERT INTO "table1" (id, "firstname", "lastname", email) VALUES ($id,$firstname,$lastname,$email) ON CONFLICT DO NOTHING RETURNING *'
      ]
    },
    {
      title: 'alter schema',
      sql: [
        'ALTER SCHEMA public OWNER TO postgres;',
        'ALTER SCHEMA "public" OWNER TO "postgres"'
      ]
    },
    {
      title: 'alter domain',
      sql: [
        'ALTER DOMAIN public."bıgınt" OWNER TO postgres;',
        'ALTER DOMAIN "public"."bıgınt" OWNER TO "postgres"'
      ]
    },
    {
      title: 'alter type',
      sql: [
        'ALTER TYPE public.mpaa_rating OWNER TO postgres;',
        'ALTER TYPE "public"."mpaa_rating" OWNER TO "postgres"'
      ]
    },
    {
      title: 'alter function',
      sql: [
        'ALTER FUNCTION public.film_in_stock(p_film_id integer, p_store_id integer, OUT p_film_count integer, p_effective_date timestamp with time zone, timestamp with time zone) OWNER TO postgres;',
        'ALTER FUNCTION "public"."film_in_stock"(p_film_id INTEGER, p_store_id INTEGER, OUT p_film_count INTEGER, p_effective_date TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) OWNER TO "postgres"'
      ]
    },
    {
      title: 'alter function without args',
      sql: [
        'ALTER FUNCTION public.last_updated() OWNER TO postgres;',
        'ALTER FUNCTION "public"."last_updated"() OWNER TO "postgres"'
      ]
    },
    {
      title: 'alter aggregate',
      sql: [
        'ALTER AGGREGATE public.group_concat(text) OWNER TO postgres;',
        'ALTER AGGREGATE "public"."group_concat"(TEXT) OWNER TO "postgres"'
      ]
    },
    {
      title: 'alter aggregate with order by',
      sql: [
        'ALTER AGGREGATE mypercentile(float8 ORDER BY integer) SET SCHEMA mynewpercentile;',
        'ALTER AGGREGATE "mypercentile"(FLOAT8 ORDER BY INTEGER) SET SCHEMA "mynewpercentile"'
      ]
    },
    {
      title: 'create domain',
      sql: [
        'CREATE DOMAIN public."bıgınt" AS bigint;',
        'CREATE DOMAIN "public"."bıgınt" AS BIGINT',
      ]
    },
    {
      title: 'create domain with constraint',
      sql: [
        'CREATE DOMAIN public.year AS integer CONSTRAINT year_check CHECK (((VALUE >= 1901) AND (VALUE <= 2155)));',
        'CREATE DOMAIN "public"."year" AS INTEGER CONSTRAINT "year_check" CHECK (((VALUE >= 1901) AND (VALUE <= 2155)))',
      ]
    },
    {
      title: 'create domain with full definition',
      sql: [
        'CREATE DOMAIN public.year AS integer collate utf8mb4_bin default 0 CONSTRAINT year_check CHECK (((VALUE >= 1901) AND (VALUE <= 2155)));',
        'CREATE DOMAIN "public"."year" AS INTEGER COLLATE utf8mb4_bin DEFAULT 0 CONSTRAINT "year_check" CHECK (((VALUE >= 1901) AND (VALUE <= 2155)))',
      ]
    },
    {
      title: 'create type as enum',
      sql: [
        `CREATE TYPE public.mpaa_rating AS ENUM (
          'G',
          'PG',
          'PG-13',
          'R',
          'NC-17'
      );`,
        `CREATE TYPE "public"."mpaa_rating" AS ENUM ('G', 'PG', 'PG-13', 'R', 'NC-17')`
      ]
    },
    {
      title: 'create type name',
      sql: [
        'create type public.test',
        'CREATE TYPE "public"."test"'
      ]
    },
    {
      title: 'create view',
      sql: [
        `CREATE OR REPLACE TEMPORARY RECURSIVE VIEW universal_comedies
        with (check_option = local, security_barrier = false)
        AS
        SELECT *
        FROM comedies
        WHERE classification = 'U'
        WITH LOCAL CHECK OPTION;`,
        `CREATE OR REPLACE TEMPORARY RECURSIVE VIEW "universal_comedies" WITH (CHECK_OPTION = LOCAL, SECURITY_BARRIER = FALSE) AS SELECT * FROM "comedies" WHERE classification = 'U' WITH LOCAL CHECK OPTION`
      ]
    },
    {
      title: 'create trigger',
      sql: [
        "CREATE TRIGGER film_fulltext_trigger BEFORE INSERT OR UPDATE ON public.film FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger('fulltext', 'pg_catalog.english', 'title', 'description');",
        `CREATE TRIGGER "film_fulltext_trigger" BEFORE INSERT OR UPDATE ON "public"."film" FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger('fulltext', 'pg_catalog.english', 'title', 'description')`
      ]
    },
    {
      title: 'grant on schema',
      sql: [
        'GRANT ALL ON SCHEMA public TO PUBLIC;',
        'GRANT ALL ON SCHEMA "public" TO PUBLIC'
      ]
    },
    {
      title: 'grant table',
      sql: [
        'GRANT INSERT ON TABLE films TO PUBLIC;',
        'GRANT INSERT ON TABLE "films" TO PUBLIC'
      ]
    },
    {
      title: 'grant all tables',
      sql: [
        'GRANT SELECT ON ALL TABLES IN SCHEMA public, trusted TO PUBLIC;',
        'GRANT SELECT ON ALL TABLES IN SCHEMA "public", "trusted" TO PUBLIC'
      ]
    },
    {
      title: 'revoke on schema',
      sql: [
        'REVOKE ALL ON SCHEMA public FROM PUBLIC;',
        'REVOKE ALL ON SCHEMA "public" FROM PUBLIC'
      ]
    },
    {
      title: 'create function case when',
      sql: [
        `CREATE FUNCTION public._group_concat(text, text) RETURNS text
        LANGUAGE sql IMMUTABLE
        AS $_$
          SELECT CASE
            WHEN $2 IS NULL THEN $1
            WHEN $1 IS NULL THEN $2
            ELSE $1 || ', ' || $2
          END
        $_$;`,
        `CREATE FUNCTION "public"._group_concat(TEXT, TEXT) RETURNS TEXT LANGUAGE sql IMMUTABLE AS $_$ SELECT CASE WHEN $2 IS NULL THEN $1 WHEN $1 IS NULL THEN $2 ELSE $1 || ', ' || $2 END $_$`
      ]
    },
    {
      title: 'create function select',
      sql: [
        `CREATE FUNCTION public.film_not_in_stock(p_film_id integer default 1, p_store_id integer = 1, OUT p_film_count integer) RETURNS SETOF integer
        LANGUAGE sql
        AS $_$
          SELECT inventory_id
          FROM inventory
          WHERE film_id = $1
          AND store_id = $2
          AND NOT inventory_in_stock(inventory_id);
        $_$;`,
        `CREATE FUNCTION "public".film_not_in_stock(p_film_id INTEGER DEFAULT 1, p_store_id INTEGER = 1, OUT p_film_count INTEGER) RETURNS SETOF INTEGER LANGUAGE sql AS $_$ SELECT inventory_id FROM "inventory" WHERE film_id = $1 AND store_id = $2 AND NOT inventory_in_stock(inventory_id) $_$`
      ]
    },
    {
      title: 'create function with declare',
      sql: [
        `CREATE FUNCTION check_password(uname TEXT, pass TEXT)
        RETURNS BOOLEAN AS $$
        DECLARE passed BOOLEAN;
        BEGIN
                SELECT  (pwd = $2) INTO passed
                FROM    pwds
                WHERE   username = $1;

                RETURN passed;
        END;
        $$  LANGUAGE plpgsql
            SECURITY DEFINER
            -- Set a secure search_path: trusted schema(s), then 'pg_temp'.
            SET search_path = admin, pg_temp;
        `,
        `CREATE FUNCTION check_password(uname TEXT, pass TEXT) RETURNS BOOLEAN AS $$ DECLARE passed BOOLEAN BEGIN SELECT (pwd = $2) INTO "passed" FROM "pwds" WHERE username = $1 ; RETURN passed END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = admin, pg_temp`
      ]
    },
    {
      title: 'create function returns table',
      sql: [
        `CREATE FUNCTION dup(int) RETURNS TABLE(f1 int, f2 text)
        AS $$ SELECT $1, CAST($1 AS text) || ' is text' $$
        LANGUAGE SQL;`,
        `CREATE FUNCTION dup(INT) RETURNS TABLE (f1 INT, f2 TEXT) AS $$ SELECT $1, CAST($1 AS TEXT) || ' is text' $$ LANGUAGE SQL`
      ]
    },
    {
      title: 'create function with if else stmt',
      sql: [
        `CREATE FUNCTION public.inventory_in_stock(p_inventory_id integer) RETURNS boolean
        LANGUAGE plpgsql
        AS $$
          DECLARE
              v_rentals INTEGER;
              v_out     INTEGER;
          BEGIN
              -- AN ITEM IS IN-STOCK IF THERE ARE EITHER NO ROWS IN THE rental TABLE
              -- FOR THE ITEM OR ALL ROWS HAVE return_date POPULATED

              SELECT count(*) INTO v_rentals
              FROM rental
              WHERE inventory_id = p_inventory_id;

              IF v_rentals = 0 THEN
                RETURN TRUE;
              END IF;

              SELECT COUNT(rental_id) INTO v_out
              FROM inventory LEFT JOIN rental USING(inventory_id)
              WHERE inventory.inventory_id = p_inventory_id
              AND rental.return_date IS NULL;

              IF v_out > 0 THEN
                RETURN FALSE;
              ELSEIF v_out = 0 THEN
                RETURN FALSE;
              ELSE
                RETURN TRUE;
              END IF;
          END
        $$;`,
        'CREATE FUNCTION "public".inventory_in_stock(p_inventory_id INTEGER) RETURNS BOOLEAN LANGUAGE plpgsql AS $$ DECLARE v_rentals INTEGER; v_out INTEGER BEGIN SELECT COUNT(*) INTO "v_rentals" FROM "rental" WHERE inventory_id = p_inventory_id ; IF v_rentals = 0 THEN RETURN TRUE; END IF ; SELECT COUNT(rental_id) INTO "v_out" FROM "inventory" LEFT JOIN "rental" USING ("inventory_id") WHERE "inventory".inventory_id = p_inventory_id AND "rental".return_date IS NULL ; IF v_out > 0 THEN RETURN FALSE; ELSEIF v_out = 0 THEN RETURN FALSE ; ELSE RETURN TRUE; END IF END $$'
      ]
    },
    {
      title: 'create function without args',
      sql: [
        `CREATE FUNCTION public.last_updated() RETURNS trigger
        LANGUAGE plpgsql
        AS $$
          BEGIN
              NEW.last_update = CURRENT_TIMESTAMP;
              RETURN NEW;
          END $$;`,
        'CREATE FUNCTION "public".last_updated() RETURNS "trigger" LANGUAGE plpgsql AS $$ BEGIN NEW.last_update = CURRENT_TIMESTAMP ; RETURN NEW END $$'
      ]
    },
    {
      title: 'create aggregate',
      sql: [
        `CREATE AGGREGATE public.group_concat(text order by integer, id integer) (
          SFUNC = public._group_concat,
          STYPE = text,
          SSPACE = 2,
          FINALFUNC_MODIFY = READ_ONLY
        );`,
        'CREATE AGGREGATE "public".group_concat(TEXT ORDER BY INTEGER, id INTEGER) (SFUNC = "public"._group_concat, STYPE = TEXT, SSPACE = 2, FINALFUNC_MODIFY = READ_ONLY)'
      ]
    },
    {
      title: 'create aggregate without orderby',
      sql: [
        `CREATE AGGREGATE public.group_concat(text, text) (
          SFUNC = public._group_concat,
          STYPE = text,
          MFINALFUNC_MODIFY = SHAREABLE
        );`,
        'CREATE AGGREGATE "public".group_concat(TEXT, TEXT) (SFUNC = "public"._group_concat, STYPE = TEXT, MFINALFUNC_MODIFY = SHAREABLE)'
      ]
    },
    {
      title: 'raise only',
      sql: [
        'raise',
        'RAISE'
      ]
    },
    {
      title: 'raise notice',
      sql: [
        "RAISE NOTICE 'Calling cs_create_job(%)', v_job_id;",
        "RAISE NOTICE 'Calling cs_create_job(%)', v_job_id"
      ]
    },
    {
      title: 'raise expection',
      sql: [
        `RAISE EXCEPTION 'Nonexistent ID --> %', user_id
        USING HINT = 'Please check your user ID';`,
        "RAISE EXCEPTION 'Nonexistent ID --> %', user_id USING HINT = 'Please check your user ID'"
      ]
    },
    {
      title: 'raise condition',
      sql: [
        'RAISE division_by_zero;',
        'RAISE division_by_zero'
      ]
    },
    {
      title: 'raise sqlstate',
      sql: [
        "RAISE SQLSTATE '22012';",
        "RAISE SQLSTATE '22012'"
      ]
    },
    {
      title: 'execute stmt',
      sql: [
        'EXECUTE tmpSQL;',
        'EXECUTE tmpSQL'
      ]
    },
    {
      title: 'execute stmt with args',
      sql: [
        'EXECUTE test(a, b, c)',
        'EXECUTE test(a, b, c)'
      ]
    },
    {
      title: 'for loop',
      sql: [
        `CREATE FUNCTION refresh_mviews() RETURNS integer AS $$
        DECLARE
            mviews RECORD;
        BEGIN
            RAISE NOTICE 'Refreshing all materialized views...';

            FOR mviews IN
               SELECT n.nspname AS mv_schema,
                      c.relname AS mv_name,
                      pg_catalog.pg_get_userbyid(c.relowner) AS owner
                 FROM pg_catalog.pg_class c
            LEFT JOIN pg_catalog.pg_namespace n ON (n.oid = c.relnamespace)
                WHERE c.relkind = 'm'
             ORDER BY 1
            LOOP

                -- Now "mviews" has one record with information about the materialized view

                RAISE NOTICE 'Refreshing materialized view %.% (owner: %)...',
                             quote_ident(mviews.mv_schema),
                             quote_ident(mviews.mv_name),
                             quote_ident(mviews.owner);
                EXECUTE format('REFRESH MATERIALIZED VIEW %I.%I', mviews.mv_schema, mviews.mv_name);
            END LOOP;

            RAISE NOTICE 'Done refreshing materialized views.';
            RETURN 1;
        END;
        $$ LANGUAGE plpgsql;`,
        `CREATE FUNCTION refresh_mviews() RETURNS INTEGER AS $$ DECLARE mviews RECORD BEGIN RAISE NOTICE 'Refreshing all materialized views...' ; FOR mviews IN SELECT "n".nspname AS "mv_schema", "c".relname AS "mv_name", pg_catalog.pg_get_userbyid("c".relowner) AS "owner" FROM "pg_catalog"."pg_class" AS "c" LEFT JOIN "pg_catalog"."pg_namespace" AS "n" ON ("n".oid = "c".relnamespace) WHERE "c".relkind = 'm' ORDER BY 1 ASC LOOP RAISE NOTICE 'Refreshing materialized view %.% (owner: %)...', quote_ident("mviews"."mv_schema"), quote_ident("mviews"."mv_name"), quote_ident("mviews"."owner") ; EXECUTE format('REFRESH MATERIALIZED VIEW %I.%I', "mviews"."mv_schema", "mviews"."mv_name") END LOOP ; RAISE NOTICE 'Done refreshing materialized views.' ; RETURN 1 END $$ LANGUAGE plpgsql`
      ]
    },
    {
      title: 'support accentuated characters',
      sql: [
        "SELECT 'Molière' AS théâtre",
        `SELECT 'Molière' AS "théâtre"`
      ]
    },
    {
      title: 'support character varying',
      sql: [
        `CREATE TABLE "public"."authors_table" (
          "author_id" integer NOT NULL,
          "first_name" character varying NOT NULL,
          "last_name" character varying NOT NULL,
          "birth_date" date
        );`,
        'CREATE TABLE "public"."authors_table" ("author_id" INTEGER NOT NULL, "first_name" CHARACTER VARYING NOT NULL, "last_name" CHARACTER VARYING NOT NULL, "birth_date" DATE)'
      ]
    },
    {
      title: 'as double quoted',
      sql: [
        'select 1 as "one"',
        'SELECT 1 AS "one"'
      ]
    },
    {
      title: 'intersect op',
      sql: [
        `SELECT  item
        FROM public.orders
        WHERE ID = 1
        INTERSECT
        SELECT "sku"
        FROM public.inventory
        WHERE ID = 1`,
        'SELECT item FROM "public"."orders" WHERE ID = 1 INTERSECT SELECT "sku" FROM "public"."inventory" WHERE ID = 1'
      ]
    },
    {
      title: 'set to in transactions',
      sql: [
        `BEGIN;
        SET search_path TO ht_hyt;
        COMMIT;`,
        `BEGIN ; SET search_path TO ht_hyt ; COMMIT ;`,
      ]
    },
    {
      title: 'transaction stmt',
      sql: [
        'begin;',
        'BEGIN ;'
      ]
    },
    {
      title: 'double quoted column cast',
      sql: [
        'SELECT "created_date"::date FROM src_hosts',
        'SELECT "created_date"::DATE FROM "src_hosts"'
      ]
    },
    {
      title: 'preserve column quoted symbol',
      sql: [
        'select "abc", def from tableName',
        'SELECT "abc", def FROM "tableName"'
      ]
    },
    {
      title: 'quoted function name',
      sql: [
        'SELECT * FROM "func"("start_time", "end_time")',
        'SELECT * FROM "func"("start_time", "end_time")'
      ]
    },
    {
      title: 'function name prefixed with quoted schema',
      sql: [
        'SELECT * FROM "schema"."func"("start_time", "end_time")',
        'SELECT * FROM "schema"."func"("start_time", "end_time")'
      ]
    },
    {
      title: 'truncate table',
      sql: [
        'TRUNCATE TABLE employee RESTART IDENTITY cascade',
        'TRUNCATE TABLE "employee" RESTART IDENTITY CASCADE'
      ]
    },
    {
      title: 'truncate all table',
      sql: [
        'TRUNCATE TABLE ONLY employee * CONTINUE IDENTITY RESTRICT',
        'TRUNCATE TABLE ONLY "employee" * CONTINUE IDENTITY RESTRICT'
      ]
    },
    {
      title: 'jsonb in select column',
      sql: [
        "SELECT data['author']['first_name'] as title FROM blogs",
        `SELECT data['author']['first_name'] AS "title" FROM "blogs"`
      ]
    },
    {
      title: 'jsonb in update set',
      sql: [
        `UPDATE blogs SET data['author']['first_name'] = '"Sarah"'`,
        `UPDATE "blogs" SET data['author']['first_name'] = '"Sarah"'`
      ]
    },
    {
      title: 'table partitioning with',
      sql: [
        'CREATE TABLE access_keys_hash_p0 PARTITION OF access_keys FOR VALUES WITH (modulus 10, remainder 0)',
        'CREATE TABLE "access_keys_hash_p0" PARTITION OF "access_keys" FOR VALUES WITH (MODULUS 10, REMAINDER 0)'
      ]
    },
    {
      title: 'table partitioning from',
      sql: [
        `CREATE TABLE measurement_y2007m12 PARTITION OF measurement
        FOR VALUES FROM ('2007-12-01') TO ('2008-01-01')
        TABLESPACE fasttablespace;`,
        `CREATE TABLE "measurement_y2007m12" PARTITION OF "measurement" FOR VALUES FROM ('2007-12-01') TO ('2008-01-01') TABLESPACE fasttablespace`
      ]
    },
    {
      title: 'table partitioning in',
      sql: [
        "CREATE TABLE electronics PARTITION OF products FOR VALUES IN ('Electronics');",
        `CREATE TABLE "electronics" PARTITION OF "products" FOR VALUES IN ('Electronics')`
      ]
    },
    {
      title: 'distinct in args',
      sql: [
        `SELECT
        f.title,
        STRING_AGG (
      a.first_name || ' ' || a.last_name,
            ','
           ORDER BY
            a.first_name,
            a.last_name
        ) actors
    FROM
        film f
    INNER JOIN film_actor fa USING (film_id)
    INNER JOIN actor a USING (actor_id)
    GROUP BY
        f.title;`,
        `SELECT "f".title, STRING_AGG("a".first_name || ' ' || "a".last_name, ',' ORDER BY "a".first_name ASC, "a".last_name ASC) AS "actors" FROM "film" AS "f" INNER JOIN "film_actor" AS "fa" USING ("film_id") INNER JOIN "actor" AS "a" USING ("actor_id") GROUP BY "f".title`
      ]
    },
    {
      title: 'drop if exists',
      sql: [
        'DROP TABLE IF EXISTS table_name;',
        'DROP TABLE IF EXISTS "table_name"'
      ]
    },
    {
      title: 'ilike binary operator',
      sql: [
        "SELECT a FROM b WHERE a::TEXT ILIKE '%x%'",
        `SELECT a FROM "b" WHERE a::TEXT ILIKE '%x%'`
      ]
    },
    {
      title: 'check constraint',
      sql: [
        'CREATE TABLE Books (price DECIMAL(10, 2) CHECK (Price > 0));',
        'CREATE TABLE "Books" (price DECIMAL(10, 2) CHECK (Price > 0))'
      ]
    },
    {
      title: 'array data type',
      sql: [
        `CREATE TABLE "table_0" ("hi" INTEGER ARRAY); CREATE TABLE "table_1" ("hi" INTEGER[3]);`,
        `CREATE TABLE "table_0" ("hi" INTEGER ARRAY) ; CREATE TABLE "table_1" ("hi" INTEGER[3])`
      ]
    },
    {
      title: 'binary expr as fun args',
      sql: [
        `SELECT
	somefunc(
        engineering_networks.realizaciya,
        engineering_networks.company = 'blah-blah'
        AND
        engineering_networks.obem_realizacii_tip = 'uslugi'
      ) AS var0,
      If(var0 > 0, '2', '1') AS fontColor
     FROM engineering_networks AS engineering_networks
     WHERE
     	engineering_networks.company = 'blah-blah' AND
        engineering_networks.month IN ('April') AND
        engineering_networks.year IN ('2024')
     LIMIT 1;`,
     `SELECT somefunc("engineering_networks".realizaciya, "engineering_networks".company = 'blah-blah' AND "engineering_networks".obem_realizacii_tip = 'uslugi') AS "var0", If(var0 > 0, '2', '1') AS "fontColor" FROM "engineering_networks" AS "engineering_networks" WHERE "engineering_networks".company = 'blah-blah' AND "engineering_networks".month IN ('April') AND "engineering_networks".year IN ('2024') LIMIT 1`
      ],
    },
    {
      title: 'alter column data type',
      sql: [
        `ALTER TABLE employees ALTER COLUMN first_name SET DATA TYPE TEXT COLLATE "C" using upper(first_name);`,
        'ALTER TABLE "employees" ALTER COLUMN first_name SET DATA TYPE TEXT COLLATE "C" USING upper(first_name)'
      ]
    },
    {
      title: 'alter column set and drop default',
      sql: [
        "ALTER TABLE transactions ADD COLUMN status varchar(30) DEFAULT 'old', ALTER COLUMN status SET default 'current', ALTER COLUMN name drop default;",
        `ALTER TABLE "transactions" ADD COLUMN status VARCHAR(30) DEFAULT 'old', ALTER COLUMN status SET DEFAULT 'current', ALTER COLUMN name DROP DEFAULT`,
      ]
    },
    {
      title: 'alter column set not null',
      sql: [
        'ALTER TABLE transactions ALTER COLUMN status SET NOT NULL',
        'ALTER TABLE "transactions" ALTER COLUMN status SET NOT NULL',
      ]
    },
    {
      title: 'jsonb operator',
      sql: [
        "SELECT id,  collection::jsonb ?| array['val1', 'val2'] FROM instances",
        `SELECT id, collection::JSONB ?| ARRAY['val1','val2'] FROM "instances"`
      ]
    },
    {
      title: 'create type',
      sql: [
        `CREATE TYPE address AS (
            street VARCHAR(255),
            city VARCHAR(100),
            state VARCHAR(100),
            zip_code VARCHAR(10)
        );`,
        'CREATE TYPE "address" AS (street VARCHAR(255), city VARCHAR(100), state VARCHAR(100), zip_code VARCHAR(10))'
      ]
    },
    {
      title: 'create type as range',
      sql: [
        'CREATE TYPE float8_range AS RANGE (subtype = float8, subtype_diff = float8mi);',
        'CREATE TYPE "float8_range" AS RANGE (subtype = float8, subtype_diff = float8mi)'
      ]
    },
    {
      title: 'create table with column_constraint',
      sql: [
        `CREATE TABLE public.tnotok ("id" SERIAL CONSTRAINT users_PK PRIMARY KEY, description text DEFAULT ''::text NOT NULL);`,
        `CREATE TABLE "public"."tnotok" ("id" SERIAL CONSTRAINT users_PK PRIMARY KEY, description TEXT NOT NULL DEFAULT ''::TEXT)`,
      ]
    },
    {
      title: 'create table with quoted data type',
      sql: [
        'CREATE TABLE "User" ("gender" "Gender" NOT NULL);',
        'CREATE TABLE "User" ("gender" "Gender" NOT NULL)',
      ]
    },
    {
      title: 'no space before line comment',
      sql: [
        'select * from model_a a-- comment',
        'SELECT * FROM "model_a" AS "a"'
      ]
    },
    {
      title: 'mixed jsonb and cast',
      sql: [
        "SELECT person.name FROM person WHERE person.email_addresses::json -> 'items'::text ILIKE '%sam%'",
        `SELECT "person".name FROM "person" WHERE "person".email_addresses::JSON -> 'items'::TEXT ILIKE '%sam%'`
      ]
    },
    {
      title: 'multiple jsonb operator expr',
      sql: [
        `select '{"a": {"b":{"c": "foo"}}}'::json#>'{a,b}', '{"a":1, "b":2}'::jsonb @> '{"b":2}'::jsonb, '{"a":1, "b":2}'::jsonb ? 'b', '{"a":1, "b":2, "c":3}'::jsonb ?| array['b', 'c']
, '["a", "b"]'::jsonb ?& array['a', 'b'], '["a", "b"]'::jsonb || '["c", "d"]'::jsonb, '{"a": "b"}'::jsonb - 'a', '["a", "b"]'::jsonb - 1, '["a", {"b":1}]'::jsonb #- '{1,b}'`,
        `SELECT '{"a": {"b":{"c": "foo"}}}'::JSON #> '{a,b}', '{"a":1, "b":2}'::JSONB @> '{"b":2}'::JSONB, '{"a":1, "b":2}'::JSONB ? 'b', '{"a":1, "b":2, "c":3}'::JSONB ?| ARRAY['b','c'], '["a", "b"]'::JSONB ?& ARRAY['a','b'], '["a", "b"]'::JSONB || '["c", "d"]'::JSONB, '{"a": "b"}'::JSONB - 'a', '["a", "b"]'::JSONB - 1, '["a", {"b":1}]'::JSONB #- '{1,b}'`
      ]
    },
    {
      title: 'timestamptz data type',
      sql: [
        'CREATE TABLE "Users" (created_at timestamptz);',
        'CREATE TABLE "Users" (created_at TIMESTAMPTZ)'
      ]
    },
    {
      title: 'start transaction',
      sql: [
        'start transaction isolation level repeatable read, read only, not deferrable',
        'START TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY, NOT DEFERRABLE'
      ]
    },
    {
      title: 'create table as',
      sql: [
        'create table test as select 1',
        'CREATE TABLE "test" AS SELECT 1'
      ]
    },
  ]
  function neatlyNestTestedSQL(sqlList){
    sqlList.forEach(sqlInfo => {
        const {title, sql} = sqlInfo
        it(`should support ${title}`, () => {
          expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
        })
    })
  }

  neatlyNestTestedSQL(SQL_LIST)

  describe('tables to sql', () => {
    it('should parse object tables', () => {
      const ast = parser.astify(SQL_LIST[100].sql[0], opt)
      ast[0].from[0].expr.parentheses = false
      expect(parser.sqlify(ast, opt)).to.be.equal('SELECT last_name, salary FROM "employees" INNER JOIN "salaries" ON "employees".emp_no = "salaries".emp_no')
    })
  })

  describe('test pg parser speed', () => {
    it('should parse nested function call in ms', () => {
      const sql = `SELECT
      f(f(f(
                  SELECT
                      f(
                          f(
                              f(c1,c2,c3,c4,c5,c6,c7,c8,c9)
                          )
                      )
                  FROM t2

        ))) as cf
      FROM t1`
      const opt = { database: 'postgresql' }
      let start = Date.now()
      parser.astify(sql, opt)
      let end = Date.now()
      expect(end - start).to.be.lessThanOrEqual(1000)
      start = Date.now()
      parser.astify("SELECT coalesce(JSON_ARRAYAGG(JSON_OBJECT('id', id,'productId', productId,'colorId', colorId,'type', type)), JSON_ARRAY()) FROM abc")
      end = Date.now()
      expect(end - start).to.be.lessThan(100)
    })
  })

  describe('returning', () => {
    it('should parse returning clause', () => {
      let sql = "UPDATE buildings SET address = 'update test 2' WHERE id = 18 RETURNING id, address"
      expect(getParsedSql(sql, opt)).to.equal(`UPDATE "buildings" SET address = 'update test 2' WHERE id = 18 RETURNING id, address`)
      sql = "UPDATE buildings SET address = 'update test 2' WHERE id = 18 RETURNING *, address as newAddress"
      expect(getParsedSql(sql, opt)).to.equal(`UPDATE "buildings" SET address = 'update test 2' WHERE id = 18 RETURNING *, address AS "newAddress"`)
      sql = "UPDATE buildings SET address = 'update test 2' WHERE id = 18 RETURNING (SELECT address FROM buildings WHERE id = 18) as old_address;"
      expect(getParsedSql(sql, opt)).to.equal(`UPDATE "buildings" SET address = 'update test 2' WHERE id = 18 RETURNING (SELECT address FROM "buildings" WHERE id = 18) AS "old_address"`)
    })
  })

  describe('create sequence', () => {
    const SQL_LIST = [
      {
        title: 'create sequence',
        sql: [
          `CREATE SEQUENCE public.table_id_seq`,
          'CREATE SEQUENCE "public"."table_id_seq"'
        ]
      },
      {
        title: 'create sequence increment by',
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10'
        ]
      },
      {
        title: 'create sequence increment by minvalue and maxvalue',
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10 minvalue 20 maxvalue 30`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 MINVALUE 20 MAXVALUE 30'
        ]
      },
      {
        title: 'create sequence increment by start with cache',
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10 no minvalue no maxvalue start with 1 cache 3`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3'
        ]
      },
      {
        title: 'create sequence increment by start with cache, cycle and owned',
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment by 10 no minvalue no maxvalue start with 1 cache 3 no cycle owned by tn.cn`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3 NO CYCLE OWNED BY "tn".cn'
        ]
      },
      {
        title: 'create sequence increment by start with cache, cycle and owned',
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment 10 no minvalue no maxvalue start with 1 cache 3 cycle owned by none`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3 CYCLE OWNED BY NONE'
        ]
      },
      {
        title: 'cast oid type explicit',
        sql: [
          `SELECT CAST(c AS OID) FROM pg_attribute`,
          'SELECT CAST(c AS OID) FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast oid type implicit',
        sql: [
          `SELECT c::OID FROM pg_attribute`,
          'SELECT c::OID FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regclass oid type',
        sql: [
          `SELECT c::REGCLASS FROM pg_attribute`,
          'SELECT c::REGCLASS FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regregcollation oid type',
        sql: [
          `SELECT c::REGCOLLATION FROM pg_attribute`,
          'SELECT c::REGCOLLATION FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regconfig oid type',
        sql: [
          `SELECT c::REGCONFIG FROM pg_attribute`,
          'SELECT c::REGCONFIG FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regdictionary oid type',
        sql: [
          `SELECT c::REGDICTIONARY FROM pg_attribute`,
          'SELECT c::REGDICTIONARY FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regnamespace oid type',
        sql: [
          `SELECT c::REGNAMESPACE FROM pg_attribute`,
          'SELECT c::REGNAMESPACE FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regoper oid type',
        sql: [
          `SELECT c::REGOPER FROM pg_attribute`,
          'SELECT c::REGOPER FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regoperator oid type',
        sql: [
          `SELECT c::REGOPERATOR FROM pg_attribute`,
          'SELECT c::REGOPERATOR FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regproc oid type',
        sql: [
          `SELECT c::REGPROC FROM pg_attribute`,
          'SELECT c::REGPROC FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regprocedure oid type',
        sql: [
          `SELECT c::REGPROCEDURE FROM pg_attribute`,
          'SELECT c::REGPROCEDURE FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regrole oid type',
        sql: [
          `SELECT c::REGROLE FROM pg_attribute`,
          'SELECT c::REGROLE FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast regtype oid type',
        sql: [
          `SELECT c::REGTYPE FROM pg_attribute`,
          'SELECT c::REGTYPE FROM "pg_attribute"'
        ]
      },
      {
        title: 'cast varchar with length',
        sql: [
          'SELECT name::VARCHAR(200) FROM raw_hosts',
          'SELECT name::VARCHAR(200) FROM "raw_hosts"'
        ]
      },
      {
        title: 'chinese oridinary identifier',
        sql: [
          'select 中文 from t1;',
          'SELECT 中文 FROM "t1"'
        ],
      },
      {
        title: 'chinese delimited identifier',
        sql: [
          'select "中文" from t1;',
          'SELECT "中文" FROM "t1"'
        ],
      },
      {
        title: 'double precision type',
        sql: [
          `CREATE TABLE test (
            amount double precision
          );`,
          'CREATE TABLE "test" (amount DOUBLE PRECISION)'
        ]
      },
      {
        title: 'crosstab tablefunc',
        sql: [
          `SELECT * FROM crosstab( 'select student, subject, evaluation_result from evaluations order by 1,2', $$VALUES ('t'::text), ('f'::text)$$) AS final_result(Student TEXT, Geography NUMERIC,History NUMERIC,Language NUMERIC,Maths NUMERIC,Music NUMERIC);`,
          `SELECT * FROM crosstab('select student, subject, evaluation_result from evaluations order by 1,2', $$VALUES ('t'::text), ('f'::text)$$) AS final_result(Student TEXT, Geography NUMERIC, History NUMERIC, Language NUMERIC, Maths NUMERIC, Music NUMERIC)`
        ]
      },
      {
        title: 'accentuated characters in column',
        sql: [
          "SELECT * FROM test WHERE théâtre = 'Molière'",
          `SELECT * FROM "test" WHERE théâtre = 'Molière'`
        ]
      },
      {
        title: 'cast when expr is additive expr',
        sql: [
          `SELECT
            CASE
                WHEN updated IS NOT NULL THEN (updated - created)::TIME
            END AS some_time
          FROM some_table`,
          'SELECT CASE WHEN updated IS NOT NULL THEN (updated - created)::TIME END AS "some_time" FROM "some_table"'
        ]
      },
      {
        title: 'custom data type',
        sql: [
          `CREATE TYPE access_key_permission_kind AS ENUM ('FULL_ACCESS', 'FUNCTION_CALL');

          CREATE TABLE
          access_keys (
          public_key text NOT NULL,
          account_id text NOT NULL,
          permission_kind access_key_permission_kind NOT NULL,
          CONSTRAINT access_keys_pk PRIMARY KEY (public_key, account_id)
          ) PARTITION BY HASH (public_key);`,
          `CREATE TYPE "access_key_permission_kind" AS ENUM ('FULL_ACCESS', 'FUNCTION_CALL') ; CREATE TABLE "access_keys" (public_key TEXT NOT NULL, account_id TEXT NOT NULL, permission_kind access_key_permission_kind NOT NULL, CONSTRAINT "access_keys_pk" PRIMARY KEY (public_key, account_id)) PARTITION BY HASH(public_key)`
        ]
      },
      {
        title: 'json to record or recordset table func',
        sql: [
          `SELECT
          *
        from
          jsonb_to_recordset(
            '[{"amount":23, "currency": "INR"}]' :: jsonb
          ) as l_amount (amount decimal, currency text);`,
          `SELECT * FROM jsonb_to_recordset('[{"amount":23, "currency": "INR"}]'::JSONB) AS l_amount(amount DECIMAL, currency TEXT)`
        ]
      },
      {
        title: 'create scheme',
        sql: [
          'CREATE SCHEMA public;',
          'CREATE SCHEMA public'
        ]
      },
      {
        title: 'create constraint with quoted name',
        sql: [
          `CREATE TABLE "User" (
              "id" SERIAL NOT NULL,
              CONSTRAINT "User_pkey" PRIMARY KEY ("id")
          );`,
          'CREATE TABLE "User" ("id" SERIAL NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"))'
        ]
      },
      {
        title: 'reserved keyword as column name',
        sql: [
          'select meeting.end from meeting',
          'SELECT "meeting".end FROM "meeting"'
        ]
      },
    ]
    neatlyNestTestedSQL(SQL_LIST)
  })

  describe('pg ast', () => {
    it('should get correct columns and tables', () => {
      let sql = 'SELECT "Id" FROM "Test";'
      let ast = parser.parse(sql, opt)
      expect(ast.tableList).to.be.eql(['select::null::Test'])
      expect(ast.columnList).to.be.eql(['select::null::Id'])
      expect(ast.ast[0].columns).to.be.eql([
        {
          type: 'expr',
          expr: {
              type: 'column_ref',
              table: null,
              column: {
                expr: {
                  type: 'double_quote_string',
                  value: 'Id'
                }
              }
          },
          as: null
        }
      ])
      expect(parser.sqlify(ast.ast, opt)).to.be.equals(sql.slice(0, -1))
      sql = 'SELECT col1 + "col2" FROM "t1"'
      ast = parser.parse(sql, opt)
      expect(ast.tableList).to.be.eql(['select::null::t1'])
      expect(ast.columnList).to.be.eql(['select::null::col1', 'select::null::col2'])
      expect(ast.ast.columns[0].expr.right).to.be.eql({
        type: 'column_ref',
        table: null,
        column: {
          expr: {
            type: 'double_quote_string',
            value: 'col2'
          }
        }
      })
      expect(parser.sqlify(ast.ast, opt)).to.be.equals('SELECT col1 + "col2" FROM "t1"')
      sql = 'SELECT "col1" + "col2" FROM "t1"'
      ast = parser.parse(sql, opt)
      expect(ast.ast.columns[0].expr.left).to.be.eql({
        type: 'column_ref',
        table: null,
        column: {
          expr: {
            type: 'double_quote_string',
            value: 'col1'
          }
        }
      })
      expect(parser.sqlify(ast.ast, opt)).to.be.equals('SELECT "col1" + "col2" FROM "t1"')
    })

    it('should support conflict be empty', () => {
      expect(conflictToSQL(null)).to.be.equal('')
    })
    it('should proc assign', () => {
      expect(procToSQL({stmt: {type: 'assign', left: {type: 'default', value: 'abc'}, keyword: '', right: {type: 'number', value: 123}, symbol: '='}})).to.be.equal('abc = 123')
    })
    it('should has loc property', () => {
      const sql = 'SELECT * FROM "company" WHERE NOT(company._id IS NULL)'
      const opt = { database: 'postgresql', parseOptions: { includeLocations: true } }
      const ast = parser.astify(sql, opt)
      expect(ast.where.loc).to.be.eql({
        "start": {
          "offset": 30,
          "line": 1,
          "column": 31
        },
        "end": {
          "offset": 54,
          "line": 1,
          "column": 55
        }
      })
      expect(ast.where.args.value[0].loc).to.be.eql({
        "start": {
          "offset": 34,
          "line": 1,
          "column": 35
        },
        "end": {
          "offset": 53,
          "line": 1,
          "column": 54
        }
      })
    })
    it('should throw error', () => {
      const sql = "select 1 as 'one'"
      const fun = parser.astify.bind(parser, sql, opt)
      expect(fun).to.throw(`Expected "--", "/*", "\\"", [ \\t\\n\\r], or [A-Za-z_一-龥] but "'" found.`)
    })
  })
  describe('pg parse speed', function () {
    this.timeout(30)
    const sql = `SELECT
      "pr"."destination_currency" AS "currency",
      "pr"."idempotency_key" AS "unqiueRequestId",
      "pr"."status" AS "paymentRequestStatus",
      "pr"."payment_date" AS "paymentDate",
      "pr"."provider_system_reference_number" AS "providerSystemReferenceNumber",
      "pr"."destination_amount" AS "destinationAmount",
      "pr"."error" AS "error",
      "pr"."source_id" AS "sourceId",
      "pr"."source_type" AS "sourceType",
      "pr"."client_legal_entity_id" AS "clientLegalEntityId",
      "pr"."beneficiary_legal_entity_id" AS "beneficiaryLegalEntityId",
      "pr"."provider" AS "provider",
      "txn"."created_at" AS "transactionCreatedAt",
      "txn"."updated_at" AS "transactionUpdatedAt",
      "txn"."provider_metadata" AS "providerMetadata",
      "txn"."currency" AS "currency",
      "txn"."amount" AS "amount",
      "txn"."status" AS "status",
      "txn"."type" AS "txnType",
      "txn"."purpose_of_payment" AS "purposeOfPayment",
      "txn"."client_reference" AS "clientReference",
      "txn"."description" AS "transactionDescription",
      pr.meta -> 'invoiceIds' AS "invoiceIds"
  FROM
      "public"."payment_request" "pr"
      LEFT JOIN "public"."transaction" "txn" ON "txn"."payment_request_id" = "pr"."id"
  WHERE
      "pr"."source_id" IN ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50)
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
      OR pr.meta::jsonb -> 'invoiceIds' @> '["c937cd8c-65bc-4006-9413-dde7b43c61b6"]'
  ORDER BY
      "pr"."created_at" DESC`
    const ast = parser.astify(sql, opt)
    expect(ast).to.be.an('object')
  })
})
