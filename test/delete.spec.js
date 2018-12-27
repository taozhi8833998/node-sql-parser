'use strict';

const { expect } = require('chai');
const { Parser } = require('../');

describe('delete', () => {
    const parser = new Parser();

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('delete from a where id = 1');
      expect(tableList).to.eql(['delete::null::a']);
      expect(columnList).to.eql([]);
      expect(ast.type).to.be.eql('delete');
      expect(ast.tables).to.be.eql(null)
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
    it('should parse table in delete usage', () => {
      const { tableList, columnList, ast } = parser.parse('DELETE t1,t2 from t1 LEFT JOIN t2 ON t1.id=t2.id WHERE t1.id=25');
      expect(tableList).to.eql(['delete::null::t1', 'delete::null::t2']);
      expect(columnList).to.eql([]);
      expect(ast.type).to.be.eql('delete');
      expect(ast.tables).to.eql([
         {
            db: null,
            table: 't1',
            as: null
         },
         {
            db: null,
            table: 't2',
            as: null
         }
      ])
      expect(ast.from).to.eql([
         {
            db: null,
            table: 't1',
            as: null
         },
         {
            db: null,
            table: 't2',
            as: null,
            join: 'LEFT JOIN',
            on: {
               type: 'binary_expr',
               operator: '=',
               left: {
                  type: 'column_ref',
                  table: 't1',
                  column: 'id'
               },
               right: {
                  type: 'column_ref',
                  table: 't2',
                  column: 'id'
               }
            }
         }
      ],);
      expect(ast.where).to.eql({
         type: 'binary_expr',
         operator: '=',
         left: {
            type: 'column_ref',
            table: 't1',
            column: 'id',
         },
         right: {
            type: 'number',
            value: 25,
         }
      });
    });
});
