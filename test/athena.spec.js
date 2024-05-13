const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('athena', () => {
  const parser = new Parser();
  const DEFAULT_OPT =  { database: 'athena' }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support array data type', () => {
    const sql = `SELECT
    sessionId session_id,
    organizationName organization,
    appMode note_type,
    rating note_rating,
    therapistId therapist_id,
    distinct_id email,
    FROM_UNIXTIME((mp_processing_time_ms / 1000)) last_updated_ts,
    source,
    CAST(json_parse (selectedSubTags) AS ARRAY (varchar)) note_rating_tags,
    description rating_description
  FROM
    events_mp_master_event
  WHERE
    (mp_event_name = 'submit feedback clicked')`
      expect(getParsedSql(sql)).to.be.equal("SELECT `sessionId` AS `session_id`, `organizationName` AS `organization`, `appMode` AS `note_type`, `rating` AS `note_rating`, `therapistId` AS `therapist_id`, `distinct_id` AS `email`, FROM_UNIXTIME((`mp_processing_time_ms` / 1000)) AS `last_updated_ts`, `source`, CAST(json_parse(`selectedSubTags`) AS ARRAY(VARCHAR)) AS `note_rating_tags`, `description` AS `rating_description` FROM `events_mp_master_event` WHERE (`mp_event_name` = 'submit feedback clicked')")
  })
  it('should support over partition and extract', () => {
    this.maxDiffSize = '900000000'
    const sql = `WITH weekly_data AS (
      SELECT
      LOWER(m.distinct_id) as therapist,
      SPLIT_PART(SPLIT_PART(distinct_id, '@', 2), '.', 1) AS eleos_organization,
      DATE_TRUNC('week', timestamp_event) AS week_start,
      MIN(DATE_TRUNC('week', timestamp_event)) OVER (PARTITION BY LOWER(m.distinct_id)) AS first_note_week
      FROM
      bronze_prod.outreach_mixpanel_events m
      WHERE
      SPLIT_PART(SPLIT_PART(distinct_id, '@', 2), '.', 1) in ('thresholds','trilogyinc', 'zepfcenter')
      AND timestamp_event IS NOT NULL
      AND event LIKE '%outreach - note saved%'
      ),

      weekly_totals as (
      SELECT
      wd.eleos_organization,
      wd.week_start,
      COUNT(DISTINCT wd.therapist) active_therapists,
      COUNT(DISTINCT CASE WHEN wd.first_note_week = wd.week_start THEN wd.therapist END) AS activated_therapists,
      SUM(COUNT(DISTINCT CASE WHEN wd.first_note_week = wd.week_start THEN wd.therapist END))
      OVER (PARTITION by wd.eleos_organization ORDER BY wd.week_start ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS accumulated_therapists
      FROM weekly_data wd
      GROUP BY wd.week_start, wd.eleos_organization
      ORDER BY wd.week_start
      ),

      weekly_data_with_namber as (
      Select distinct
      eleos_organization,
      therapist,
      week_start,
      first_note_week,
      EXTRACT(DAY FROM week_start - first_note_week)/7 as week_number
      from weekly_data
      order by first_note_week
      )

      Select
      wd.eleos_organization,
      wd.first_note_week,
      wt.active_therapists,
      wt.activated_therapists,
      wt.accumulated_therapists,
      SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END) AS week_0,
      SUM(CASE WHEN week_number = 1 THEN 1 ELSE 0 END) AS week_1,
      SUM(CASE WHEN week_number = 2 THEN 1 ELSE 0 END) AS week_2,
      SUM(CASE WHEN week_number = 3 THEN 1 ELSE 0 END) AS week_3,
      SUM(CASE WHEN week_number = 4 THEN 1 ELSE 0 END) AS week_4,
      SUM(CASE WHEN week_number = 5 THEN 1 ELSE 0 END) AS week_5,
      SUM(CASE WHEN week_number = 6 THEN 1 ELSE 0 END) AS week_6,
      SUM(CASE WHEN week_number = 7 THEN 1 ELSE 0 END) AS week_7,
      SUM(CASE WHEN week_number = 8 THEN 1 ELSE 0 END) AS week_8,
      SUM(CASE WHEN week_number = 9 THEN 1 ELSE 0 END) AS week_9,
      SUM(CASE WHEN week_number = 10 THEN 1 ELSE 0 END) AS week_10,
      SUM(CASE WHEN week_number = 11 THEN 1 ELSE 0 END) AS week_11,
      SUM(CASE WHEN week_number = 12 THEN 1 ELSE 0 END) AS week_12,
      SUM(CASE WHEN week_number = 13 THEN 1 ELSE 0 END) AS week_13,
      SUM(CASE WHEN week_number = 14 THEN 1 ELSE 0 END) AS week_14,
      SUM(CASE WHEN week_number = 15 THEN 1 ELSE 0 END) AS week_15,
      SUM(CASE WHEN week_number = 16 THEN 1 ELSE 0 END) AS week_16,
      SUM(CASE WHEN week_number = 17 THEN 1 ELSE 0 END) AS week_17,
      SUM(CASE WHEN week_number = 18 THEN 1 ELSE 0 END) AS week_18,
      SUM(CASE WHEN week_number = 19 THEN 1 ELSE 0 END) AS week_19,
      SUM(CASE WHEN week_number = 20 THEN 1 ELSE 0 END) AS week_20,
      SUM(CASE WHEN week_number = 21 THEN 1 ELSE 0 END) AS week_21,
      SUM(CASE WHEN week_number = 22 THEN 1 ELSE 0 END) AS week_22,
      SUM(CASE WHEN week_number = 23 THEN 1 ELSE 0 END) AS week_23,
      SUM(CASE WHEN week_number = 24 THEN 1 ELSE 0 END) AS week_24,
      SUM(CASE WHEN week_number = 25 THEN 1 ELSE 0 END) AS week_25,
      SUM(CASE WHEN week_number = 26 THEN 1 ELSE 0 END) AS week_26,
      SUM(CASE WHEN week_number = 27 THEN 1 ELSE 0 END) AS week_27,
      SUM(CASE WHEN week_number = 28 THEN 1 ELSE 0 END) AS week_28,
      SUM(CASE WHEN week_number = 29 THEN 1 ELSE 0 END) AS week_29,
      ROUND(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_0_percentage,
      ROUND(SUM(CASE WHEN week_number = 1 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_1_percentage,
      ROUND(SUM(CASE WHEN week_number = 2 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_2_percentage,
      ROUND(SUM(CASE WHEN week_number = 3 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_3_percentage,
      ROUND(SUM(CASE WHEN week_number = 4 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_4_percentage,
      ROUND(SUM(CASE WHEN week_number = 5 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_5_percentage,
      ROUND(SUM(CASE WHEN week_number = 6 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_6_percentage,
      ROUND(SUM(CASE WHEN week_number = 7 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_7_percentage,
      ROUND(SUM(CASE WHEN week_number = 8 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_8_percentage,
      ROUND(SUM(CASE WHEN week_number = 9 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_9_percentage,
      ROUND(SUM(CASE WHEN week_number = 10 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_10_percentage,
      ROUND(SUM(CASE WHEN week_number = 11 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_11_percentage,
      ROUND(SUM(CASE WHEN week_number = 12 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_12_percentage,
      ROUND(SUM(CASE WHEN week_number = 13 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_13_percentage,
      ROUND(SUM(CASE WHEN week_number = 14 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_14_percentage,
      ROUND(SUM(CASE WHEN week_number = 15 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_15_percentage,
      ROUND(SUM(CASE WHEN week_number = 16 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_16_percentage,
      ROUND(SUM(CASE WHEN week_number = 17 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_17_percentage,
      ROUND(SUM(CASE WHEN week_number = 18 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_18_percentage,
      ROUND(SUM(CASE WHEN week_number = 19 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_19_percentage,
      ROUND(SUM(CASE WHEN week_number = 20 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_20_percentage,
      ROUND(SUM(CASE WHEN week_number = 21 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_21_percentage,
      ROUND(SUM(CASE WHEN week_number = 22 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_22_percentage,
      ROUND(SUM(CASE WHEN week_number = 23 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_23_percentage,
      ROUND(SUM(CASE WHEN week_number = 24 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_24_percentage,
      ROUND(SUM(CASE WHEN week_number = 25 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_25_percentage,
      ROUND(SUM(CASE WHEN week_number = 26 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_26_percentage,
      ROUND(SUM(CASE WHEN week_number = 27 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_27_percentage,
      ROUND(SUM(CASE WHEN week_number = 28 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_28_percentage,
      ROUND(SUM(CASE WHEN week_number = 29 THEN 1 ELSE 0 END)*1.0 / NULLIF(SUM(CASE WHEN week_number = 0 THEN 1 ELSE 0 END), 0)*1.0 * 100, 2) AS week_29_percentage
      from weekly_data_with_namber wd
      join weekly_totals wt on wd.eleos_organization = wt.eleos_organization and wd.first_note_week = wt.week_start
      group by
      wd.eleos_organization,
      wd.first_note_week,
      wt.active_therapists,
      wt.activated_therapists,
      wt.accumulated_therapists
      order by first_note_week`
      expect(getParsedSql(sql)).to.be.equal("WITH `weekly_data` AS (SELECT LOWER(`m`.`distinct_id`) AS `therapist`, SPLIT_PART(SPLIT_PART(`distinct_id`, '@', 2), '.', 1) AS `eleos_organization`, DATE_TRUNC('week', `timestamp_event`) AS `week_start`, MIN(DATE_TRUNC('week', `timestamp_event`)) OVER (PARTITION BY LOWER(`m`.`distinct_id`)) AS `first_note_week` FROM `bronze_prod`.`outreach_mixpanel_events` AS `m` WHERE SPLIT_PART(SPLIT_PART(`distinct_id`, '@', 2), '.', 1) IN ('thresholds', 'trilogyinc', 'zepfcenter') AND `timestamp_event` IS NOT NULL AND `event` LIKE '%outreach - note saved%'), `weekly_totals` AS (SELECT `wd`.`eleos_organization`, `wd`.`week_start`, COUNT(DISTINCT `wd`.`therapist`) AS `active_therapists`, COUNT(DISTINCT CASE WHEN `wd`.`first_note_week` = `wd`.`week_start` THEN `wd`.`therapist` END) AS `activated_therapists`, SUM(COUNT(DISTINCT CASE WHEN `wd`.`first_note_week` = `wd`.`week_start` THEN `wd`.`therapist` END)) OVER (PARTITION BY `wd`.`eleos_organization` ORDER BY `wd`.`week_start` ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS `accumulated_therapists` FROM `weekly_data` AS `wd` GROUP BY `wd`.`week_start`, `wd`.`eleos_organization` ORDER BY `wd`.`week_start` ASC), `weekly_data_with_namber` AS (SELECT DISTINCT `eleos_organization`, `therapist`, `week_start`, `first_note_week`, EXTRACT(DAY FROM `week_start` - `first_note_week`) / 7 AS `week_number` FROM `weekly_data` ORDER BY `first_note_week` ASC) SELECT `wd`.`eleos_organization`, `wd`.`first_note_week`, `wt`.`active_therapists`, `wt`.`activated_therapists`, `wt`.`accumulated_therapists`, SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END) AS `week_0`, SUM(CASE WHEN `week_number` = 1 THEN 1 ELSE 0 END) AS `week_1`, SUM(CASE WHEN `week_number` = 2 THEN 1 ELSE 0 END) AS `week_2`, SUM(CASE WHEN `week_number` = 3 THEN 1 ELSE 0 END) AS `week_3`, SUM(CASE WHEN `week_number` = 4 THEN 1 ELSE 0 END) AS `week_4`, SUM(CASE WHEN `week_number` = 5 THEN 1 ELSE 0 END) AS `week_5`, SUM(CASE WHEN `week_number` = 6 THEN 1 ELSE 0 END) AS `week_6`, SUM(CASE WHEN `week_number` = 7 THEN 1 ELSE 0 END) AS `week_7`, SUM(CASE WHEN `week_number` = 8 THEN 1 ELSE 0 END) AS `week_8`, SUM(CASE WHEN `week_number` = 9 THEN 1 ELSE 0 END) AS `week_9`, SUM(CASE WHEN `week_number` = 10 THEN 1 ELSE 0 END) AS `week_10`, SUM(CASE WHEN `week_number` = 11 THEN 1 ELSE 0 END) AS `week_11`, SUM(CASE WHEN `week_number` = 12 THEN 1 ELSE 0 END) AS `week_12`, SUM(CASE WHEN `week_number` = 13 THEN 1 ELSE 0 END) AS `week_13`, SUM(CASE WHEN `week_number` = 14 THEN 1 ELSE 0 END) AS `week_14`, SUM(CASE WHEN `week_number` = 15 THEN 1 ELSE 0 END) AS `week_15`, SUM(CASE WHEN `week_number` = 16 THEN 1 ELSE 0 END) AS `week_16`, SUM(CASE WHEN `week_number` = 17 THEN 1 ELSE 0 END) AS `week_17`, SUM(CASE WHEN `week_number` = 18 THEN 1 ELSE 0 END) AS `week_18`, SUM(CASE WHEN `week_number` = 19 THEN 1 ELSE 0 END) AS `week_19`, SUM(CASE WHEN `week_number` = 20 THEN 1 ELSE 0 END) AS `week_20`, SUM(CASE WHEN `week_number` = 21 THEN 1 ELSE 0 END) AS `week_21`, SUM(CASE WHEN `week_number` = 22 THEN 1 ELSE 0 END) AS `week_22`, SUM(CASE WHEN `week_number` = 23 THEN 1 ELSE 0 END) AS `week_23`, SUM(CASE WHEN `week_number` = 24 THEN 1 ELSE 0 END) AS `week_24`, SUM(CASE WHEN `week_number` = 25 THEN 1 ELSE 0 END) AS `week_25`, SUM(CASE WHEN `week_number` = 26 THEN 1 ELSE 0 END) AS `week_26`, SUM(CASE WHEN `week_number` = 27 THEN 1 ELSE 0 END) AS `week_27`, SUM(CASE WHEN `week_number` = 28 THEN 1 ELSE 0 END) AS `week_28`, SUM(CASE WHEN `week_number` = 29 THEN 1 ELSE 0 END) AS `week_29`, ROUND(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_0_percentage`, ROUND(SUM(CASE WHEN `week_number` = 1 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_1_percentage`, ROUND(SUM(CASE WHEN `week_number` = 2 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_2_percentage`, ROUND(SUM(CASE WHEN `week_number` = 3 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_3_percentage`, ROUND(SUM(CASE WHEN `week_number` = 4 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_4_percentage`, ROUND(SUM(CASE WHEN `week_number` = 5 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_5_percentage`, ROUND(SUM(CASE WHEN `week_number` = 6 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_6_percentage`, ROUND(SUM(CASE WHEN `week_number` = 7 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_7_percentage`, ROUND(SUM(CASE WHEN `week_number` = 8 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_8_percentage`, ROUND(SUM(CASE WHEN `week_number` = 9 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_9_percentage`, ROUND(SUM(CASE WHEN `week_number` = 10 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_10_percentage`, ROUND(SUM(CASE WHEN `week_number` = 11 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_11_percentage`, ROUND(SUM(CASE WHEN `week_number` = 12 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_12_percentage`, ROUND(SUM(CASE WHEN `week_number` = 13 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_13_percentage`, ROUND(SUM(CASE WHEN `week_number` = 14 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_14_percentage`, ROUND(SUM(CASE WHEN `week_number` = 15 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_15_percentage`, ROUND(SUM(CASE WHEN `week_number` = 16 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_16_percentage`, ROUND(SUM(CASE WHEN `week_number` = 17 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_17_percentage`, ROUND(SUM(CASE WHEN `week_number` = 18 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_18_percentage`, ROUND(SUM(CASE WHEN `week_number` = 19 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_19_percentage`, ROUND(SUM(CASE WHEN `week_number` = 20 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_20_percentage`, ROUND(SUM(CASE WHEN `week_number` = 21 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_21_percentage`, ROUND(SUM(CASE WHEN `week_number` = 22 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_22_percentage`, ROUND(SUM(CASE WHEN `week_number` = 23 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_23_percentage`, ROUND(SUM(CASE WHEN `week_number` = 24 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_24_percentage`, ROUND(SUM(CASE WHEN `week_number` = 25 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_25_percentage`, ROUND(SUM(CASE WHEN `week_number` = 26 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_26_percentage`, ROUND(SUM(CASE WHEN `week_number` = 27 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_27_percentage`, ROUND(SUM(CASE WHEN `week_number` = 28 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_28_percentage`, ROUND(SUM(CASE WHEN `week_number` = 29 THEN 1 ELSE 0 END) * 1 / NULLIF(SUM(CASE WHEN `week_number` = 0 THEN 1 ELSE 0 END), 0) * 1 * 100, 2) AS `week_29_percentage` FROM `weekly_data_with_namber` AS `wd` INNER JOIN `weekly_totals` AS `wt` ON `wd`.`eleos_organization` = `wt`.`eleos_organization` AND `wd`.`first_note_week` = `wt`.`week_start` GROUP BY `wd`.`eleos_organization`, `wd`.`first_note_week`, `wt`.`active_therapists`, `wt`.`activated_therapists`, `wt`.`accumulated_therapists` ORDER BY `first_note_week` ASC")
  })
})