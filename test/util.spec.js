const { expect } = require('chai')
const {
  columnIdentifierToSql,
  createValueExpr,
  createBinaryExpr,
  literalToSQL,
  commentToSQL,
  identifierToSql,
  setParserOpt,
} = require('../src/util')
const { overToSQL } = require('../src/over')

describe('util function test', () => {
  it('should throw error when type is unkonwn', () => {
    expect(createValueExpr.bind(null, {})).to.throw('Cannot convert value "object" to SQL')
  })

  it('should sqlify when right do not has type', () => {
    expect(createBinaryExpr('=', { type: 'left' }, 2)).to.be.eql({
      operator: '=',
      type: 'binary_expr',
      left: { type: 'left' },
      right: {
        type: 'number',
        value: 2
      }
    })
  })

  it('should sqlify when type if boolean has parentheses', () => {
    expect(literalToSQL({ type: 'boolean', parentheses: true , value: 1 })).to.equal('(TRUE)')
  })

  it('should comment with symbol', () => {
    const comment = commentToSQL({ keyword: 'comment', value: { type: 'string', value: '123'}, symbol: '='})
    expect(comment).to.equal("COMMENT = '123'")
  })

  it('should support default back quote', () => {
    setParserOpt({"database": "default"})
    expect(identifierToSql('db')).to.be.equal('`db`')
    setParserOpt({})
    expect(identifierToSql('db')).to.be.equal('`db`')
  })

  it('should support columnIdentifierToSql without ident', () => {
    expect(columnIdentifierToSql()).to.be.undefined
  })
})

describe('over to sql', () => {
  it('should throw new error when type is unknown', () => {
    expect(() => overToSQL({ type: 'unknown' })).to.throw('unknown over type')
  })
})