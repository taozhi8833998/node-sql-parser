const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('select', () => {
  const parser = new Parser();

  it('should be null if empty', () => {
    const ast = parser.astify('SELECT a');
    expect(ast.options).to.be.null;
    expect(ast.distinct).to.be.null;
    expect(ast.from).to.be.null;
    expect(ast.where).to.be.null;
    expect(ast.groupby).to.be.null;
    expect(ast.orderby).to.be.null;
    expect(ast.limit).to.be.null;
  });

  it('should support * with optional table prefix and other columns alias', () => {
    [
      {
        sql: 'SELECT *, \'a\' as col2 FROM table1',
        expected: 'SELECT *, \'a\' AS `col2` FROM `table1`'
      },
      {
        sql: 'SELECT table1.*, \'a\' as col2 FROM table1',
        expected: 'SELECT `table1`.*, \'a\' AS `col2` FROM `table1`'
      }
    ].forEach(({sql, expected}, index) => {
      const ast = parser.astify(sql)
      expect(ast.options).to.be.null;
      expect(ast.distinct).to.be.null;
      expect(ast.columns).to.be.eql([
        {
          "expr": {
              "type": "column_ref",
              "table": index === 0 ? null: "table1",
              "column": "*"
          },
          "as": null
        },
        {
          "expr": {
              "type": "string",
              "value": "a"
          },
          "as": "col2"
        }
      ]);
      expect(ast.from).to.be.eql([
        {
          "db": null,
          "table": "table1",
          "as": null
        }
      ]);
      expect(ast.where).to.be.null;
      expect(ast.groupby).to.be.null;
      expect(ast.orderby).to.be.null;
      expect(ast.limit).to.be.null;
      expect(parser.sqlify(ast)).to.be.eql(expected)
    })
  })

  it('should support select *from', () => {
    const ast = parser.astify('SELECT *from abc');
    expect(ast.options).to.be.null;
    expect(ast.distinct).to.be.null;
    expect(ast.columns).to.be.eql('*');
    expect(ast.from).to.be.eql([
         {
            "db": null,
            "table": "abc",
            "as": null
         }
      ]);
    expect(ast.where).to.be.null;
    expect(ast.groupby).to.be.null;
    expect(ast.orderby).to.be.null;
    expect(ast.limit).to.be.null;
  });

  it('should support parse any column name', () => {
    const sql = 'select book_view.code from book_view where book_view.type= "A"'
    const ast = parser.astify(sql)
    const backSQL = parser.sqlify(ast)
    expect(backSQL).to.be.equal('SELECT `book_view`.`code` FROM `book_view` WHERE `book_view`.`type` = \'A\'')
  })

  it('should have appropriate types', () => {
    const ast = parser.astify('SELECT SQL_NO_CACHE DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit 3');

    expect(ast.options).to.be.an('array');
    expect(ast.distinct).to.equal('DISTINCT');
    expect(ast.from).to.be.an('array');
    expect(ast.where).to.be.an('object');
    expect(ast.groupby).to.be.an('array');
    expect(ast.orderby).to.be.an('array');
    expect(ast.limit).to.be.an('object');
  });

  describe('column clause', () => {
    it('should parse "*" shorthand', () => {
      const ast = parser.astify('SELECT * FROM t');
      expect(ast.columns).to.equal('*');
    });

    it('should parse "table.*" column expressions', () => {
      const ast = parser.astify('SELECT t.* FROM t');
      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', 'table': 't', column: '*' }, as: null }
      ]);
    });
    it('should parse json column query expressions', () => {
      const ast = parser.astify("SELECT item.jsonCol->>'$.test.path' from 'items'");
      expect(parser.sqlify(ast)).to.be.equal("SELECT `item`.`jsonCol` ->> '$.test.path' FROM `items`")
    });
    it('should parse json column query expressions with collate', () => {
      const ast = parser.astify("SELECT item.jsonCol->>'$.test.path' collate utf8mb4_unicode_ci from 'items'");
      expect(parser.sqlify(ast)).to.be.equal("SELECT `item`.`jsonCol` ->> '$.test.path' COLLATE UTF8MB4_UNICODE_CI FROM `items`")
    });


    it('should parse aliases w/o "AS" keyword', () => {
      const ast = parser.astify('SELECT a aa FROM  t');
      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'a' }, as: 'aa' }
      ]);
    });

    it('should parse aliases w/ "AS" keyword', () => {
      const ast = parser.astify('SELECT b.c as bc FROM t');
      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', table: 'b', column: 'c' },  as: 'bc' }
      ]);
    });

    describe('logic operator', () => {
      it('should support column concatenation operator', () => {
        const { tableList, columnList, ast } = parser.parse('SELECT "a" || "," || b as ab, t.cd && "ef" FROM t');
        expect(tableList).to.eql(['select::null::t']);
        expect(columnList).to.eql(['select::null::b', 'select::t::cd']);
        expect(ast.columns).to.eql([
          {
            expr: {
              type: 'binary_expr',
              operator: '||',
              left: {
                type: 'binary_expr',
                operator: '||',
                left: {
                  type: 'string',
                  value: 'a'
                },
                right: {
                  type: 'string',
                  value: ','
                }
              },
              right: {
                type: 'column_ref',
                table: null,
                column: 'b'
              }
            },
            as: 'ab'
          },
          {
            expr: {
              type: 'binary_expr',
              operator: '&&',
              left: {
                 type: 'column_ref',
                 table: 't',
                 column: 'cd'
              },
              right: {
                 type: 'string',
                 value: 'ef'
              }
           },
           "as": null
          }
        ]);
        expect(ast.options).to.be.null;
        expect(ast.distinct).to.be.null;
        expect(ast.from).to.be.eql([
            {
              db: null,
              table: 't',
              as: null
            }
          ]);
        expect(ast.where).to.be.null;
        expect(ast.groupby).to.be.null;
        expect(ast.orderby).to.be.null;
        expect(ast.limit).to.be.null;
      });
    })

    describe('functions', () => {
      it('should parse function expression', () => {
        const ast = parser.astify('SELECT fun(d) FROM t');

        expect(ast.columns).to.eql([
          {
            expr: {
              type: 'function',
              name: 'fun',
              args: {
                type  : 'expr_list',
                value : [ { type: 'column_ref', table: null, column: 'd' } ]
              }
            },
            as: null
          }
        ]);
      })

      it('should parse position function',() => {
        const ast = parser.astify("SELECT position(', ' in 'a, b')")

        expect(ast.columns).to.eql([
          {
            expr: {
              type: 'function',
              name: 'position',
              args: {
                type: 'expr_list',
                value: [
                  {
                    type: 'binary_expr',
                    operator: 'IN',
                    left: { type: 'string', value: ', ' },
                    right: { type: 'string', value: 'a, b' }
                  }
                ]
              }
            },
            as: null
          }
        ]);
        expect(parser.sqlify(ast)).to.be.equal("SELECT position(', ' IN 'a, b')")
      });

      [
        'CURRENT_DATE',
        'CURRENT_TIME',
        'CURRENT_TIMESTAMP',
        'CURRENT_USER',
        'SESSION_USER',
        'USER',
        'SYSTEM_USER'
      ].forEach((func) => {
        const columnAst = [
          {
            expr: {
              type: 'function',
              name: func,
              args: {
                type: 'expr_list',
                value: []
              }
            },
            as: null
          }
        ]

        it(`should parse scalar function ${func}() with parentheses`, () => {
          const ast = parser.astify(`SELECT ${func}() FROM t`);

          expect(ast.columns).to.eql(columnAst);
        });
      });
    });

    it('should parse multiple columns', () => {
      const ast = parser.astify('SELECT b.c as bc, 1+3 FROM t');

      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', table: 'b', column: 'c' },  as: 'bc' },
        {
          expr: {
            type: 'binary_expr',
            operator: '+',
            left: { type: 'number', value: 1 },
            right: { type: 'number', value: 3 }
          },
          as: null
        }
      ]);
    });
  });

  describe('from clause', () => {
    it('should parse single table', () => {
      const ast = parser.astify('SELECT * FROM t');
      expect(ast.from).to.eql([{ db: null, table: 't', as: null }]);
    });

    it('should parse tables from other databases', () => {
      const ast = parser.astify('SELECT * FROM u.t');
      expect(ast.from).to.eql([{ db: 'u', table: 't', as: null }]);
    });

    it('should parse tables from other databases (ANSI identifier)', () => {
      const ast = parser.astify('SELECT * FROM "u"."t"');
      expect(ast.from).to.eql([{ db: 'u', table: 't', as: null }]);
    });

    it('should support keyword as tablename', () => {
      const sql = 'select user0__.user_id as userId from user user0__'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal('SELECT `user0__`.`user_id` AS `userId` FROM `user` AS `user0__`')
    })


    it('should parse subselect', () => {
      const ast = parser.astify('SELECT * FROM (SELECT id FROM t1) someAlias');
      expect(ast.from).to.eql([{
        expr: {
          tableList: ['select::null::t1'],
          columnList: ['select::null::(.*)', 'select::null::id'],
          ast: {
              with: null,
              type: 'select',
              options: null,
              distinct: null,
              from: [{ db: null, table: 't1', as: null }],
              columns: [{ expr: { type: 'column_ref', table: null, column: 'id' }, as: null }],
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: null,
          },
          parentheses: true
        },
        as: 'someAlias'
      }]);
    });

    describe('joins', () => {
      it('should parse implicit joins', () => {
        const ast = parser.astify('SELECT * FROM t, a.b b, c.d as cd');

        expect(ast.from).to.eql([
          { db: null, table: 't', as: null },
          { db: 'a', table: 'b', as: 'b' },
          { db: 'c', table: 'd', as: 'cd' }
        ]);
      });

      ['left', 'right', 'full'].forEach((join) => {
        [' ', ' outer '].forEach((outer) => {
          it(`should parse ${join}${outer}joins`, () => {
            const ast = parser.astify(`SELECT * FROM t ${join} ${outer} join d on d.d = d.a`);

            expect(ast.from).to.eql([
              { db: null, table: 't', as: null },
              {
                db: null,
                table: 'd',
                as: null,
                join: `${join.toUpperCase()} JOIN`,
                on: {
                  type: 'binary_expr',
                  operator: '=',
                  left: { type: 'column_ref', table: 'd', column: 'd' },
                  right: { type: 'column_ref', table: 'd', column: 'a' }
                }
              }
            ]);
          });
        });
      });

      it('should parse joined subselect', () => {
        const ast = parser.astify('SELECT * FROM t1 JOIN (SELECT id, col1 FROM t2) someAlias ON t1.id = someAlias.id');

        expect(ast.from).to.eql([
          { db: null, table: 't1', as: null },
          {
            expr: {
              tableList: ["select::null::t2", "select::null::t1"],
              columnList: ["select::null::(.*)", "select::null::id",  "select::null::col1", "select::t1::id", "select::someAlias::id"],
              ast: {
                with: null,
                type: 'select',
                options: null,
                distinct: null,
                from: [{ db: null, table: 't2', as: null }],
                columns: [
                  { expr: { type: 'column_ref', table: null, 'column': 'id' }, as: null },
                  { expr: { type: 'column_ref', table: null, 'column': 'col1' }, as: null }
                ],
                where: null,
                groupby: null,
                having: null,
                orderby: null,
                limit: null,
              },
              parentheses: true
            },
            as: 'someAlias',
            join: 'INNER JOIN',
            on: {
              type: 'binary_expr',
              operator: '=',
              left: { type: 'column_ref', table: 't1', column: 'id' },
              right: { type: 'column_ref', table: 'someAlias', column: 'id' }
            }
          }
        ]);
      });

      it('should parse joins with USING (single column)', () => {
        const ast = parser.astify('SELECT * FROM t1 JOIN t2 USING (id)');

        expect(ast.from).to.eql([
          { db: null, table: 't1', as: null },
          { db: null, table: 't2', as: null, join: 'INNER JOIN', using: ['id'] }
        ]);
      });

      it('should parse joins with USING (multiple columns)', () => {
        const ast = parser.astify('SELECT * FROM t1 JOIN t2 USING (id1, id2)');

        expect(ast.from).to.eql([
          { db: null, table: 't1', as: null },
          { db: null, table: 't2', as: null, join: 'INNER JOIN', using: ['id1', 'id2'] }
        ]);
      });
    });

    it('should parse DUAL table', () => {
      const ast = parser.astify('SELECT * FROM DUAL');
      expect(ast.from).to.eql([{ type: 'dual' }]);
    });
  });

  describe('where clause', () => {
    it('should parse single condition', () => {
      const ast = parser.astify('SELECT * FROM t where t.a > 0');

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '>',
        left: { type: 'column_ref', table: 't', column: 'a' },
        right: { type: 'number', value: 0 }
      });
    });

    it('should parse parameters', () => {
      const ast = parser.astify('SELECT * FROM t where t.a > :my_param');

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '>',
        left: { type: 'column_ref', table: 't', column: 'a' },
        right: { type: 'param', value: 'my_param' }
      });
    });

    it('should parse multiple conditions', () => {
      const ast = parser.astify(`SELECT * FROM t where t.c between 1 and 't' AND Not true`);

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: 'AND',
        left: {
          type: 'binary_expr',
          operator: 'BETWEEN',
          left: { type: 'column_ref', table: 't', column: 'c' },
          right: {
            type : 'expr_list',
            value : [
              { type: 'number', value: 1 },
              { type: 'string', value: 't' }
            ]
          }
        },
        right: {
          type: 'unary_expr',
          operator: 'NOT',
          expr: { type: 'bool', value: true }
        }
      });
    });

    it('should parse single condition with boolean', () => {
      const ast = parser.astify('SELECT * FROM t where t.a = TRUE');

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '=',
        left: { type: 'column_ref', table: 't', column: 'a' },
        right: { type: 'bool', value: true }
      });
    });

    ['is', 'is not'].forEach((operator) => {
      it(`should parse ${operator} condition`, () => {
        const ast = parser.astify(`SELECT * FROM t WHERE col ${operator} NULL`);

        expect(ast.where).to.eql({
          type: 'binary_expr',
          operator: operator.toUpperCase(),
          left: { type: 'column_ref', table: null, column: 'col' },
          right: { type: 'null', value: null }
        });
      });
    });

    ['exists', 'not exists'].forEach((operator) => {
      it('should parse ' + operator.toUpperCase() + ' condition', () => {
        const ast = parser.astify(`SELECT * FROM t WHERE ${operator} (SELECT 1)`);
        expect(ast.where).to.eql({
          type: 'unary_expr',
          operator: operator.toUpperCase(),
          expr: {
            tableList: ["select::null::t"],
            columnList: ["select::null::(.*)"],
            ast: {
              with: null,
              type: 'select',
              options: null,
              distinct: null,
              columns: [{ expr: { type: 'number', value: 1 }, as: null }],
              from: null,
              where: null,
              groupby: null,
              having: null,
              orderby: null,
              limit: null,
            },
            parentheses: true
          }
        });
      });
    });

    it(`should parse + and - unary`, () => {
      const { tableList, columnList, ast } = parser.parse('select -1, -a, +b, +abc.e from abc')
      expect(tableList).to.eql(['select::null::abc'])
      expect(columnList).to.eql([
        'select::null::a',
        'select::null::b',
        'select::abc::e'
      ])
      expect(ast.columns).to.eql([
        {
          expr: { type: 'unary_expr', operator: '-', expr: { type: 'number', value: 1 } },
          as: null
        },
        {
          expr: { type: 'unary_expr', operator: '-', expr: { type: 'column_ref', table: null, column: 'a' } } ,
          as: null
        },
        {
          expr: { type: 'unary_expr', operator: '+', expr: { type: 'column_ref', table: null, column: 'b' } },
          as: null
        },
        {
          expr: { type: 'unary_expr', operator: '+', expr: { type: 'column_ref', table: 'abc', column: 'e' } },
          as: null
        }
      ])
      expect(ast.options).to.be.null;
      expect(ast.distinct).to.be.null;
      expect(ast.from).to.eql([
        {
          db: null,
          table: 'abc',
          as: null
        }
      ]);
      expect(ast.where).to.be.null;
      expect(ast.groupby).to.be.null;
      expect(ast.orderby).to.be.null;
      expect(ast.limit).to.be.null;
    })
  })

  describe('limit clause', () => {
    it('should be parsed w/o', () => {
      const ast = parser.astify('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e ASC limit 10');

      expect(ast.limit).eql({
        seperator: '',
        value: [
          { type: 'number', value: 10 }
        ],
      });

      expect(parser.sqlify(ast)).to.be.equal('SELECT DISTINCT `a` FROM `b` WHERE `c` = 0 GROUP BY `d` ORDER BY `e` ASC LIMIT 10')
    });

    it('should be parsed w/o', () => {
      const ast = parser.astify('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit 10,3');

      expect(ast.limit).eql({
        seperator: ',',
        value: [
          { type: 'number', value: 10 },
          { type: 'number', value: 3 }
        ],
      });

      expect(parser.sqlify(ast)).to.be.equal('SELECT DISTINCT `a` FROM `b` WHERE `c` = 0 GROUP BY `d` ORDER BY `e` ASC LIMIT 10, 3')
    });

    it('should be parsed w/ offset', () => {
      const ast = parser.astify('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit 10 offset 23');
      expect(ast.limit).eql({
        seperator: 'offset',
        value: [
          { type: 'number', value: 10 },
          { type: 'number', value: 23 }
        ],
      });
      expect(parser.sqlify(ast)).to.be.equal('SELECT DISTINCT `a` FROM `b` WHERE `c` = 0 GROUP BY `d` ORDER BY `e` ASC LIMIT 10 OFFSET 23')
    });

    it('should be parsed pg offset', () => {
      const opt = {
        database: 'postgresql'
      }
      const ast = parser.astify('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit all', opt);
      expect(ast.limit).eql({
        seperator: '',
        value: [
          { type: 'origin', value: 'all' },
        ],
      });
      expect(parser.sqlify(ast)).to.be.equal('SELECT DISTINCT `a` FROM `b` WHERE `c` = 0 GROUP BY `d` ORDER BY `e` ASC LIMIT ALL')

      const offsetAst = parser.astify('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit all offset 100', opt);
      expect(offsetAst.limit).eql({
        seperator: 'offset',
        value: [
          { type: 'origin', value: 'all' },
          { type: 'number', value: 100 }
        ],
      });
      expect(parser.sqlify(offsetAst)).to.be.equal('SELECT DISTINCT `a` FROM `b` WHERE `c` = 0 GROUP BY `d` ORDER BY `e` ASC LIMIT ALL OFFSET 100')
    });
  });

  describe('group by clause', () => {
    it('should parse single columns', () => {
      const ast = parser.astify('SELECT a FROM b WHERE c = 0 GROUP BY d');

      expect(ast.groupby).to.eql([{ type:'column_ref', table: null, column: 'd' }])
    });

    it('should parse multiple columns', () => {
      const ast = parser.astify('SELECT a FROM b WHERE c = 0 GROUP BY d, t.b, t.c');

      expect(ast.groupby).to.eql([
        { type: 'column_ref', table: null, column: 'd' },
        { type: 'column_ref', table: 't', column: 'b' },
        { type: 'column_ref', table: 't', column: 'c' }
      ]);
    });

    it('should parse column index', () => {
      const sql = 'SELECT name, gender FROM Test.student GROUP BY 1, 2'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal('SELECT `name`, `gender` FROM `Test`.`student` GROUP BY 1, 2')
    })

    it('should parser column expression', () => {
      const sql = 'SELECT name, gender, date_format(gmt_created,"yyyyMM"), count(*) FROM Test.student GROUP BY date_format(gmt_created,"yyyyMM")'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal('SELECT `name`, `gender`, date_format(`gmt_created`, \'yyyyMM\'), COUNT(*) FROM `Test`.`student` GROUP BY date_format(`gmt_created`, \'yyyyMM\')')
    })
  });

  describe('having clause', () => {
    it('should parse single conditions', () => {
      const ast = parser.astify('SELECT col1 FROM t GROUP BY col2 HAVING COUNT(*) > 1');

      expect(ast.having).to.eql({
        type: 'binary_expr',
        operator: '>',
        left: {
          type: 'aggr_func',
          name: 'COUNT',
          args: { expr: { type: 'star', value: '*' } }
        },
        right: { type: 'number', value: 1 }
      });
    });

    it('should parse multiple conditions', () => {
      const ast = parser.astify('SELECT col1 FROM t GROUP BY col2 HAVING SUM(col2) > 10 OR 1 = 1');

      expect(ast.having).to.eql({
        type: 'binary_expr',
        operator: 'OR',
        left: {
          type: 'binary_expr',
          operator: '>',
          left: {
            type: 'aggr_func',
            name: 'SUM',
            args: { expr: { type: 'column_ref', table: null, column: 'col2' } }
          },
          right: { type: 'number', value: 10 }
        },
        right: {
          type: 'binary_expr',
          operator: '=',
          left: { type: 'number', value: 1 },
          right: { type: 'number', value: 1 }
        }
      });
    });

    it('should parse subselects', () => {
      const ast = parser.astify('SELECT col1 FROM t GROUP BY col2 HAVING SUM(col2) > (SELECT 10)');

      expect(ast.having).to.eql({
        type: 'binary_expr',
        operator: '>',
        left: {
          type: 'aggr_func',
          name: 'SUM',
          args: { expr: { type: 'column_ref', table: null, column: 'col2' } }
        },
        right: {
          with: null,
          type: 'select',
          options: null,
          distinct: null,
          columns: [{ expr: { type: 'number', value: 10 }, as: null }],
          from: null,
          where: null,
          groupby: null,
          having: null,
          orderby: null,
          limit: null,
          parentheses: true
        }
      });
    });
  });

  describe('order by clause', () => {
    it('should parse single column', () => {
      const ast = parser.astify('SELECT a FROM b WHERE c = 0 order BY d');

      expect(ast.orderby).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'd' }, type: 'ASC' }
      ]);
    });

    it('should parse multiple columns', () => {
      const ast = parser.astify('SELECT a FROM b WHERE c = 0 order BY d, t.b dEsc, t.c');

      expect(ast.orderby).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'd' },  type: 'ASC' },
        { expr: { type: 'column_ref', table: 't', column: 'b' }, type: 'DESC' },
        { expr: { type: 'column_ref', table: 't', column: 'c' }, type: 'ASC' }
      ]);
    });

    it('should parse expressions', () => {
      const ast = parser.astify("SELECT a FROM b WHERE c = 0 order BY d, SuM(e)");

      expect(ast.orderby).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'd' },  type: 'ASC' },
        {
          expr: {
            type: 'aggr_func',
            name: 'SUM',
            args: { expr: { type: 'column_ref', table: null, column: 'e' } }
          },
          type: 'ASC'
        }
      ]);
    });
  });

  describe('MySQL SQL extensions', () => {
    it('should parse SQL_CALC_FOUND_ROWS', () => {
      const ast = parser.astify('SELECT SQL_CALC_FOUND_ROWS col FROM t');
      expect(ast.options).to.eql(['SQL_CALC_FOUND_ROWS']);
    });

    it('should parse SQL_CACHE/SQL_NO_CACHE', () => {
      const ast = parser.astify('SELECT SQL_CACHE col FROM t');
      expect(ast.options).to.eql(['SQL_CACHE']);

      const otherAst = parser.astify('SELECT SQL_NO_CACHE col FROM t');
      expect(otherAst.options).to.eql(['SQL_NO_CACHE']);
    });

    it('should parse SQL_SMALL_RESULT/SQL_BIG_RESULT', () => {
      const ast = parser.astify('SELECT SQL_SMALL_RESULT col FROM t');
      expect(ast.options).to.eql(['SQL_SMALL_RESULT']);

      const otherAst = parser.astify('SELECT SQL_BIG_RESULT col FROM t');
      expect(otherAst.options).to.eql(['SQL_BIG_RESULT']);
    });

    it('should parse SQL_BUFFER_RESULT', () => {
      const ast = parser.astify('SELECT SQL_BUFFER_RESULT col FROM t');
      expect(ast.options).to.contain('SQL_BUFFER_RESULT');
    });

    it('should parse multiple options per query', () => {
      const ast = parser.astify('SELECT SQL_CALC_FOUND_ROWS SQL_BIG_RESULT SQL_BUFFER_RESULT col FROM t');
      expect(ast.options).to.eql(['SQL_CALC_FOUND_ROWS', 'SQL_BIG_RESULT', 'SQL_BUFFER_RESULT']);
    });
  });

  describe('literals', () => {
    describe('strings', () => {
      it('should parse single quoted strings', () => {
        const ast = parser.astify(`SELECT 'string'`);
        expect(ast.columns).to.eql([{ expr: { type: 'string', value: 'string' }, as: null }]);
      });

      it('should parse keywords in single quotes as string', () => {
        const ast = parser.astify(`SELECT 'select'`);
        expect(ast.columns).to.eql([{ expr: { type: 'string', value: 'select' }, as: null }]);
      });
    });

    describe('datetime', () => {
      const literals = {
        time: '08:23:16',
        date: '1999-12-25',
        timestamp: '1999-12-25 08:23:16'
      };

      Object.keys(literals).forEach((type) => {
        const value = literals[type];

        [type, type.toUpperCase()].forEach((t) => {
          it(t, () => {
            const ast = parser.astify(`SELECT ${t} '${value}'`);
            expect(ast.columns).to.eql([{ expr: { type, value }, as: null }]);
          });
        });
      });
    });
  });

  describe('row value constructor', () => {
    it('should parse simple values', () => {
      const ast = parser.astify(`SELECT * FROM "user" WHERE (firstname, lastname) = ('John', 'Doe')`);

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '=',
        left: {
          type: 'expr_list',
          value: [
            { column: 'firstname', table: null, type: 'column_ref' },
            { column: 'lastname', table: null, type: 'column_ref' }
          ],
          parentheses: true
        },
        right: {
          type: 'expr_list',
          value: [
            { type: 'string', value: 'John' },
            { type: 'string', value: 'Doe' }
          ],
          parentheses: true
        }
      });
    });
  });

  describe('common table expressions', () => {
    it('should parse single CTE', () => {
      const ast = parser.astify(`WITH cte AS (SELECT 1)
                SELECT * FROM cte`);

      expect(ast).to.have.property('with')
        .and.to.be.an('array')
        .and.to.have.lengthOf(1);

      const cte = ast.with[0];
      expect(cte).to.have.property('name', 'cte');
      expect(cte)
        .to.have.property('stmt')
        .and.to.be.an('object');
    });

    it('should parse multiple CTEs', () => {
      const ast = parser.astify(`WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2)
                SELECT * FROM cte1 UNION SELECT * FROM cte2`);

      expect(ast)
        .to.have.property('with')
        .and.to.have.lengthOf(2);

      const [cte1, cte2] = ast.with;
      expect(cte1).to.have.property('name', 'cte1');
      expect(cte2).to.have.property('name', 'cte2');
    });

    it('should parse CTE with column', () => {
      const ast = parser.astify(`WITH cte (col1) AS (SELECT 1)
                SELECT * FROM cte`);

      const cte = ast.with[0];
      expect(cte)
        .to.have.property('columns')
        .and.to.eql(['col1']);
    });

    it('should parse CTE with multiple columns', () => {
      const ast = parser.astify(`WITH cte (col1, col2) AS (SELECT 1, 2)
                SELECT * FROM cte`);

      const cte = ast.with[0];
      expect(cte.columns).to.eql(['col1', 'col2']);
    });

    it('should parse recursive CTE', () => {
      const sql = `WITH RECURSIVE cte(n) AS
            (
              SELECT 1
              UNION
              SELECT n + 1 FROM cte WHERE n < 5
            )
            SELECT * FROM cte`;
      const ast = parser.astify(sql);

      const cte = ast.with[0];
      expect(cte).to.have.property('recursive', true);
    });
  });

  describe('multiple statements', () => {
    it('should parser multiple statements', () => {
      const sql = 'SELECT * FROM a;SELECT id from b'
      const ast = parser.astify(sql)
      const [sqla, sqlb] = sql.split(';')
      const astFirstSQL = parser.astify(sqla.trim())
      const astSecondSQL = parser.astify(sqlb.trim())
      expect(ast).to.have.lengthOf(2)
      expect(ast[0]).to.eql(astFirstSQL)
      expect(ast[1]).to.eql(astSecondSQL)
    })
  })

  describe('white list check', () => {
    describe('table mode', () => {
      it('should failed without whitelist', () => {
        const sql = 'SELECT * FROM a'
        const result = parser.whiteListCheck(sql)
        expect(result).to.be.eql(undefined)
        expect(parser.whiteListCheck(sql, [])).to.be.eql(undefined)
      })
      it('should pass the same check', () => {
        const sql = 'SELECT * FROM a'
        const whiteList = ['select::null::a']
        const result = parser.whiteListCheck(sql, whiteList)
        expect(result).to.be.eql(undefined)
      })
      it('should pass the regex check', () => {
        const sql = 'SELECT * FROM a'
        const whiteList = ['select::(.*)::a']
        const result = parser.whiteListCheck(sql, whiteList)
        expect(result).to.be.eql(undefined)
        expect(parser.whiteListCheck(sql, whiteList, {})).to.be.eql(undefined)
      })
      it('should pass the complex sql check', () => {
        const sql = 'SELECT * FROM a;SELECT * FROM x.b'
        const whiteList = ['select::(.*)::(a|b)']
        const result = parser.whiteListCheck(sql, whiteList)
        expect(result).to.be.eql(undefined)
      })
      it('should pass the complex sql and regex check', () => {
        const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
        const whiteList = ['(select|update)::(.*)::(a|b)']
        const result = parser.whiteListCheck(sql, whiteList)
        expect(result).to.be.eql(undefined)
      })
      it('should fail for simple check', () => {
        const sql = 'SELECT * FROM b'
        const whiteList = ['select::(.*)::a']
        const fun = parser.whiteListCheck.bind(parser, sql, whiteList)
        expect(fun).to.throw(`authority = 'select::null::b' is required in table whiteList to execute SQL = '${sql}'`)
      })
      it('should fail for as column reserved word check', () => {
        const sql = 'SELECT id as type FROM b'
        const fun = parser.astify.bind(parser, sql)
        expect(fun).to.throw('Error: "type" is a reserved word, can not as alias clause')
      })
      it('should fail for as table reserved word check', () => {
        const sql = 'SELECT id as bc FROM b as table'
        const fun = parser.astify.bind(parser, sql)
        expect(fun).to.throw('Error: "table" is a reserved word, can not as alias clause')
      })
      it('should fail the complex sql and regex check', () => {
        const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
        const whiteList = ['select::(.*)::(a|b)']
        const fun = parser.whiteListCheck.bind(parser, sql, whiteList)
        expect(fun).to.throw(`authority = 'update::null::a' is required in table whiteList to execute SQL = '${sql}'`)
      })
    })
    describe('column mode', () => {
      const mode = { type: 'column' }
      it('should pass the same check', () => {
        const sql = 'SELECT * FROM a'
        const whiteList = ['select::null::(.*)']
        const result = parser.whiteListCheck(sql, whiteList, mode)
        expect(result).to.be.eql(undefined)
      })
      it('should pass the regex check', () => {
        const sql = 'SELECT * FROM a'
        const whiteList = ['select::(.*)::(.*)']
        const result = parser.whiteListCheck(sql, whiteList, mode)
        expect(result).to.be.eql(undefined)
      })
      it('should pass the regex check with table prefix', () => {
        const sql = 'SELECT a.id, a.name FROM a'
        const whiteList = ['select::a::(id|name)']
        const result = parser.whiteListCheck(sql, whiteList, mode)
        expect(result).to.be.eql(undefined)
      })
      it('should pass the complex sql check', () => {
        const sql = 'SELECT id FROM a;SELECT name FROM x.b'
        const whiteList = ['select::(.*)::(id|name)']
        const result = parser.whiteListCheck(sql, whiteList, mode)
        expect(result).to.be.eql(undefined)
      })
      it('should pass the complex sql and regex check', () => {
        const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
        const whiteList = ['(select|update)::(.*)::(id|name)']
        const result = parser.whiteListCheck(sql, whiteList, mode)
        expect(result).to.be.eql(undefined)
      })
      it('should fail for simple check', () => {
        const sql = 'SELECT b.id, b.name FROM b'
        const whiteList = ['select::b::id']
        const fun = parser.whiteListCheck.bind(parser, sql, whiteList, mode)
        expect(fun).to.throw(`authority = 'select::b::name' is required in ${mode.type} whiteList to execute SQL = '${sql}'`)
      })
      it('should fail the complex sql and regex check', () => {
        const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
        const whiteList = ['select::(.*)::(id|name)']
        const fun = parser.whiteListCheck.bind(parser, sql, whiteList, mode)
        expect(fun).to.throw(`authority = 'update::null::id' is required in ${mode.type} whiteList to execute SQL = '${sql}'`)
      })
    })
  })
  describe('select over', () => {
    it('should support select over', () => {
      const sql = 'SELECT id, name,gender, COUNT(gender) OVER (PARTITION BY gender) AS Total_students FROM student'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT `id`, `name`, `gender`, COUNT(`gender`) OVER (PARTITION BY `gender`) AS `Total_students` FROM `student`")
    })

    it('should support select over function', () => {
      const sql = 'SELECT ROW_NUMBER() OVER (PARTITION BY gender) AS Total_students FROM student'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT ROW_NUMBER() OVER (PARTITION BY `gender`) AS `Total_students` FROM `student`")
    })

    it('should support select over function with order by', () => {
      const sql = 'SELECT ROW_NUMBER() OVER (PARTITION BY gender order by gender asc) AS Total_students FROM student'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT ROW_NUMBER() OVER (PARTITION BY `gender` ORDER BY `gender` ASC) AS `Total_students` FROM `student`")
    })

    it('should support select over function with order by multiple columns', () => {
      const sql = 'SELECT ROW_NUMBER() OVER (PARTITION BY gender, id order by gender asc, id desc) AS Total_students FROM student'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT ROW_NUMBER() OVER (PARTITION BY `gender`, `id` ORDER BY `gender` ASC, `id` DESC) AS `Total_students` FROM `student`")
    })
  })

  describe('pg json column', () => {
    it('should support pg json column query', () => {
      const sql = `SELECT id,
      config,
      busy,
      'templateId',
      active,
      domain,
      config ->> 'email'
      FROM instances WHERE config ->> 'email' = 'email@provider.com'
      `
      const ast = parser.astify(sql, { database: 'postgresql' })
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT `id`, `config`, `busy`, 'templateId', `active`, `domain`, `config` ->> 'email' FROM `instances` WHERE `config` ->> 'email' = 'email@provider.com'")
    })

    it('should support pg json column query #>', () => {
      const sql = `SELECT id,
      config,
      busy,
      'templateId',
      active #> '{a,b}',
      domain ->> 2,
      config ->> 'email'
      FROM instances WHERE config ->> 'email' = 'email@provider.com'
      `
      const ast = parser.astify(sql, { database: 'postgresql' })
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT `id`, `config`, `busy`, 'templateId', `active` #> '{a,b}', `domain` ->> 2, `config` ->> 'email' FROM `instances` WHERE `config` ->> 'email' = 'email@provider.com'")
    })

    it('should support pg json column query #>>', () => {
      const sql = `SELECT id,
      config,
      busy,
      'templateId',
      active #>> '{a,b}',
      domain ->> 2,
      config ->> 'email'
      FROM instances WHERE config ->> 'email' = 'email@provider.com'
      `
      const ast = parser.astify(sql, { database: 'postgresql' })
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT `id`, `config`, `busy`, 'templateId', `active` #>> '{a,b}', `domain` ->> 2, `config` ->> 'email' FROM `instances` WHERE `config` ->> 'email' = 'email@provider.com'")
    })

    it('should support pg jsonb column query', () => {
      const sql = `SELECT id,
      config,
      busy,
      'templateId',
      active::jsonb @> '{"b":2}'::jsonb,
      domain::jsonb <@ '{"a":1, "b":2}'::jsonb,
      config::jsonb - 'a'
      FROM instances WHERE config ->> 'email' = 'email@provider.com'
      `
      const ast = parser.astify(sql, { database: 'postgresql' })
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal("SELECT `id`, `config`, `busy`, 'templateId', `active`::JSONB @> '{\"b\":2}'::JSONB, `domain`::JSONB <@ '{\"a\":1, \"b\":2}'::JSONB, `config`::JSONB - 'a' FROM `instances` WHERE `config` ->> 'email' = 'email@provider.com'")
    })
  })

  describe('transactsql', () => {
    const opt = {
      database: 'transactsql'
    }
    it('should support select top n', () => {
      const sql = 'select top 3 * from tableA'
      const ast = parser.astify(sql, opt)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal('SELECT TOP 3 * FROM `tableA`')
    })

    it('should support select top n percent', () => {
      const sql = 'select top 3 percent * from tableA'
      const ast = parser.astify(sql, opt)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.equal('SELECT TOP 3 PERCENT * FROM `tableA`')
    })
  })
  describe('unknow type check', () => {
    it('should throw error', () => {
      const sql = 'SELECT * FROM a'
      const whiteList = ['select::null::(.*)']
      expect(parser.whiteListCheck.bind(parser, sql, whiteList, { type: 'unknow' })).to.throw('unknow is not valid check mode')
    })
  })
});
