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
  it('should support from unnest', () => {
    const sql = `with org_mapping AS (
      select * from (
      select trim(lower(name)) as name, organization_name,
      ROW_NUMBER() OVER (PARTITION BY trim(lower(name))) as rn
      from bronze_sales_prod.drive_organization_mapping)
      where rn = 1
      )
      ,orgs as (
      SELECT trim(COALESCE(om.organization_name, custom_attributes.Account)) AS organization,
      *
      FROM "bronze_sales_prod"."intercom_all_conversations"
      JOIN org_mapping om ON trim(lower(custom_attributes.Account)) = trim(lower(om.name))
      )
      , orgs_dates_metrics as (
      select organization,
      cast(from_unixtime(created_at) as date) AS conversation_ctreated_date,
      array_agg(custom_attributes) custom_attributes_array,
      approx_percentile(case when state = 'closed' then date_diff('minute', from_unixtime(created_at), from_unixtime(updated_at)) else 0 end,0.5) as median_resolution_time_minutes,
      sum(case when state IN ('open', 'snoozed') then 1 else 0 end) open_conversations_count,
      count(*) overall_conversations_count
      from orgs
      where organization is not null
      group by 1,2
      )
      ,last_year_org_dates as
      (
      SELECT distinct om.organization_name as organization,
        date_add('day', -sequence, current_date) AS date
      FROM UNNEST(sequence(1, 365)) AS t
        join org_mapping om on 1=1
      WHERE
        date_add('day', -sequence, current_date) >= date_add('year', -1, current_date)
      ), counted_tags as (
      SELECT organization
      ,cast(from_unixtime(created_at) as date) AS conversation_ctreated_date
      ,tag.name as tag
      , json_extract_scalar(cast(source AS json), '$.author.email') AS author_email
      ,COUNT(*) AS count
      FROM orgs
      CROSS JOIN UNNEST(tags.tags) AS t(tag)
      group by 1,2,3,4
      ),  counted_tags_map as (
      SELECT organization, conversation_ctreated_date, author_email,
          MAP (
              ARRAY_AGG(tag),
              ARRAY_AGG(count)
          ) AS tags_counts
      FROM
          counted_tags
      group by 1,2,3
      )
      select od.organization as organization_name
      , od.date
      , t.author_email
      , coalesce(t.tags_counts, MAP()) as tags_counts
      , coalesce(o.custom_attributes_array, ARRAY[]) as custom_attributes_array
      , COALESCE(o.median_resolution_time_minutes,0) as median_resolution_time_minutes
      , COALESCE(o.open_conversations_count,0) as open_conversations_count
      , COALESCE(o.overall_conversations_count,0) as overall_conversations_count
      , cast(current_timestamp as timestamp(6)) as dbt_insert_time
      from last_year_org_dates od
      left join orgs_dates_metrics o on od.organization = o.organization and od.date = o.conversation_ctreated_date
      left join counted_tags_map t on od.organization = t.organization and od.date = t.conversation_ctreated_date`
      expect(getParsedSql(sql)).to.be.equal("WITH `org_mapping` AS (SELECT * FROM (SELECT trim(lower(`name`)) AS `name`, `organization_name`, ROW_NUMBER() OVER (PARTITION BY trim(lower(`name`))) AS `rn` FROM `bronze_sales_prod`.`drive_organization_mapping`) WHERE `rn` = 1), `orgs` AS (SELECT trim(COALESCE(`om`.`organization_name`, `custom_attributes`.`Account`)) AS `organization`, * FROM `bronze_sales_prod`.`intercom_all_conversations` INNER JOIN `org_mapping` AS `om` ON trim(lower(`custom_attributes`.`Account`)) = trim(lower(`om`.`name`))), `orgs_dates_metrics` AS (SELECT `organization`, CAST(from_unixtime(`created_at`) AS DATE) AS `conversation_ctreated_date`, array_agg(`custom_attributes`) AS `custom_attributes_array`, approx_percentile(CASE WHEN `state` = 'closed' THEN date_diff('minute', from_unixtime(`created_at`), from_unixtime(`updated_at`)) ELSE 0 END, 0.5) AS `median_resolution_time_minutes`, SUM(CASE WHEN `state` IN ('open', 'snoozed') THEN 1 ELSE 0 END) AS `open_conversations_count`, COUNT(*) OVER all_conversations_count FROM `orgs` WHERE `organization` IS NOT NULL GROUP BY 1, 2), `last_year_org_dates` AS (SELECT DISTINCT `om`.`organization_name` AS `organization`, date_add('day', -`sequence`, CURRENT_DATE) AS DATE  FROM UNNEST(sequence(1, 365)) AS `t` INNER JOIN `org_mapping` AS `om` ON 1 = 1 WHERE date_add('day', -`sequence`, CURRENT_DATE) >= date_add('year', -1, CURRENT_DATE)), `counted_tags` AS (SELECT `organization`, CAST(from_unixtime(`created_at`) AS DATE) AS `conversation_ctreated_date`, `tag`.`name` AS `tag`, json_extract_scalar(CAST(`source` AS JSON), '$.author.email') AS `author_email`, COUNT(*) AS `count` FROM `orgs` CROSS JOIN UNNEST(`tags`.`tags`) AS t(`tag`) GROUP BY 1, 2, 3, 4), `counted_tags_map` AS (SELECT `organization`, `conversation_ctreated_date`, `author_email`, MAP(ARRAY_AGG(`tag`), ARRAY_AGG(`count`)) AS `tags_counts` FROM `counted_tags` GROUP BY 1, 2, 3) SELECT `od`.`organization` AS `organization_name`, `od`.`date`, `t`.`author_email`, coalesce(`t`.`tags_counts`, MAP()) AS `tags_counts`, coalesce(`o`.`custom_attributes_array`, ARRAY[]) AS `custom_attributes_array`, COALESCE(`o`.`median_resolution_time_minutes`, 0) AS `median_resolution_time_minutes`, COALESCE(`o`.`open_conversations_count`, 0) AS `open_conversations_count`, COALESCE(`o`.`overall_conversations_count`, 0) AS `overall_conversations_count`, CAST(CURRENT_TIMESTAMP AS TIMESTAMP(6)) AS `dbt_insert_time` FROM `last_year_org_dates` AS `od` LEFT JOIN `orgs_dates_metrics` AS `o` ON `od`.`organization` = `o`.`organization` AND `od`.`date` = `o`.`conversation_ctreated_date` LEFT JOIN `counted_tags_map` AS `t` ON `od`.`organization` = `t`.`organization` AND `od`.`date` = `t`.`conversation_ctreated_date`")
  })
  it('should parse with clause', () => {
    const sql = `WITH user_logins as (
      SELECT user_id, event, dttm, dashboard_id, slice_id
      FROM (
       SELECT l.user_id, 'login' AS event, l.dttm, CAST(NULL as bigint) AS dashboard_id, CAST(NULL as bigint)  AS slice_id,
              LAG(l.dttm) OVER (PARTITION BY l.user_id ORDER BY l.dttm) AS previous_dttm
          FROM "bronze_prod"."superset_logs" l
          WHERE l.action = 'welcome'
          )
      WHERE previous_dttm IS NULL  -- Keep the first record
      OR dttm > previous_dttm + INTERVAL '1' HOUR  -- Only keep records that are more than 1 hour apart
      ORDER BY user_id, dttm
      ),
      user_events as (
      SELECT l.user_id, json_extract_scalar(l."json", '$.event_name') AS event, l.dttm,
      NULLIF(COALESCE(cast(json_extract_scalar(l."json", '$.source_id') as bigint), l.dashboard_id), 0) AS dashboard_id,
      NULLIF(COALESCE(cast(json_extract_scalar(l."json", '$.slice_id') as bigint), cast(json_extract_scalar(l."json", '$.chartId') as bigint), l.slice_id), 0) AS slice_id
      FROM "bronze_prod"."superset_logs" l
      WHERE json_extract_scalar("json", '$.event_name') IN (
              'spa_navigation',
              'mount_dashboard',
              'export_csv_dashboard_chart',
              'chart_download_as_image',
              'export_xlsx_dashboard_chart',
              'change_dashboard_filter'
          )
      ),
      export_dashboard_logs as (
      SELECT user_id, event, dttm,
           CAST(json_extract_scalar(json_array_element, '$.value') as bigint) AS dashboard_id,
          CAST(NULL as bigint) as slice_id
      FROM (
          SELECT user_id, event, dttm,
              json_array_element
          FROM (
              SELECT l.user_id, 'export_dashboard' AS event, l.dttm,
                  json_extract(l."json", '$.rison.filters') AS filters_array
              FROM
                  "bronze_prod"."superset_logs" l
                  WHERE action = 'ReportScheduleRestApi.get_list'
          )
          CROSS JOIN UNNEST(CAST(filters_array AS ARRAY<json>)) AS t (json_array_element)
          WHERE
              json_extract_scalar(json_array_element, '$.col') = 'dashboard_id'
      )
      ),
      relevant_logs as (
      SELECT *, ROW_NUMBER() OVER(PARTITION BY user_id, dttm ORDER BY dashboard_id) as RN
      FROM(
      SELECT user_id, dttm, event, max(dashboard_id) as dashboard_id, max(slice_id) as slice_id
      FROM (
      SELECT *
      FROM user_logins
      UNION ALL
      SELECT *
      FROM user_events
      UNION ALL
      SELECT *
      FROM export_dashboard_logs
      )
      GROUP BY user_id, dttm, event
      )
      ),
      organizational_domains as (
      SELECT lower(split_part(split_part(therapist_mail, '@', 2), '.', 1)) AS organization_domain, max(therapist_organization_name) as organization
      from  "silver_prod"."eleos_full_therapist_info"
      group by 1
      )
      SELECT l.user_id, l.dttm, l.event, l.dashboard_id, l.slice_id, u.last_name, u.email, o.organization, d.dashboard_title, s.slice_name, 'Client Facing' as superset_instance
      FROM relevant_logs l
      JOIN "bronze_prod"."superset_ab_user" u ON l.user_id = u.id
      LEFT JOIN "bronze_prod"."superset_dashboards" d ON l.dashboard_id = d.id
      LEFT JOIN "bronze_prod"."superset_slices" s ON l.slice_id = s.id
      LEFT JOIN organizational_domains o ON lower(split_part(split_part(u.email, '@', 2), '.', 1)) = o.organization_domain
      WHERE RN = 1 AND lower(u.email) NOT LIKE '%eleos%'
      AND lower(u.email) NOT LIKE '%test%'
      AND  lower(u.username) NOT LIKE '%eleos%'
      AND lower(u.username) NOT LIKE '%test%'
      AND  lower(u.username) NOT LIKE '%admin%'`
      expect(getParsedSql(sql)).to.be.equal("WITH `user_logins` AS (SELECT `user_id`, `event`, `dttm`, `dashboard_id`, `slice_id` FROM (SELECT `l`.`user_id`, 'login' AS `event`, `l`.`dttm`, CAST(NULL AS BIGINT) AS `dashboard_id`, CAST(NULL AS BIGINT) AS `slice_id`, LAG(`l`.`dttm`) OVER (PARTITION BY `l`.`user_id` ORDER BY `l`.`dttm` ASC) AS `previous_dttm` FROM `bronze_prod`.`superset_logs` AS `l` WHERE `l`.`action` = 'welcome') WHERE `previous_dttm` IS NULL OR `dttm` > `previous_dttm` + INTERVAL '1' HOUR ORDER BY `user_id` ASC, `dttm` ASC), `user_events` AS (SELECT `l`.`user_id`, json_extract_scalar(`l`.`json`, '$.event_name') AS `event`, `l`.`dttm`, NULLIF(COALESCE(CAST(json_extract_scalar(`l`.`json`, '$.source_id') AS BIGINT), `l`.`dashboard_id`), 0) AS `dashboard_id`, NULLIF(COALESCE(CAST(json_extract_scalar(`l`.`json`, '$.slice_id') AS BIGINT), CAST(json_extract_scalar(`l`.`json`, '$.chartId') AS BIGINT), `l`.`slice_id`), 0) AS `slice_id` FROM `bronze_prod`.`superset_logs` AS `l` WHERE json_extract_scalar(\"json\", '$.event_name') IN ('spa_navigation', 'mount_dashboard', 'export_csv_dashboard_chart', 'chart_download_as_image', 'export_xlsx_dashboard_chart', 'change_dashboard_filter')), `export_dashboard_logs` AS (SELECT `user_id`, `event`, `dttm`, CAST(json_extract_scalar(`json_array_element`, '$.value') AS BIGINT) AS `dashboard_id`, CAST(NULL AS BIGINT) AS `slice_id` FROM (SELECT `user_id`, `event`, `dttm`, `json_array_element` FROM (SELECT `l`.`user_id`, 'export_dashboard' AS `event`, `l`.`dttm`, json_extract(`l`.`json`, '$.rison.filters') AS `filters_array` FROM `bronze_prod`.`superset_logs` AS `l` WHERE `action` = 'ReportScheduleRestApi.get_list') CROSS JOIN UNNEST(CAST(`filters_array` AS ARRAY<JSON>)) AS t(`json_array_element`) WHERE json_extract_scalar(`json_array_element`, '$.col') = 'dashboard_id')), `relevant_logs` AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY `user_id`, `dttm` ORDER BY `dashboard_id` ASC) AS `RN` FROM (SELECT `user_id`, `dttm`, `event`, MAX(`dashboard_id`) AS `dashboard_id`, MAX(`slice_id`) AS `slice_id` FROM (SELECT * FROM `user_logins` UNION ALL SELECT * FROM `user_events` UNION ALL SELECT * FROM `export_dashboard_logs`) GROUP BY `user_id`, `dttm`, `event`)), `organizational_domains` AS (SELECT lower(split_part(split_part(`therapist_mail`, '@', 2), '.', 1)) AS `organization_domain`, MAX(`therapist_organization_name`) AS `organization` FROM `silver_prod`.`eleos_full_therapist_info` GROUP BY 1) SELECT `l`.`user_id`, `l`.`dttm`, `l`.`event`, `l`.`dashboard_id`, `l`.`slice_id`, `u`.`last_name`, `u`.`email`, `o`.`organization`, `d`.`dashboard_title`, `s`.`slice_name`, 'Client Facing' AS `superset_instance` FROM `relevant_logs` AS `l` INNER JOIN `bronze_prod`.`superset_ab_user` AS `u` ON `l`.`user_id` = `u`.`id` LEFT JOIN `bronze_prod`.`superset_dashboards` AS `d` ON `l`.`dashboard_id` = `d`.`id` LEFT JOIN `bronze_prod`.`superset_slices` AS `s` ON `l`.`slice_id` = `s`.`id` LEFT JOIN `organizational_domains` AS `o` ON lower(split_part(split_part(`u`.`email`, '@', 2), '.', 1)) = `o`.`organization_domain` WHERE `RN` = 1 AND lower(`u`.`email`) NOT LIKE '%eleos%' AND lower(`u`.`email`) NOT LIKE '%test%' AND lower(`u`.`username`) NOT LIKE '%eleos%' AND lower(`u`.`username`) NOT LIKE '%test%' AND lower(`u`.`username`) NOT LIKE '%admin%'")
  })
})