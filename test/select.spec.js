'use strict';

const { expect } = require('chai');
const { Parser } = require('../');

describe('select', () => {
  const parser = new Parser();

  it('should be null if empty', () => {
    const ast = parser.sqlToAst('SELECT a');
    expect(ast.options).to.be.null;
    expect(ast.distinct).to.be.null;
    expect(ast.from).to.be.null;
    expect(ast.where).to.be.null;
    expect(ast.groupby).to.be.null;
    expect(ast.orderby).to.be.null;
    expect(ast.limit).to.be.null;
  });

  it('should support select *from', () => {
    const ast = parser.sqlToAst('SELECT *from abc');
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

  it('should have appropriate types', () => {
    const ast = parser.sqlToAst('SELECT SQL_NO_CACHE DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit 3');

    expect(ast.options).to.be.an('array');
    expect(ast.distinct).to.equal('DISTINCT');
    expect(ast.from).to.be.an('array');
    expect(ast.where).to.be.an('object');
    expect(ast.groupby).to.be.an('array');
    expect(ast.orderby).to.be.an('array');
    expect(ast.limit).to.be.an('array');
  });

  describe('column clause', () => {
    it('should parse "*" shorthand', () => {
      const ast = parser.sqlToAst('SELECT * FROM t');
      expect(ast.columns).to.equal('*');
    });

    it('should parse "table.*" column expressions', () => {
      const ast = parser.sqlToAst('SELECT t.* FROM t');

      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', 'table': 't', column: '*' }, as: null }
      ]);
    });

    it('should parse aliases w/o "AS" keyword', () => {
      const ast = parser.sqlToAst('SELECT a aa FROM  t');

      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'a' }, as: 'aa' }
      ]);
    });

    it('should parse aliases w/ "AS" keyword', () => {
      const ast = parser.sqlToAst('SELECT b.c as bc FROM t');

      expect(ast.columns).to.eql([
        { expr: { type: 'column_ref', table: 'b', column: 'c' },  as: 'bc' }
      ]);
    });

    describe('functions', () => {
      it('should parse function expression', () => {
        const ast = parser.sqlToAst('SELECT fun(d) FROM t');

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
        it(`should parse scalar function ${func}`, () => {
          const ast = parser.sqlToAst(`SELECT ${func} FROM t`);

          expect(ast.columns).to.eql([
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
          ]);
        });
      });
    });

    it('should parse multiple columns', () => {
      const ast = parser.sqlToAst('SELECT b.c as bc, 1+3 FROM t');

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
      const ast = parser.sqlToAst('SELECT * FROM t');
      expect(ast.from).to.eql([{ db: null, table: 't', as: null }]);
    });

    it('should parse tables from other databases', () => {
      const ast = parser.sqlToAst('SELECT * FROM u.t');
      expect(ast.from).to.eql([{ db: 'u', table: 't', as: null }]);
    });

    it('should parse tables from other databases (ANSI identifier)', () => {
      const ast = parser.sqlToAst('SELECT * FROM "u"."t"');
      expect(ast.from).to.eql([{ db: 'u', table: 't', as: null }]);
    });


    it('should parse subselect', () => {
      const ast = parser.sqlToAst('SELECT * FROM (SELECT id FROM t1) someAlias');
      expect(ast.from).to.eql([{
        expr: {
          tableList: ["select::null::t1"],
          columnList: [],
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
        const ast = parser.sqlToAst('SELECT * FROM t, a.b b, c.d as cd');

        expect(ast.from).to.eql([
          { db: null, table: 't', as: null },
          { db: 'a', table: 'b', as: 'b' },
          { db: 'c', table: 'd', as: 'cd' }
        ]);
      });

      ['left', 'right', 'full'].forEach((join) => {
        [' ', ' outer '].forEach((outer) => {
          it(`should parse ${join}${outer}joins`, () => {
            const ast = parser.sqlToAst(`SELECT * FROM t ${join} ${outer} join d on d.d = d.a`);

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
        const ast = parser.sqlToAst('SELECT * FROM t1 JOIN (SELECT id, col1 FROM t2) someAlias ON t1.id = someAlias.id');

        expect(ast.from).to.eql([
          { db: null, table: 't1', as: null },
          {
            expr: {
              tableList: ["select::null::t2", "select::null::t1"],
              columnList: [],
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
        const ast = parser.sqlToAst('SELECT * FROM t1 JOIN t2 USING (id)');

        expect(ast.from).to.eql([
          { db: null, table: 't1', as: null },
          { db: null, table: 't2', as: null, join: 'INNER JOIN', using: ['id'] }
        ]);
      });

      it('should parse joins with USING (multiple columns)', () => {
        const ast = parser.sqlToAst('SELECT * FROM t1 JOIN t2 USING (id1, id2)');

        expect(ast.from).to.eql([
          { db: null, table: 't1', as: null },
          { db: null, table: 't2', as: null, join: 'INNER JOIN', using: ['id1', 'id2'] }
        ]);
      });
    });

    it('should parse DUAL table', () => {
      const ast = parser.sqlToAst('SELECT * FROM DUAL');
      expect(ast.from).to.eql([{ type: 'dual' }]);
    });
  });

  describe('where clause', () => {
    it('should parse single condition', () => {
      const ast = parser.sqlToAst('SELECT * FROM t where t.a > 0');

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '>',
        left: { type: 'column_ref', table: 't', column: 'a' },
        right: { type: 'number', value: 0 }
      });
    });

    it('should parse parameters', () => {
      const ast = parser.sqlToAst('SELECT * FROM t where t.a > :my_param');

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '>',
        left: { type: 'column_ref', table: 't', column: 'a' },
        right: { type: 'param', value: 'my_param' }
      });
    });

    it('should parse multiple conditions', () => {
      const ast = parser.sqlToAst(`SELECT * FROM t where t.c between 1 and 't' AND Not true`);

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
      const ast = parser.sqlToAst('SELECT * FROM t where t.a = TRUE');

      expect(ast.where).to.eql({
        type: 'binary_expr',
        operator: '=',
        left: { type: 'column_ref', table: 't', column: 'a' },
        right: { type: 'bool', value: true }
      });
    });

    ['is', 'is not'].forEach((operator) => {
      it(`should parse ${operator} condition`, () => {
        const ast = parser.sqlToAst(`SELECT * FROM t WHERE col ${operator} NULL`);

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
        const ast = parser.sqlToAst(`SELECT * FROM t WHERE ${operator} (SELECT 1)`);
        expect(ast.where).to.eql({
          type: 'unary_expr',
          operator: operator.toUpperCase(),
          expr: {
            tableList: ["select::null::t"],
            columnList: [],
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
  });

  describe('limit clause', () => {
    it('should be parsed w/o offset', () => {
      const ast = parser.sqlToAst('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit 3');

      expect(ast.limit).eql([
        { type: 'number', value: 0 },
        { type: 'number', value: 3 }
      ]);
    });

    it('should be parsed w/ offset', () => {
      const ast = parser.sqlToAst('SELECT DISTINCT a FROM b WHERE c = 0 GROUP BY d ORDER BY e limit 0, 3');

      expect(ast.limit).to.eql([
        {type: 'number', value: 0 },
        {type: 'number', value: 3 }
      ]);
    });
  });

  describe('group by clause', () => {
    it('should parse single columns', () => {
      const ast = parser.sqlToAst('SELECT a FROM b WHERE c = 0 GROUP BY d');

      expect(ast.groupby).to.eql([{ type:'column_ref', table: null, column: 'd' }])
    });

    it('should parse multiple columns', () => {
      const ast = parser.sqlToAst('SELECT a FROM b WHERE c = 0 GROUP BY d, t.b, t.c');

      expect(ast.groupby).to.eql([
        { type: 'column_ref', table: null, column: 'd' },
        { type: 'column_ref', table: 't', column: 'b' },
        { type: 'column_ref', table: 't', column: 'c' }
      ]);
    });
  });

  describe('having clause', () => {
    it('should parse single conditions', () => {
      const ast = parser.sqlToAst('SELECT col1 FROM t GROUP BY col2 HAVING COUNT(*) > 1');

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
      const ast = parser.sqlToAst('SELECT col1 FROM t GROUP BY col2 HAVING SUM(col2) > 10 OR 1 = 1');

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
      const ast = parser.sqlToAst('SELECT col1 FROM t GROUP BY col2 HAVING SUM(col2) > (SELECT 10)');

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
      const ast = parser.sqlToAst('SELECT a FROM b WHERE c = 0 order BY d');

      expect(ast.orderby).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'd' }, type: 'ASC' }
      ]);
    });

    it('should parse multiple columns', () => {
      const ast = parser.sqlToAst('SELECT a FROM b WHERE c = 0 order BY d, t.b dEsc, t.c');

      expect(ast.orderby).to.eql([
        { expr: { type: 'column_ref', table: null, column: 'd' },  type: 'ASC' },
        { expr: { type: 'column_ref', table: 't', column: 'b' }, type: 'DESC' },
        { expr: { type: 'column_ref', table: 't', column: 'c' }, type: 'ASC' }
      ]);
    });

    it('should parse expressions', () => {
      const ast = parser.sqlToAst("SELECT a FROM b WHERE c = 0 order BY d, SuM(e)");

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
      const ast = parser.sqlToAst('SELECT SQL_CALC_FOUND_ROWS col FROM t');
      expect(ast.options).to.eql(['SQL_CALC_FOUND_ROWS']);
    });

    it('should parse SQL_CACHE/SQL_NO_CACHE', () => {
      const ast = parser.sqlToAst('SELECT SQL_CACHE col FROM t');
      expect(ast.options).to.eql(['SQL_CACHE']);

      const otherAst = parser.sqlToAst('SELECT SQL_NO_CACHE col FROM t');
      expect(otherAst.options).to.eql(['SQL_NO_CACHE']);
    });

    it('should parse SQL_SMALL_RESULT/SQL_BIG_RESULT', () => {
      const ast = parser.sqlToAst('SELECT SQL_SMALL_RESULT col FROM t');
      expect(ast.options).to.eql(['SQL_SMALL_RESULT']);

      const otherAst = parser.sqlToAst('SELECT SQL_BIG_RESULT col FROM t');
      expect(otherAst.options).to.eql(['SQL_BIG_RESULT']);
    });

    it('should parse SQL_BUFFER_RESULT', () => {
      const ast = parser.sqlToAst('SELECT SQL_BUFFER_RESULT col FROM t');
      expect(ast.options).to.contain('SQL_BUFFER_RESULT');
    });

    it('should parse multiple options per query', () => {
      const ast = parser.sqlToAst('SELECT SQL_CALC_FOUND_ROWS SQL_BIG_RESULT SQL_BUFFER_RESULT col FROM t');
      expect(ast.options).to.eql(['SQL_CALC_FOUND_ROWS', 'SQL_BIG_RESULT', 'SQL_BUFFER_RESULT']);
    });
  });

  describe('literals', () => {
    describe('strings', () => {
      it('should parse single quoted strings', () => {
        const ast = parser.sqlToAst(`SELECT 'string'`);
        expect(ast.columns).to.eql([{ expr: { type: 'string', value: 'string' }, as: null }]);
      });

      it('should parse keywords in single quotes as string', () => {
        const ast = parser.sqlToAst(`SELECT 'select'`);
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
            const ast = parser.sqlToAst(`SELECT ${t} '${value}'`);
            expect(ast.columns).to.eql([{ expr: { type, value }, as: null }]);
          });
        });
      });
    });
  });

  describe('row value constructor', () => {
    it('should parse simple values', () => {
      const ast = parser.sqlToAst(`SELECT * FROM "user" WHERE (firstname, lastname) = ('John', 'Doe')`);

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
      const ast = parser.sqlToAst(`WITH cte AS (SELECT 1)
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
      const ast = parser.sqlToAst(`WITH cte1 AS (SELECT 1), cte2 AS (SELECT 2)
                SELECT * FROM cte1 UNION SELECT * FROM cte2`);

      expect(ast)
        .to.have.property('with')
        .and.to.have.lengthOf(2);

      const [cte1, cte2] = ast.with;
      expect(cte1).to.have.property('name', 'cte1');
      expect(cte2).to.have.property('name', 'cte2');
    });

    it('should parse CTE with column', () => {
      const ast = parser.sqlToAst(`WITH cte (col1) AS (SELECT 1)
                SELECT * FROM cte`);

      const cte = ast.with[0];
      expect(cte)
        .to.have.property('columns')
        .and.to.eql(['col1']);
    });

    it('should parse CTE with multiple columns', () => {
      const ast = parser.sqlToAst(`WITH cte (col1, col2) AS (SELECT 1, 2)
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
      const ast = parser.sqlToAst(sql);

      const cte = ast.with[0];
      expect(cte).to.have.property('recursive', true);
    });
  });

  describe('multiple statements', () => {
    it('should parser multiple statements', () => {
      const sql = 'SELECT * FROM a;SELECT id from b'
      const ast = parser.sqlToAst(sql)
      const [sqla, sqlb] = sql.split(';')
      const astFirstSQL = parser.sqlToAst(sqla.trim())
      const astSecondSQL = parser.sqlToAst(sqlb.trim())
      expect(ast).to.have.lengthOf(2)
      expect(ast[0]).to.eql(astFirstSQL)
      expect(ast[1]).to.eql(astSecondSQL)
    })
  })

  describe('white list check', () => {
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
      expect(fun).to.throw(`authority = 'select::null::b' is required in whiteList to execute SQL = '${sql}'`)
    })
    it('should fail the complex sql and regex check', () => {
      const sql = 'UPDATE a SET id = 1 WHERE name IN (SELECT name FROM b)'
      const whiteList = ['select::(.*)::(a|b)']
      const fun = parser.whiteListCheck.bind(parser, sql, whiteList)
      expect(fun).to.throw(`authority = 'update::null::a' is required in whiteList to execute SQL = '${sql}'`)
    })
  })
});
