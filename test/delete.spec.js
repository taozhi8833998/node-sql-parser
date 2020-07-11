const { expect } = require('chai');
const Parser = require('../src/parser').default
const { deleteToSQL } = require('../src/delete')

describe('delete', () => {
    const parser = new Parser();

    function getParsedSql(sql, opt) {
      const ast = parser.astify(sql, opt);
      return parser.sqlify(ast, opt);
  }

    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('delete from a where id = 1');
      expect(tableList).to.eql(['delete::null::a']);
      expect(columnList).to.eql(['select::null::id', 'delete::a::(.*)']);
      expect(ast.type).to.be.eql('delete');
      expect(ast.table).to.be.eql([{
        db: null,
        table: 'a',
        as: null,
        addition: true
      }])
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
    it('should parse baisc usage', () => {
      const { tableList, columnList, ast } = parser.parse('delete from a');
      expect(tableList).to.eql(['delete::null::a']);
      expect(columnList).to.eql(['delete::a::(.*)']);
      expect(ast.type).to.be.eql('delete');
      expect(ast.table).to.be.eql([{
         db: null,
         table: 'a',
         as: null,
         addition: true
       }])
      expect(ast.from).to.eql([{
        db: null,
        table: 'a',
        as: null
      }]);
    });
    it('should sqlify delete without table', () => {
       expect(deleteToSQL({})).to.equal('DELETE')
    })
    it('should parse table in delete usage', () => {
      const { tableList, columnList, ast } = parser.parse('DELETE t1,t2 from t1 LEFT JOIN t2 ON t1.id=t2.id WHERE t1.id=25');
      expect(tableList).to.eql(['delete::null::t1', 'delete::null::t2']);
      expect(columnList).to.eql(['select::t1::id', 'select::t2::id', 'delete::t1::(.*)', 'delete::t2::(.*)']);
      expect(ast.type).to.be.eql('delete');
      expect(ast.table).to.eql([
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

   it('should support order by and limit in delete sql', () => {
      expect(getParsedSql('delete from t1 where id = 1 order by id')).to.be.equal('DELETE FROM `t1` WHERE `id` = 1 ORDER BY `id` ASC')
      expect(getParsedSql('delete from t1 where id = 1 limit 10')).to.be.equal('DELETE FROM `t1` WHERE `id` = 1 LIMIT 10')
      expect(getParsedSql('delete from t1 where id = 1 order by id limit 10')).to.be.equal('DELETE FROM `t1` WHERE `id` = 1 ORDER BY `id` ASC LIMIT 10')
      expect(getParsedSql('delete from t1 order by id limit 10')).to.be.equal('DELETE FROM `t1` ORDER BY `id` ASC LIMIT 10')
   })
});