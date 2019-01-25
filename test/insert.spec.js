'use strict';

const { expect } = require('chai');
const { Parser } = require('../');

describe('insert', () => {
    const parser = new Parser();

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('INSERT INTO t (col1, col2) VALUES (1, 2)');
      expect(tableList).to.eql(['insert::null::t']);
      expect(columnList).to.eql(['insert::t::col1', 'insert::t::col2']);
      expect(ast.type).to.be.eql('insert');
      expect(ast.db).to.be.null;
      expect(ast.table).to.be.eql('t');
      expect(ast.columns).to.be.eql(["col1", "col2"]);
      expect(ast.values).to.eql([{
        type: "expr_list",
        value: [{
          type: "number",
          value: 1
        },
        {
          type: "number",
          value: 2
        }]
      }]);
    });

    it('should parse insert and select', () => {
      const sql = 'INSERT INTO t1 values("1223", "name") ; SELECT * FROM t'
      const [sqla, sqlb] = sql.split(';')
      const astFirstSQL = parser.astify(sqla.trim())
      const astSecondSQL = parser.astify(sqlb.trim())
      const { tableList, columnList, ast } = parser.parse(sql)
      expect(tableList).to.eql(['insert::null::t1', 'select::null::t'])
      expect(columnList).to.eql(['insert::t1::(.*)', 'select::null::(.*)'])
      expect(ast).to.have.lengthOf(2)
      expect(ast[0]).to.eql(astFirstSQL)
      expect(ast[1]).to.eql(astSecondSQL)
    })

    it('failed with INSERT SELECT INFO', () => {
      const sql = 'INSERT INTO t1 SELECT * FROM t'
      const fun = parser.parse.bind(parser, sql)
      expect(fun).to.throw('"(", "--", ".", "/*", "VALUES", or [ \\t\\n\\r] but "S" found')
    })
});