const { expect } = require('chai')
const Parser = require('../src/parser').default
const util = require('../src/util')
const { varToSQL, orderOrPartitionByToSQL } = require('../src/expr')
const { multipleToSQL } = require('../src/union')

describe('AST', () => {
    const parser = new Parser();
    let sql;

    function getParsedSql(sql, opt) {
        const ast = parser.astify(sql, opt);
        return parser.sqlify(ast, opt);
    }

    describe('select statement', () => {
        it('should support MySQL query options', () => {
            expect(getParsedSql('SELECT SQL_CALC_FOUND_ROWS SQL_BUFFER_RESULT col1 FROM t'))
                .to.equal('SELECT SQL_CALC_FOUND_ROWS SQL_BUFFER_RESULT `col1` FROM `t`');
        });
        it('should support MySQL query options function', () => {
            expect(getParsedSql(`SELECT xx.dd, Max(IF(stat_key = 'yys', stat_us, 0)) AS 'yys_users' FROM waf.t_cpkg WHERE stat_ty = 'waf_ty' GROUP BY dd;`))
                .to.equal("SELECT `xx`.`dd`, MAX(IF(`stat_key` = 'yys', `stat_us`, 0)) AS `yys_users` FROM `waf`.`t_cpkg` WHERE `stat_ty` = 'waf_ty' GROUP BY `dd`");
        });

        it('should support select *from ast to sql', () => {
             expect(getParsedSql('SELECT *FROM abc'))
                .to.equal('SELECT * FROM `abc`');
        })

        it('should support double quotes MySQL query', () => {
            expect(getParsedSql('select * from (select * from tb_user where user_id = "lmt") as tableA limit 0,2'))
                .to.equal('SELECT * FROM (SELECT * FROM `tb_user` WHERE `user_id` = \'lmt\') AS `tableA` LIMIT 0, 2');
        });

        describe('logic operator', () => {
            it('should support column concatenation operator', () => {
              expect(getParsedSql('select "a" || "," || b as ab, t.cd && "ef" from t'))
              .to.equal("SELECT 'a' || ',' || `b` AS `ab`, `t`.`cd` && 'ef' FROM `t`");
            })
        })

        describe('common table expressions', () => {
            it('should support single CTE', () => {
                const sql = `WITH cte AS (SELECT 1)
                            SELECT * FROM cte`;
                expect(getParsedSql(sql)).to.equal('WITH cte AS (SELECT 1) SELECT * FROM `cte`');
            });

            it('should support multiple CTE', () => {
                 const sql = `WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2)
                              SELECT * FROM cte1 UNION SELECT * FROM cte2`;


                let expected = 'WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2) ' +
                               'SELECT * FROM `cte1` UNION SELECT * FROM `cte2`';
                expect(getParsedSql(sql)).to.equal(expected)
            });

            it('should support CTE with column', () => {
                const sql = `WITH cte (col1) AS (SELECT 1)
                            SELECT * FROM cte`;

                expect(getParsedSql(sql)).to.contain('(col1)');
            });

            it('should support CTE with multiple columns', () => {
                const sql = `WITH cte (col1, col2) AS (SELECT 1, 2)
                             SELECT * FROM \`cte\``;

                expect(getParsedSql(sql)).to.contain('(col1, col2)');
            });

            it('should support recursive CTE', () => {
                const sql = `WITH RECURSIVE cte(n) AS
                            (
                              SELECT 1
                              UNION
                              SELECT n + 1 FROM cte WHERE n < 5
                            )
                            SELECT * FROM cte`;

                expect(getParsedSql(sql)).to.match(/^WITH RECURSIVE/);
            });
        });

        describe('parentheses', () => {
            it('should support select column parentheses ast to sql', () => {
             expect(getParsedSql('SELECT (id) FROM abc'))
                .to.equal('SELECT (`id`) FROM `abc`');
            });

            it('should support select column parentheses ast to sql', () => {
             expect(getParsedSql('select (date(id)) from abc'))
                .to.equal('SELECT (date(`id`)) FROM `abc`');
            });
        })

        describe('expression', () => {
            it('should support asterisk', () => {
                expect(getParsedSql('SELECT * FROM t')).to.equal('SELECT * FROM `t`');
            });

            it('should support asterisk prefixed by table', () => {
                expect(getParsedSql('SELECT t.* FROM t')).to.equal('SELECT `t`.* FROM `t`');
            });

            it('should parse multiple expressions', () => {
                sql = 'SELECT col1 AS a, col2 AS b FROM t';
                expect(getParsedSql(sql)).to.equal('SELECT `col1` AS `a`, `col2` AS `b` FROM `t`');
            });

            it('should escape reserved keywords', () => {
                expect(getParsedSql('SELECT col."select" FROM t'))
                    .to.equal('SELECT `col`.`select` FROM `t`');
            });

            it('should escape reserved keywords in aliases', () => {
                expect(getParsedSql('SELECT col AS "index" FROM t'))
                    .to.equal('SELECT `col` AS `index` FROM `t`');
            });

            it('should escape aliases with non-identifier chars (/a-z0-9_/i)', () => {
                sql = `SELECT col AS "foo bar" FROM t`;
                expect(getParsedSql(sql)).to.contain('`col` AS `foo bar`');
            });

            ["'", '"', 'n', 't'].forEach((char) => {
                it(`should escape char ${char} "`, () => {
                    sql = `SELECT ' escape \${char}'`;
                    expect(getParsedSql(sql)).to.equal(sql);
                });
            });

            it('should support boolean values', () => {
                sql = 'SELECT false, true';
                expect(getParsedSql(sql)).to.equal('SELECT FALSE, TRUE');
            });

            it('should support parentheses', () => {
                sql = 'SELECT (2 + 3) * 4';
                expect(getParsedSql(sql)).to.equal(sql);
            });

            it('should support functions', () => {
                sql = `SELECT md5('foo')`;
                expect(getParsedSql(sql)).to.equal(sql);
            });

            it('should support aggregate functions', () => {
                sql = 'SELECT COUNT(distinct t.id) FROM t';
                expect(getParsedSql(sql)).to.equal('SELECT COUNT(DISTINCT `t`.`id`) FROM `t`');
            });

            it('should support unary operators', () => {
                sql = 'SELECT (not true), !t.foo as foo FROM t';
                expect(getParsedSql(sql)).to.equal('SELECT (NOT TRUE), NOT `t`.`foo` AS `foo` FROM `t`');
                sql = 'select -1, -a, +b, +abc.e from abc'
                expect(getParsedSql(sql)).to.equal('SELECT -1, -`a`, +`b`, +`abc`.`e` FROM `abc`');
            });

            const castQueries = {
                'simple casts':  [
                    'SELECT CAST(col AS CHAR) FROM t',
                    'SELECT CAST(`col` AS CHAR) FROM `t`'
                ],
                'null target casts':  [
                    'SELECT CAST(col) FROM t',
                    'SELECT CAST(`col`) FROM `t`'
                ],
                'string casts':  [
                    'SELECT CAST(\'col\' AS CHAR) FROM t',
                    'SELECT CAST(\'col\' AS CHAR) FROM `t`'
                ],
                'signed integer casts': [
                    'SELECT CAST(col as unsigned integer) FROM t',
                    'SELECT CAST(`col` AS UNSIGNED INTEGER) FROM `t`'
                ],
                'int casts': [
                    'SELECT CAST(col as int64) FROM t',
                    'SELECT CAST(`col` AS INT64) FROM `t`'
                ],
                'int num casts': [
                    'SELECT CAST(col as int(64)) FROM t',
                    'SELECT CAST(`col` AS INT(64)) FROM `t`'
                ],
                'simple decimal casts': [
                    'SELECT CAST(col AS DECIMAL) FROM t',
                    'SELECT CAST(`col` AS DECIMAL) FROM `t`'
                ],
                'decimal casts with precision': [
                    'SELECT CAST(col AS DECIMAL(4)) FROM t',
                    'SELECT CAST(`col` AS DECIMAL(4)) FROM `t`'
                ],
                'decimal casts with precision and scale': [
                    'SELECT CAST(col AS DECIMAL(6, 2)) FROM t',
                    'SELECT CAST(`col` AS DECIMAL(6, 2)) FROM `t`'
                ],
                'json casts':  [
                    `SELECT CAST('{"foo":"bar"}' AS JSON) FROM dual`,
                    `SELECT CAST('{"foo":"bar"}' AS JSON) FROM DUAL`
                ],
                'binary casts':  [
                    `SELECT CAST(a AS BINARY) FROM t`,
                    'SELECT CAST(`a` AS BINARY) FROM `t`'
                ],
                'char casts':  [
                    `SELECT CAST(test AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_bin;`,
                    'SELECT CAST(`test` AS CHAR CHARACTER SET UTF8MB4) COLLATE UTF8MB4_BIN'
                ],
            };
            Object.keys(castQueries).forEach(cast => {
                const [inputQuery, expectedQuery] = castQueries[cast];

                it(`should support ${cast}`, () => {
                    expect(getParsedSql(inputQuery)).to.equal(expectedQuery);
                });
            });

            it('should support pg double colon cast', () => {
                const castQueries = {
                    'colon cast': [
                        'SELECT col::CHAR FROM t',
                        'SELECT `col`::CHAR FROM `t`'
                    ],
                    'string cast': [
                        `SELECT CASE
                                WHEN op110.nkw = 1 THEN 'CV'::text
                                WHEN op110.pkw = 1 AND op110.transporter = 0 THEN 'PC'::text
                                WHEN op110.pkw = 1 AND op110.transporter = 1 THEN 'LCV'::text
                                ELSE NULL::text
                            END AS category
                        FROM t1 op110`,
                        "SELECT CASE WHEN `op110`.`nkw` = 1 THEN 'CV'::TEXT WHEN `op110`.`pkw` = 1 AND `op110`.`transporter` = 0 THEN 'PC'::TEXT WHEN `op110`.`pkw` = 1 AND `op110`.`transporter` = 1 THEN 'LCV'::TEXT ELSE NULL::TEXT END AS `category` FROM `t1` AS `op110`"
                    ],
                    'multiple colon cast': [
                        'SELECT col::CHAR, colb::geometry FROM t',
                        'SELECT `col`::CHAR, `colb`::GEOMETRY FROM `t`'
                    ],
                    'colon cast with as': [
                        'select (salary + bonus)::bigint as comp from employee',
                        'SELECT (`salary` + `bonus`)::BIGINT AS `comp` FROM `employee`'
                    ]
                }
                const opt = {
                    database: 'postgresql'
                }
                Object.keys(castQueries).forEach(cast => {
                    const [inputQuery, expectedQuery] = castQueries[cast];
                    expect(parser.sqlify(parser.astify(inputQuery, opt))).to.equal(expectedQuery);
                });
            })

            it('should support hive cast as string', () => {
                expect(getParsedSql(`select abc from t1 where cast(abc as string) = "123"`, { database: 'hive' }))
                    .to.equal('SELECT `abc` FROM `t1` WHERE CAST(`abc` AS STRING) = \'123\'')
            })


            it('should support subselects', () => {
                expect(getParsedSql(`SELECT 'string', (SELECT col FROM t2) subSelect FROM t1`))
                    .to.equal(`SELECT 'string', (SELECT \`col\` FROM \`t2\`) AS \`subSelect\` FROM \`t1\``);
            });

            it('should support subselects in FROM clause', () => {
                expect(getParsedSql('SELECT * FROM (SELECT id FROM t1) AS someAlias'))
                    .to.equal('SELECT * FROM (SELECT `id` FROM `t1`) AS `someAlias`');
            });

            it('should throw an exception for undefined values', () => {
                // flora-mysql uses plain values instead of equivalent expressions, so expressions
                // have to be created by SQL parser
                expect(() => {
                    util.createBinaryExpr(
                        '=',
                        { type: 'column_ref', table: null, column: 'id' },
                        undefined
                    );
                }).to.throw(Error)
            });

            it('should createBinaryExpr using between', () => {
                const expr =  util.createBinaryExpr(
                        'BETWEEN',
                       'id',
                       [10, 100]
                    )
                expect(expr).to.be.eql({
                  operator: 'BETWEEN',
                  type: 'binary_expr',
                  left: {
                    type: 'string',
                    value: 'id'
                  },
                  right: {
                    type: 'expr_list',
                    value: [
                      {
                        type: 'number',
                        value: 10
                      },
                      {
                        type: 'number',
                        value: 100
                      }
                    ]
                  }
                })

            });

            it('should createBinaryExpr using between', () => {
                const expr =  util.createBinaryExpr(
                        '=',
                       { type: 'column_ref', table: null, column: 'id' },
                       {type: 'number', value: 10},
                    )
                expect(expr).to.be.eql({
                  operator: '=',
                  type: 'binary_expr',
                  left: {
                    type: 'column_ref',
                    table: null,
                    column: 'id'
                  },
                  right: {
                    type: 'number',
                    value: 10
                  }
                })

            });

            it('should parse ANSI SQL compliant statements', () => {
                sql = `SELECT "id", 'foo' AS "type" FROM "table"`;
                expect(getParsedSql(sql)).to.equal('SELECT \'id\', \'foo\' AS `type` FROM `table`');
            });

            it('should parse DUAL table', () => {
                sql = `SELECT 'id' FROM DUAL`;
                expect(getParsedSql(sql)).to.equal(sql);
            });

            it('should parse DUAL table column add str', () => {
                sql = `SELECT id FROM DUAL`;
                expect(getParsedSql(sql)).to.equal(`SELECT 'id' FROM DUAL`);
            });
        });

        describe('date function', () => {
            it('should interval string', () => {
                const opt = {
                    database: 'postgresql'
                }
                expect(getParsedSql("SELECT NOW() - INTERVAL '7 DAY'", opt))
                .to.equal("SELECT NOW() - INTERVAL '7 DAY'");
                expect(getParsedSql("SELECT NOW() - INTERVAL 7 DAY", opt))
                    .to.equal("SELECT NOW() - INTERVAL 7 DAY");
            })

            it('should support adddate function', () => {
                expect(getParsedSql('SELECT ADDDATE(c, INTERVAL 10 DAY) as b FROM tableA'))
                    .to.equal('SELECT ADDDATE(`c`, INTERVAL 10 DAY) AS `b` FROM `tableA`');
            })

            it('should support adddate function interval expr', () => {
                expect(getParsedSql('SELECT ADDDATE(c, INTERVAL 1+3 DAY) as b FROM tableA'))
                    .to.equal('SELECT ADDDATE(`c`, INTERVAL 1 + 3 DAY) AS `b` FROM `tableA`');
            })

            it('should support adddate function interval column ref', () => {
                expect(getParsedSql('SELECT ADDDATE(c, INTERVAL tableB.col + 3 DAY) as b FROM tableA'))
                    .to.equal('SELECT ADDDATE(`c`, INTERVAL `tableB`.`col` + 3 DAY) AS `b` FROM `tableA`');
            })

            it('should support adddate function', () => {
                expect(getParsedSql('SELECT ADDDATE(c, 10) as b FROM tableA'))
                    .to.equal('SELECT ADDDATE(`c`, 10) AS `b` FROM `tableA`');
            })
        })

        describe('joins', () => {
            it('should support implicit joins', () => {
                expect(getParsedSql('SELECT a.col , b.c FROM a ,b'))
                    .to.equal('SELECT `a`.`col`, `b`.`c` FROM `a`, `b`');
            });

            it('should support (INNER) JOINs', () => {
                sql = 'SELECT a FROM t1 join t2 on t1.t2id = t2.t1id';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t1` INNER JOIN `t2` ON `t1`.`t2id` = `t2`.`t1id`');
            });

            it('should support LEFT JOINs', () => {
                sql = 'SELECT a FROM t1 left join t2 on t1.t2id = t2.t1id';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t1` LEFT JOIN `t2` ON `t1`.`t2id` = `t2`.`t1id`');
            });

            it('should support RIGHT JOINs', () => {
                sql = 'SELECT a FROM t1 right join t2 on t1.t2id = t2.t1id';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t1` RIGHT JOIN `t2` ON `t1`.`t2id` = `t2`.`t1id`');
            });

            it('should support FULL JOINs', () => {
                sql = 'SELECT a FROM t1 full join t2 on t1.t2id = t2.t1id';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t1` FULL JOIN `t2` ON `t1`.`t2id` = `t2`.`t1id`');
            });

            it('should support multiple joins', () => {
                sql = 'SELECT a FROM t1 LEFT JOIN t2 ON t1.t2id = t2.t1id INNER JOIN t3 ON t1.t3id = t3.t1id';
                expect(getParsedSql(sql))
                    .to.equal('SELECT `a` FROM `t1` LEFT JOIN `t2` ON `t1`.`t2id` = `t2`.`t1id` INNER JOIN `t3` ON `t1`.`t3id` = `t3`.`t1id`');
            });

            it('should support alias for base table', () => {
                sql = 'SELECT col1 FROM awesome_table t';
                expect(getParsedSql(sql)).to.equal('SELECT `col1` FROM `awesome_table` AS `t`');
            });

            it('should support joins with tables from other databases', () => {
                sql = 'SELECT col1 FROM t JOIN otherdb.awesome_table at ON t.id = at.tid';
                expect(getParsedSql(sql))
                    .to.equal('SELECT `col1` FROM `t` INNER JOIN `otherdb`.`awesome_table` AS `at` ON `t`.`id` = `at`.`tid`');
            });

            it('should support aliases in joins', () => {
                expect(getParsedSql('SELECT col1 FROM t1 LEFT JOIN awesome_table AS t2 ON t1.id = t2.t1id'))
                    .to.equal('SELECT `col1` FROM `t1` LEFT JOIN `awesome_table` AS `t2` ON `t1`.`id` = `t2`.`t1id`');
            });

            it('should support joined subquery', () => {
                expect(getParsedSql('SELECT * FROM t1 LEFT JOIN (SELECT id, col1 FROM t2) AS someAlias ON t1.id = someAlias.id'))
                    .to.equal('SELECT * FROM `t1` LEFT JOIN (SELECT `id`, `col1` FROM `t2`) AS `someAlias` ON `t1`.`id` = `someAlias`.`id`');
            });

            it('should support USING keyword (single column)', () => {
                expect(getParsedSql('SELECT * FROM t1 JOIN t2 USING (id)'))
                    .to.equal('SELECT * FROM `t1` INNER JOIN `t2` USING (`id`)');
            });

            it('should support USING keyword (multiple columns)', () => {
                expect(getParsedSql('SELECT * FROM t1 JOIN t2 USING (id1, id2)'))
                    .to.equal('SELECT * FROM `t1` INNER JOIN `t2` USING (`id1`, `id2`)');
            });
        });

        describe('where clause', () => {
            ['<', '<=', '=', '!=', '>=', '>'].forEach((operator) => {
                it(`should support simple "${operator}" comparison`, () => {
                    sql = `SELECT a fRom db.t wHERE "type" ${operator} 3`;
                    expect(getParsedSql(sql)).to.equal(`SELECT \`a\` FROM \`db\`.\`t\` WHERE 'type' ${operator} 3`);
                });
                it(`should support simple "${operator}" comparison`, () => {
                    sql = `SELECT a fRom db.t wHERE id ${operator} 3`;
                    expect(getParsedSql(sql)).to.equal(`SELECT \`a\` FROM \`db\`.\`t\` WHERE \`id\` ${operator} 3`);
                });
            });

            const operatorMap = { '=': 'IN', '!=': 'NOT IN' };
            Object.keys(operatorMap).forEach((operator) => {
                const sqlOperator = operatorMap[operator];

                it(`should convert "${operator}" to ${sqlOperator} operator for array values`, () => {
                    const ast = {
                        type: 'select',
                        options: null,
                        distinct: null,
                        columns: [{ expr: { type: 'column_ref', table: null, column: 'a' }, as: null }],
                        from: [{ db: null, table: 't', as: null }],
                        where: {
                            type: 'binary_expr',
                            operator: operator,
                            left: { type: 'column_ref', table: null, column: 'id' },
                            right: {
                                type: 'expr_list',
                                value: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }]
                            }
                        },
                        groupby: null,
                        limit: null
                    };

                    expect(parser.sqlify(ast)).to.equal(`SELECT \`a\` FROM \`t\` WHERE \`id\` ${sqlOperator} (1, 2)`);
                });
            });

            ['IN', 'NOT IN'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `SELECT a FROM t WHERE id ${operator.toLowerCase()} (1, 2, 3)`;
                    expect(getParsedSql(sql)).to.equal(`SELECT \`a\` FROM \`t\` WHERE \`id\` ${operator} (1, 2, 3)`);
                });
            });

            ['IS', 'IS NOT'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `SELECT a FROM t WHERE col ${operator.toLowerCase()} NULL`;
                    expect(getParsedSql(sql)).to.equal(`SELECT \`a\` FROM \`t\` WHERE \`col\` ${operator} NULL`);
                });
            });

            it('should support query param values', () => {
                sql = 'SELECT * FROM t where t.a > :my_param';
                expect(getParsedSql(sql)).to.equal('SELECT * FROM `t` WHERE `t`.`a` > :my_param');
            });

            ['BETWEEN', 'NOT BETWEEN'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `SELECT a FROM t WHERE id ${operator.toLowerCase()} '1' and 1337`;
                    expect(getParsedSql(sql)).to.equal(`SELECT \`a\` FROM \`t\` WHERE \`id\` ${operator} '1' AND 1337`);
                });
            });

            it('should support boolean values', () => {
                sql = 'SELECT col1 FROM t WHERE col2 = false';
                expect(getParsedSql(sql)).to.equal('SELECT `col1` FROM `t` WHERE `col2` = FALSE');
            });

            it('should support string values', () => {
                expect(getParsedSql(`SELECT col1 FROM t WHERE col2 = 'foobar'`))
                    .to.equal(`SELECT \`col1\` FROM \`t\` WHERE \`col2\` = 'foobar'`);
            });

            it('should support null values', () => {
                expect(getParsedSql('SELECT col1 FROM t WHERE col2 IS NULL'))
                    .to.equal('SELECT `col1` FROM `t` WHERE `col2` IS NULL');
            });

            it('should support array values', () => {
                expect(getParsedSql('SELECT col1 FROM t WHERE col2 IN (1, 3, 5, 7)'))
                    .to.equal('SELECT `col1` FROM `t` WHERE `col2` IN (1, 3, 5, 7)');
            });

            ['NOT EXISTS'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    expect(getParsedSql(`SELECT a FROM t WHERE ${operator} (SELECT 1)`))
                        .to.equal(`SELECT \`a\` FROM \`t\` WHERE ${operator} (SELECT 1)`);
                });
            });

            it(`should support exists operator`, () => {
                const operator = 'EXISTS'
                expect(getParsedSql(`SELECT a FROM t WHERE ${operator} (SELECT 1)`))
                    .to.equal(`SELECT \`a\` FROM \`t\` WHERE ${operator}(SELECT 1)`);
            });

            it('should support row value constructors', () => {
                expect(getParsedSql(`SELECT * FROM "user" WHERE (firstname, lastname) = ('John', 'Doe')`))
                    .to.equal(`SELECT * FROM \`user\` WHERE (\`firstname\`, \`lastname\`) = ('John', 'Doe')`);
            });
        });

        describe('group clause', () => {
            it('should support single expressions', () => {
                expect(getParsedSql('SELECT a FROM t group by t.b'))
                    .to.equal('SELECT `a` FROM `t` GROUP BY `t`.`b`');
            });

            it('should support multiple expressions', () => {
                expect(getParsedSql('SELECT a FROM t GROUP BY t.b, t.c'))
                    .to.equal('SELECT `a` FROM `t` GROUP BY `t`.`b`, `t`.`c`');
            });

            it('should not generate an empty GROUP BY clause on empty arrays', () => {
                const sql = 'SELECT a FROM t';
                const ast = parser.astify(sql);
                ast.groupby = [];
                expect(parser.sqlify(ast)).to.equal('SELECT `a` FROM `t`');
            });
        });

        describe('having clause', () => {
            it('should support simple expressions', () => {
                expect(getParsedSql('SELECT a FROM t GROUP BY t.b having COUNT(*) > 1'))
                    .to.equal('SELECT `a` FROM `t` GROUP BY `t`.`b` HAVING COUNT(*) > 1');
            });

            it('should support complex expressions', () => {
                expect(getParsedSql('SELECT a FROM t GROUP BY t.b HAVING COUNT(*) > (SELECT 10)'))
                    .to.equal('SELECT `a` FROM `t` GROUP BY `t`.`b` HAVING COUNT(*) > (SELECT 10)');
            });
        });

        describe('order clause', () => {
            it('should support implicit sort order', () => {
                sql = 'SELECT a FROM t order by id';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t` ORDER BY `id` ASC');
            });

            it('should support explicit sort order', () => {
                sql = 'SELECT a FROM t order by id desc';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t` ORDER BY `id` DESC');
            });

            it('should support multiple expressions', () => {
                sql = 'SELECT a FROM t order by id desc, name asc';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t` ORDER BY `id` DESC, `name` ASC');
            });

            it('should support complex expressions', () => {
                expect(getParsedSql('SELECT a FROM t ORDER BY rand() ASC'))
                    .to.equal('SELECT `a` FROM `t` ORDER BY rand() ASC');
            });

            it('should not generate an empty ORDER BY clause on empty arrays', () => {
                const sql = 'SELECT a FROM t';
                const ast = parser.astify(sql);
                ast.orderby = [];
                expect(parser.sqlify(ast)).to.equal('SELECT `a` FROM `t`');
            });
        });

        describe('limit clause', () => {
            it('should work w/o offset', () => {
                sql = 'SELECT a FROM t limit 10';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t` LIMIT 10');
            });

            it('should work w/ offset', () => {
                sql = 'SELECT a FROM t limit 10, 10';
                expect(getParsedSql(sql)).to.equal('SELECT `a` FROM `t` LIMIT 10, 10');
            });

            it('should work db2 fetch', () => {
                sql = "select col1, col2 from library.tablename where col1 = 'foo' fetch first 5 rows only";
                expect(getParsedSql(sql, {database: 'db2'})).to.equal("SELECT col1, col2 FROM library.tablename WHERE col1 = 'foo' FETCH FIRST 5 ROWS ONLY");
            });

            it('should work db2 fetch offset', () => {
                sql = "select col1, col2 from library.tablename where col1 = 'foo' offset 10 rows fetch next 5 rows only";
                expect(getParsedSql(sql, {database: 'db2'})).to.equal("SELECT col1, col2 FROM library.tablename WHERE col1 = 'foo' OFFSET 10 ROWS FETCH NEXT 5 ROWS ONLY");
            });
        });

        describe('union operator', () => {
            it('should combine multiple statements', () => {
                sql = `select 1 union select '1' union select a from t union (select true)`;
                expect(getParsedSql(sql)).to.equal(`SELECT 1 UNION SELECT '1' UNION SELECT \`a\` FROM \`t\` UNION (SELECT TRUE)`);
            });

            it('should support union with parentheses order by and limit', () => {
                expect(getParsedSql('(select id from app) union (select id from user)')).to.equal('(SELECT `id` FROM `app`) UNION (SELECT `id` FROM `user`)')
                expect(getParsedSql('(select id from app) union (select id from user) order by id')).to.equal('(SELECT `id` FROM `app`) UNION (SELECT `id` FROM `user`) ORDER BY `id` ASC')
                expect(getParsedSql('(select id from app) union (select id from user) order by id limit 10')).to.equal('(SELECT `id` FROM `app`) UNION (SELECT `id` FROM `user`) ORDER BY `id` ASC LIMIT 10')
                expect(getParsedSql('(select id from app) union (select id from user) limit 10')).to.equal('(SELECT `id` FROM `app`) UNION (SELECT `id` FROM `user`) LIMIT 10')
            });

            it('should combine multiple statements default union', () => {
                sql = `select 1 union all select '1' union select a from t union all (select true)`;
                const ast = parser.astify(sql)
                ast.union = null
                expect(parser.sqlify(ast)).to.equal(`SELECT 1 UNION SELECT '1' UNION SELECT \`a\` FROM \`t\` UNION ALL (SELECT TRUE)`);
            });


            it('should combine multiple statements union all', () => {
                sql = `select 1 union all select '1' union select a from t union all (select true)`;
                const ast =
                expect(getParsedSql(sql)).to.equal(`SELECT 1 UNION ALL SELECT '1' UNION SELECT \`a\` FROM \`t\` UNION ALL (SELECT TRUE)`);
            });

            it('should support sqlify without ast', () => {
                const ast = [{
                    ast: {
                        "with": null,
                        "type": "select",
                        "options": null,
                        "distinct": null,
                        "columns": [
                            {
                                "expr": {
                                "type": "number",
                                "value": 1
                                },
                                "as": null
                            }
                        ],
                        "from": null,
                        "where": null,
                        "groupby": null,
                        "having": null,
                        "orderby": null,
                        "limit": null
                    }
                }]
                expect(multipleToSQL(ast)).to.equal('SELECT 1')
            })

            it('should be supported in expressions', () => {
                sql = `select * from (select 1 union select 2) t`;
                expect(getParsedSql(sql)).to.equal(`SELECT * FROM (SELECT 1 UNION SELECT 2) AS \`t\``);
            });
        });
    });

    describe('control flow', () => {
        describe('case operator', () => {
            it('should support case-when', () => {
                sql = `select case when 1 then 'one' when 2 then 'two' END`;
                expect(getParsedSql(sql)).to.equal(`SELECT CASE WHEN 1 THEN 'one' WHEN 2 THEN 'two' END`);
            });

            it('should support case-when-else', () => {
                sql = `select case FUNC(a) when 1 then 'one' when 2 then 'two' else 'more' END FROM t`;
                expect(getParsedSql(sql)).to.equal(`SELECT CASE FUNC(\`a\`) WHEN 1 THEN 'one' WHEN 2 THEN 'two' ELSE 'more' END FROM \`t\``);
            });

            it('should support case-when with parenthesis', () => {
                sql = `SELECT CASE WHEN (a - b) = 1 THEN 1 ELSE 0 END FROM t`;
                expect(getParsedSql(sql)).to.equal('SELECT CASE WHEN (`a` - `b`) = 1 THEN 1 ELSE 0 END FROM `t`');
            });
        });

        describe('if function', () => {
            it('should support simple calls', () => {
                expect(getParsedSql(`SELECT IF(col1 = 'xyz', 'foo', 'bar') FROM t`))
                    .to.equal(`SELECT IF(\`col1\` = 'xyz', 'foo', 'bar') FROM \`t\``);
            });
        });
    });

    describe('literals', () => {
        it('should support string values', () => {
            sql = `SELECT 'foo'`;
            expect(getParsedSql(sql)).to.equal(`SELECT 'foo'`);
        });

        it('should support string with escape values', () => {
            sql = `INSERT INTO mytablehere (ID, post_author) VALUES (2564,'I haven\\'t <a href="http://www.someurl.com/somepartofurl\\0">figured</a>');`;
            expect(getParsedSql(sql)).to.equal('INSERT INTO `mytablehere` (`ID`, `post_author`) VALUES (2564,\'I haven\\\'t <a href="http://www.someurl.com/somepartofurl\\0">figured</a>\')');
        });

        it('should sqlify back with escape', () => {
            expect(getParsedSql(`select * from test where a='te\\'st'`))
            .to.equal("SELECT * FROM `test` WHERE `a` = 'te\\'st'")
        })

        it('should support null values', () => {
            sql = 'SELECT null';
            expect(getParsedSql(sql)).to.equal('SELECT NULL');
        });

        it('should support params values', () => {
            sql = 'SELECT :var_dname FROM dual';
            expect(getParsedSql(sql)).to.equal('SELECT :var_dname FROM DUAL');
        });

        it('should support without prefix', () => {
            expect(varToSQL({ name: "test" })).to.equal('@test')
        })

        it('should support trailing zeros',  () => {
            expect(getParsedSql('SELECT 042')).equal('SELECT 42');
            expect(getParsedSql('SELECT -042')).equal('SELECT -42');
        });


        describe('datetime', () => {
            const literals = {
                time: '08:23:16',
                date: '1999-12-25',
                timestamp: '1999-12-25 08:23:16'
            };

            Object.keys(literals).forEach((type) => {
                const value = literals[type];

                it(type, () => {
                    expect(getParsedSql(`SELECT ${type} '${value}'`)).to.equal(`SELECT ${type.toUpperCase()} '${value}'`);
                });
            });
        });
    });

    describe('placeholder', () => {
        let ast;

        it('should replace single parameter', () => {
            ast = parser.astify('SELECT col FROM t WHERE id = :id');
            ast = util.replaceParams(ast, { id: 1 });

            expect(ast.where).to.eql({
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: null, column: 'id' },
                right: { type: 'number', value: 1 }
            });
        });

        it('should replace multiple parameters', () => {
            ast = parser.astify('SELECT col FROM t WHERE id = :id AND "type" = :type');
            ast = util.replaceParams(ast, { id: 1, type: 'foobar' });

            expect(ast.where).to.eql({
                type: 'binary_expr',
                operator: 'AND',
                left: {
                    type: 'binary_expr',
                    operator: '=',
                    left: { type: 'column_ref', table: null, column: 'id' },
                    right: { type: 'number', value: 1 }
                },
                right: {
                    type: 'binary_expr',
                    operator: '=',
                    left: { type: 'string', value: 'type' },
                    right: { type: 'string', value: 'foobar' }
                }
            });
        });

        it('should set parameter with string', () => {
            ast = parser.astify('SELECT col1 FROM t WHERE col2 = :name');
            ast = util.replaceParams(ast, { name: 'John Doe' });

            expect(ast.where).to.eql({
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: null, column: 'col2' },
                right: { type: 'string', value: 'John Doe' }
            });
        });

        it('should set parameter with boolean value', () => {
            ast = parser.astify('SELECT col1 FROM t WHERE isMain = :main');
            ast = util.replaceParams(ast, { main: true });

            expect(ast.where).to.eql({
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: null, column: 'isMain' },
                right: { type: 'bool', value: true }
            });
        });

        it('should set parameter with null value', () => {
            ast = parser.astify('SELECT col1 FROM t WHERE col2 = :param');
            ast = util.replaceParams(ast, { param: null });

            expect(ast.where).to.eql({
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: null, column: 'col2' },
                right: { type: 'null', value: null }
            });
        });

        it('should set parameter with array as value', () => {
            ast = parser.astify('SELECT col1 FROM t WHERE id = :ids');
            ast = util.replaceParams(ast, { ids: [1, 3, 5, 7] });

            expect(ast.where).to.eql({
                type: 'binary_expr',
                operator: '=',
                left: { type: 'column_ref', table: null, column: 'id' },
                right: {
                    type: 'expr_list',
                    value: [
                        { type: 'number', value: 1 },
                        { type: 'number', value: 3 },
                        { type: 'number', value: 5 },
                        { type: 'number', value: 7 }
                    ]
                }
            });
        });

        it('should throw an exception if no value for parameter is available', () => {
            ast = parser.astify('SELECT col FROM t WHERE id = :id');

            expect(() => {
                util.replaceParams(ast, { foo: 'bar' });
            }).to.throw('no value for parameter :id found');
        });

        it('should return new AST object', () => {
            ast = parser.astify('SELECT col FROM t WHERE id = :id');
            const resolvedParamAST = util.replaceParams(ast, { id: 1 });

            expect(ast).to.not.eql(resolvedParamAST);
        });
    });

    describe('multiple statements', () => {
        it('should parser simple multiple statements', () => {
            const sql = 'SELECT * FROM a;SELECT id FROM b'
            const expectSQL = 'SELECT * FROM `a` ; SELECT `id` FROM `b`'
            expect(getParsedSql(sql)).to.equal(expectSQL);
        })
        it('should parser simple multiple statements with same type', () => {
            const sql = 'SELECT * FROM a;SELECT id FROM b UNION SELECT id FROM c'
            const expectSQL = 'SELECT * FROM `a` ; SELECT `id` FROM `b` UNION SELECT `id` FROM `c`'
            expect(getParsedSql(sql)).to.equal(expectSQL);
        })
        it('should parser simple multiple statements with different types', () => {
            const sql = 'SELECT * FROM a;UPDATE b SET id = 1'
            const expectSQL = 'SELECT * FROM `a` ; UPDATE `b` SET `id` = 1'
            expect(getParsedSql(sql)).to.equal(expectSQL);
        })
    })

    describe('delete statements', () => {

        describe('where clause', () => {
            ['<', '<=', '=', '!=', '>=', '>'].forEach((operator) => {
                it(`should support simple "${operator}" comparison`, () => {
                    sql = `DELETE a fRom db.t wHERE "type" ${operator} 3`;
                    expect(getParsedSql(sql)).to.equal(`DELETE \`a\` FROM \`db\`.\`t\` WHERE 'type' ${operator} 3`);
                });
                it(`should support simple "${operator}" comparison`, () => {
                    sql = `DELETE a fRom db.t wHERE id ${operator} 3`;
                    expect(getParsedSql(sql)).to.equal(`DELETE \`a\` FROM \`db\`.\`t\` WHERE \`id\` ${operator} 3`);
                });
            });

            const operatorMap = { '=': 'IN', '!=': 'NOT IN' };
            Object.keys(operatorMap).forEach((operator) => {
                const sqlOperator = operatorMap[operator];

                it(`should convert "${operator}" to ${sqlOperator} operator for array values`, () => {
                    const ast = {
                        type: 'delete',
                        options: null,
                        distinct: null,
                        table: [{ db: null, table: 't', as: null }],
                        from: [{ db: null, table: 't', as: null }],
                        where: {
                            type: 'binary_expr',
                            operator: operator,
                            left: { type: 'column_ref', table: null, column: 'id' },
                            right: {
                                type: 'expr_list',
                                value: [{ type: 'number', value: 1 }, { type: 'number', value: 2 }]
                            }
                        },
                        groupby: null,
                        limit: null
                    };

                    expect(parser.sqlify(ast)).to.equal(`DELETE \`t\` FROM \`t\` WHERE \`id\` ${sqlOperator} (1, 2)`);
                    ast.table[0].addition = true
                    expect(parser.sqlify(ast)).to.equal(`DELETE FROM \`t\` WHERE \`id\` ${sqlOperator} (1, 2)`);
                });
            });

            ['IN', 'NOT IN'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `DELETE a FROM t WHERE id ${operator.toLowerCase()} (1, 2, 3)`;
                    expect(getParsedSql(sql)).to.equal(`DELETE \`a\` FROM \`t\` WHERE \`id\` ${operator} (1, 2, 3)`);
                });
            });

            ['IS', 'IS NOT'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `DELETE a FROM t WHERE col ${operator.toLowerCase()} NULL`;
                    expect(getParsedSql(sql)).to.equal(`DELETE \`a\` FROM \`t\` WHERE \`col\` ${operator} NULL`);
                });
            });

            ['BETWEEN', 'NOT BETWEEN'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `DELETE a FROM t WHERE id ${operator.toLowerCase()} '1' and 1337`;
                    expect(getParsedSql(sql)).to.equal(`DELETE \`a\` FROM \`t\` WHERE \`id\` ${operator} '1' AND 1337`);
                });
            });

            it('should support boolean values', () => {
                sql = 'DELETE col1 FROM t WHERE col2 = false';
                expect(getParsedSql(sql)).to.equal('DELETE `col1` FROM `t` WHERE `col2` = FALSE');
            });

            it('should support string values', () => {
                expect(getParsedSql(`DELETE col1 FROM t WHERE col2 = 'foobar'`))
                    .to.equal(`DELETE \`col1\` FROM \`t\` WHERE \`col2\` = 'foobar'`);
            });

            it('should support null values', () => {
                expect(getParsedSql('DELETE col1 FROM t WHERE col2 IS NULL'))
                    .to.equal('DELETE `col1` FROM `t` WHERE `col2` IS NULL');
            });

            it('should support array values', () => {
                expect(getParsedSql('DELETE col1 FROM t WHERE col2 IN (1, 3, 5, 7)'))
                    .to.equal('DELETE `col1` FROM `t` WHERE `col2` IN (1, 3, 5, 7)');
            });

            ['NOT EXISTS'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    expect(getParsedSql(`DELETE a FROM t WHERE ${operator} (SELECT 1)`))
                        .to.equal(`DELETE \`a\` FROM \`t\` WHERE ${operator} (SELECT 1)`);
                });
            })

            it(`should support exists operator`, () => {
                const operator = 'EXISTS'
                expect(getParsedSql(`DELETE a FROM t WHERE ${operator} (SELECT 1)`))
                    .to.equal(`DELETE \`a\` FROM \`t\` WHERE ${operator}(SELECT 1)`);
            });
        });

        it('should support JOINs', () => {
            expect(getParsedSql('DELETE t1,t2 FROM t1 LEFT JOIN t2 ON t1.id=t2.id WHERE t1.id = 25'))
            .to.equal('DELETE `t1`, `t2` FROM `t1` LEFT JOIN `t2` ON `t1`.`id` = `t2`.`id` WHERE `t1`.`id` = 25')
        })

    })

    describe('update statements', () => {

        it('should support value is number', () => {
            expect(getParsedSql('UPDATE t SET col1 = 5'))
            .to.equal('UPDATE `t` SET `col1` = 5')
        })

        it('should support backticks', () => {
            expect(getParsedSql('UPDATE `t` SET `col1` = 5'))
            .to.equal('UPDATE `t` SET `col1` = 5')
        })

        it('should support value is string', () => {
            expect(getParsedSql('UPDATE t SET col1 = "abc"'))
            .to.equal('UPDATE `t` SET `col1` = \'abc\'')
        })

        it('should support value is NULL ', () => {
            expect(getParsedSql('UPDATE t SET name = null'))
            .to.equal('UPDATE `t` SET `name` = NULL')
        })

        it('should support multiple columns', () => {
            expect(getParsedSql('UPDATE t SET id = 1, name = 2'))
            .to.equal('UPDATE `t` SET `id` = 1, `name` = 2')
        })

        it('should support cross-table update', () => {
            expect(getParsedSql('UPDATE Reservations r JOIN Train t ON (r.Train = t.TrainID) SET t.Capacity = t.Capacity + r.NoSeats WHERE r.ReservationID = 12'))
            .to.equal('UPDATE `Reservations` AS `r` INNER JOIN `Train` AS `t` ON (`r`.`Train` = `t`.`TrainID`) SET `t`.`Capacity` = `t`.`Capacity` + `r`.`NoSeats` WHERE `r`.`ReservationID` = 12')
        })

        describe('where clause', () => {
            ['<', '<=', '=', '!=', '>=', '>'].forEach((operator) => {
                it(`should support simple "${operator}" comparison`, () => {
                    sql = `UPDATE a SET col1 = 5 WHERE "type" ${operator} 3`;
                    expect(getParsedSql(sql)).to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE 'type' ${operator} 3`);
                });
                it(`should support simple "${operator}" comparison`, () => {
                    sql = `UPDATE a SET col1 = 5 WHERE id ${operator} 3`;
                    expect(getParsedSql(sql)).to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE \`id\` ${operator} 3`);
                });
            });

            const operatorMap = { '=': 'IN', '!=': 'NOT IN' };
            Object.keys(operatorMap).forEach((operator) => {
                const sqlOperator = operatorMap[operator];
                it(`should convert "${operator}" to ${sqlOperator} operator for array values`, () => {
                    const ast = {
                    "type": "update",
                    "table": [
                        {
                        "db": null,
                        "table": "a",
                        "as": null
                        }
                    ],
                    "set": [
                        {
                            "column": "col1",
                            "value": {
                                "type": "number",
                                "value": 5
                            }
                        }
                    ],
                    "where": {
                        "type": "binary_expr",
                        "operator": operator,
                        "left": {
                            "type": "column_ref",
                            "table": null,
                            "column": "id"
                        },
                        "right": {
                            "type": "expr_list",
                            "value": [
                                {
                                "type": "number",
                                "value": 1
                                },
                                {
                                "type": "number",
                                "value": 2
                                }
                            ]
                        }
                    }
                }

                expect(parser.sqlify(ast)).to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE \`id\` ${sqlOperator} (1, 2)`);
                });
            });

            ['IN', 'NOT IN'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `UPDATE a SET col1 = 5 WHERE id ${operator.toLowerCase()} (1, 2, 3)`;
                    expect(getParsedSql(sql)).to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE \`id\` ${operator} (1, 2, 3)`);
                });
            });

            ['IS', 'IS NOT'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `UPDATE a SET col1 = 5 WHERE col ${operator.toLowerCase()} NULL`;
                    expect(getParsedSql(sql)).to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE \`col\` ${operator} NULL`);
                });
            });

            ['BETWEEN', 'NOT BETWEEN'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    sql = `UPDATE a SET col1 = 5 WHERE id ${operator.toLowerCase()} '1' and 1337`;
                    expect(getParsedSql(sql)).to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE \`id\` ${operator} '1' AND 1337`);
                });
            });

            it('should support boolean values', () => {
                sql = 'UPDATE t SET col1 = 5 WHERE col2 = false';
                expect(getParsedSql(sql)).to.equal('UPDATE `t` SET \`col1\` = 5 WHERE `col2` = FALSE');
            });

            it('should support string values', () => {
                expect(getParsedSql(`UPDATE t SET col1 = 5 WHERE col2 = 'foobar'`))
                    .to.equal(`UPDATE \`t\` SET \`col1\` = 5 WHERE \`col2\` = 'foobar'`);
            });

            it('should support null values', () => {
                expect(getParsedSql('UPDATE t SET col1 = 5 WHERE col2 IS NULL'))
                    .to.equal('UPDATE `t` SET \`col1\` = 5 WHERE `col2` IS NULL');
            });

            it('should support array values', () => {
                expect(getParsedSql('UPDATE t SET col1 = 5 WHERE col2 IN (1, 3, 5, 7)'))
                    .to.equal('UPDATE `t` SET \`col1\` = 5 WHERE `col2` IN (1, 3, 5, 7)');
            });

            ['NOT EXISTS'].forEach((operator) => {
                it(`should support ${operator} operator`, () => {
                    expect(getParsedSql(`UPDATE a SET col1 = 5 WHERE ${operator} (SELECT 1)`))
                        .to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE ${operator} (SELECT 1)`);
                });
            })

            it(`should support exists operator`, () => {
                const operator = 'EXISTS'
                expect(getParsedSql(`UPDATE a SET col1 = 5 WHERE ${operator} (SELECT 1)`))
                    .to.equal(`UPDATE \`a\` SET \`col1\` = 5 WHERE ${operator}(SELECT 1)`);
            });
        });


        it('should support function', () => {
            expect(getParsedSql(`UPDATE t SET col1 = concat(name, '名字')`))
            .to.equal("UPDATE `t` SET `col1` = concat(`name`, '名字')")
        })

    })

    describe('insert statements', () => {

        it('should support insert', () => {
            expect(getParsedSql('INSERT INTO t (col1, col2) VALUES (1, 2)'))
            .to.equal('INSERT INTO `t` (`col1`, `col2`) VALUES (1,2)')
        })

        it('should support insert with no columns', () => {
            expect(getParsedSql('INSERT INTO t VALUES (1, 2)'))
            .to.equal('INSERT INTO `t` VALUES (1,2)')
        })

    })

    describe('sql comment', () => {
        it('should support # symbol', () => {
            expect(getParsedSql('select * from app limit 0,1; # comment here'))
            .to.equal('SELECT * FROM `app` LIMIT 0, 1')
        })

        it('should support -- symbol', () => {
            expect(getParsedSql('select * from app limit 0,1; -- comment here'))
            .to.equal('SELECT * FROM `app` LIMIT 0, 1')
        })

        it('should support /**/ symbol', () => {
            expect(getParsedSql(`SELECT contact_id, last_name, first_name
            /* Author: TechOnTheNet.com */
            FROM contacts;`))
            .to.equal('SELECT `contact_id`, `last_name`, `first_name` FROM `contacts`')
        })

        it('should support comment symbol in middle', () => {
            expect(getParsedSql(`SELECT  /* Author: TechOnTheNet.com */  contact_id, last_name, first_name
            FROM contacts;`))
            .to.equal('SELECT `contact_id`, `last_name`, `first_name` FROM `contacts`')
            expect(getParsedSql(`SELECT contact_id, last_name, first_name  -- Author: TechOnTheNet.com
            FROM contacts;`))
            .to.equal('SELECT `contact_id`, `last_name`, `first_name` FROM `contacts`')
            expect(getParsedSql(`SELECT contact_id, last_name, first_name  # Author: TechOnTheNet.com
            FROM contacts;`))
            .to.equal('SELECT `contact_id`, `last_name`, `first_name` FROM `contacts`')
        })

        it('should support comment multiple lines', () => {
            expect(getParsedSql(`SELECT contact_id, last_name, first_name
            /*
             * Author: TechOnTheNet.com
             * Purpose: To show a comment that spans multiple lines in your SQL
             * statement in MySQL.
             */
            FROM contacts;`))
            .to.equal('SELECT `contact_id`, `last_name`, `first_name` FROM `contacts`')
        })

    })

    describe('orderOrPartitionByToSQL', () => {
        it('should support default order partition', () => {
            const expr = [
                {
                "expr": {
                  "type": "column_ref",
                  "table": null,
                  "column": "gender"
                },
                "as": null
                }
            ]
            expect(orderOrPartitionByToSQL(expr, 'default')).to.equal('DEFAULT `gender`')
          })
    })

    describe('transactsql', () => {
        it('should support basic parser select', () => {
            const sql = `SELECT col, col2 FROM dba.schemab.tbl_c`
            const opt = { database: 'transactsql' }
            const ast = parser.astify(sql, opt)
            const backSQL = parser.sqlify(ast, opt)
            expect(backSQL).to.equals(`SELECT [col], [col2] FROM [dba.schemab].[tbl_c]`)
        })
    })


    describe('unsupported situation', () => {
        it(`should throw exception for drop statements`, () => {
            expect(parser.sqlify.bind(null, {type: 'Alter'})).to.throw(Error, `Alter statements not supported at the moment`);
        });

        it(`should throw exception for drop statements`, () => {
            expect(parser.sqlify.bind(null, {ast: {type: 'Alter'}})).to.throw(Error, `Alter statements not supported at the moment`);
            });
        });
});
