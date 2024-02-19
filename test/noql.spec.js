const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('noql', () => {
  const parser = new Parser();
  const DEFAULT_OPT =  { database: 'noql' }

  function getParsedSql(sql, opt = DEFAULT_OPT) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support basic nosql', () => {
    let sql = 'SELECT  id,"First Name","Last Name",(SELECT * FROM Rentals WHERE staffId<10) AS rentalsArr FROM customers'
    expect(getParsedSql(sql)).to.be.equal('SELECT "id", "First Name", "Last Name", (SELECT * FROM "Rentals" WHERE "staffId" < 10) AS "rentalsArr" FROM "customers"')
    sql = "SELECT  Order1.id, unset(_id) FROM orders Order1 INNER JOIN(SELECT * FROM orders) 'Order2|unwind' on Order2.id = Order1.id LIMIT 1"
    expect(getParsedSql(sql)).to.be.equal('SELECT "Order1"."id", unset("_id") FROM "orders" AS "Order1" INNER JOIN (SELECT * FROM "orders") AS "Order2|unwind" ON "Order2"."id" = "Order1"."id" LIMIT 1')
    sql = "SELECT c.*,cn.* FROM customers c INNER JOIN (SELECT * from `customer-notes` where id>2) `cn|first` ON cn.id=c.id"
    expect(getParsedSql(sql)).to.be.equal('SELECT "c".*, "cn".* FROM "customers" AS "c" INNER JOIN (SELECT * FROM "customer-notes" WHERE "id" > 2) AS "cn|first" ON "cn"."id" = "c"."id"')
    sql = "SELECT * FROM customers c LEFT OUTER JOIN `customer-notes` `cn|first` ON cn.id=convert(c.id,'int')"
    expect(getParsedSql(sql)).to.be.equal(`SELECT * FROM "customers" AS "c" LEFT JOIN "customer-notes" AS "cn|first" ON "cn"."id" = convert("c"."id", 'int')`)
    sql = "SELECT id,`First Name`,`Last Name`,avg_ARRAY((select filmId as '$$ROOT' from 'Rentals')) as avgIdRentals FROM customers"
    expect(getParsedSql(sql)).to.be.equal('SELECT "id", "First Name", "Last Name", avg_ARRAY((SELECT "filmId" AS "$$ROOT" FROM "Rentals")) AS "avgIdRentals" FROM "customers"')
    sql = 'SELECT CAST(abs(`id`) as decimal) AS `id` FROM `customers`'
    expect(getParsedSql(sql)).to.be.equal('SELECT CAST(abs("id") AS DECIMAL) AS "id" FROM "customers"')
    sql = 'select convert(`Replacement Cost`) as s from `films`'
    expect(getParsedSql(sql)).to.be.equal('SELECT convert("Replacement Cost") AS "s" FROM "films"')
    sql = "SELECT *,convert(`Replacement Cost`,'int') AS s FROM `films`"
    expect(getParsedSql(sql)).to.be.equal(`SELECT *, convert("Replacement Cost", 'int') AS "s" FROM "films"`)
  })

  it('should support intersect', () => {
    const sql = `SELECT  *
    FROM "most-popular-films"

    INTERSECT

    SELECT  *
    FROM "top-rated-films"`
    expect(getParsedSql(sql)).to.be.equal('SELECT * FROM "most-popular-films" INTERSECT SELECT * FROM "top-rated-films"')
  })
})