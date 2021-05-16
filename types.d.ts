// Type definitions for node-sql-parser 1.0
// Project: https://github.com/taozhi8833998/node-sql-parser#readme
// Definitions by: taozhi8833998 <https://github.com/taozhi8833998>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

export interface With {
  name: string;
  stmt: any[];
  columns?: any[];
}
export type WhilteListCheckMode = 'table' | 'column';
export interface Option {
  database?: string,
  type?: string,
}
export interface TableColumnAst {
  tableList: string[];
  columnList: string[];
  ast: AST[] | AST;
}
export interface From {
  db: string | null;
  table: string;
  as: string | null;
}
export interface Dual {
  type: 'dual';
}
export interface LimitValue {
  type: string;
  value: number;
}
export interface Limit {
  seperator: string;
  value: LimitValue[];
}
export interface OrderBy {
  type: 'ASC' | 'DESC';
  expr: any;
}
export interface ColumnRef {
  type: 'column_ref';
  table: string | null;
  column: string;
}
export interface SetList {
  column: string;
  value: any;
  table: string | null;
}
export interface InsertReplaceValue {
  type: 'expr_list';
  value: any[];
}

export interface Star {
  type: 'star';
  value: '*';
}
export interface AggrFunc {
  type: 'aggr_func';
  name: string;
  args: ColumnRef | AggrFunc | Star | null;
}
export interface Column {
  expr: ColumnRef | AggrFunc;
  as: string;
}

export interface Select {
  with: With | null;
  type: 'select';
  options: any[] | null;
  distinct: 'DISTINCT' | null;
  columns: any[] | Column[] | '*';
  from: Array<From | Dual | any> | null;
  where: any;
  groupby: ColumnRef[] | null;
  having: any[] | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
}
export interface Insert_Replace {
  type: 'replace' | 'insert';
  db: string | null;
  table: any;
  columns: string[] | null;
  values: InsertReplaceValue[];
}
export interface Update {
  type: 'update';
  db: string | null;
  table: Array<From | Dual> | null;
  set: SetList[];
  where: any;
}
export interface Delete {
  type: 'delete';
  table: any;
  from: Array<From | Dual>;
  where: any;
}

export interface Alter {
  type: 'alter',
  table: From,
  expr: any
}

export interface Use {
  type: 'use';
  db: string;
}

export type AST = Use | Select | Insert_Replace | Update | Delete | Alter;

export class Parser {
  constructor();

  parse(sql: string, opt?: Option): TableColumnAst;

  astify(sql: string, opt?: Option): AST[] | AST;

  sqlify(ast: AST[] | AST, opt?: Option): string;

  whiteListCheck(sql: string, whiteList: string[], opt?: Option): Error | undefined;

  tableList(sql: string, opt?: Option): string[];

  columnList(sql: string, opt?: Option): string[];
}
