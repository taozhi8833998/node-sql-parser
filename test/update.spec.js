const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('update', () => {
    const parser = new Parser();

    function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('UPDATE a set id = 1');
      expect(tableList).to.eql(["update::null::a"]);
      expect(columnList).to.eql(["update::null::id"]);
      expect(ast.type).to.be.eql('update');
      expect(ast.table).to.be.eql([{
        "db": null,
        "table": "a",
        "as": null
     }]);
      expect(ast.set).to.eql([{
        column: 'id',
        table: null,
        value: {
          type: 'number',
          value: 1
        }
      }]);
      expect(ast.where).to.be.null;
    });

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('UPDATE a set a.id = 1');
      expect(tableList).to.eql(["update::null::a"]);
      expect(columnList).to.eql(["update::a::id"]);
      expect(ast.type).to.be.eql('update');
      expect(ast.table).to.be.eql([{
        "db": null,
        "table": "a",
        "as": null
     }]);
      expect(ast.set).to.eql([{
        column: 'id',
        table: 'a',
        value: {
          type: 'number',
          value: 1
        }
      }]);
      expect(ast.where).to.be.null;
    });

    it('should parse function expression', () => {
      const { tableList, columnList, ast } = parser.parse("UPDATE t SET col1 = concat(name, '名字')");
      expect(tableList).to.eql(["update::null::t"]);
      expect(columnList).to.eql(["select::null::name", "update::null::col1"]);
      expect(ast.type).to.be.eql('update');
      expect(ast.table).to.be.eql([
        {
          "db": null,
          "table": "t",
          "as": null
       }
      ]);
      expect(ast.set).to.eql([
        {
          column: "col1",
          table: null,
          value: {
            type: "function",
            name: { name: [{ type: 'default', value: 'concat' }]},
            over: null,
            args: {
              type: "expr_list",
              value: [
                {
                  type: "column_ref",
                  table: null,
                  column: "name"
                },
                {
                  type: "single_quote_string",
                  value: "名字"
                }
              ]
            }
          }
        }
     ]);
    expect(ast.where).to.be.null;
    });

    it('should parser set is null', () => {
      const set =  [
        {
          "column": "id",
          "table": null
        }
      ]
      const value = {
        "type": "number",
        "value": 1
      }
      const ast = {
        "type": "update",
        "table": [
          {
            "db": null,
            "table": "a",
            "as": null
          }
        ],
        "where": null
      }
      expect(parser.sqlify(ast)).to.be.equal('UPDATE `a`')
      ast.set = []
      expect(parser.sqlify(ast)).to.be.equal('UPDATE `a` SET ')
      ast.set = set
      expect(parser.sqlify(ast)).to.be.equal('UPDATE `a` SET `id`')
      set[0].value = value
      expect(parser.sqlify(ast)).to.be.equal('UPDATE `a` SET `id` = 1')
    })

    it('should parse cross-table update', () => {
      const { tableList, columnList, ast } = parser.parse("UPDATE Reservations r JOIN Train t ON (r.Train = t.TrainID) SET t.Capacity = t.Capacity + r.NoSeats WHERE r.ReservationID = 12");
      expect(tableList).to.eql([
        "update::null::Reservations",
        "select::null::Train",
        "update::null::Train"
     ]);
      expect(columnList).to.eql([
        "select::Reservations::Train",
        "select::Train::TrainID",
        "select::Train::Capacity",
        "select::Reservations::NoSeats",
        "select::Reservations::ReservationID",
        "update::Train::Capacity"
     ]);
      expect(ast.type).to.be.eql('update');
      expect(ast.table).to.be.eql([
        {
           "db": null,
           "table": "Reservations",
           "as": "r"
        },
        {
           "db": null,
           "table": "Train",
           "as": "t",
           "join": "INNER JOIN",
           "on": {
              "type": "binary_expr",
              "operator": "=",
              "left": {
                 "type": "column_ref",
                 "table": "r",
                 "column": "Train"
              },
              "right": {
                 "type": "column_ref",
                 "table": "t",
                 "column": "TrainID"
              },
              "parentheses": true
           }
        }
     ]);
      expect(ast.set).to.eql([
        {
           "column": "Capacity",
           "value": {
              "type": "binary_expr",
              "operator": "+",
              "left": {
                 "type": "column_ref",
                 "table": "t",
                 "column": "Capacity"
              },
              "right": {
                 "type": "column_ref",
                 "table": "r",
                 "column": "NoSeats"
              }
           },
           "table": "t"
        }
     ]);
    expect(ast.where).to.be.eql({
      "type": "binary_expr",
      "operator": "=",
      "left": {
        "type": "column_ref",
        "table": "r",
        "column": "ReservationID"
      },
      "right": {
        "type": "number",
        "value": 12
      }
    });
  })

  it('should support set value', () => {
    expect(getParsedSql('update a set id = 123, name = values(abc) where age > 15 order by name'))
      .to.be.equal('UPDATE `a` SET `id` = 123, `name` = values(`abc`) WHERE `age` > 15 ORDER BY `name` ASC')
  })

  it('should support order by and limit in update sql', () => {
    expect(getParsedSql('update a set id = 123 where age > 15 order by name')).to.be.equal('UPDATE `a` SET `id` = 123 WHERE `age` > 15 ORDER BY `name` ASC')
    expect(getParsedSql('update a set id = 123 order by name')).to.be.equal('UPDATE `a` SET `id` = 123 ORDER BY `name` ASC')
    expect(getParsedSql('update a set id = 123 limit 10')).to.be.equal('UPDATE `a` SET `id` = 123 LIMIT 10')
    expect(getParsedSql('update a set id = 123 order by name limit 10')).to.be.equal('UPDATE `a` SET `id` = 123 ORDER BY `name` ASC LIMIT 10')
  })

  it('should support parse pg update returning', () => {
    const sql = 'update account set id = 1 where name = "abc" returning id'
    const ast = parser.astify(sql, { database: 'postgresql' })
    const backSQL = parser.sqlify(ast)
    expect(backSQL).to.be.equal('UPDATE `account` SET id = 1 WHERE name = "abc" RETURNING id')
  })

  it('should get tableList in right action', () => {
    let sql = `UPDATE empdb.employees t1 INNER JOIN empdb.merits t2 ON t1.performance = t2.performance SET t1.salary = t1.salary + t1.salary * t2.percentage;`
    let ast = parser.parse(sql)
    expect(ast.tableList).to.eql(["update::empdb::employees", "select::empdb::merits"])
    expect(ast.columnList).to.eql([
      "select::employees::performance",
      "select::merits::performance",
      "select::employees::salary",
      "select::merits::percentage",
      "update::employees::salary"
    ])
  })
  sql = `UPDATE empdb.employees t1 INNER JOIN (select t2.percentage,t2.performance from empdb.merits t2) as t3 ON t1.performance = t3.performance SET t1.salary = t1.salary + t1.salary * t3.percentage;`
  ast = parser.parse(sql)
  expect(ast.tableList).to.eql(["select::empdb::merits", "update::empdb::employees"])
  expect(ast.columnList).to.eql([
    "select::merits::percentage",
    "select::merits::performance",
    "select::employees::performance",
    "select::t3::performance",
    "select::employees::salary",
    "select::t3::percentage",
    "update::employees::salary"
  ])
  sql = `DELETE t1 FROM t1 INNER JOIN  t2 ON t2.ref = t1.id;`
  ast = parser.parse(sql)
  expect(ast.tableList).to.eql(["delete::null::t1","select::null::t2"])
  expect(ast.columnList).to.eql(["select::t2::ref", "select::t1::id", "delete::t1::(.*)" ])
});
