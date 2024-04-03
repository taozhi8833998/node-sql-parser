const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('trino', () => {
  const parser = new Parser();
  const opt = {
    database: 'trino'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  const SQL_LIST = [
    {
      title: 'lambda expression',
      sql: [
        `SELECT numbers,
        transform(numbers, n -> n * n) as squared_numbers
        FROM (
            VALUES
                (ARRAY[1, 2]),
                (ARRAY[3, 4]),
                (ARRAY[5, 6, 7])
        ) AS t(numbers);`,
        'SELECT numbers, transform(numbers, n -> n * n) AS "squared_numbers" FROM (VALUES (ARRAY[1,2]), (ARRAY[3,4]), (ARRAY[5,6,7])) AS "t(numbers)"'
      ]
    },
    {
      title: 'lambda expression args',
      sql: [
        `SELECT reduce_agg(value, 0, (a, b) -> a + b, (a, b) -> a + b) sum_values
        FROM (
            VALUES (1), (2), (3), (4), (5)
        ) AS t(value);`,
        'SELECT reduce_agg(value, 0, (a, b) -> a + b, (a, b) -> a + b) AS "sum_values" FROM (VALUES (1), (2), (3), (4), (5)) AS "t(value)"'
      ]
    },
    {
      title: 'lambda expression in where clause',
      sql: [
        `SELECT numbers
        FROM (
            VALUES
                (ARRAY[1,NULL,3]),
                (ARRAY[10,20,30]),
                (ARRAY[100,200,300])
        ) AS t(numbers)
        WHERE any_match(numbers, n ->  COALESCE(n, 0) > 100);`,
        'SELECT numbers FROM (VALUES (ARRAY[1,NULL,3]), (ARRAY[10,20,30]), (ARRAY[100,200,300])) AS "t(numbers)" WHERE any_match(numbers, n -> COALESCE(n, 0) > 100)'
      ]
    },
    {
      title: 'lambda expression complex function',
      sql: [
        `SELECT xvalues,
        "a",
        b,
        transform(xvalues, x -> IF(x > 0, a * x + b, a * (-x) + b)) as linear_function_values
        FROM (
            VALUES
                (ARRAY[1, 2], 10, 5),
                (ARRAY[3, 4], 4, 2)
        ) AS t(xvalues, a, b);`,
        'SELECT xvalues, "a", b, transform(xvalues, x -> IF(x > 0, a * x + b, a * (-x) + b)) AS "linear_function_values" FROM (VALUES (ARRAY[1,2],10,5), (ARRAY[3,4],4,2)) AS "t(xvalues, a, b)"'
      ]
    },
    {
      title: 'window function',
      sql: [
        'select sum(a) over (partition by b rows between unbounded preceding and current row)',
        'SELECT SUM(a) OVER (PARTITION BY b ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)'

      ]
    }
  ]
  SQL_LIST.forEach(sqlInfo => {
    const { title, sql } = sqlInfo
    it(`should support ${title}`, () => {
      expect(getParsedSql(sql[0], opt)).to.equal(sql[1])
    })
  })
  it('should throw error when lambda expression is invalid', () => {
    let sql = 'SELECT numbers, transform(numbers, n -> max(n)) as squared_numbers FROM (VALUES (ARRAY[1, 2]),(ARRAY[3, 4]),(ARRAY[5, 6, 7])) AS t(numbers);'
    expect(parser.astify.bind(parser, sql, opt)).to.throw('Aggregations are not supported in lambda expressions')
    sql = 'SELECT numbers, transform(numbers, n -> 2 + (select 3)) as squared_numbers FROM (VALUES (ARRAY[1, 2]),(ARRAY[3, 4]),(ARRAY[5, 6, 7])) AS t(numbers);'
    expect(parser.astify.bind(parser, sql, opt)).to.throw('Subqueries are not supported in lambda expressions')
  })
  it('should support deep nest function call', function () {
    this.timeout(100)
    const sql = `WITH
    "Quiz Attempts 8 1" AS (
      SELECT
        "attemptid" AS "AttemptId",
        "quizid" AS "QuizId",
        "userid" AS "UserId",
        "orgunitid" AS "OrgUnitId",
        "attemptnumber" AS "AttemptNumber",
        CAST("timestarted" AS timestamp) AS "TimeStarted",
        CAST("timecompleted" AS timestamp) AS "TimeCompleted",
        "score" AS "Score",
        "isgraded" AS "IsGraded",
        "oldattemptnumber" AS "OldAttemptNumber",
        "isdeleted" AS "IsDeleted",
        "possiblescore" AS "PossibleScore",
        "isretakeincorrectonly" AS "IsRetakeIncorrectOnly",
        CAST("duedate" AS timestamp) AS "DueDate",
        "timelimit" AS "TimeLimit",
        "timelimitenforced" AS "TimeLimitEnforced",
        "graceperiod" AS "GracePeriod",
        "graceperiodexceededbehaviour" AS "GracePeriodExceededBehaviour",
        "extendeddeadline" AS "ExtendedDeadline"
      FROM
        "brightspace_data_sets_4c829df9_d432_4ae3_bf08_363f82e8793c"."quizattempts_8_13_2"
    ),
    "Filter by Quiz ID 2" AS (
      SELECT
        *
      FROM
        "Quiz Attempts 8 1"
      WHERE
        "QuizId" = 319058
    ),
    "Quiz User Answer Responses 8 3" AS (
      SELECT
        "attemptid" AS "AttemptId",
        "attemptnumber" AS "AttemptNumber",
        "questionid" AS "QuestionId",
        "questionversionid" AS "QuestionVersionId",
        "answerid" AS "AnswerId",
        "sortorder" AS "SortOrder",
        "iscorrect" AS "IsCorrect",
        "userselection" AS "UserSelection",
        "useranswer" AS "UserAnswer",
        "filesetid" AS "FileSetId"
      FROM
        "brightspace_data_sets_4c829df9_d432_4ae3_bf08_363f82e8793c"."quizuseranswerresponses_8_13_2"
    ),
    "Select Columns 4" AS (
      SELECT
        "AttemptId",
        "QuestionId",
        "QuestionVersionId",
        "UserSelection",
        "UserAnswer",
        "AnswerId"
      FROM
        "Quiz User Answer Responses 8 3"
    ),
    "Question Library 8 5" AS (
      SELECT
        "questionid" AS "QuestionId",
        "questionversionid" AS "QuestionVersionId",
        "isautograded" AS "IsAutoGraded",
        "templatetypeid" AS "TemplateTypeId",
        "questiontype" AS "QuestionType",
        "name" AS "Name",
        "question" AS "Question",
        "comment" AS "Comment",
        "answerkey" AS "AnswerKey",
        CAST("creationdate" AS timestamp) AS "CreationDate",
        "version" AS "Version",
        "allowsattachments" AS "AllowsAttachments"
      FROM
        "brightspace_data_sets_4c829df9_d432_4ae3_bf08_363f82e8793c"."questionlibrary_8_13_2"
    ),
    "Joining Question Library 6" AS (
      SELECT
        "T1"."AttemptId",
        "T1"."QuestionId",
        "T1"."QuestionVersionId",
        "T1"."AnswerId",
        "T1"."UserSelection",
        "T1"."UserAnswer",
        "T2"."QuestionId",
        "T2"."QuestionVersionId" AS "Question Library 8.QuestionVersionId",
        "T2"."IsAutoGraded",
        "T2"."TemplateTypeId",
        "T2"."QuestionType",
        "T2"."Name",
        "T2"."Question",
        "T2"."Comment",
        "T2"."AnswerKey",
        "T2"."CreationDate",
        "T2"."Version",
        "T2"."AllowsAttachments"
      FROM
        "Select Columns 4" AS "T1"
        INNER JOIN "Question Library 8 5" AS "T2" ON "T1"."QuestionId" = "T2"."QuestionId"
    ),
    "Join Data 7" AS (
      SELECT
        "T1"."AttemptId",
        "T1"."QuestionId",
        "T1"."QuestionVersionId",
        "T1"."AnswerId",
        "T1"."UserSelection",
        "T1"."UserAnswer",
        "T1"."QuestionId",
        "T1"."IsAutoGraded",
        "T1"."TemplateTypeId",
        "T1"."QuestionType",
        "T1"."Name",
        "T1"."Question",
        "T1"."Comment",
        "T1"."AnswerKey",
        "T1"."CreationDate",
        "T1"."Version",
        "T1"."AllowsAttachments",
        "T1"."Question Library 8.QuestionVersionId",
        "T2"."AttemptId" AS "AttemptId_1",
        "T2"."QuizId",
        "T2"."UserId",
        "T2"."OrgUnitId",
        "T2"."AttemptNumber" AS "AttemptNumber_1",
        "T2"."TimeStarted",
        "T2"."TimeCompleted",
        "T2"."Score",
        "T2"."IsGraded",
        "T2"."OldAttemptNumber",
        "T2"."IsDeleted",
        "T2"."PossibleScore",
        "T2"."IsRetakeIncorrectOnly",
        "T2"."DueDate",
        "T2"."TimeLimit",
        "T2"."TimeLimitEnforced",
        "T2"."GracePeriod",
        "T2"."GracePeriodExceededBehaviour",
        "T2"."ExtendedDeadline"
      FROM
        "Joining Question Library 6" AS "T1"
        INNER JOIN "Filter by Quiz ID 2" AS "T2" ON "T1"."AttemptId" = "T2"."AttemptId"
    ),
    "Replace Text 1 8" AS (
      SELECT
        "AttemptId",
        "QuestionId",
        "QuestionVersionId",
        "AnswerId",
        "UserSelection",
        "QuestionId",
        "IsAutoGraded",
        "TemplateTypeId",
        "QuestionType",
        "Name",
        "Question",
        "Comment",
        "AnswerKey",
        "CreationDate",
        "Version",
        "AllowsAttachments",
        "Question Library 8.QuestionVersionId",
        "QuizId",
        "UserId",
        "OrgUnitId",
        "TimeStarted",
        "TimeCompleted",
        "Score",
        "IsGraded",
        "OldAttemptNumber",
        "IsDeleted",
        "PossibleScore",
        "IsRetakeIncorrectOnly",
        "DueDate",
        "TimeLimit",
        "TimeLimitEnforced",
        "GracePeriod",
        "GracePeriodExceededBehaviour",
        "ExtendedDeadline",
        "AttemptNumber_1",
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace(
                          regexp_replace(
                            regexp_replace(
                              regexp_replace(
                                regexp_replace(
                                  regexp_replace(
                                    regexp_replace(
                                      regexp_replace(
                                        regexp_replace(
                                          regexp_replace(
                                            regexp_replace(
                                              regexp_replace(
                                                regexp_replace(
                                                  regexp_replace(
                                                    regexp_replace(
                                                      regexp_replace(
                                                        regexp_replace(
                                                          regexp_replace(
                                                            regexp_replace(
                                                              regexp_replace(
                                                                regexp_replace(
                                                                  regexp_replace(
                                                                    regexp_replace(
                                                                      regexp_replace(
                                                                        regexp_replace(
                                                                          regexp_replace(
                                                                            regexp_replace(
                                                                              regexp_replace(
                                                                                regexp_replace(
                                                                                  regexp_replace(
                                                                                    regexp_replace(
                                                                                      regexp_replace(
                                                                                        regexp_replace(
                                                                                          regexp_replace(
                                                                                            regexp_replace("UserAnswer", '(?i)&hellip;', '...'),
                                                                                            '(?i)&#x',
                                                                                            'x'
                                                                                          ),
                                                                                          '(?i)ldquo',
                                                                                          '"'
                                                                                        ),
                                                                                        '(?i)rdquo',
                                                                                        '"'
                                                                                      ),
                                                                                      '(?i)&nbsp',
                                                                                      ''
                                                                                    ),
                                                                                    '(?i)<p>',
                                                                                    ''
                                                                                  ),
                                                                                  '(?i)</p>',
                                                                                  ''
                                                                                ),
                                                                                '(?i)<strong>',
                                                                                ''
                                                                              ),
                                                                              '(?i)</strong>',
                                                                              ''
                                                                            ),
                                                                            '(?i)<div>',
                                                                            ''
                                                                          ),
                                                                          '(?i)</div>',
                                                                          ''
                                                                        ),
                                                                        '(?i)<ul>',
                                                                        ''
                                                                      ),
                                                                      '(?i)</ul>',
                                                                      ''
                                                                    ),
                                                                    '(?i)<u>',
                                                                    ''
                                                                  ),
                                                                  '(?i)</u>',
                                                                  ''
                                                                ),
                                                                '(?i)<br/>',
                                                                ''
                                                              ),
                                                              '(?i)<li>',
                                                              ''
                                                            ),
                                                            '(?i)</li>',
                                                            ''
                                                          ),
                                                          '(?i)<em>',
                                                          ''
                                                        ),
                                                        '(?i)</em>',
                                                        ''
                                                      ),
                                                      '(?i)<span>',
                                                      ''
                                                    ),
                                                    '(?i)</span>',
                                                    ''
                                                  ),
                                                  '(?i)<span style="font-family: arial, helvetica, sans-serif;">',
                                                  ''
                                                ),
                                                '(?i)<span style="font-family: arial, helvetica, sans-serif; font-size: 14pt;">',
                                                ''
                                              ),
                                              '(?i)&mdash;',
                                              '-'
                                            ),
                                            '(?i)&ndash;',
                                            '-'
                                          ),
                                          '(?i)<span style="font-size: 14pt;">',
                                          ''
                                        ),
                                        '(?i)<span style="font-size: 16\.0px;">',
                                        ''
                                      ),
                                      '(?i)<span style="font-size: 12\.0pt;">',
                                      ''
                                    ),
                                    '(?i)<span style="font-family: times new roman;">',
                                    ''
                                  ),
                                  '(?i)&amp;',
                                  '&'
                                ),
                                '(?i)<p style="font-size: 14\.4px;">',
                                ''
                              ),
                              '(?i)&iquest;',
                              '¿'
                            ),
                            '(?i)&‌eacute;',
                            'é'
                          ),
                          '(?i)&oacute;',
                          'ó'
                        ),
                        '(?i)&iacute;',
                        'í'
                      ),
                      '(?i)&aacute;',
                      'á'
                    ),
                    '(?i)&iexcl;',
                    '¡'
                  ),
                  '(?i)<span style="text-decoration: underline;">',
                  ''
                ),
                '(?i)<p style="margin: 0in; font-size: 12pt; font-family: Calibri, sans-serif;">',
                ''
              ),
              '(?i)<span style="font-size: 11\.0pt; font-family: Arial, sans-serif; color: black;">',
              ''
            ),
            '(?i)<p style="margin: 0\.1pt 0in; font-size: 10pt; font-family: Times;">',
            ''
          ),
          '(?i)<span style="font-size: 14\.0pt; font-family: Arial, sans-serif;">',
          ''
        ) AS "UserAnswer"
      FROM
        "Join Data 7"
    ),
    "UserTable v4 9" AS (
      SELECT
        "QuestionId",
        "QuestionVersionId",
        "AnswerId",
        "UserSelection",
        "UserAnswer",
        "IsAutoGraded",
        "TemplateTypeId",
        "QuestionType",
        "Name",
        "Question",
        "Comment",
        "AnswerKey",
        "CreationDate",
        "Version",
        "AllowsAttachments",
        "Question Library 8.QuestionVersionId",
        "QuizId",
        "UserId",
        "OrgUnitId",
        "TimeStarted",
        "TimeCompleted",
        "Score",
        "IsGraded",
        "OldAttemptNumber",
        "IsDeleted",
        "PossibleScore",
        "IsRetakeIncorrectOnly",
        "DueDate",
        "TimeLimit",
        "TimeLimitEnforced",
        "GracePeriod",
        "GracePeriodExceededBehaviour",
        "ExtendedDeadline",
        "AttemptNumber_1",
        "AttemptId" AS "AttemptId",
        "QuestionId" AS "QuestionId_1"
      FROM
        "Replace Text 1 8"
    )
    SELECT
    "QuestionId",
    "QuestionVersionId",
    "AnswerId",
    "UserSelection",
    "UserAnswer",
    "IsAutoGraded",
    "TemplateTypeId",
    "QuestionType",
    "Name",
    "Question",
    "Comment",
    "AnswerKey",
    "CreationDate",
    "Version",
    "AllowsAttachments",
    "Question Library 8.QuestionVersionId",
    "QuizId",
    "UserId",
    "OrgUnitId",
    "TimeStarted",
    "TimeCompleted",
    "Score",
    "IsGraded",
    "OldAttemptNumber",
    "IsDeleted",
    "PossibleScore",
    "IsRetakeIncorrectOnly",
    "DueDate",
    "TimeLimit",
    "TimeLimitEnforced",
    "GracePeriod",
    "GracePeriodExceededBehaviour",
    "ExtendedDeadline",
    "AttemptNumber_1",
    "AttemptId",
    "QuestionId_1"
    FROM
    "UserTable v4 9"`
    const backSQL =`WITH "Quiz Attempts 8 1" AS (SELECT "attemptid" AS "AttemptId", "quizid" AS "QuizId", "userid" AS "UserId", "orgunitid" AS "OrgUnitId", "attemptnumber" AS "AttemptNumber", CAST("timestarted" AS TIMESTAMP) AS "TimeStarted", CAST("timecompleted" AS TIMESTAMP) AS "TimeCompleted", "score" AS "Score", "isgraded" AS "IsGraded", "oldattemptnumber" AS "OldAttemptNumber", "isdeleted" AS "IsDeleted", "possiblescore" AS "PossibleScore", "isretakeincorrectonly" AS "IsRetakeIncorrectOnly", CAST("duedate" AS TIMESTAMP) AS "DueDate", "timelimit" AS "TimeLimit", "timelimitenforced" AS "TimeLimitEnforced", "graceperiod" AS "GracePeriod", "graceperiodexceededbehaviour" AS "GracePeriodExceededBehaviour", "extendeddeadline" AS "ExtendedDeadline" FROM "brightspace_data_sets_4c829df9_d432_4ae3_bf08_363f82e8793c"."quizattempts_8_13_2"), "Filter by Quiz ID 2" AS (SELECT * FROM "Quiz Attempts 8 1" WHERE "QuizId" = 319058), "Quiz User Answer Responses 8 3" AS (SELECT "attemptid" AS "AttemptId", "attemptnumber" AS "AttemptNumber", "questionid" AS "QuestionId", "questionversionid" AS "QuestionVersionId", "answerid" AS "AnswerId", "sortorder" AS "SortOrder", "iscorrect" AS "IsCorrect", "userselection" AS "UserSelection", "useranswer" AS "UserAnswer", "filesetid" AS "FileSetId" FROM "brightspace_data_sets_4c829df9_d432_4ae3_bf08_363f82e8793c"."quizuseranswerresponses_8_13_2"), "Select Columns 4" AS (SELECT "AttemptId", "QuestionId", "QuestionVersionId", "UserSelection", "UserAnswer", "AnswerId" FROM "Quiz User Answer Responses 8 3"), "Question Library 8 5" AS (SELECT "questionid" AS "QuestionId", "questionversionid" AS "QuestionVersionId", "isautograded" AS "IsAutoGraded", "templatetypeid" AS "TemplateTypeId", "questiontype" AS "QuestionType", "name" AS "Name", "question" AS "Question", "comment" AS "Comment", "answerkey" AS "AnswerKey", CAST("creationdate" AS TIMESTAMP) AS "CreationDate", "version" AS "Version", "allowsattachments" AS "AllowsAttachments" FROM "brightspace_data_sets_4c829df9_d432_4ae3_bf08_363f82e8793c"."questionlibrary_8_13_2"), "Joining Question Library 6" AS (SELECT "T1"."AttemptId", "T1"."QuestionId", "T1"."QuestionVersionId", "T1"."AnswerId", "T1"."UserSelection", "T1"."UserAnswer", "T2"."QuestionId", "T2"."QuestionVersionId" AS "Question Library 8.QuestionVersionId", "T2"."IsAutoGraded", "T2"."TemplateTypeId", "T2"."QuestionType", "T2"."Name", "T2"."Question", "T2"."Comment", "T2"."AnswerKey", "T2"."CreationDate", "T2"."Version", "T2"."AllowsAttachments" FROM "Select Columns 4" AS "T1" INNER JOIN "Question Library 8 5" AS "T2" ON "T1"."QuestionId" = "T2"."QuestionId"), "Join Data 7" AS (SELECT "T1"."AttemptId", "T1"."QuestionId", "T1"."QuestionVersionId", "T1"."AnswerId", "T1"."UserSelection", "T1"."UserAnswer", "T1"."QuestionId", "T1"."IsAutoGraded", "T1"."TemplateTypeId", "T1"."QuestionType", "T1"."Name", "T1"."Question", "T1"."Comment", "T1"."AnswerKey", "T1"."CreationDate", "T1"."Version", "T1"."AllowsAttachments", "T1"."Question Library 8.QuestionVersionId", "T2"."AttemptId" AS "AttemptId_1", "T2"."QuizId", "T2"."UserId", "T2"."OrgUnitId", "T2"."AttemptNumber" AS "AttemptNumber_1", "T2"."TimeStarted", "T2"."TimeCompleted", "T2"."Score", "T2"."IsGraded", "T2"."OldAttemptNumber", "T2"."IsDeleted", "T2"."PossibleScore", "T2"."IsRetakeIncorrectOnly", "T2"."DueDate", "T2"."TimeLimit", "T2"."TimeLimitEnforced", "T2"."GracePeriod", "T2"."GracePeriodExceededBehaviour", "T2"."ExtendedDeadline" FROM "Joining Question Library 6" AS "T1" INNER JOIN "Filter by Quiz ID 2" AS "T2" ON "T1"."AttemptId" = "T2"."AttemptId"), "Replace Text 1 8" AS (SELECT "AttemptId", "QuestionId", "QuestionVersionId", "AnswerId", "UserSelection", "QuestionId", "IsAutoGraded", "TemplateTypeId", "QuestionType", "Name", "Question", "Comment", "AnswerKey", "CreationDate", "Version", "AllowsAttachments", "Question Library 8.QuestionVersionId", "QuizId", "UserId", "OrgUnitId", "TimeStarted", "TimeCompleted", "Score", "IsGraded", "OldAttemptNumber", "IsDeleted", "PossibleScore", "IsRetakeIncorrectOnly", "DueDate", "TimeLimit", "TimeLimitEnforced", "GracePeriod", "GracePeriodExceededBehaviour", "ExtendedDeadline", "AttemptNumber_1", regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace("UserAnswer", '(?i)&hellip;', '...'), '(?i)&#x', 'x'), '(?i)ldquo', '"'), '(?i)rdquo', '"'), '(?i)&nbsp', ''), '(?i)<p>', ''), '(?i)</p>', ''), '(?i)<strong>', ''), '(?i)</strong>', ''), '(?i)<div>', ''), '(?i)</div>', ''), '(?i)<ul>', ''), '(?i)</ul>', ''), '(?i)<u>', ''), '(?i)</u>', ''), '(?i)<br/>', ''), '(?i)<li>', ''), '(?i)</li>', ''), '(?i)<em>', ''), '(?i)</em>', ''), '(?i)<span>', ''), '(?i)</span>', ''), '(?i)<span style="font-family: arial, helvetica, sans-serif;">', ''), '(?i)<span style="font-family: arial, helvetica, sans-serif; font-size: 14pt;">', ''), '(?i)&mdash;', '-'), '(?i)&ndash;', '-'), '(?i)<span style="font-size: 14pt;">', ''), '(?i)<span style="font-size: 16.0px;">', ''), '(?i)<span style="font-size: 12.0pt;">', ''), '(?i)<span style="font-family: times new roman;">', ''), '(?i)&amp;', '&'), '(?i)<p style="font-size: 14.4px;">', ''), '(?i)&iquest;', '¿'), '(?i)&‌eacute;', 'é'), '(?i)&oacute;', 'ó'), '(?i)&iacute;', 'í'), '(?i)&aacute;', 'á'), '(?i)&iexcl;', '¡'), '(?i)<span style="text-decoration: underline;">', ''), '(?i)<p style="margin: 0in; font-size: 12pt; font-family: Calibri, sans-serif;">', ''), '(?i)<span style="font-size: 11.0pt; font-family: Arial, sans-serif; color: black;">', ''), '(?i)<p style="margin: 0.1pt 0in; font-size: 10pt; font-family: Times;">', ''), '(?i)<span style="font-size: 14.0pt; font-family: Arial, sans-serif;">', '') AS "UserAnswer" FROM "Join Data 7"), "UserTable v4 9" AS (SELECT "QuestionId", "QuestionVersionId", "AnswerId", "UserSelection", "UserAnswer", "IsAutoGraded", "TemplateTypeId", "QuestionType", "Name", "Question", "Comment", "AnswerKey", "CreationDate", "Version", "AllowsAttachments", "Question Library 8.QuestionVersionId", "QuizId", "UserId", "OrgUnitId", "TimeStarted", "TimeCompleted", "Score", "IsGraded", "OldAttemptNumber", "IsDeleted", "PossibleScore", "IsRetakeIncorrectOnly", "DueDate", "TimeLimit", "TimeLimitEnforced", "GracePeriod", "GracePeriodExceededBehaviour", "ExtendedDeadline", "AttemptNumber_1", "AttemptId" AS "AttemptId", "QuestionId" AS "QuestionId_1" FROM "Replace Text 1 8") SELECT "QuestionId", "QuestionVersionId", "AnswerId", "UserSelection", "UserAnswer", "IsAutoGraded", "TemplateTypeId", "QuestionType", "Name", "Question", "Comment", "AnswerKey", "CreationDate", "Version", "AllowsAttachments", "Question Library 8.QuestionVersionId", "QuizId", "UserId", "OrgUnitId", "TimeStarted", "TimeCompleted", "Score", "IsGraded", "OldAttemptNumber", "IsDeleted", "PossibleScore", "IsRetakeIncorrectOnly", "DueDate", "TimeLimit", "TimeLimitEnforced", "GracePeriod", "GracePeriodExceededBehaviour", "ExtendedDeadline", "AttemptNumber_1", "AttemptId", "QuestionId_1" FROM "UserTable v4 9"`
    expect(getParsedSql(sql, opt)).to.be.eql(backSQL)
  })
})
