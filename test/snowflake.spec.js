const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('snowflake', () => {
  const parser = new Parser();
  const opt = {
    database: 'snowflake'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: 'select from lateral flatten',
      sql: [
        `SELECT d.value as data_by_row
        FROM source,
        LATERAL FLATTEN(INPUT => PARSE_JSON(jsontext), outer => true) d`,
        'SELECT "d"."value" AS "data_by_row" FROM "source", LATERAL FLATTEN(INPUT => PARSE_JSON("jsontext"), OUTER => TRUE) AS "d"'
      ]
    },
    {
      title: 'select from lateral flatten with path',
      sql: [
        `SELECT * FROM TABLE(FLATTEN(input => parse_json('{"a":1, "b":[77,88]}'), path => 'b')) f;`,
        `SELECT * FROM TABLE(FLATTEN(INPUT => parse_json('{"a":1, "b":[77,88]}'), PATH => 'b')) AS "f"`
      ]
    },
    {
      title: 'select from lateral flatten with mode',
      sql: [
        `SELECT * FROM TABLE(FLATTEN(input => parse_json('{"a":1, "b":[77,88], "c": {"d":"X"}}'),
        recursive => true, mode => 'object' )) f;`,
        `SELECT * FROM TABLE(FLATTEN(INPUT => parse_json('{"a":1, "b":[77,88], "c": {"d":"X"}}'), RECURSIVE => TRUE, MODE => 'OBJECT')) AS "f"`
      ]
    },
    {
      title: 'complex select stmt',
      sql: [
        `WITH source AS (

          SELECT *
          FROM foo
          ORDER BY uploaded_at DESC
          LIMIT 1

      ), flattened AS (

          SELECT d.value as data_by_row
          FROM source,
          LATERAL FLATTEN(INPUT => PARSE_JSON(jsontext), outer => true) d

      ), renamed AS (

          SELECT
            data_by_row['country']::VARCHAR                       AS country,
            data_by_row['gitlab']::VARCHAR                        AS gitlab_handle,
            data_by_row['gitlabId']::VARCHAR                      AS gitlab_id,
            data_by_row['isBackendMaintainer']::BOOLEAN           AS is_backend_maintainer,
            data_by_row['isBackendTraineeMaintainer']::BOOLEAN    AS is_backend_trainee_maintainer,
            data_by_row['isDatabaseMaintainer']::BOOLEAN          AS is_database_maintainer,
            data_by_row['isDatabaseTraineeMaintainer']::BOOLEAN   AS is_database_trainee_maintainer,
            data_by_row['isFrontendMaintainer']::BOOLEAN          AS is_frontend_maintainer,
            data_by_row['isFrontendTraineeMaintainer']::BOOLEAN   AS is_frontend_trainee_maintainer,
            data_by_row['isManager']::BOOLEAN                     AS is_manager,
            data_by_row['level']::VARCHAR                         AS team_member_level,
            data_by_row['locality']::VARCHAR                      AS locality,
            data_by_row['location_factor']::DOUBLE PRECISION      AS location_factor,
            data_by_row['matchName']::VARCHAR                     AS match_name,
            data_by_row['name']::VARCHAR                          AS name,
            data_by_row['section']::VARCHAR                       AS development_section,
            data_by_row['start_date']::DATE                       AS start_date,
            data_by_row['team']::VARCHAR                          AS team,
            data_by_row['technology']::VARCHAR                    AS technology_group
          FROM flattened

        )
        SELECT *
        FROM renamed`,
        `WITH "source" AS (SELECT * FROM "foo" ORDER BY "uploaded_at" DESC LIMIT 1), "flattened" AS (SELECT "d"."value" AS "data_by_row" FROM "source", LATERAL FLATTEN(INPUT => PARSE_JSON("jsontext"), OUTER => TRUE) AS "d"), "renamed" AS (SELECT "data_by_row"['country']::VARCHAR AS "country", "data_by_row"['gitlab']::VARCHAR AS "gitlab_handle", "data_by_row"['gitlabId']::VARCHAR AS "gitlab_id", "data_by_row"['isBackendMaintainer']::BOOLEAN AS "is_backend_maintainer", "data_by_row"['isBackendTraineeMaintainer']::BOOLEAN AS "is_backend_trainee_maintainer", "data_by_row"['isDatabaseMaintainer']::BOOLEAN AS "is_database_maintainer", "data_by_row"['isDatabaseTraineeMaintainer']::BOOLEAN AS "is_database_trainee_maintainer", "data_by_row"['isFrontendMaintainer']::BOOLEAN AS "is_frontend_maintainer", "data_by_row"['isFrontendTraineeMaintainer']::BOOLEAN AS "is_frontend_trainee_maintainer", "data_by_row"['isManager']::BOOLEAN AS "is_manager", "data_by_row"['level']::VARCHAR AS "team_member_level", "data_by_row"['locality']::VARCHAR AS "locality", "data_by_row"['location_factor']::DOUBLE AS "PRECISION" AS "location_factor", "data_by_row"['matchName']::VARCHAR AS "match_name", "data_by_row"['name']::VARCHAR AS "name", "data_by_row"['section']::VARCHAR AS "development_section", "data_by_row"['start_date']::DATE AS "start_date", "data_by_row"['team']::VARCHAR AS "team", "data_by_row"['technology']::VARCHAR AS "technology_group" FROM "flattened") SELECT * FROM "renamed"`
      ]
    },
    {
      title: 'alias to be identified',
      sql: [
        'select Age, "name" as "a\b" from schmeaName.tableName',
        'SELECT "Age", "name" AS "a\b" FROM "schmeaName"."tableName"'
      ]
    },
    {
      title: 'select from db.scheme.table',
      sql: [
        'SELECT * FROM my_db.my_schema.my_table',
        'SELECT * FROM "my_db"."my_schema"."my_table"'
      ]
    },
    {
      title: 'double slash comment',
      sql: [
        `// some comment
        SELECT * FROM TABLEName`,
        'SELECT * FROM "TABLEName"'
      ]
    },
    {
      title: 'cast to number data type',
      sql: [
        `SELECT listing_id,
        listing_name,
        room_type,
        host_id,
        REPLACE(price_str, '$') :: NUMBER(10, 2) AS price,
        created_at,
        updated_at
        FROM src_listings`,
        `SELECT "listing_id", "listing_name", "room_type", "host_id", REPLACE("price_str", '$')::NUMBER(10, 2) AS "price", "created_at", "updated_at" FROM "src_listings"`
      ]
    },
    {
      title: 'regexp operator',
      sql: [
        `SELECT v
    FROM strings
    WHERE v REGEXP 'San* [fF].*'

    UNION ALL

    SELECT v
    FROM strings
    WHERE v NOT REGEXP 'San\\w+?o'`,
        'SELECT "v" FROM "strings" WHERE "v" REGEXP \'San* [fF].*\' UNION ALL SELECT "v" FROM "strings" WHERE "v" NOT REGEXP \'San\\w+?o\''
      ]
    },
    {
      title: 'create table as',
      sql: [
        'CREATE TABLE EMP_SEL_COL as SELECT FNAME,DEPARTMENT,SALARY FROM EMPLOYEE.PUBLIC.EMP',
        'CREATE TABLE "EMP_SEL_COL" AS SELECT "FNAME", "DEPARTMENT", "SALARY" FROM "EMPLOYEE"."PUBLIC"."EMP"'
      ]
    },
    {
      title: 'query statement uses a colon in the column name',
      sql: [
        'SELECT src:salesperson:name FROM car_sales ORDER BY 1;',
        'SELECT "src":"salesperson"."name" FROM "car_sales" ORDER BY 1 ASC',
      ]
    },
    {
      title: 'colon and array indexgd',
      sql: [
        'SELECT src:customer[0].name, src:vehicle[0] FROM car_sales ORDER BY 1;',
        'SELECT "src"."customer"[0].name, "src"."vehicle"[0] FROM "car_sales" ORDER BY 1 ASC',
      ]
    },
  ]
  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })
})
