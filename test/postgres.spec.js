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
      `WITH subQ1 AS (SELECT * FROM "Roster" WHERE "SchoolID" = 52), subQ2 AS (SELECT "SchoolID" FROM "subQ1") SELECT DISTINCT * FROM "subQ2"`
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
        `WITH t AS (SELECT ARRAY['a','b','c'] AS "a") SELECT "a"[2] FROM "t"`
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
})
