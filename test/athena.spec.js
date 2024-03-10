const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('athena', () => {
  const parser = new Parser();
  const DEFAULT_OPT =  { database: 'athena' }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('array data type', () => {
    let sql = `SELECT
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
})