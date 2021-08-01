const { expect } = require('chai');
const Parser = require('../src/parser').default

describe('sqlite', () => {
	const parser = new Parser();

	function getParsedSql(sql, opt = { database: 'sqlite' }) {
		const ast = parser.astify(sql, opt);
		return parser.sqlify(ast, opt);
  }

	it('should support analyze in sqlite', () => {
		const sql = 'analyze schemaName.tableName'
		expect(getParsedSql(sql)).to.be.equal('ANALYZE `schemaName`.`tableName`')
	})
})