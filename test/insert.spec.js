const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('insert', () => {
    const parser = new Parser();

    function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
    }

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
      expect(backSQL).to.be.equal("INSERT INTO `t1` VALUES ('1223','name'), ('1224','name2')")
    })

    it("should throw error if column count doesn't match value count", () => {
      const sql = 'INSERT INTO t1 (col1, col2, col3) values("1223", "name"), ("1224", "name2")'
      const fun = parser.astify.bind(parser, sql)
      expect(fun).to.throw("column count doesn't match value count at row 1")
    })

    it('should support parse insert from select', () => {
      const sql = 'INSERT INTO t1(col_a, col_b) select col_a, col_b from t2'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `t1` (`col_a`, `col_b`) SELECT `col_a`, `col_b` FROM `t2`")
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

    it('should support parse hive sql insert from select', () => {
      const sql = 'INSERT overwrite table account select col_a, col_b from t2'
      const ast = parser.astify(sql, { database: 'hive' })
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT OVERWRITE TABLE `account` SELECT `col_a`, `col_b` FROM `t2`")
    })

    it('should support parse insert partition', () => {
      const sql = 'INSERT into account partition(date, id) select col_a, col_b from t2'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `account` PARTITION(`date`, `id`) SELECT `col_a`, `col_b` FROM `t2`")
    })

    it('should support parse insert partition', () => {
      const sql = 'INSERT into account partition(date, id) (id, name) values(123, "test"), (124, "test2")'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `account` PARTITION(`date`, `id`) (`id`, `name`) VALUES (123,'test'), (124,'test2')")
    })

    it('should support parse insert on duplicate key update', () => {
      const sql = 'INSERT into account partition(date, id) (id, name) values(123, "test"), (124, "test2") on duplicate key update id = 123, name = "test"'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `account` PARTITION(`date`, `id`) (`id`, `name`) VALUES (123,'test'), (124,'test2') ON DUPLICATE KEY UPDATE `id` = 123, `name` = 'test'")
      expect(parser.sqlify(parser.astify(`INSERT INTO user (id, name, age) VALUES (1, 'user1', 50) ON DUPLICATE KEY UPDATE name = VALUES(name), age = VALUES(age)`))).to.be.equal("INSERT INTO `user` (`id`, `name`, `age`) VALUES (1,'user1',50) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `age` = VALUES(`age`)")
    })

    it('should support parse insert set', () => {
      const sql = 'INSERT into account partition(date, id) set id = 234, name="my-name" on duplicate key update id = 123, name = "test"'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `account` PARTITION(`date`, `id`) SET `id` = 234, `name` = 'my-name' ON DUPLICATE KEY UPDATE `id` = 123, `name` = 'test'")
    })

    it('should support parse insert partition expr', () => {
      const sql = 'INSERT into account partition(date = 20191218, id = 2) (id, name) values(123, "test"), (124, "test2")'
      const ast = parser.astify(sql)
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT INTO `account` PARTITION(`date` = 20191218, `id` = 2) (`id`, `name`) VALUES (123,'test'), (124,'test2')")
    })

    it('should support parse insert partition for hive', () => {
      const sql = 'INSERT overwrite table account partition(date, id) select * from tmp'
      const ast = parser.astify(sql, { database: 'hive' })
      const backSQL = parser.sqlify(ast)
      expect(backSQL).to.be.equal("INSERT OVERWRITE TABLE `account` PARTITION(`date`, `id`) SELECT * FROM `tmp`")
    })

    it('should support parse pg insert returning', () => {
      const sql = 'INSERT into account (date, id) values("2019-12-23", 123) returning id'
      const opt = { database: 'postgresql' }
      const ast = parser.astify(sql, opt)
      const backSQL = parser.sqlify(ast, opt)
      expect(backSQL).to.be.equal('INSERT INTO "account" ("date", "id") VALUES ("2019-12-23",123) RETURNING "id"')
      expect(parser.sqlify(parser.astify(`INSERT INTO account (date, id) VALUES ("2019-12-23",123) RETURNING *`, opt), opt)).to.be.equal('INSERT INTO "account" ("date", "id") VALUES ("2019-12-23",123) RETURNING *')
    })

    it('should support insert hex value', () => {
      expect(parser.sqlify(parser.astify(`INSERT INTO \`t\`
      (\`a\`) VALUES
      (X'ax')`))).to.be.equal("INSERT INTO `t` (`a`) VALUES (X'ax')")
    })

    it('should support replace into', () => {
      const sql = "REPLACE INTO test (test_column1, test_column2) VALUES ('testvalue1', 'testvalue2')"
      expect(getParsedSql(sql)).to.be.equal("REPLACE INTO `test` (`test_column1`, `test_column2`) VALUES ('testvalue1','testvalue2')")
    })

    describe('support ascii pnCtrl single-char', () => {
      it('should support ascii pnCtrl', () => {
        // 0～31及127(共33个)是控制字符或通信专用字符 \0-\x1F和\x7f in ascii, ETX ascii code is 0x03
        const sql = `INSERT INTO posts (content) VALUES('\\'s ')`
        const ast = parser.astify(sql)
        const backSQL = parser.sqlify(ast)
        expect(backSQL).to.be.equal("INSERT INTO `posts` (`content`) VALUES ('\\\'s ')")
      })

    })
});
