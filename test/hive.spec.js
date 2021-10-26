const { expect } = require('chai')
const Parser = require('../src/parser').default

describe('Hive', () => {
  const parser = new Parser();
  const option = {
    database: 'hive'
  }

  function getParsedSql(sql, opt = option) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

  it('should support colume start with number', () => {
    const sql = `SELECT min(salary)
    FROM "MyTable" as ST
    WHERE (ST.3_year_base_employee_count= 390)
    GROUP BY ST.bankruptcy_date,ST.3_year_base_employee_count`
    expect(getParsedSql(sql)).to.be.equal("SELECT MIN(`salary`) FROM `MyTable` AS `ST` WHERE (`ST`.`3_year_base_employee_count` = 390) GROUP BY `ST`.`bankruptcy_date`, `ST`.`3_year_base_employee_count`")
  })

  it('should support where clause with parentheses', () => {
    const sql = `select * from ab where
    (
    (upstream.created_time >= from_unixtime((businessBeginTime - 3600000) / 1000, 'yyyy-MM-dd hh:mm:ss') and upstream.created_time < from_unixtime((businessEndTime - 3600000) / 1000, 'yyyy-MM-dd hh:mm:ss'))
    or
    (item.create_time >= businessBeginTime - 3600000 and item.create_time < from_unixtime((businessEndTime - 3600000) / 1000, 'yyyy-MM-dd hh:mm:ss'))
    )
    and
    (
    upstream.upper_amount is null
    or item.amount is null
    or coalesce(upstream.upper_amount, 0) <> coalesce(item.amount, 0)
    or upstream.settle_type <> item.settle_type
    )`
    expect(getParsedSql(sql)).to.be.equal("SELECT * FROM `ab` WHERE ((`upstream`.`created_time` >= from_unixtime((`businessBeginTime` - 3600000) / 1000, 'yyyy-MM-dd hh:mm:ss') AND `upstream`.`created_time` < from_unixtime((`businessEndTime` - 3600000) / 1000, 'yyyy-MM-dd hh:mm:ss')) OR (`item`.`create_time` >= `businessBeginTime` - 3600000 AND `item`.`create_time` < from_unixtime((`businessEndTime` - 3600000) / 1000, 'yyyy-MM-dd hh:mm:ss'))) AND (`upstream`.`upper_amount` IS NULL OR `item`.`amount` IS NULL OR coalesce(`upstream`.`upper_amount`, 0) <> coalesce(`item`.`amount`, 0) OR `upstream`.`settle_type` <> `item`.`settle_type`)")
  })
})