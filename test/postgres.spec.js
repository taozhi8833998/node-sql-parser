const { expect } = require('chai')
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
      `WITH "subQ1" AS (SELECT * FROM "Roster" WHERE "SchoolID" = 52), "subQ2" AS (SELECT "SchoolID" FROM "subQ1") SELECT DISTINCT * FROM "subQ2"`
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
        'SELECT AVG("PointsScored") FROM (SELECT "PointsScored" FROM "Stats" WHERE "SchoolID" = 77)'
      ]
    },
    {
      title: 'select subquery have alias',
      sql: [
        `SELECT r.LastName
        FROM
        ( SELECT * FROM Roster) AS r`,
        'SELECT "r"."LastName" FROM (SELECT * FROM "Roster") AS "r"'
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
        'SELECT "FirstName" FROM "Roster" INNER JOIN "PlayerStats" USING ("LastName")'
      ]
    },
    {
        title: 'Window Fns with qualified frame clause',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at DESC) AS age_window
          FROM roster`,
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" DESC) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (PARTITION BY user_city ORDER BY created_at) AS age_window
          FROM roster`,
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
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
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC ROWS 1 FOLLOWING) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS unbounded following',
        sql: [
          `SELECT
            first_name,
            SUM(user_age) OVER (
                PARTITION BY user_city
                ORDER BY created_at ASC
                ROWS UNbounded FOLLOWING
            ) AS age_window
          FROM roster`,
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC ROWS UNBOUNDED FOLLOWING) AS "age_window" FROM "roster"'
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
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC ROWS UNBOUNDED PRECEDING) AS "age_window" FROM "roster"'
        ]
    },
    {
        title: 'Window Fns + ROWS between',
        sql: [
          `SELECT
            first_name,
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
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" DESC ROWS BETWEEN 1 PRECEDING AND 5 FOLLOWING) AS "age_window", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS "age_window2" FROM "roster"'
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
          'SELECT "first_name", SUM("user_age") OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC, "user_id" ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS "age_window" FROM "roster"'
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
          'SELECT ROW_NUMBER() OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
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
          'SELECT LAG("user_name", 10) OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
      title: 'Window Fns + LEAD',
      sql: [
        `SELECT
          LEAD(user_name, 10) OVER (
              PARTITION BY user_city
              ORDER BY created_at
          ) AS age_window
        FROM roster`,
        'SELECT LEAD("user_name", 10) OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
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
        'SELECT NTH_VALUE("user_name", 10) OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
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
          'SELECT LAG("user_name") IGNORE NULLS OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC) AS "age_window" FROM "roster"'
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
          'SELECT FIRST_VALUE("user_name" IGNORE NULLS) OVER (PARTITION BY "user_city" ORDER BY "created_at" ASC, "ranking" ASC) AS "age_window" FROM "roster"'
        ]
    },
    {
      title: 'array column',
      sql: [
        "SELECT ARRAY[col1, col2, 1, 'str_literal'] from tableb",
        `SELECT ARRAY["col1","col2",1,'str_literal'] FROM "tableb"`
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
        `WITH "t" AS (SELECT ARRAY['a','b','c'] AS "a") SELECT "a"[2] FROM "t"`
      ]
    },
    {
      title: 'row function column',
      sql: [
        "SELECT ROW(col1, col2, 'literal', 1) from tableb",
        `SELECT ROW("col1", "col2", 'literal', 1) FROM "tableb"`
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
        `SELECT "d"."metadata" ->> 'communication_status' AS "communication_status" FROM "device" AS "d" WHERE "d"."metadata" ->> 'communication_status' IS NOT NULL LIMIT 10`
      ]
    },
    {
      title: 'case when in pg',
      sql: [
        `SELECT SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) FROM tablename`,
        `SELECT SUM(CASE WHEN "status" = 'ACTIVE' THEN 1 ELSE 0 END) FROM "tablename"`
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
        `SELECT CASE WHEN "ee"."start_time" <= CURRENT_TIMESTAMP AND "ee"."end_time" > CURRENT_TIMESTAMP THEN TRUE ELSE FALSE END AS "is_live", "is_upcoming" FROM "abc"`
      ]
    },
    {
      title: 'key keyword in pg',
      sql: [
        `SELECT * FROM partitions WHERE location IS NULL AND code like 'XX-%' AND key <> 1;`,
        `SELECT * FROM "partitions" WHERE "location" IS NULL AND "code" LIKE 'XX-%' AND "key" <> 1`
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
      title: 'a multi-line single-quoted string',
      sql: [
        `select
        person.first_name,
        department.dept_name
      from
        person
      left join department on person.dept_id = department.dept_id`,
        'SELECT "person"."first_name", "department"."dept_name" FROM "person" LEFT JOIN "department" ON "person"."dept_id" = "department"."dept_id"'
      ]
    },
    {
      title: 'create table with serial',
      sql: [
        `create table posts(id serial primary key, name varchar(128))`,
        `CREATE TABLE "posts" ("id" SERIAL PRIMARY KEY, "name" VARCHAR(128))`
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
        `SELECT * FROM (VALUES (0,0), (1,NULL), (NULL,2), (3,4)) AS "t(a, b)" WHERE "a" IS DISTINCT FROM "b"`
      ]
    },
    {
      title: 'select from values as without parentheses',
      sql: [
        `select last(col) FROM VALUES(10),(5),(20) AS tab(col)`,
        `SELECT last("col") FROM VALUES (10), (5), (20) AS "tab(col)"`
      ]
    },
    {
      title: 'aggr_fun percentile_cont',
      sql: [
        `select percentile_cont(0.25) within group (order by a asc) as p25
        from (values (0),(0),(1),(2),(3),(4)) as t(a)`,
        `SELECT PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY "a" ASC) AS "p25" FROM (VALUES (0), (0), (1), (2), (3), (4)) AS "t(a)"`
      ]
    },
    {
      title: 'aggr_fun percentile_cont with array args',
      sql: [
        `select percentile_cont(array[0.5, 1]) within group (order by a asc) as p25
        from (values (0),(0),(1),(2),(3),(4)) as t(a)`,
        `SELECT PERCENTILE_CONT(ARRAY[0.5,1]) WITHIN GROUP (ORDER BY "a" ASC) AS "p25" FROM (VALUES (0), (0), (1), (2), (3), (4)) AS "t(a)"`
      ]
    },
    {
      title: 'aggr_fun mode',
      sql: [
        `select mode() within group (order by a asc) as p25
        from (values (0),(0),(1),(2),(3),(4)) as t(a)`,
        `SELECT MODE() WITHIN GROUP (ORDER BY "a" ASC) AS "p25" FROM (VALUES (0), (0), (1), (2), (3), (4)) AS "t(a)"`
      ]
    },
    {
      title: 'similar to keyword in pg',
      sql: [
        `select name similar to 'John%' from (values ('John Doe'),('Jane Doe'),('Bob John')) as t(name)`,
        `SELECT "name" SIMILAR TO 'John%' FROM (VALUES ('John Doe'), ('Jane Doe'), ('Bob John')) AS "t(name)"`
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
        'SELECT round("arr"[1])'
      ]
    },
    {
      title: 'access array index in where clause',
      sql: [
        'SELECT * FROM a INNER JOIN b ON c = d[1]',
        'SELECT * FROM "a" INNER JOIN "b" ON "c" = "d"[1]'
      ]
    },
    {
      title: 'distinct on',
      sql: [
        'SELECT DISTINCT ON (a, b) a, b, c FROM tbl',
        'SELECT DISTINCT ON ("a", "b") "a", "b", "c" FROM "tbl"'
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
        'SELECT SUM("salary") OVER w, AVG("salary") OVER w FROM "empsalary" WINDOW w AS (PARTITION BY "depname" ORDER BY "salary" DESC)'
      ]
    },
    {
      title: '$ field id with parameters',
      sql: [
        'SELECT * FROM tablea WHERE comment_id = $<3>;',
        'SELECT * FROM "tablea" WHERE "comment_id" = $<3>'
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
        'SELECT * FROM "organization" INNER JOIN "payment" ON "organization"."id" = "payment"."organization_id" AND "createdat" = "month"'
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
        'SELECT * FROM "pg_database" AS "a" INNER JOIN "pg_database" AS "b" ON "a"."oid" = "b"."oid" AND upper("a"."datctype") = upper("b"."datctype")'
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
        `WITH "statuses" AS (SELECT "a" FROM (VALUES ('Closed'), ('Verified'), ('Done')) AS "s(a)") SELECT * FROM "statuses"`
      ]
    },
    {
      title: 'dollar-quoted string',
      sql: [
        'SELECT $$foo bar$$;',
        'SELECT $$foo bar$$'
      ]
    },
    {
      title: 'dollar-quoted string',
      sql: [
        "select $SomeTag$Dianne's horse$SomeTag$",
        "SELECT $SomeTag$Dianne's horse$SomeTag$"
      ]
    },
    {
      title: 'nested block comments',
      sql: [
        "select /* /* */ */ col from tbl",
        'SELECT "col" FROM "tbl"'
      ]
    },
    {
      title: 'select into',
      sql: [
        "select c1, c2 into t1 from t2",
        'SELECT "c1", "c2" INTO "t1" FROM "t2"'
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
        `CREATE TABLE "stuff" ("id" SERIAL PRIMARY KEY, "name" VARCHAR) ; WITH "new_stuff" AS (INSERT INTO "stuff" ("name") VALUES ('foo'), ('bar') RETURNING "id") SELECT "id" FROM "new_stuff"`
      ]
    },
    {
      title: 'offset without limit',
      sql: [
        'select c1 from t1 offset 11',
        'SELECT "c1" FROM "t1" OFFSET 11'
      ]
    },
    {
      title: 'support empty space after ::',
      sql: [
        'SELECT (COALESCE(wp.weight,  0))::double(10) as net_weight , wp.gross_weight:: double(10) FROM  wp ;',
        'SELECT (COALESCE("wp"."weight", 0))::DOUBLE(10) AS "net_weight", "wp"."gross_weight"::DOUBLE(10) FROM "wp"'
      ]
    },
    {
      title: 'support nested json traversal',
      sql: [
        "SELECT meta.data->'foo'->'bar' as value FROM meta;",
        `SELECT "meta"."data" -> 'foo' -> 'bar' AS "value" FROM "meta"`
      ]
    },
    {
      title: 'support nulls first or last after order by',
      sql: [
        'SELECT has_geometry FROM rooms WHERE rooms.index = 200 ORDER BY has_geometry DESC NULLS LAST;',
        'SELECT "has_geometry" FROM "rooms" WHERE "rooms"."index" = 200 ORDER BY "has_geometry" DESC NULLS LAST'
      ]
    },
    {
      title: 'support nulls after order by with default val',
      sql: [
        'SELECT has_geometry FROM rooms WHERE rooms.index = 200 ORDER BY has_geometry ASC NULLS;',
        'SELECT "has_geometry" FROM "rooms" WHERE "rooms"."index" = 200 ORDER BY "has_geometry" ASC NULLS LAST'
      ]
    },
    {
      title: 'support lateral with subquery',
      sql: [
        'SELECT * FROM foo, LATERAL (SELECT * FROM bar WHERE bar.id = foo.bar_id) ss;',
        'SELECT * FROM "foo", LATERAL (SELECT * FROM "bar" WHERE "bar"."id" = "foo"."bar_id") AS "ss"'
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
        'SELECT "p1"."id", "p2"."id", "v1", "v2" FROM "polygons" AS "p1", "polygons" AS "p2", LATERAL vertices("p1"."poly") AS "v1", LATERAL vertices("p2"."poly") AS "v2" WHERE ("v1" - "v2") < 10 AND "p1"."id" != "p2"."id"'
      ]
    },
    {
      title: 'support lateral with join',
      sql: [
        `SELECT m.name
        FROM manufacturers m LEFT JOIN LATERAL get_product_names(m.id) pname ON true
        WHERE pname IS NULL;`,
        'SELECT "m"."name" FROM "manufacturers" AS "m" LEFT JOIN LATERAL get_product_names("m"."id") AS "pname" ON TRUE WHERE "pname" IS NULL'
      ]
    },
    {
      title: 'support escape char patten matching',
      sql: [
        "select c1 from t1 where c2 like 'abc' escape '!'",
        `SELECT "c1" FROM "t1" WHERE "c2" LIKE 'abc' ESCAPE '!'`
      ]
    },
    {
      title: 'with or without timezone',
      sql: [
        'select cast(c as time with time zone)',
        'SELECT CAST("c" AS TIME WITH TIME ZONE)'
      ]
    },
    {
      title: 'with or without timezone',
      sql: [
        'select cast(c as timestamp without time zone)',
        'SELECT CAST("c" AS TIMESTAMP WITHOUT TIME ZONE)'
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
        `SELECT date_trunc('month', "buy_window") AS "month_window", "marketplace", SUM("currency_amount_a") FILTER (WHERE "currency_symbol_a" IN ('REN', 'EUR')) + SUM("currency_amount_b") FILTER (WHERE "currency_symbol_b" IN ('REN', 'EUR')) AS "volume" FROM "currency"."forex" WHERE "buy_window" >= to_timestamp(1522540800) GROUP BY "project", "month"`,
      ]
    },
    {
      title: 'decimal without prefix 0',
      sql: [
        `SELECT date_trunc('month', time_window) , SUM(ren) * .999 as ren_normalized FROM currencies."forex" WHERE memory_address = '\x881d40237659c251811cec9c364ef91dc08d300c' GROUP BY 1`,
        `SELECT date_trunc('month', "time_window"), SUM("ren") * 0.999 AS "ren_normalized" FROM "currencies"."forex" WHERE "memory_address" = '\x881d40237659c251811cec9c364ef91dc08d300c' GROUP BY 1`
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
        'DELETE FROM "users" WHERE "id" = 2',
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
        `UPDATE "t1" SET "c1" = 'x' FROM "t2" WHERE "c3" = "t2"."c2"`,
      ]
    },
    {
      title: 'from clause in update with select',
      sql: [
        `UPDATE t1 SET c1 = 'x' FROM (select c2 from t2) WHERE c3 = c2`,
        `UPDATE "t1" SET "c1" = 'x' FROM (SELECT "c2" FROM "t2") WHERE "c3" = "c2"`,
      ]
    },
    {
      title: 'drop index',
      sql: [
        'drop index concurrently title_index cascade',
        'DROP INDEX CONCURRENTLY "title_index" CASCADE'
      ],
    },
    {
      title: 'with clause in update',
      sql: [
        `WITH olds AS (SELECT test_field_1, test_field_2 FROM test_tbl WHERE test_field_1=5)
        UPDATE test_tbl SET test_field_2 ='tested!' WHERE test_field_1=5
        RETURNING (SELECT test_field_1 FROM olds) AS test_field_1_old,
        (SELECT test_field_2 FROM olds) AS test_field_2_old;`,
        `WITH "olds" AS (SELECT "test_field_1", "test_field_2" FROM "test_tbl" WHERE "test_field_1" = 5) UPDATE "test_tbl" SET "test_field_2" = 'tested!' WHERE "test_field_1" = 5 RETURNING (SELECT "test_field_1" FROM "olds") AS "test_field_1_old", (SELECT "test_field_2" FROM "olds") AS "test_field_2_old"`
      ]
    },
    {
      title: 'string concatenator in where clause',
      sql: [
        "SELECT * from tests where name = 'test' || 'abc';",
        `SELECT * FROM "tests" WHERE "name" = 'test' || 'abc'`
      ]
    },
    {
      title: 'alter table add constraint',
      sql: [
        'ALTER TABLE address ADD CONSTRAINT user_id_address_fk FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE RESTRICT;',
        'ALTER TABLE "address" ADD CONSTRAINT "user_id_address_fk" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE RESTRICT'
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

  describe('returning', () => {
    it('should parse returning clause', () => {
      let sql = "UPDATE buildings SET address = 'update test 2' WHERE id = 18 RETURNING id, address"
      expect(getParsedSql(sql, opt)).to.equal(`UPDATE "buildings" SET "address" = 'update test 2' WHERE "id" = 18 RETURNING "id", "address"`)
      sql = "UPDATE buildings SET address = 'update test 2' WHERE id = 18 RETURNING *, address as newAddress"
      expect(getParsedSql(sql, opt)).to.equal(`UPDATE "buildings" SET "address" = 'update test 2' WHERE "id" = 18 RETURNING *, "address" AS "newAddress"`)
      sql = "UPDATE buildings SET address = 'update test 2' WHERE id = 18 RETURNING (SELECT address FROM buildings WHERE id = 18) as old_address;"
      expect(getParsedSql(sql, opt)).to.equal(`UPDATE "buildings" SET "address" = 'update test 2' WHERE "id" = 18 RETURNING (SELECT "address" FROM "buildings" WHERE "id" = 18) AS "old_address"`)
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
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT BY 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3 NO CYCLE OWNED BY "tn"."cn"'
        ]
      },
      {
        title: 'create sequence increment by start with cache, cycle and owned',
        sql: [
          `CREATE TEMPORARY SEQUENCE if not exists public.table_id_seq increment 10 no minvalue no maxvalue start with 1 cache 3 cycle owned by none`,
          'CREATE TEMPORARY SEQUENCE IF NOT EXISTS "public"."table_id_seq" INCREMENT 10 NO MINVALUE NO MAXVALUE START WITH 1 CACHE 3 CYCLE OWNED BY NONE'
        ]
      },
    ]
    neatlyNestTestedSQL(SQL_LIST)
  })

  describe('pg ast', () => {
    it('should get correct columns and tables', () => {
      const sql = 'SELECT "Id" FROM "Test";'
      const ast = parser.parse(sql, opt)
      expect(ast.tableList).to.be.eql(['select::null::Test'])
      expect(ast.columnList).to.be.eql(['select::null::Id'])
      expect(parser.sqlify(ast.ast, opt)).to.be.equals(sql.slice(0, -1))
    })
  })
})
