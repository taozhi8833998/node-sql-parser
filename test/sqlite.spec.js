const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('sqlite', () => {
  const parser = new Parser();

  function getParsedSql(sql, opt = { database: 'sqlite' }) {
    const ast = parser.astify(sql, opt);
    return parser.sqlify(ast, opt);
  }

  it('should support analyze', () => {
    const sql = 'analyze schemaName.tableName'
    expect(getParsedSql(sql)).to.be.equal('ANALYZE `schemaName`.`tableName`')
  })

  it('should support attach', () => {
    const sql = "attach database 'c:\sqlite\db\contacts.db' as contacts;"
    expect(getParsedSql(sql)).to.be.equal("ATTACH DATABASE 'c:\sqlite\db\contacts.db' AS `contacts`")
  })

  it('should support json function in from clause', () => {
    const sql = `SELECT json_extract(value, '$.id') AS author_id
    FROM
        post,
        json_each(post.author, '$')
    GROUP BY
        author_id;`
    expect(getParsedSql(sql)).to.be.equal("SELECT json_extract(`value`, '$.id') AS `author_id` FROM `post`, json_each(`post`.`author`, '$') GROUP BY `author_id`")
  })
})
