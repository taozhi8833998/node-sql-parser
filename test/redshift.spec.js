const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('redshift', () => {
  const parser = new Parser();
  const DEFAULT_OPT =  { database: 'redshift' }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support qualify condition', () => {
    let sql = `SELECT sf_account_id, date_trunc('week', date_) as week_id, date_trunc('month', date_) as month_id, Last_VALUE(hermes_health_score IGNORE NULLS) OVER ( partition by sf_account_id, week_id ) as hermes_health_score,
    Last_VALUE(hermes_health_score IGNORE NULLS) OVER ( partition by sf_account_id, month_id ) as hermes_health_score_monthly,  row_number() OVER ( PARTITION BY sf_account_id, date_trunc('week', date_)
    ORDER BY date_ desc ) AS o_key_week  FROM dwh.dwh_health_score_hermes  WHERE date_trunc('month', date_) >= '2023-01-01'  Qualify o_key_week = 1`
    expect(getParsedSql(sql)).to.be.equal(`SELECT sf_account_id, date_trunc('week', date_) AS "week_id", date_trunc('month', date_) AS "month_id", Last_VALUE(hermes_health_score IGNORE NULLS) OVER (PARTITION BY sf_account_id, week_id) AS "hermes_health_score", Last_VALUE(hermes_health_score IGNORE NULLS) OVER (PARTITION BY sf_account_id, month_id) AS "hermes_health_score_monthly", row_number() OVER (PARTITION BY sf_account_id, date_trunc('week', date_) ORDER BY date_ DESC) AS "o_key_week" FROM "dwh"."dwh_health_score_hermes" WHERE date_trunc('month', date_) >= '2023-01-01' QUALIFY o_key_week = 1`)
    sql = `with pv as (
      select
        action_date,
        visitor_id_v,
        visit_country_name,
        referer_channel_group,
        email,
        sgid,
        mp."brand/non-brand" as is_brand
      from
        dwh_fact_pageviews pv
        left join ppc_keywords_mapping mp using (campaign_keyword)
      )
      select is_brand as "b/nb" from pv where mp."brand/non-brand" = 'brand'`
      expect(getParsedSql(sql)).to.be.equal(`WITH "pv" AS (SELECT action_date, visitor_id_v, visit_country_name, referer_channel_group, email, sgid, "mp"."brand/non-brand" AS "is_brand" FROM "dwh_fact_pageviews" AS "pv" LEFT JOIN "ppc_keywords_mapping" AS "mp" USING ("campaign_keyword")) SELECT is_brand AS "b/nb" FROM "pv" WHERE "mp"."brand/non-brand" = 'brand'`)
  })

})