const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('insert', () => {
    const parser = new Parser();

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('INSERT INTO t (col1, col2) VALUES (1, 2)');
      expect(tableList).to.eql(['insert::null::t']);
      expect(columnList).to.eql(['insert::t::col1', 'insert::t::col2']);
      expect(ast.type).to.be.eql('insert');
      expect(ast.table).to.be.eql([ { db: null, table: 't', as: null } ]);
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

    it('should support parse insert with multiple rows', () => {
      const sql = 'INSERT INTO t1 values("1223", "name"), ("1224", "name2")'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `t1` VALUES ('1223','name'),('1224','name2')")
    })

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

    it('should parser no columns', () => {
      const ast = {
        "type": "insert",
        "table": [
          {
            "db": null,
            "table": "t",
            "as": null
          }
        ],
        "values": [
          {
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
        ]
      }
      expect(parser.sqlify(ast)).to.be.eql('INSERT INTO `t` VALUES (1,2)')
      ast.columns = ['col1', 'col2']
      expect(parser.sqlify(ast)).to.be.eql('INSERT INTO `t` (`col1`, `col2`) VALUES (1,2)')
    })

    it('should support big number', () => {
      const bigNumberList = ['3511161156327326047123', '23.3e+12323243434']
      for (const bigNumber of bigNumberList) {
        const sql = `INSERT INTO t1(id) VALUES(${bigNumber})`
        const ast = parser.astify(sql)
        expect(ast.values[0].value).to.be.eql([{ type: 'bigint', value: bigNumber }])
        expect(parser.sqlify(ast)).to.equal('INSERT INTO `t1` (`id`) VALUES (' + bigNumber + ')')
      }
    })

    it('failed with INSERT SELECT INFO', () => {
      const sql = 'INSERT INTO t1 SELECT * FROM t'
      const fun = parser.parse.bind(parser, sql)
      expect(fun).to.throw('Expected [A-Za-z0-9_] but " " found')
    })
});