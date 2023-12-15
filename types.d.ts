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
export type WhilteListCheckMode = "table" | "column";
export interface Option {
  database?: string;
  type?: string;
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
  type: "dual";
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
  type: "ASC" | "DESC";
  expr: any;
}
export interface ColumnRef {
  type: "column_ref";
  table: string | null;
  column: string;
}
export interface SetList {
  column: string;
  value: any;
  table: string | null;
}
export interface InsertReplaceValue {
  type: "expr_list";
  value: any[];
}

export interface Star {
  type: "star";
  value: "*";
}
export interface AggrFunc {
  type: "aggr_func";
  name: string;
  args: ColumnRef | AggrFunc | Star | null;
}
export interface Function {
  type: "function";
  name: string;
  args: ExprList;
  suffix?: any;
}
export interface Column {
  expr: ColumnRef | AggrFunc | Function;
  as: string | null;
  type?: string;
}

type Param = { type: "param"; value: string };

type Value = { type: string; value: any };

export type Expr =
  | {
      type: "binary_expr";
      operator: "AND" | "OR";
      left: Expr;
      right: Expr;
    }
  | {
      type: "binary_expr";
      operator: string;
      left: ColumnRef | Param | Value;
      right: ColumnRef | Param | Value;
    };

export type ExprList = {
  type: "expr_list";
  value: Expr[];
};
export interface Select {
  with: With | null;
  type: "select";
  options: any[] | null;
  distinct: "DISTINCT" | null;
  columns: any[] | Column[];
  from: Array<From | Dual | any> | null;
  where: Expr | Function | null;
  groupby: ColumnRef[] | null;
  having: any[] | null;
  orderby: OrderBy[] | null;
  limit: Limit | null;
  _orderby?: OrderBy[] | null;
  _limit?: Limit | null;
  parentheses_symbol?: boolean;
  _parentheses?: boolean;
}
export interface Insert_Replace {
  type: "replace" | "insert";
  db: string | null;
  table: any;
  columns: string[] | null;
  values: InsertReplaceValue[];
}
export interface Update {
  type: "update";
  db: string | null;
  table: Array<From | Dual> | null;
  set: SetList[];
  where: Expr | Function | null;
}
export interface Delete {
  type: "delete";
  table: any;
  from: Array<From | Dual>;
  where: Expr | Function | null;
}

export interface Alter {
  type: "alter";
  table: From[];
  expr: any;
}

export interface Use {
  type: "use";
  db: string;
}

export interface Create {
  type: "create";
  keyword: "table" | "index" | "database";
  temporary?: "temporary" | null;
  table?: { db: string; table: string }[];
  if_not_exists?: "if not exists" | null;
  like?: {
    type: "like";
    table: string;
    parentheses?: boolean;
  } | null;
  ignore_replace?: "ignore" | "replace" | null;
  as?: string | null;
  query_expr?: any | null;
  create_definitions?: any[] | null;
  table_options?: any[] | null;
  index_using?: {
    keyword: "using";
    type: "btree" | "hash";
  } | null;
  index?: string | null;
  on_kw?: "on" | null;
  index_columns?: any[] | null;
  index_type?: "unique" | "fulltext" | "spatial" | null;
  index_options?: any[] | null;
  algorithm_option?: {
    type: "alter";
    keyword: "algorithm";
    resource: "algorithm";
    symbol: "=" | null;
    algorithm: "default" | "instant" | "inplace" | "copy";
  } | null;
  lock_option?: {
    type: "alter";
    keyword: "lock";
    resource: "lock";
    symbol: "=" | null;
    lock: "default" | "none" | "shared" | "exclusive";
  } | null;
  database?: string;
}

export interface Drop {
  type: "drop";
  keyword: string;
  name: any[];
}

export type AST =
  | Use
  | Select
  | Insert_Replace
  | Update
  | Delete
  | Alter
  | Create
  | Drop;

export class Parser {
  constructor();

  parse(sql: string, opt?: Option): TableColumnAst;

  astify(sql: string, opt?: Option): AST[] | AST;

  sqlify(ast: AST[] | AST, opt?: Option): string;

  exprToSQL(ast: any, opt?: Option): string;

  whiteListCheck(
    sql: string,
    whiteList: string[],
    opt?: Option
  ): Error | undefined;

  tableList(sql: string, opt?: Option): string[];

  columnList(sql: string, opt?: Option): string[];
}
