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
      title: 'multiple union all',
      sql: [
        'select * from ( ( ( select * from some_table ) union all ( select * from some_table ) )  union all ( select * from some_table )  )',
        'SELECT * FROM (((SELECT * FROM "some_table") UNION ALL (SELECT * FROM "some_table")) UNION ALL (SELECT * FROM "some_table"))'
      ]
    },
    {
      title: 'generate virtual table rows',
      sql: [
        `select *, date(concat(left(date,7),'-01')) as date_start_month, left(date,7) as month from
          ((select
            dateadd(day, '-' || seq4(), current_date()) as date
          from
            table(generator(rowcount => 1095))
          where date>='2022-10-01') as dates
          left join
          (select id, name, category, start_date, end_date, days, cost, cost/days as cost_per_day
          from
          (select id, name, category, start_date, end_date, cost, datediff('day',start_date, end_date)+1 as days
          from ui_other_costs
          group by 1,2,3,4,5,6)
          group by 1,2,3,4,5,6,7) as cost)
          where dates.date between cost.start_date and cost.end_date`,
          `SELECT *, date(concat(left("date", 7), '-01')) AS "date_start_month", left("date", 7) AS "month" FROM ((SELECT dateadd("day", '-' || seq4(), CURRENT_DATE()) AS "date" FROM TABLE(GENERATOR(ROWCOUNT => 1095)) WHERE "date" >= '2022-10-01') AS "dates" LEFT JOIN (SELECT "id", "name", "category", "start_date", "end_date", "days", "cost", "cost" / "days" AS "cost_per_day" FROM (SELECT "id", "name", "category", "start_date", "end_date", "cost", datediff('day', "start_date", "end_date") + 1 AS "days" FROM "ui_other_costs" GROUP BY 1, 2, 3, 4, 5, 6) GROUP BY 1, 2, 3, 4, 5, 6, 7) AS "cost") WHERE "dates"."date" BETWEEN "cost"."start_date" AND "cost"."end_date"`
      ]
    },
    {
      title: 'unpivot function',
      sql: [
        `select transaction_date,
          platform,
          date_granularity,
          transaction_type,
          buyer_country,
          sku,
          transaction_currency,
          exchange_rate,
          transaction_amount_usd,
          transaction_amount_local_currency,
          transaction_amount_ils
        from
        ((select 'android' as platform,
          'Daily' as date_granularity,
          transaction_date,
          transaction_type,
          buyer_country,
          sku,
          transaction_currency,
          exchange_rate,
          sum(transaction_amount_usd) as transaction_amount_usd,
          sum(transaction_amount_local_currency) as transaction_amount_local_currency,
          sum(amount_merchant_currency) as transaction_amount_ils
        from
        (select
          to_date(ge.transaction_date, 'Mon DD, YYYY') as transaction_date
          ,ge.transaction_type as transaction_type
          ,ge.product_title as product
          ,ge.sku_id as sku
          ,ge.buyer_country as buyer_country
          ,ge.buyer_currency as transaction_currency
          ,er.rate as exchange_rate
          ,ge.amount_buyer_currency as transaction_amount_local_currency
          ,ge.amount_buyer_currency / er.rate as transaction_amount_usd
          ,ge.amount_merchant_currency as amount_merchant_currency
          from (select distinct * from staging.raw.google_play_store_earnings) as ge
          join F_EXCHANGE_RATES as er
          on date(er.time)=  to_date(ge.transaction_date, 'Mon DD, YYYY') and er.currency = ge.buyer_currency)
        group by all)
        UNION ALL
        (select platform,
          date_granularity,
          transaction_date,
          transaction_type,
          buyer_country,
          sku,
          transaction_currency,
          exchange_rate,
          transaction_amount_usd,
          case when transaction_type='CHARGE' then transaction_amount_local_currency when transaction_type='TAXES_AND_FEES' then Taxes_and_Fees_local_currency end as transaction_amount_local_currency,
          transaction_amount_usd*ils_exchange_rate as transaction_amount_ils
        from
        (select distinct *
        from
        (select 'ios' as platform,
          date_granularity,
          date as transaction_date,
          buyer_country,
          sku,
          transaction_currency,
          exchange_rate,
          ils.exchange_rate as ils_exchange_rate,
          sum(transaction_amount_usd) as Charge,
          sum(developer_proceeds_usd) as Taxes_and_Fees,
          sum(transaction_amount_local_currency) as transaction_amount_local_currency,
          sum(developer_proceeds) as Taxes_and_Fees_local_currency
        from
        (select
          date(ge1.begin_date) as date
          ,ge1.date_granularity as date_granularity --if granulity is grater than Daily will convert based on begin_date exchange rate
          ,ge1.title as sku
          ,ge1.country_code as buyer_country
          ,ge1.currency_of_proceeds as transaction_currency
          ,er1.rate as exchange_rate
          ,ge1.units as units
          ,(ge1.customer_price-ge1.developer_proceeds) * ge1.units * (-1) as developer_proceeds
          ,ge1.customer_price*ge1.units as transaction_amount_local_currency
          ,ge1.customer_price*ge1.units / er1.rate as transaction_amount_usd
          ,(ge1.customer_price-ge1.developer_proceeds) * ge1.units / er1.rate * (-1) as developer_proceeds_usd
          from (select distinct * from staging.raw.apps_store_connect_sales) as ge1
          join (select distinct * from F_EXCHANGE_RATES) as er1
          on date(er1.time) =  date(ge1.begin_date) and er1.currency = ge1.currency_of_proceeds)
          left join
          (select date(time) as date, currency, rate as exchange_rate from (select distinct * from F_EXCHANGE_RATES) where currency='ILS') as ils
          using(date)
        group by all)
        unpivot(transaction_amount_usd FOR transaction_type IN (Charge, Taxes_and_Fees)))))`,
        `SELECT "transaction_date", "platform", "date_granularity", "transaction_type", "buyer_country", "sku", "transaction_currency", "exchange_rate", "transaction_amount_usd", "transaction_amount_local_currency", "transaction_amount_ils" FROM ((SELECT 'android' AS "platform", 'Daily' AS "date_granularity", "transaction_date", "transaction_type", "buyer_country", "sku", "transaction_currency", "exchange_rate", SUM("transaction_amount_usd") AS "transaction_amount_usd", SUM("transaction_amount_local_currency") AS "transaction_amount_local_currency", SUM("amount_merchant_currency") AS "transaction_amount_ils" FROM (SELECT to_date("ge"."transaction_date", 'Mon DD, YYYY') AS "transaction_date", "ge"."transaction_type" AS "transaction_type", "ge"."product_title" AS "product", "ge"."sku_id" AS "sku", "ge"."buyer_country" AS "buyer_country", "ge"."buyer_currency" AS "transaction_currency", "er"."rate" AS "exchange_rate", "ge"."amount_buyer_currency" AS "transaction_amount_local_currency", "ge"."amount_buyer_currency" / "er"."rate" AS "transaction_amount_usd", "ge"."amount_merchant_currency" AS "amount_merchant_currency" FROM (SELECT DISTINCT * FROM "staging"."raw"."google_play_store_earnings") AS "ge" INNER JOIN "F_EXCHANGE_RATES" AS "er" ON date("er"."time") = to_date("ge"."transaction_date", 'Mon DD, YYYY') AND "er"."currency" = "ge"."buyer_currency") GROUP BY ALL) UNION ALL (SELECT "platform", "date_granularity", "transaction_date", "transaction_type", "buyer_country", "sku", "transaction_currency", "exchange_rate", "transaction_amount_usd", CASE WHEN "transaction_type" = 'CHARGE' THEN "transaction_amount_local_currency" WHEN "transaction_type" = 'TAXES_AND_FEES' THEN "Taxes_and_Fees_local_currency" END AS "transaction_amount_local_currency", "transaction_amount_usd" * "ils_exchange_rate" AS "transaction_amount_ils" FROM (SELECT DISTINCT * FROM (SELECT 'ios' AS "platform", "date_granularity", "date" AS "transaction_date", "buyer_country", "sku", "transaction_currency", "exchange_rate", "ils"."exchange_rate" AS "ils_exchange_rate", SUM("transaction_amount_usd") AS "Charge", SUM("developer_proceeds_usd") AS "Taxes_and_Fees", SUM("transaction_amount_local_currency") AS "transaction_amount_local_currency", SUM("developer_proceeds") AS "Taxes_and_Fees_local_currency" FROM (SELECT date("ge1"."begin_date") AS "date", "ge1"."date_granularity" AS "date_granularity", "ge1"."title" AS "sku", "ge1"."country_code" AS "buyer_country", "ge1"."currency_of_proceeds" AS "transaction_currency", "er1"."rate" AS "exchange_rate", "ge1"."units" AS "units", ("ge1"."customer_price-ge1"."developer_proceeds") * "ge1"."units" * (-1) AS "developer_proceeds", "ge1"."customer_price" * "ge1"."units" AS "transaction_amount_local_currency", "ge1"."customer_price" * "ge1"."units" / "er1"."rate" AS "transaction_amount_usd", ("ge1"."customer_price-ge1"."developer_proceeds") * "ge1"."units" / "er1"."rate" * (-1) AS "developer_proceeds_usd" FROM (SELECT DISTINCT * FROM "staging"."raw"."apps_store_connect_sales") AS "ge1" INNER JOIN (SELECT DISTINCT * FROM "F_EXCHANGE_RATES") AS "er1" ON date("er1"."time") = date("ge1"."begin_date") AND "er1"."currency" = "ge1"."currency_of_proceeds") LEFT JOIN (SELECT date("time") AS "date", "currency", "rate" AS "exchange_rate" FROM (SELECT DISTINCT * FROM "F_EXCHANGE_RATES") WHERE "currency" = 'ILS') AS "ils" USING ("date") GROUP BY ALL) UNPIVOT("transaction_amount_usd" FOR "transaction_type" IN ("Charge", "Taxes_and_Fees")))))`,
      ]
    },
    {
      title: '* with exclude single column',
      sql: [
        'SELECT table_a.* EXCLUDE column_in_table_a from tableName',
        'SELECT "table_a".* EXCLUDE "column_in_table_a" FROM "tableName"'
      ]
    },
    {
      title: '* with exclude multiple columns',
      sql: [
        'select * exclude (user_id,daily_iap,iap_7d,iap_30d,purchases_cnt), count(distinct user_id)DAU from tableName',
        'SELECT * EXCLUDE("user_id", "daily_iap", "iap_7d", "iap_30d", "purchases_cnt"), COUNT(DISTINCT "user_id") AS "DAU" FROM "tableName"'
      ]
    },
    {
      title: 'create or replace view',
      sql: [
        `create or replace view JACEK_DB.PUBLIC.VALIDATION_DATA_VIEW(
          ID,
          DATA,
          LOLZ
        ) as (SELECT *, DATA AS LOLZ FROM VALIDATION_DATA);`,
        'CREATE OR REPLACE VIEW "JACEK_DB"."PUBLIC"."VALIDATION_DATA_VIEW" ("ID", "DATA", "LOLZ") AS (SELECT *, "DATA" AS "LOLZ" FROM "VALIDATION_DATA")'
      ]
    },
    {
      title: 'keyword in alias clause',
      sql: [
        'select user_id, Limits as Limit from tableName',
        'SELECT "user_id", "Limits" AS "Limit" FROM "tableName"',
      ]
    },
    {
      title: 'in op right expr',
      sql: [
        'SELECT POSITION("3" IN split_part("W3Schools|com", "|", 11)) AS MatchPosition;',
        'SELECT POSITION("3" IN split_part("W3Schools|com", "|", 11)) AS "MatchPosition"'
      ]
    },
    {
      title: 'limit is not reserved keyword',
      sql: [
        'select * from tb where wins>=limit',
        'SELECT * FROM "tb" WHERE "wins" >= limit',
      ]
    },
    {
      title: 'basic limit clause',
      sql: [
        'select * from tb limit 10',
        'SELECT * FROM "tb" LIMIT 10',
      ]
    },
    {
      title: 'over partition after function',
      sql: [
        `select
          mode(name) OVER (
            partition by
              id
          ) most_frequent_name
          from airbnb.staging_test1_montara1_com.raw_hosts h`,
        'SELECT mode("name") OVER (PARTITION BY "id") AS "most_frequent_name" FROM "airbnb"."staging_test1_montara1_com"."raw_hosts" AS "h"'
      ]
    },
    {
      title: 'keyword in column name',
      sql: [
        'SELECT  bi_json:limit AS limit FROM modelc',
        'SELECT "bi_json"."limit" AS "limit" FROM "modelc"'
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
