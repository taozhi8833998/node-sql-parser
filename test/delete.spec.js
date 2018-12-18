'use strict';

const { expect } = require('chai');
const { Parser } = require('../');

describe('delete', () => {
    const parser = new Parser();

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('delete from a where id = 1');
      expect(tableList).to.eql(["delete::null::a"]);
      expect(columnList).to.eql([]);
      expect(ast.type).to.be.eql('delete');
      expect(ast.from).to.eql([{
            db: null,
            table: 'a',
            as: null
         }]);
      expect(ast.where).to.eql({
         type: 'binary_expr',
         operator: '=',
         left: {
            type: 'column_ref',
            table: null,
            column: 'id',
         },
         right: {
            type: 'number',
            value: 1,
         }
      });
    });
});
