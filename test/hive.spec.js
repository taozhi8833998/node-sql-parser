const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('Hive', () => {
  const parser = new Parser();
  const opt = {
    database: 'hive'
  }

  function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  it('should support colume start with number', () => {
    const sql = `SELECT min(salary)
    FROM "MyTable" as ST
    WHERE (ST.3_year_base_employee_count= 390)
    GROUP BY ST.bankruptcy_date,ST.3_year_base_employee_count`
    const ast = parser.astify(sql, { database: 'hive' })
    const backSQL = parser.sqlify(ast)
    expect(backSQL).to.be.equal("SELECT MIN(`salary`) FROM `MyTable` AS `ST` WHERE (`ST`.`3_year_base_employee_count` = 390) GROUP BY `ST`.`bankruptcy_date`, `ST`.`3_year_base_employee_count`")
  })
})