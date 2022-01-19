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

  it('should support rlike', () => {
    const sql = `select emp_id,name,email_id
    from emp_info
    where email_id RLIKE '^([0-9]|[a-z]|[A-Z])';`
    expect(getParsedSql(sql)).to.be.equal("SELECT `emp_id`, `name`, `email_id` FROM `emp_info` WHERE `email_id` RLIKE '^([0-9]|[a-z]|[A-Z])'")
  })

  it('should support not rlike', () => {
    const sql = `select emp_id,name,email_id
    from emp_info
    where email_id NOT RLIKE '^([0-9]|[a-z]|[A-Z])';`
    expect(getParsedSql(sql)).to.be.equal("SELECT `emp_id`, `name`, `email_id` FROM `emp_info` WHERE `email_id` NOT RLIKE '^([0-9]|[a-z]|[A-Z])'")
  })

  it('should support window function', () => {
    let sql = `SELECT COALESCE(
      LAST_VALUE(prop1) OVER (PARTITION BY duid, vid, inserteddate ORDER BY STAMP ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),
      LAST_VALUE(prop2) OVER (PARTITION BY duid, vid, inserteddate ORDER BY STAMP ASC ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING),
      'unknown')`
    expect(getParsedSql(sql)).to.be.equal("SELECT COALESCE(LAST_VALUE(`prop1`) OVER (PARTITION BY `duid`, `vid`, `inserteddate` ORDER BY `STAMP` ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), LAST_VALUE(`prop2`) OVER (PARTITION BY `duid`, `vid`, `inserteddate` ORDER BY `STAMP` ASC ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING), 'unknown')")
    sql = `SELECT CASE
      WHEN(
          LAST_VALUE(
              CASE
                  WHEN prop1='const1' THEN 'const2'
                  ELSE NULL
              END, True
          ) OVER (PARTITION BY duid, vid, market ORDER BY stamp ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) = 'const3'
      ) THEN 'const4'
      ELSE NULL
    END`
    expect(getParsedSql(sql)).to.be.equal("SELECT CASE WHEN (LAST_VALUE(CASE WHEN `prop1` = 'const1' THEN 'const2' ELSE NULL END, TRUE) OVER (PARTITION BY `duid`, `vid`, `market` ORDER BY `stamp` ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) = 'const3') THEN 'const4' ELSE NULL END")
  })

  it('should support cross join', () => {
    const sql = 'SELECT * FROM a CROSS JOIN b ON (a.id = b.id AND a.department = b.department)'
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM `a` CROSS JOIN `b` ON (`a`.`id` = `b`.`id` AND `a`.`department` = `b`.`department`)')
  })

  it('should support ==', () => {
    const sql = "select * from some_table where column1 == 'value'"
    expect(getParsedSql(sql)).to.be.equal("SELECT * FROM `some_table` WHERE `column1` == 'value'")
  })

  it('should support array index', () => {
    let sql = "select some_array[0] from some_table;"
    expect(getParsedSql(sql)).to.be.equal("SELECT `some_array`[0] FROM `some_table`")
    sql = "select lower(some_array[0]) from some_table;"
    expect(getParsedSql(sql)).to.be.equal("SELECT lower(`some_array`[0]) FROM `some_table`")
    sql = "select some_array[0].some_prop from some_table;"
    expect(getParsedSql(sql)).to.be.equal("SELECT `some_array`[0].some_prop FROM `some_table`")
    sql = "select lower(some_array[0].some_prop) from some_table;"
    expect(getParsedSql(sql)).to.be.equal("SELECT lower(`some_array`[0].some_prop) FROM `some_table`")
  })

  it('should support date interval cal', () => {
    let sql = `SELECT id from origindb.tt WHERE _update_timestamp >= timestamp businessBeginTime - interval '3' day`
    expect(getParsedSql(sql)).to.be.equal("SELECT `id` FROM `origindb`.`tt` WHERE `_update_timestamp` >= TIMESTAMP `businessBeginTime` - INTERVAL '3' DAY")
    sql = `select id from origindb.tt where date '2012-08-08' + interval '2' day`
    expect(getParsedSql(sql)).to.be.equal("SELECT `id` FROM `origindb`.`tt` WHERE DATE '2012-08-08' + INTERVAL '2' DAY")
    sql = "SELECT timestamp '2012-10-31 01:00 UTC';"
    expect(getParsedSql(sql)).to.be.equal("SELECT TIMESTAMP '2012-10-31 01:00 UTC'")
  })
})