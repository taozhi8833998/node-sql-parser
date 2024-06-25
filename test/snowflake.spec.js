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
    {
      title: 'qualify expr',
      sql: [
        `SELECT i, p, o
        FROM qt
        QUALIFY ROW_NUMBER() OVER (PARTITION BY p ORDER BY o) = 1;`,
        'SELECT "i", "p", "o" FROM "qt" QUALIFY ROW_NUMBER() OVER (PARTITION BY "p" ORDER BY "o" ASC) = 1'
      ]
    },
    {
      title: 'json visitor',
      sql: [
        `SELECT
        '1'||'_'||tj.ID AS JOB_KEY,
        tj.ID AS PAY_JOB_ID,
        tj.ID,
        case when tj.transcription_job_split_id is not null then 1 else 0 end AS TRANSCRIPTION_IS_SPLIT, --chnaged logic for all splits
        case when tjs.transcription_job_id is not null then tjs.transcription_job_id else tj.id end as PARENT_TRANSCRIPTION_JOB_ID, --New column--
        case when tjss.transcription_job_id is not null then tjss.transcription_job_id
          when tjss.transcription_job_id is null and tjs.transcription_job_id  is not null then tjs.transcription_job_id
          else tj.id end AS TRANSCRIPTION_ORIGINAL_JOB_ID,
        case when tjss.transcription_job_id is not null then tjss.transcription_job_id
          when tjss.transcription_job_id is null and tjs.transcription_job_id  is not null then tjs.transcription_job_id
          else tj.id end AS REV_JOB_ID,
        tj.catalog_item_id,
        PARSE_JSON(tj.METADATA) AS METADATA,
        PARSE_JSON(tj.METADATA):entry_id::STRING AS ENTRY_ID, --relavent for Kaltura only--
        PARSE_JSON(tj.METADATA):partner_id::NUMBER AS PARTNER_ID,--relavent for Kaltura only--
        PARSE_JSON(tj.METADATA):original_profile_id::NUMBER AS ORIGINAL_PROFILE_ID,
        PARSE_JSON(tj.config):external_provider_captioning_provider::STRING AS caption_provider,
        PARSE_JSON(tj.config):external_provider_transcription_provider::STRING AS transcription_provider,
        tj.FRAUD_ISSUES,
        tj.OWNER_ID, --this will be the customer user that uploaded the file--
        tj.SANDBOX,-- should be excluded in all cases--
        coalesce(tj.ORDER_ID, tj.ORDER_UUID) ORDER_ID,
        coalesce(tj.ORDER_ID, tj.ORDER_UUID) IS NOT NULL AS ONE_ORDERING,
        tj.SOURCE_TABLE,
        coalesce(tj.job_flow_id,p.job_flow_id) as JOB_FLOW_ID
        FROM MRR.MRR_VERBIT_TRANSCRIPTION_JOBS tj -- SON --
        left join MRR.MRR_VERBIT_TRANSCRIPTION_JOB_SPLITS tjs
        on tj.transcription_job_split_id=tjs.id
        inner join MRR.MRR_VERBIT_PROFILES p on tj.profile_id=p.id
        left join MRR.MRR_VERBIT_TRANSCRIPTION_JOBS tjj -- FATHER --
        on tjs.transcription_job_id=tjj.id
        left join MRR.MRR_VERBIT_TRANSCRIPTION_JOB_SPLITS tjss  -- GRANDPHA --
        on tjj.transcription_job_split_id=tjss.id`,
        `SELECT '1' || '_' || "tj"."ID" AS "JOB_KEY", "tj"."ID" AS "PAY_JOB_ID", "tj"."ID", CASE WHEN "tj"."transcription_job_split_id" IS NOT NULL THEN 1 ELSE 0 END AS "TRANSCRIPTION_IS_SPLIT", CASE WHEN "tjs"."transcription_job_id" IS NOT NULL THEN "tjs"."transcription_job_id" ELSE "tj"."id" END AS "PARENT_TRANSCRIPTION_JOB_ID", CASE WHEN "tjss"."transcription_job_id" IS NOT NULL THEN "tjss"."transcription_job_id" WHEN "tjss"."transcription_job_id" IS NULL AND "tjs"."transcription_job_id" IS NOT NULL THEN "tjs"."transcription_job_id" ELSE "tj"."id" END AS "TRANSCRIPTION_ORIGINAL_JOB_ID", CASE WHEN "tjss"."transcription_job_id" IS NOT NULL THEN "tjss"."transcription_job_id" WHEN "tjss"."transcription_job_id" IS NULL AND "tjs"."transcription_job_id" IS NOT NULL THEN "tjs"."transcription_job_id" ELSE "tj"."id" END AS "REV_JOB_ID", "tj"."catalog_item_id", PARSE_JSON("tj"."METADATA") AS "METADATA", PARSE_JSON("tj"."METADATA") :entry_id::STRING AS "ENTRY_ID", PARSE_JSON("tj"."METADATA") :partner_id::NUMBER AS "PARTNER_ID", PARSE_JSON("tj"."METADATA") :original_profile_id::NUMBER AS "ORIGINAL_PROFILE_ID", PARSE_JSON("tj"."config") :external_provider_captioning_provider::STRING AS "caption_provider", PARSE_JSON("tj"."config") :external_provider_transcription_provider::STRING AS "transcription_provider", "tj"."FRAUD_ISSUES", "tj"."OWNER_ID", "tj"."SANDBOX", coalesce("tj"."ORDER_ID", "tj"."ORDER_UUID") AS "ORDER_ID", coalesce("tj"."ORDER_ID", "tj"."ORDER_UUID") IS NOT NULL AS "ONE_ORDERING", "tj"."SOURCE_TABLE", coalesce("tj"."job_flow_id", "p"."job_flow_id") AS "JOB_FLOW_ID" FROM "MRR"."MRR_VERBIT_TRANSCRIPTION_JOBS" AS "tj" LEFT JOIN "MRR"."MRR_VERBIT_TRANSCRIPTION_JOB_SPLITS" AS "tjs" ON "tj"."transcription_job_split_id" = "tjs"."id" INNER JOIN "MRR"."MRR_VERBIT_PROFILES" AS "p" ON "tj"."profile_id" = "p"."id" LEFT JOIN "MRR"."MRR_VERBIT_TRANSCRIPTION_JOBS" AS "tjj" ON "tjs"."transcription_job_id" = "tjj"."id" LEFT JOIN "MRR"."MRR_VERBIT_TRANSCRIPTION_JOB_SPLITS" AS "tjss" ON "tjj"."transcription_job_split_id" = "tjss"."id"`
      ]
    },
    {
      title: 'Support Snowflake types: NUMERIC, BYTEINT, BINARY, VARBINARY, GEOGRAPHY, TIMESTAMP_TZ',
      sql: [
        `
          CREATE TABLE TEST_SNOWFLAKE (
              "att1" NUMERIC(3,3),
              "att2" BYTEINT,
              "att3_SAMPLE_3" BINARY,
              "att4_SAMPLE_4" VARBINARY,
              "att5_SAMPLE_5" GEOGRAPHY,
              "att6_SAMPLE_6" TIMESTAMP_TZ,
              primary key ("att1")
          );
        `,
        `CREATE TABLE "TEST_SNOWFLAKE" ("att1" NUMERIC(3, 3), "att2" BYTEINT, "att3_SAMPLE_3" BINARY, "att4_SAMPLE_4" VARBINARY, "att5_SAMPLE_5" GEOGRAPHY, "att6_SAMPLE_6" TIMESTAMP_TZ, PRIMARY KEY ("att1"))`
      ]
    },
    {
      title: 'create or replace table',
      sql: [
        'create or replace TABLE HOSPITAL.PUBLIC.BILLING (BILL_ID VARCHAR(16777216) NOT NULL, DATE TIMESTAMP_NTZ(9), B_ID VARBINARY(333), primary key (BILL_ID));',
        'CREATE OR REPLACE TABLE "HOSPITAL"."PUBLIC"."BILLING" ("BILL_ID" VARCHAR(16777216) NOT NULL, "DATE" TIMESTAMP_NTZ(9), "B_ID" VARBINARY(333), PRIMARY KEY ("BILL_ID"))'
      ]
    },
    {
      title: 'create or replace schema',
      sql: [
        'create or replace schema DELETETHISDB.PUBLIC;',
        'CREATE OR REPLACE SCHEMA DELETETHISDB.PUBLIC'
      ]
    },
    {
      title: 'table name start with digit',
      sql: [
        'CREATE TABLE 1dog (id INT);',
        'CREATE TABLE "1dog" ("id" INT)'
      ]
    },
    {
      title: 'group by all',
      sql: [
        'SELECT A, B, COUNT(*) FROM T GROUP BY All',
        'SELECT "A", "B", COUNT(*) FROM "T" GROUP BY ALL'
      ]
    },
    {
      title: 'top clause in select',
      sql: [
        'select top 10 * from cleansed_hosts',
        'SELECT TOP 10 * FROM "cleansed_hosts"'
      ]
    },
    {
      title: 'pa',
      sql: [
        'select * from ( ( ( select * from some_table ) union all ( select * from some_table ) )  union all ( select * from some_table )  )',
        'SELECT * FROM (((SELECT * FROM "some_table") UNION ALL (SELECT * FROM "some_table")) UNION ALL (SELECT * FROM "some_table"))'
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
