/*
 * Generated type guards for "types.d.ts".
 * WARNING: Do not manually change this file.
 */
import { With, ParseOptions, Option, TableColumnAst, BaseFrom, Join, TableExpr, Dual, From, LimitValue, Limit, OrderBy, ValueExpr, SortDirection, ColumnRefItem, ColumnRef, SetList, InsertReplaceValue, Star, Case, Cast, AggrFunc, FunctionName, Function, Column, Interval, Param, Var, Value, Binary, Unary, Expr, ExpressionValue, ExprList, PartitionBy, WindowSpec, WindowFrameClause, AsWindowSpec, NamedWindowExpr, WindowExpr, Select, Insert_Replace, Returning, Update, Delete, Alter, AlterExpr, AlterAddColumn, AlterDropColumn, AlterModifyColumn, AlterChangeColumn, AlterRenameTable, AlterRenameColumn, AlterAddIndex, AlterDropIndex, AlterDropKey, AlterAddConstraint, AlterDropConstraint, AlterAddPartition, AlterDropPartition, AlterAlgorithm, AlterLock, AlterTableOption, Use, Timezone, KeywordComment, CollateExpr, DataType, OnUpdateCurrentTimestamp, LiteralNotNull, LiteralNull, ColumnConstraint, ColumnDefinitionOptList, ReferenceDefinition, OnReference, CreateColumnDefinition, IndexType, IndexOption, CreateIndexDefinition, CreateFulltextSpatialIndexDefinition, ConstraintName, CreateConstraintPrimary, CreateConstraintUnique, CreateConstraintForeign, CreateConstraintCheck, CreateConstraintDefinition, CreateDefinition, CreateTable, CreateDatabase, CreateSchema, CreateIndex, CreateView, CreateTrigger, CreateUser, Create, TriggerEvent, UserAuthOption, RequireOption, ResourceOption, PasswordOption, TableOption, DropTable, DropDatabase, DropView, DropIndex, DropTrigger, Drop, Show, Desc, Explain, Call, Set, Lock, LockTable, Unlock, Grant, LoadData, LoadDataField, LoadDataLine, Truncate, Rename, Transaction, AST } from "./types";

export function isWith(obj: unknown): obj is With {
    const typedObj = obj as With
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["name"] !== null &&
            typeof typedObj["name"] === "object" ||
            typeof typedObj["name"] === "function") &&
        typeof typedObj["name"]["value"] === "string" &&
        (typedObj["stmt"] !== null &&
            typeof typedObj["stmt"] === "object" ||
            typeof typedObj["stmt"] === "function") &&
        (typeof typedObj["stmt"]["_parentheses"] === "undefined" ||
            typedObj["stmt"]["_parentheses"] === false ||
            typedObj["stmt"]["_parentheses"] === true) &&
        Array.isArray(typedObj["stmt"]["tableList"]) &&
        typedObj["stmt"]["tableList"].every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(typedObj["stmt"]["columnList"]) &&
        typedObj["stmt"]["columnList"].every((e: any) =>
            typeof e === "string"
        ) &&
        isSelect(typedObj["stmt"]["ast"]) as boolean &&
        (typedObj["columns"] === null ||
            Array.isArray(typedObj["columns"]) &&
            typedObj["columns"].every((e: any) =>
                isColumnRefItem(e) as boolean
            ))
    )
}

export function isParseOptions(obj: unknown): obj is ParseOptions {
    const typedObj = obj as ParseOptions
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["includeLocations"] === "undefined" ||
            typedObj["includeLocations"] === false ||
            typedObj["includeLocations"] === true)
    )
}

export function isOption(obj: unknown): obj is Option {
    const typedObj = obj as Option
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["database"] === "undefined" ||
            typeof typedObj["database"] === "string") &&
        (typeof typedObj["type"] === "undefined" ||
            typeof typedObj["type"] === "string") &&
        (typeof typedObj["trimQuery"] === "undefined" ||
            typedObj["trimQuery"] === false ||
            typedObj["trimQuery"] === true) &&
        (typeof typedObj["parseOptions"] === "undefined" ||
            isParseOptions(typedObj["parseOptions"]) as boolean)
    )
}

export function isTableColumnAst(obj: unknown): obj is TableColumnAst {
    const typedObj = obj as TableColumnAst
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        Array.isArray(typedObj["tableList"]) &&
        typedObj["tableList"].every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(typedObj["columnList"]) &&
        typedObj["columnList"].every((e: any) =>
            typeof e === "string"
        ) &&
        (isSelect(typedObj["ast"]) as boolean ||
            isInsert_Replace(typedObj["ast"]) as boolean ||
            isUpdate(typedObj["ast"]) as boolean ||
            isDelete(typedObj["ast"]) as boolean ||
            isAlter(typedObj["ast"]) as boolean ||
            isUse(typedObj["ast"]) as boolean ||
            isCreateTable(typedObj["ast"]) as boolean ||
            isCreateDatabase(typedObj["ast"]) as boolean ||
            isCreateSchema(typedObj["ast"]) as boolean ||
            isCreateIndex(typedObj["ast"]) as boolean ||
            isCreateView(typedObj["ast"]) as boolean ||
            isCreateTrigger(typedObj["ast"]) as boolean ||
            isCreateUser(typedObj["ast"]) as boolean ||
            isDropTable(typedObj["ast"]) as boolean ||
            isDropDatabase(typedObj["ast"]) as boolean ||
            isDropView(typedObj["ast"]) as boolean ||
            isDropIndex(typedObj["ast"]) as boolean ||
            isDropTrigger(typedObj["ast"]) as boolean ||
            isShow(typedObj["ast"]) as boolean ||
            isDesc(typedObj["ast"]) as boolean ||
            isExplain(typedObj["ast"]) as boolean ||
            isCall(typedObj["ast"]) as boolean ||
            isSet(typedObj["ast"]) as boolean ||
            isLock(typedObj["ast"]) as boolean ||
            isUnlock(typedObj["ast"]) as boolean ||
            isGrant(typedObj["ast"]) as boolean ||
            isLoadData(typedObj["ast"]) as boolean ||
            isTruncate(typedObj["ast"]) as boolean ||
            isRename(typedObj["ast"]) as boolean ||
            isTransaction(typedObj["ast"]) as boolean ||
            Array.isArray(typedObj["ast"]) &&
            typedObj["ast"].every((e: any) =>
                isAST(e) as boolean
            )) &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === false ||
            typedObj["parentheses"] === true) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isBaseFrom(obj: unknown): obj is BaseFrom {
    const typedObj = obj as BaseFrom
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["db"] === null ||
            typeof typedObj["db"] === "string") &&
        typeof typedObj["table"] === "string" &&
        (typedObj["as"] === null ||
            typeof typedObj["as"] === "string") &&
        (typeof typedObj["schema"] === "undefined" ||
            typeof typedObj["schema"] === "string") &&
        (typeof typedObj["addition"] === "undefined" ||
            typedObj["addition"] === false ||
            typedObj["addition"] === true) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isJoin(obj: unknown): obj is Join {
    const typedObj = obj as Join
    return (
        isBaseFrom(typedObj) as boolean &&
        (typedObj["join"] === "INNER JOIN" ||
            typedObj["join"] === "LEFT JOIN" ||
            typedObj["join"] === "RIGHT JOIN") &&
        (typeof typedObj["using"] === "undefined" ||
            Array.isArray(typedObj["using"]) &&
            typedObj["using"].every((e: any) =>
                typeof e === "string"
            )) &&
        (typeof typedObj["on"] === "undefined" ||
            isBinary(typedObj["on"]) as boolean)
    )
}

export function isTableExpr(obj: unknown): obj is TableExpr {
    const typedObj = obj as TableExpr
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["expr"] !== null &&
            typeof typedObj["expr"] === "object" ||
            typeof typedObj["expr"] === "function") &&
        Array.isArray(typedObj["expr"]["tableList"]) &&
        typedObj["expr"]["tableList"].every((e: any) =>
            typeof e === "string"
        ) &&
        Array.isArray(typedObj["expr"]["columnList"]) &&
        typedObj["expr"]["columnList"].every((e: any) =>
            typeof e === "string"
        ) &&
        isSelect(typedObj["expr"]["ast"]) as boolean &&
        typeof typedObj["expr"]["parentheses"] === "boolean" &&
        (typedObj["as"] === null ||
            typeof typedObj["as"] === "string")
    )
}

export function isDual(obj: unknown): obj is Dual {
    const typedObj = obj as Dual
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "dual" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isFrom(obj: unknown): obj is From {
    const typedObj = obj as From
    return (
        (isBaseFrom(typedObj) as boolean ||
            isJoin(typedObj) as boolean ||
            isTableExpr(typedObj) as boolean ||
            isDual(typedObj) as boolean)
    )
}

export function isLimitValue(obj: unknown): obj is LimitValue {
    const typedObj = obj as LimitValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["type"] === "string" &&
        typeof typedObj["value"] === "number" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isLimit(obj: unknown): obj is Limit {
    const typedObj = obj as Limit
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["seperator"] === "string" &&
        Array.isArray(typedObj["value"]) &&
        typedObj["value"].every((e: any) =>
            isLimitValue(e) as boolean
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isOrderBy(obj: unknown): obj is OrderBy {
    const typedObj = obj as OrderBy
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === null ||
            typedObj["type"] === "ASC" ||
            typedObj["type"] === "DESC") &&
        isExpressionValue(typedObj["expr"]) as boolean &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isValueExpr(obj: unknown): obj is ValueExpr {
    const typedObj = obj as ValueExpr
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "string" ||
            typedObj["type"] === "number" ||
            typedObj["type"] === "boolean" ||
            typedObj["type"] === "backticks_quote_string" ||
            typedObj["type"] === "regex_string" ||
            typedObj["type"] === "hex_string" ||
            typedObj["type"] === "full_hex_string" ||
            typedObj["type"] === "natural_string" ||
            typedObj["type"] === "bit_string" ||
            typedObj["type"] === "double_quote_string" ||
            typedObj["type"] === "single_quote_string" ||
            typedObj["type"] === "bool" ||
            typedObj["type"] === "null" ||
            typedObj["type"] === "star" ||
            typedObj["type"] === "param" ||
            typedObj["type"] === "origin" ||
            typedObj["type"] === "date" ||
            typedObj["type"] === "datetime" ||
            typedObj["type"] === "default" ||
            typedObj["type"] === "time" ||
            typedObj["type"] === "timestamp" ||
            typedObj["type"] === "var_string") &&
        typeof typedObj["value"] === "T"
    )
}

export function isSortDirection(obj: unknown): obj is SortDirection {
    const typedObj = obj as SortDirection
    return (
        (typedObj === "ASC" ||
            typedObj === "DESC" ||
            typedObj === "asc" ||
            typedObj === "desc")
    )
}

export function isColumnRefItem(obj: unknown): obj is ColumnRefItem {
    const typedObj = obj as ColumnRefItem
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "column_ref" &&
        (typeof typedObj["table"] === "undefined" ||
            typedObj["table"] === null ||
            typeof typedObj["table"] === "string") &&
        (typeof typedObj["column"] === "string" ||
            (typedObj["column"] !== null &&
                typeof typedObj["column"] === "object" ||
                typeof typedObj["column"] === "function") &&
            (typedObj["column"]["expr"] !== null &&
                typeof typedObj["column"]["expr"] === "object" ||
                typeof typedObj["column"]["expr"] === "function") &&
            (typedObj["column"]["expr"]["type"] === "string" ||
                typedObj["column"]["expr"]["type"] === "number" ||
                typedObj["column"]["expr"]["type"] === "boolean" ||
                typedObj["column"]["expr"]["type"] === "backticks_quote_string" ||
                typedObj["column"]["expr"]["type"] === "regex_string" ||
                typedObj["column"]["expr"]["type"] === "hex_string" ||
                typedObj["column"]["expr"]["type"] === "full_hex_string" ||
                typedObj["column"]["expr"]["type"] === "natural_string" ||
                typedObj["column"]["expr"]["type"] === "bit_string" ||
                typedObj["column"]["expr"]["type"] === "double_quote_string" ||
                typedObj["column"]["expr"]["type"] === "single_quote_string" ||
                typedObj["column"]["expr"]["type"] === "bool" ||
                typedObj["column"]["expr"]["type"] === "null" ||
                typedObj["column"]["expr"]["type"] === "star" ||
                typedObj["column"]["expr"]["type"] === "param" ||
                typedObj["column"]["expr"]["type"] === "origin" ||
                typedObj["column"]["expr"]["type"] === "date" ||
                typedObj["column"]["expr"]["type"] === "datetime" ||
                typedObj["column"]["expr"]["type"] === "default" ||
                typedObj["column"]["expr"]["type"] === "time" ||
                typedObj["column"]["expr"]["type"] === "timestamp" ||
                typedObj["column"]["expr"]["type"] === "var_string") &&
            (typeof typedObj["column"]["expr"]["value"] === "string" ||
                typeof typedObj["column"]["expr"]["value"] === "number" ||
                typedObj["column"]["expr"]["value"] === false ||
                typedObj["column"]["expr"]["value"] === true)) &&
        (typeof typedObj["options"] === "undefined" ||
            isExprList(typedObj["options"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean) &&
        (typeof typedObj["order_by"] === "undefined" ||
            typedObj["order_by"] === null ||
            typedObj["order_by"] === "ASC" ||
            typedObj["order_by"] === "DESC" ||
            typedObj["order_by"] === "asc" ||
            typedObj["order_by"] === "desc")
    )
}

export function isColumnRef(obj: unknown): obj is ColumnRef {
    const typedObj = obj as ColumnRef
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "column_ref" &&
        (typeof typedObj["table"] === "undefined" ||
            typedObj["table"] === null ||
            typeof typedObj["table"] === "string") &&
        (typeof typedObj["column"] === "string" ||
            (typedObj["column"] !== null &&
                typeof typedObj["column"] === "object" ||
                typeof typedObj["column"] === "function") &&
            (typedObj["column"]["expr"] !== null &&
                typeof typedObj["column"]["expr"] === "object" ||
                typeof typedObj["column"]["expr"] === "function") &&
            (typedObj["column"]["expr"]["type"] === "string" ||
                typedObj["column"]["expr"]["type"] === "number" ||
                typedObj["column"]["expr"]["type"] === "boolean" ||
                typedObj["column"]["expr"]["type"] === "backticks_quote_string" ||
                typedObj["column"]["expr"]["type"] === "regex_string" ||
                typedObj["column"]["expr"]["type"] === "hex_string" ||
                typedObj["column"]["expr"]["type"] === "full_hex_string" ||
                typedObj["column"]["expr"]["type"] === "natural_string" ||
                typedObj["column"]["expr"]["type"] === "bit_string" ||
                typedObj["column"]["expr"]["type"] === "double_quote_string" ||
                typedObj["column"]["expr"]["type"] === "single_quote_string" ||
                typedObj["column"]["expr"]["type"] === "bool" ||
                typedObj["column"]["expr"]["type"] === "null" ||
                typedObj["column"]["expr"]["type"] === "star" ||
                typedObj["column"]["expr"]["type"] === "param" ||
                typedObj["column"]["expr"]["type"] === "origin" ||
                typedObj["column"]["expr"]["type"] === "date" ||
                typedObj["column"]["expr"]["type"] === "datetime" ||
                typedObj["column"]["expr"]["type"] === "default" ||
                typedObj["column"]["expr"]["type"] === "time" ||
                typedObj["column"]["expr"]["type"] === "timestamp" ||
                typedObj["column"]["expr"]["type"] === "var_string") &&
            (typeof typedObj["column"]["expr"]["value"] === "string" ||
                typeof typedObj["column"]["expr"]["value"] === "number" ||
                typedObj["column"]["expr"]["value"] === false ||
                typedObj["column"]["expr"]["value"] === true)) &&
        (typeof typedObj["options"] === "undefined" ||
            isExprList(typedObj["options"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean) &&
        (typeof typedObj["order_by"] === "undefined" ||
            typedObj["order_by"] === null ||
            typedObj["order_by"] === "ASC" ||
            typedObj["order_by"] === "DESC" ||
            typedObj["order_by"] === "asc" ||
            typedObj["order_by"] === "desc")
    )
}

export function isSetList(obj: unknown): obj is SetList {
    const typedObj = obj as SetList
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["column"] === "string" &&
        isExpressionValue(typedObj["value"]) as boolean &&
        (typedObj["table"] === null ||
            typeof typedObj["table"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isInsertReplaceValue(obj: unknown): obj is InsertReplaceValue {
    const typedObj = obj as InsertReplaceValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "expr_list" &&
        Array.isArray(typedObj["value"]) &&
        typedObj["value"].every((e: any) =>
            isExpressionValue(e) as boolean
        ) &&
        (typedObj["prefix"] === null ||
            typeof typedObj["prefix"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isStar(obj: unknown): obj is Star {
    const typedObj = obj as Star
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "star" &&
        (typedObj["value"] === "" ||
            typedObj["value"] === "*") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCase(obj: unknown): obj is Case {
    const typedObj = obj as Case
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "case" &&
        typedObj["expr"] === null &&
        Array.isArray(typedObj["args"]) &&
        typedObj["args"].every((e: any) =>
        ((e !== null &&
            typeof e === "object" ||
            typeof e === "function") &&
            isBinary(e["cond"]) as boolean &&
            isExpressionValue(e["result"]) as boolean &&
            e["type"] === "when" ||
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            isExpressionValue(e["result"]) as boolean &&
            e["type"] === "else")
        )
    )
}

export function isCast(obj: unknown): obj is Cast {
    const typedObj = obj as Cast
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "cast" &&
        typedObj["keyword"] === "cast" &&
        isExpressionValue(typedObj["expr"]) as boolean &&
        typedObj["symbol"] === "as" &&
        Array.isArray(typedObj["target"]) &&
        typedObj["target"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e["dataType"] === "string" &&
            (typeof e["quoted"] === "undefined" ||
                typeof e["quoted"] === "string")
        )
    )
}

export function isAggrFunc(obj: unknown): obj is AggrFunc {
    const typedObj = obj as AggrFunc
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "aggr_func" &&
        typeof typedObj["name"] === "string" &&
        (typedObj["args"] !== null &&
            typeof typedObj["args"] === "object" ||
            typeof typedObj["args"] === "function") &&
        isExpressionValue(typedObj["args"]["expr"]) as boolean &&
        (typeof typedObj["args"]["distinct"] === "undefined" ||
            typedObj["args"]["distinct"] === null ||
            typedObj["args"]["distinct"] === "DISTINCT") &&
        (typeof typedObj["args"]["orderby"] === "undefined" ||
            typedObj["args"]["orderby"] === null ||
            Array.isArray(typedObj["args"]["orderby"]) &&
            typedObj["args"]["orderby"].every((e: any) =>
                isOrderBy(e) as boolean
            )) &&
        (typeof typedObj["args"]["parentheses"] === "undefined" ||
            typedObj["args"]["parentheses"] === false ||
            typedObj["args"]["parentheses"] === true) &&
        (typeof typedObj["args"]["separator"] === "undefined" ||
            typedObj["args"]["separator"] === null ||
            typeof typedObj["args"]["separator"] === "string" ||
            (typedObj["args"]["separator"] !== null &&
                typeof typedObj["args"]["separator"] === "object" ||
                typeof typedObj["args"]["separator"] === "function") &&
            typeof typedObj["args"]["separator"]["keyword"] === "string" &&
            isValue(typedObj["args"]["separator"]["value"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typedObj["over"] === null ||
            (typedObj["over"] !== null &&
                typeof typedObj["over"] === "object" ||
                typeof typedObj["over"] === "function") &&
            typedObj["over"]["type"] === "window" &&
            isAsWindowSpec(typedObj["over"]["as_window_specification"]) as boolean)
    )
}

export function isFunctionName(obj: unknown): obj is FunctionName {
    const typedObj = obj as FunctionName
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["schema"] === "undefined" ||
            (typedObj["schema"] !== null &&
                typeof typedObj["schema"] === "object" ||
                typeof typedObj["schema"] === "function") &&
            typeof typedObj["schema"]["value"] === "string" &&
            typeof typedObj["schema"]["type"] === "string") &&
        Array.isArray(typedObj["name"]) &&
        typedObj["name"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["type"] === "string" ||
                e["type"] === "number" ||
                e["type"] === "boolean" ||
                e["type"] === "backticks_quote_string" ||
                e["type"] === "regex_string" ||
                e["type"] === "hex_string" ||
                e["type"] === "full_hex_string" ||
                e["type"] === "natural_string" ||
                e["type"] === "bit_string" ||
                e["type"] === "double_quote_string" ||
                e["type"] === "single_quote_string" ||
                e["type"] === "bool" ||
                e["type"] === "null" ||
                e["type"] === "star" ||
                e["type"] === "param" ||
                e["type"] === "origin" ||
                e["type"] === "date" ||
                e["type"] === "datetime" ||
                e["type"] === "default" ||
                e["type"] === "time" ||
                e["type"] === "timestamp" ||
                e["type"] === "var_string") &&
            typeof e["value"] === "string"
        )
    )
}

export function isFunction(obj: unknown): obj is Function {
    const typedObj = obj as Function
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "function" &&
        isFunctionName(typedObj["name"]) as boolean &&
        (typeof typedObj["args"] === "undefined" ||
            isExprList(typedObj["args"]) as boolean) &&
        (typeof typedObj["suffix"] === "undefined" ||
            typedObj["suffix"] === null ||
            isOnUpdateCurrentTimestamp(typedObj["suffix"]) as boolean) &&
        (typeof typedObj["over"] === "undefined" ||
            typedObj["over"] === null ||
            (typedObj["over"] !== null &&
                typeof typedObj["over"] === "object" ||
                typeof typedObj["over"] === "function") &&
            typedObj["over"]["type"] === "window" &&
            isAsWindowSpec(typedObj["over"]["as_window_specification"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isColumn(obj: unknown): obj is Column {
    const typedObj = obj as Column
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isExpressionValue(typedObj["expr"]) as boolean &&
        (typedObj["as"] === null ||
            typeof typedObj["as"] === "string" ||
            (typedObj["as"] !== null &&
                typeof typedObj["as"] === "object" ||
                typeof typedObj["as"] === "function") &&
            (typedObj["as"]["type"] === "string" ||
                typedObj["as"]["type"] === "number" ||
                typedObj["as"]["type"] === "boolean" ||
                typedObj["as"]["type"] === "backticks_quote_string" ||
                typedObj["as"]["type"] === "regex_string" ||
                typedObj["as"]["type"] === "hex_string" ||
                typedObj["as"]["type"] === "full_hex_string" ||
                typedObj["as"]["type"] === "natural_string" ||
                typedObj["as"]["type"] === "bit_string" ||
                typedObj["as"]["type"] === "double_quote_string" ||
                typedObj["as"]["type"] === "single_quote_string" ||
                typedObj["as"]["type"] === "bool" ||
                typedObj["as"]["type"] === "null" ||
                typedObj["as"]["type"] === "star" ||
                typedObj["as"]["type"] === "param" ||
                typedObj["as"]["type"] === "origin" ||
                typedObj["as"]["type"] === "date" ||
                typedObj["as"]["type"] === "datetime" ||
                typedObj["as"]["type"] === "default" ||
                typedObj["as"]["type"] === "time" ||
                typedObj["as"]["type"] === "timestamp" ||
                typedObj["as"]["type"] === "var_string") &&
            typeof typedObj["as"]["value"] === "string") &&
        (typeof typedObj["type"] === "undefined" ||
            typeof typedObj["type"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isInterval(obj: unknown): obj is Interval {
    const typedObj = obj as Interval
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "interval" &&
        typeof typedObj["unit"] === "string" &&
        (typedObj["expr"] !== null &&
            typeof typedObj["expr"] === "object" ||
            typeof typedObj["expr"] === "function") &&
        (typedObj["expr"]["type"] === "string" ||
            typedObj["expr"]["type"] === "number" ||
            typedObj["expr"]["type"] === "boolean" ||
            typedObj["expr"]["type"] === "backticks_quote_string" ||
            typedObj["expr"]["type"] === "regex_string" ||
            typedObj["expr"]["type"] === "hex_string" ||
            typedObj["expr"]["type"] === "full_hex_string" ||
            typedObj["expr"]["type"] === "natural_string" ||
            typedObj["expr"]["type"] === "bit_string" ||
            typedObj["expr"]["type"] === "double_quote_string" ||
            typedObj["expr"]["type"] === "single_quote_string" ||
            typedObj["expr"]["type"] === "bool" ||
            typedObj["expr"]["type"] === "null" ||
            typedObj["expr"]["type"] === "star" ||
            typedObj["expr"]["type"] === "param" ||
            typedObj["expr"]["type"] === "origin" ||
            typedObj["expr"]["type"] === "date" ||
            typedObj["expr"]["type"] === "datetime" ||
            typedObj["expr"]["type"] === "default" ||
            typedObj["expr"]["type"] === "time" ||
            typedObj["expr"]["type"] === "timestamp" ||
            typedObj["expr"]["type"] === "var_string") &&
        (typeof typedObj["expr"]["value"] === "string" ||
            typeof typedObj["expr"]["value"] === "number" ||
            typedObj["expr"]["value"] === false ||
            typedObj["expr"]["value"] === true) &&
        (typedObj["expr"] !== null &&
            typeof typedObj["expr"] === "object" ||
            typeof typedObj["expr"] === "function") &&
        (typeof typedObj["expr"]["loc"] === "undefined" ||
            (typedObj["expr"]["loc"] !== null &&
                typeof typedObj["expr"]["loc"] === "object" ||
                typeof typedObj["expr"]["loc"] === "function") &&
            (typedObj["expr"]["loc"]["start"] !== null &&
                typeof typedObj["expr"]["loc"]["start"] === "object" ||
                typeof typedObj["expr"]["loc"]["start"] === "function") &&
            typeof typedObj["expr"]["loc"]["start"]["line"] === "number" &&
            typeof typedObj["expr"]["loc"]["start"]["column"] === "number" &&
            typeof typedObj["expr"]["loc"]["start"]["offset"] === "number" &&
            (typedObj["expr"]["loc"]["end"] !== null &&
                typeof typedObj["expr"]["loc"]["end"] === "object" ||
                typeof typedObj["expr"]["loc"]["end"] === "function") &&
            typeof typedObj["expr"]["loc"]["end"]["line"] === "number" &&
            typeof typedObj["expr"]["loc"]["end"]["column"] === "number" &&
            typeof typedObj["expr"]["loc"]["end"]["offset"] === "number")
    )
}

export function isParam(obj: unknown): obj is Param {
    const typedObj = obj as Param
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "param" &&
        typeof typedObj["value"] === "string" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isVar(obj: unknown): obj is Var {
    const typedObj = obj as Var
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "var" &&
        typeof typedObj["name"] === "string" &&
        Array.isArray(typedObj["members"]) &&
        typedObj["members"].every((e: any) =>
            typeof e === "string"
        ) &&
        typeof typedObj["prefix"] === "string" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isValue(obj: unknown): obj is Value {
    const typedObj = obj as Value
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["type"] === "string" &&
        (typedObj["value"] === null ||
            typeof typedObj["value"] === "string" ||
            typeof typedObj["value"] === "number" ||
            typedObj["value"] === false ||
            typedObj["value"] === true) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isBinary(obj: unknown): obj is Binary {
    const typedObj = obj as Binary
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "binary_expr" &&
        typeof typedObj["operator"] === "string" &&
        (isTableColumnAst(typedObj["left"]) as boolean ||
            isColumnRefItem(typedObj["left"]) as boolean ||
            isStar(typedObj["left"]) as boolean ||
            isCase(typedObj["left"]) as boolean ||
            isCast(typedObj["left"]) as boolean ||
            isAggrFunc(typedObj["left"]) as boolean ||
            isFunction(typedObj["left"]) as boolean ||
            isInterval(typedObj["left"]) as boolean ||
            isParam(typedObj["left"]) as boolean ||
            isVar(typedObj["left"]) as boolean ||
            isValue(typedObj["left"]) as boolean ||
            isBinary(typedObj["left"]) as boolean ||
            isUnary(typedObj["left"]) as boolean ||
            isExprList(typedObj["left"]) as boolean) &&
        (isTableColumnAst(typedObj["right"]) as boolean ||
            isColumnRefItem(typedObj["right"]) as boolean ||
            isStar(typedObj["right"]) as boolean ||
            isCase(typedObj["right"]) as boolean ||
            isCast(typedObj["right"]) as boolean ||
            isAggrFunc(typedObj["right"]) as boolean ||
            isFunction(typedObj["right"]) as boolean ||
            isInterval(typedObj["right"]) as boolean ||
            isParam(typedObj["right"]) as boolean ||
            isVar(typedObj["right"]) as boolean ||
            isValue(typedObj["right"]) as boolean ||
            isBinary(typedObj["right"]) as boolean ||
            isUnary(typedObj["right"]) as boolean ||
            isExprList(typedObj["right"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === false ||
            typedObj["parentheses"] === true)
    )
}

export function isUnary(obj: unknown): obj is Unary {
    const typedObj = obj as Unary
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "unary_expr" &&
        typeof typedObj["operator"] === "string" &&
        isExpressionValue(typedObj["expr"]) as boolean &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === false ||
            typedObj["parentheses"] === true)
    )
}

export function isExpr(obj: unknown): obj is Expr {
    const typedObj = obj as Expr
    return (
        (isBinary(typedObj) as boolean ||
            isUnary(typedObj) as boolean)
    )
}

export function isExpressionValue(obj: unknown): obj is ExpressionValue {
    const typedObj = obj as ExpressionValue
    return (
        (isTableColumnAst(typedObj) as boolean ||
            isColumnRefItem(typedObj) as boolean ||
            isStar(typedObj) as boolean ||
            isCase(typedObj) as boolean ||
            isCast(typedObj) as boolean ||
            isAggrFunc(typedObj) as boolean ||
            isFunction(typedObj) as boolean ||
            isInterval(typedObj) as boolean ||
            isParam(typedObj) as boolean ||
            isVar(typedObj) as boolean ||
            isValue(typedObj) as boolean ||
            isBinary(typedObj) as boolean ||
            isUnary(typedObj) as boolean)
    )
}

export function isExprList(obj: unknown): obj is ExprList {
    const typedObj = obj as ExprList
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "expr_list" &&
        (typedObj["value"] === null ||
            Array.isArray(typedObj["value"]) &&
            typedObj["value"].every((e: any) =>
                isExpressionValue(e) as boolean
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === false ||
            typedObj["parentheses"] === true) &&
        (typeof typedObj["separator"] === "undefined" ||
            typeof typedObj["separator"] === "string")
    )
}

export function isPartitionBy(obj: unknown): obj is PartitionBy {
    const typedObj = obj as PartitionBy
    return (
        Array.isArray(typedObj) &&
        typedObj.every((e: any) =>
            isColumn(e) as boolean
        )
    )
}

export function isWindowSpec(obj: unknown): obj is WindowSpec {
    const typedObj = obj as WindowSpec
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["name"] === null ||
            typeof typedObj["name"] === "string") &&
        (typedObj["partitionby"] === null ||
            isPartitionBy(typedObj["partitionby"]) as boolean) &&
        (typedObj["orderby"] === null ||
            Array.isArray(typedObj["orderby"]) &&
            typedObj["orderby"].every((e: any) =>
                isOrderBy(e) as boolean
            )) &&
        (typedObj["window_frame_clause"] === null ||
            isBinary(typedObj["window_frame_clause"]) as boolean)
    )
}

export function isWindowFrameClause(obj: unknown): obj is WindowFrameClause {
    const typedObj = obj as WindowFrameClause
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "binary_expr" &&
        typeof typedObj["operator"] === "string" &&
        (isTableColumnAst(typedObj["left"]) as boolean ||
            isColumnRefItem(typedObj["left"]) as boolean ||
            isStar(typedObj["left"]) as boolean ||
            isCase(typedObj["left"]) as boolean ||
            isCast(typedObj["left"]) as boolean ||
            isAggrFunc(typedObj["left"]) as boolean ||
            isFunction(typedObj["left"]) as boolean ||
            isInterval(typedObj["left"]) as boolean ||
            isParam(typedObj["left"]) as boolean ||
            isVar(typedObj["left"]) as boolean ||
            isValue(typedObj["left"]) as boolean ||
            isBinary(typedObj["left"]) as boolean ||
            isUnary(typedObj["left"]) as boolean ||
            isExprList(typedObj["left"]) as boolean) &&
        (isTableColumnAst(typedObj["right"]) as boolean ||
            isColumnRefItem(typedObj["right"]) as boolean ||
            isStar(typedObj["right"]) as boolean ||
            isCase(typedObj["right"]) as boolean ||
            isCast(typedObj["right"]) as boolean ||
            isAggrFunc(typedObj["right"]) as boolean ||
            isFunction(typedObj["right"]) as boolean ||
            isInterval(typedObj["right"]) as boolean ||
            isParam(typedObj["right"]) as boolean ||
            isVar(typedObj["right"]) as boolean ||
            isValue(typedObj["right"]) as boolean ||
            isBinary(typedObj["right"]) as boolean ||
            isUnary(typedObj["right"]) as boolean ||
            isExprList(typedObj["right"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === false ||
            typedObj["parentheses"] === true)
    )
}

export function isAsWindowSpec(obj: unknown): obj is AsWindowSpec {
    const typedObj = obj as AsWindowSpec
    return (
        (typeof typedObj === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            isWindowSpec(typedObj["window_specification"]) as boolean &&
            typeof typedObj["parentheses"] === "boolean")
    )
}

export function isNamedWindowExpr(obj: unknown): obj is NamedWindowExpr {
    const typedObj = obj as NamedWindowExpr
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["name"] === "string" &&
        isAsWindowSpec(typedObj["as_window_specification"]) as boolean
    )
}

export function isWindowExpr(obj: unknown): obj is WindowExpr {
    const typedObj = obj as WindowExpr
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "window" &&
        typedObj["type"] === "window" &&
        Array.isArray(typedObj["expr"]) &&
        typedObj["expr"].every((e: any) =>
            isNamedWindowExpr(e) as boolean
        )
    )
}

export function isSelect(obj: unknown): obj is Select {
    const typedObj = obj as Select
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["with"] === null ||
            Array.isArray(typedObj["with"]) &&
            typedObj["with"].every((e: any) =>
                isWith(e) as boolean
            )) &&
        typedObj["type"] === "select" &&
        (typedObj["options"] === null ||
            Array.isArray(typedObj["options"]) &&
            typedObj["options"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["type"] === "string" ||
                    e["type"] === "number" ||
                    e["type"] === "boolean" ||
                    e["type"] === "backticks_quote_string" ||
                    e["type"] === "regex_string" ||
                    e["type"] === "hex_string" ||
                    e["type"] === "full_hex_string" ||
                    e["type"] === "natural_string" ||
                    e["type"] === "bit_string" ||
                    e["type"] === "double_quote_string" ||
                    e["type"] === "single_quote_string" ||
                    e["type"] === "bool" ||
                    e["type"] === "null" ||
                    e["type"] === "star" ||
                    e["type"] === "param" ||
                    e["type"] === "origin" ||
                    e["type"] === "date" ||
                    e["type"] === "datetime" ||
                    e["type"] === "default" ||
                    e["type"] === "time" ||
                    e["type"] === "timestamp" ||
                    e["type"] === "var_string") &&
                typeof e["value"] === "string"
            )) &&
        (typedObj["distinct"] === null ||
            typedObj["distinct"] === "DISTINCT") &&
        Array.isArray(typedObj["columns"]) &&
        typedObj["columns"].every((e: any) =>
            isColumn(e) as boolean
        ) &&
        (typedObj["into"] !== null &&
            typeof typedObj["into"] === "object" ||
            typeof typedObj["into"] === "function") &&
        (typeof typedObj["into"]["keyword"] === "undefined" ||
            typeof typedObj["into"]["keyword"] === "string") &&
        (typeof typedObj["into"]["type"] === "undefined" ||
            typeof typedObj["into"]["type"] === "string") &&
        (typeof typedObj["into"]["expr"] === "undefined" ||
            isValue(typedObj["into"]["expr"]) as boolean ||
            Array.isArray(typedObj["into"]["expr"]) &&
            typedObj["into"]["expr"].every((e: any) =>
                isVar(e) as boolean
            )) &&
        (typedObj["into"]["position"] === null ||
            typedObj["into"]["position"] === "column" ||
            typedObj["into"]["position"] === "from" ||
            typedObj["into"]["position"] === "end") &&
        (typedObj["from"] === null ||
            isTableExpr(typedObj["from"]) as boolean ||
            Array.isArray(typedObj["from"]) &&
            typedObj["from"].every((e: any) =>
                isFrom(e) as boolean
            ) ||
            (typedObj["from"] !== null &&
                typeof typedObj["from"] === "object" ||
                typeof typedObj["from"] === "function") &&
            Array.isArray(typedObj["from"]["expr"]) &&
            typedObj["from"]["expr"].every((e: any) =>
                isFrom(e) as boolean
            ) &&
            (typedObj["from"]["parentheses"] !== null &&
                typeof typedObj["from"]["parentheses"] === "object" ||
                typeof typedObj["from"]["parentheses"] === "function") &&
            typeof typedObj["from"]["parentheses"]["length"] === "number" &&
            Array.isArray(typedObj["from"]["joins"]) &&
            typedObj["from"]["joins"].every((e: any) =>
                isFrom(e) as boolean
            )) &&
        (typedObj["where"] === null ||
            isFunction(typedObj["where"]) as boolean ||
            isBinary(typedObj["where"]) as boolean ||
            isUnary(typedObj["where"]) as boolean) &&
        (typedObj["groupby"] === null ||
            (typedObj["groupby"] !== null &&
                typeof typedObj["groupby"] === "object" ||
                typeof typedObj["groupby"] === "function") &&
            (typedObj["groupby"]["columns"] === null ||
                Array.isArray(typedObj["groupby"]["columns"]) &&
                typedObj["groupby"]["columns"].every((e: any) =>
                    isColumnRefItem(e) as boolean
                )) &&
            Array.isArray(typedObj["groupby"]["modifiers"]) &&
            typedObj["groupby"]["modifiers"].every((e: any) =>
            (e === null ||
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["type"] === "string" ||
                    e["type"] === "number" ||
                    e["type"] === "boolean" ||
                    e["type"] === "backticks_quote_string" ||
                    e["type"] === "regex_string" ||
                    e["type"] === "hex_string" ||
                    e["type"] === "full_hex_string" ||
                    e["type"] === "natural_string" ||
                    e["type"] === "bit_string" ||
                    e["type"] === "double_quote_string" ||
                    e["type"] === "single_quote_string" ||
                    e["type"] === "bool" ||
                    e["type"] === "null" ||
                    e["type"] === "star" ||
                    e["type"] === "param" ||
                    e["type"] === "origin" ||
                    e["type"] === "date" ||
                    e["type"] === "datetime" ||
                    e["type"] === "default" ||
                    e["type"] === "time" ||
                    e["type"] === "timestamp" ||
                    e["type"] === "var_string") &&
                typeof e["value"] === "string")
            )) &&
        (typedObj["having"] === null ||
            isBinary(typedObj["having"]) as boolean) &&
        (typedObj["orderby"] === null ||
            Array.isArray(typedObj["orderby"]) &&
            typedObj["orderby"].every((e: any) =>
                isOrderBy(e) as boolean
            )) &&
        (typedObj["limit"] === null ||
            isLimit(typedObj["limit"]) as boolean) &&
        (typedObj["window"] === null ||
            isWindowExpr(typedObj["window"]) as boolean) &&
        (typeof typedObj["qualify"] === "undefined" ||
            typedObj["qualify"] === null ||
            Array.isArray(typedObj["qualify"]) &&
            typedObj["qualify"].every((e: any) =>
                isBinary(e) as boolean
            )) &&
        (typeof typedObj["_orderby"] === "undefined" ||
            typedObj["_orderby"] === null ||
            Array.isArray(typedObj["_orderby"]) &&
            typedObj["_orderby"].every((e: any) =>
                isOrderBy(e) as boolean
            )) &&
        (typeof typedObj["_limit"] === "undefined" ||
            typedObj["_limit"] === null ||
            isLimit(typedObj["_limit"]) as boolean) &&
        (typeof typedObj["parentheses_symbol"] === "undefined" ||
            typedObj["parentheses_symbol"] === false ||
            typedObj["parentheses_symbol"] === true) &&
        (typeof typedObj["_parentheses"] === "undefined" ||
            typedObj["_parentheses"] === false ||
            typedObj["_parentheses"] === true) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["_next"] === "undefined" ||
            isSelect(typedObj["_next"]) as boolean) &&
        (typeof typedObj["set_op"] === "undefined" ||
            typeof typedObj["set_op"] === "string") &&
        (typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean) &&
        (typedObj["locking_read"] === null ||
            (typedObj["locking_read"] !== null &&
                typeof typedObj["locking_read"] === "object" ||
                typeof typedObj["locking_read"] === "function") &&
            (typedObj["locking_read"]["type"] === "for_update" ||
                typedObj["locking_read"]["type"] === "lock_in_share_mode") &&
            (typeof typedObj["locking_read"]["of_tables"] === "undefined" ||
                Array.isArray(typedObj["locking_read"]["of_tables"]) &&
                typedObj["locking_read"]["of_tables"].every((e: any) =>
                    isFrom(e) as boolean
                )) &&
            (typeof typedObj["locking_read"]["wait"] === "undefined" ||
                typedObj["locking_read"]["wait"] === null ||
                typedObj["locking_read"]["wait"] === "nowait" ||
                typedObj["locking_read"]["wait"] === "skip_locked"))
    )
}

export function isInsert_Replace(obj: unknown): obj is Insert_Replace {
    const typedObj = obj as Insert_Replace
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "replace" ||
            typedObj["type"] === "insert") &&
        (isBaseFrom(typedObj["table"]) as boolean ||
            isJoin(typedObj["table"]) as boolean ||
            isTableExpr(typedObj["table"]) as boolean ||
            isDual(typedObj["table"]) as boolean ||
            Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
                isFrom(e) as boolean
            )) &&
        (typedObj["columns"] === null ||
            Array.isArray(typedObj["columns"]) &&
            typedObj["columns"].every((e: any) =>
                typeof e === "string"
            )) &&
        (typeof typedObj["values"] === "undefined" ||
            isSelect(typedObj["values"]) as boolean ||
            (typedObj["values"] !== null &&
                typeof typedObj["values"] === "object" ||
                typeof typedObj["values"] === "function") &&
            typedObj["values"]["type"] === "values" &&
            Array.isArray(typedObj["values"]["values"]) &&
            typedObj["values"]["values"].every((e: any) =>
                isInsertReplaceValue(e) as boolean
            )) &&
        (typeof typedObj["set"] === "undefined" ||
            Array.isArray(typedObj["set"]) &&
            typedObj["set"].every((e: any) =>
                isSetList(e) as boolean
            )) &&
        (typedObj["partition"] === null ||
            Array.isArray(typedObj["partition"]) &&
            typedObj["partition"].every((e: any) =>
                typeof e === "string"
            )) &&
        typeof typedObj["prefix"] === "string" &&
        (typedObj["on_duplicate_update"] === null ||
            (typedObj["on_duplicate_update"] !== null &&
                typeof typedObj["on_duplicate_update"] === "object" ||
                typeof typedObj["on_duplicate_update"] === "function") &&
            typedObj["on_duplicate_update"]["keyword"] === "on duplicate key update" &&
            Array.isArray(typedObj["on_duplicate_update"]["set"]) &&
            typedObj["on_duplicate_update"]["set"].every((e: any) =>
                isSetList(e) as boolean
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["returning"] === "undefined" ||
            isReturning(typedObj["returning"]) as boolean)
    )
}

export function isReturning(obj: unknown): obj is Returning {
    const typedObj = obj as Returning
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "returning" &&
        Array.isArray(typedObj["columns"]) &&
        typedObj["columns"].every((e: any) =>
            isColumn(e) as boolean
        )
    )
}

export function isUpdate(obj: unknown): obj is Update {
    const typedObj = obj as Update
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["with"] === null ||
            Array.isArray(typedObj["with"]) &&
            typedObj["with"].every((e: any) =>
                isWith(e) as boolean
            )) &&
        typedObj["type"] === "update" &&
        (typedObj["table"] === null ||
            Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
                isFrom(e) as boolean
            )) &&
        Array.isArray(typedObj["set"]) &&
        typedObj["set"].every((e: any) =>
            isSetList(e) as boolean
        ) &&
        (typedObj["where"] === null ||
            isFunction(typedObj["where"]) as boolean ||
            isBinary(typedObj["where"]) as boolean ||
            isUnary(typedObj["where"]) as boolean) &&
        (typedObj["orderby"] === null ||
            Array.isArray(typedObj["orderby"]) &&
            typedObj["orderby"].every((e: any) =>
                isOrderBy(e) as boolean
            )) &&
        (typedObj["limit"] === null ||
            isLimit(typedObj["limit"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["returning"] === "undefined" ||
            isReturning(typedObj["returning"]) as boolean)
    )
}

export function isDelete(obj: unknown): obj is Delete {
    const typedObj = obj as Delete
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["with"] === null ||
            Array.isArray(typedObj["with"]) &&
            typedObj["with"].every((e: any) =>
                isWith(e) as boolean
            )) &&
        typedObj["type"] === "delete" &&
        (typedObj["table"] === null ||
            Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
            (isBaseFrom(e) as boolean &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (typeof e["addition"] === "undefined" ||
                    e["addition"] === false ||
                    e["addition"] === true) ||
                isJoin(e) as boolean &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (typeof e["addition"] === "undefined" ||
                    e["addition"] === false ||
                    e["addition"] === true) ||
                isTableExpr(e) as boolean &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (typeof e["addition"] === "undefined" ||
                    e["addition"] === false ||
                    e["addition"] === true) ||
                isDual(e) as boolean &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (typeof e["addition"] === "undefined" ||
                    e["addition"] === false ||
                    e["addition"] === true))
            )) &&
        Array.isArray(typedObj["from"]) &&
        typedObj["from"].every((e: any) =>
            isFrom(e) as boolean
        ) &&
        (typedObj["where"] === null ||
            isFunction(typedObj["where"]) as boolean ||
            isBinary(typedObj["where"]) as boolean ||
            isUnary(typedObj["where"]) as boolean) &&
        (typedObj["orderby"] === null ||
            Array.isArray(typedObj["orderby"]) &&
            typedObj["orderby"].every((e: any) =>
                isOrderBy(e) as boolean
            )) &&
        (typedObj["limit"] === null ||
            isLimit(typedObj["limit"]) as boolean) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number") &&
        (typeof typedObj["returning"] === "undefined" ||
            isReturning(typedObj["returning"]) as boolean)
    )
}

export function isAlter(obj: unknown): obj is Alter {
    const typedObj = obj as Alter
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        Array.isArray(typedObj["table"]) &&
        typedObj["table"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["db"] === null ||
                typeof e["db"] === "string") &&
            typeof e["table"] === "string"
        ) &&
        Array.isArray(typedObj["expr"]) &&
        typedObj["expr"].every((e: any) =>
            isAlterExpr(e) as boolean
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isAlterExpr(obj: unknown): obj is AlterExpr {
    const typedObj = obj as AlterExpr
    return (
        (isAlterAddColumn(typedObj) as boolean ||
            isAlterDropColumn(typedObj) as boolean ||
            isAlterModifyColumn(typedObj) as boolean ||
            isAlterChangeColumn(typedObj) as boolean ||
            isAlterRenameTable(typedObj) as boolean ||
            isAlterRenameColumn(typedObj) as boolean ||
            isAlterAddIndex(typedObj) as boolean ||
            isAlterDropIndex(typedObj) as boolean ||
            isAlterDropKey(typedObj) as boolean ||
            isAlterAddConstraint(typedObj) as boolean ||
            isAlterDropConstraint(typedObj) as boolean ||
            isAlterAddPartition(typedObj) as boolean ||
            isAlterDropPartition(typedObj) as boolean ||
            isAlterAlgorithm(typedObj) as boolean ||
            isAlterLock(typedObj) as boolean ||
            isAlterTableOption(typedObj) as boolean)
    )
}

export function isAlterAddColumn(obj: unknown): obj is AlterAddColumn {
    const typedObj = obj as AlterAddColumn
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "column" &&
        typedObj["action"] === "add" &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === "COLUMN") &&
        isColumnRefItem(typedObj["column"]) as boolean &&
        isDataType(typedObj["definition"]) as boolean &&
        (typedObj["suffix"] === null ||
            typeof typedObj["suffix"] === "string" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string")
    )
}

export function isAlterDropColumn(obj: unknown): obj is AlterDropColumn {
    const typedObj = obj as AlterDropColumn
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "column" &&
        typedObj["action"] === "drop" &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === "COLUMN") &&
        isColumnRefItem(typedObj["column"]) as boolean
    )
}

export function isAlterModifyColumn(obj: unknown): obj is AlterModifyColumn {
    const typedObj = obj as AlterModifyColumn
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "column" &&
        typedObj["action"] === "modify" &&
        (typedObj["keyword"] === null ||
            typedObj["keyword"] === "COLUMN") &&
        isColumnRefItem(typedObj["column"]) as boolean &&
        isDataType(typedObj["definition"]) as boolean &&
        (typedObj["suffix"] === null ||
            typeof typedObj["suffix"] === "string" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string")
    )
}

export function isAlterChangeColumn(obj: unknown): obj is AlterChangeColumn {
    const typedObj = obj as AlterChangeColumn
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "column" &&
        typedObj["action"] === "change" &&
        (typedObj["keyword"] === null ||
            typedObj["keyword"] === "COLUMN") &&
        isColumnRefItem(typedObj["old_column"]) as boolean &&
        isColumnRefItem(typedObj["column"]) as boolean &&
        isDataType(typedObj["definition"]) as boolean &&
        (typedObj["suffix"] === null ||
            typeof typedObj["suffix"] === "string" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string")
    )
}

export function isAlterRenameTable(obj: unknown): obj is AlterRenameTable {
    const typedObj = obj as AlterRenameTable
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "table" &&
        typedObj["action"] === "rename" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["table"] === "string"
    )
}

export function isAlterRenameColumn(obj: unknown): obj is AlterRenameColumn {
    const typedObj = obj as AlterRenameColumn
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "column" &&
        typedObj["action"] === "rename" &&
        typedObj["keyword"] === "column" &&
        isColumnRefItem(typedObj["old_column"]) as boolean &&
        typeof typedObj["prefix"] === "string" &&
        isColumnRefItem(typedObj["column"]) as boolean
    )
}

export function isAlterAddIndex(obj: unknown): obj is AlterAddIndex {
    const typedObj = obj as AlterAddIndex
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "index" &&
        typedObj["action"] === "add" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["index"] === "string" &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        (typedObj["index_type"] === null ||
            isIndexType(typedObj["index_type"]) as boolean) &&
        (typedObj["index_options"] === null ||
            Array.isArray(typedObj["index_options"]) &&
            typedObj["index_options"].every((e: any) =>
                isIndexOption(e) as boolean
            ))
    )
}

export function isAlterDropIndex(obj: unknown): obj is AlterDropIndex {
    const typedObj = obj as AlterDropIndex
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "index" &&
        typedObj["action"] === "drop" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["index"] === "string"
    )
}

export function isAlterDropKey(obj: unknown): obj is AlterDropKey {
    const typedObj = obj as AlterDropKey
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "key" &&
        typedObj["action"] === "drop" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["key"] === "string"
    )
}

export function isAlterAddConstraint(obj: unknown): obj is AlterAddConstraint {
    const typedObj = obj as AlterAddConstraint
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "constraint" &&
        typedObj["action"] === "add" &&
        isCreateConstraintDefinition(typedObj["create_definitions"]) as boolean
    )
}

export function isAlterDropConstraint(obj: unknown): obj is AlterDropConstraint {
    const typedObj = obj as AlterDropConstraint
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "constraint" &&
        typedObj["action"] === "drop" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["constraint"] === "string"
    )
}

export function isAlterAddPartition(obj: unknown): obj is AlterAddPartition {
    const typedObj = obj as AlterAddPartition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "partition" &&
        typedObj["action"] === "add" &&
        typedObj["keyword"] === "PARTITION" &&
        Array.isArray(typedObj["partitions"]) &&
        typedObj["partitions"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["name"] !== null &&
                typeof e["name"] === "object" ||
                typeof e["name"] === "function") &&
            (e["name"]["type"] === "string" ||
                e["name"]["type"] === "number" ||
                e["name"]["type"] === "boolean" ||
                e["name"]["type"] === "backticks_quote_string" ||
                e["name"]["type"] === "regex_string" ||
                e["name"]["type"] === "hex_string" ||
                e["name"]["type"] === "full_hex_string" ||
                e["name"]["type"] === "natural_string" ||
                e["name"]["type"] === "bit_string" ||
                e["name"]["type"] === "double_quote_string" ||
                e["name"]["type"] === "single_quote_string" ||
                e["name"]["type"] === "bool" ||
                e["name"]["type"] === "null" ||
                e["name"]["type"] === "star" ||
                e["name"]["type"] === "param" ||
                e["name"]["type"] === "origin" ||
                e["name"]["type"] === "date" ||
                e["name"]["type"] === "datetime" ||
                e["name"]["type"] === "default" ||
                e["name"]["type"] === "time" ||
                e["name"]["type"] === "timestamp" ||
                e["name"]["type"] === "var_string") &&
            (typeof e["name"]["value"] === "string" ||
                typeof e["name"]["value"] === "number" ||
                e["name"]["value"] === false ||
                e["name"]["value"] === true) &&
            (e["value"] !== null &&
                typeof e["value"] === "object" ||
                typeof e["value"] === "function") &&
            typeof e["value"]["type"] === "string" &&
            isValue(e["value"]["expr"]) as boolean &&
            typeof e["value"]["parentheses"] === "boolean"
        )
    )
}

export function isAlterDropPartition(obj: unknown): obj is AlterDropPartition {
    const typedObj = obj as AlterDropPartition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "partition" &&
        typedObj["action"] === "drop" &&
        typedObj["keyword"] === "PARTITION" &&
        Array.isArray(typedObj["partitions"]) &&
        typedObj["partitions"].every((e: any) =>
            isColumn(e) as boolean
        )
    )
}

export function isAlterAlgorithm(obj: unknown): obj is AlterAlgorithm {
    const typedObj = obj as AlterAlgorithm
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "algorithm" &&
        typedObj["keyword"] === "algorithm" &&
        typeof typedObj["symbol"] === "string" &&
        typeof typedObj["algorithm"] === "string"
    )
}

export function isAlterLock(obj: unknown): obj is AlterLock {
    const typedObj = obj as AlterLock
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "lock" &&
        typedObj["keyword"] === "lock" &&
        typeof typedObj["symbol"] === "string" &&
        typeof typedObj["lock"] === "string"
    )
}

export function isAlterTableOption(obj: unknown): obj is AlterTableOption {
    const typedObj = obj as AlterTableOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typeof typedObj["resource"] === "string" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["symbol"] === "string" &&
        (typeof typedObj["engine"] === "undefined" ||
            typeof typedObj["engine"] === "string")
    )
}

export function isUse(obj: unknown): obj is Use {
    const typedObj = obj as Use
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "use" &&
        typeof typedObj["db"] === "string" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isTimezone(obj: unknown): obj is Timezone {
    const typedObj = obj as Timezone
    return (
        Array.isArray(typedObj) &&
        (typedObj[0] === "WITHOUT" ||
            typedObj[0] === "WITH") &&
        typedObj[1] === "TIME" &&
        typedObj[2] === "ZONE"
    )
}

export function isKeywordComment(obj: unknown): obj is KeywordComment {
    const typedObj = obj as KeywordComment
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "comment" &&
        typedObj["keyword"] === "comment" &&
        (typeof typedObj["symbol"] === "undefined" ||
            typedObj["symbol"] === null ||
            typedObj["symbol"] === "=") &&
        (typeof typedObj["value"] === "string" ||
            (typedObj["value"] !== null &&
                typeof typedObj["value"] === "object" ||
                typeof typedObj["value"] === "function") &&
            (typedObj["value"]["type"] === "string" ||
                typedObj["value"]["type"] === "number" ||
                typedObj["value"]["type"] === "boolean" ||
                typedObj["value"]["type"] === "backticks_quote_string" ||
                typedObj["value"]["type"] === "regex_string" ||
                typedObj["value"]["type"] === "hex_string" ||
                typedObj["value"]["type"] === "full_hex_string" ||
                typedObj["value"]["type"] === "natural_string" ||
                typedObj["value"]["type"] === "bit_string" ||
                typedObj["value"]["type"] === "double_quote_string" ||
                typedObj["value"]["type"] === "single_quote_string" ||
                typedObj["value"]["type"] === "bool" ||
                typedObj["value"]["type"] === "null" ||
                typedObj["value"]["type"] === "star" ||
                typedObj["value"]["type"] === "param" ||
                typedObj["value"]["type"] === "origin" ||
                typedObj["value"]["type"] === "date" ||
                typedObj["value"]["type"] === "datetime" ||
                typedObj["value"]["type"] === "default" ||
                typedObj["value"]["type"] === "time" ||
                typedObj["value"]["type"] === "timestamp" ||
                typedObj["value"]["type"] === "var_string") &&
            (typeof typedObj["value"]["value"] === "string" ||
                typeof typedObj["value"]["value"] === "number" ||
                typedObj["value"]["value"] === false ||
                typedObj["value"]["value"] === true))
    )
}

export function isCollateExpr(obj: unknown): obj is CollateExpr {
    const typedObj = obj as CollateExpr
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "collate" &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === "collate") &&
        (typeof typedObj["symbol"] === "undefined" ||
            typedObj["symbol"] === null ||
            typedObj["symbol"] === "=") &&
        (typeof typedObj["value"] === "undefined" ||
            typeof typedObj["value"] === "string") &&
        (typeof typedObj["collate"] === "undefined" ||
            (typedObj["collate"] !== null &&
                typeof typedObj["collate"] === "object" ||
                typeof typedObj["collate"] === "function") &&
            typeof typedObj["collate"]["name"] === "string" &&
            (typedObj["collate"]["symbol"] === null ||
                typedObj["collate"]["symbol"] === "=")) &&
        (typeof typedObj["name"] === "undefined" ||
            typeof typedObj["name"] === "string")
    )
}

export function isDataType(obj: unknown): obj is DataType {
    const typedObj = obj as DataType
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["dataType"] === "string" &&
        (typeof typedObj["length"] === "undefined" ||
            typeof typedObj["length"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === true) &&
        (typeof typedObj["scale"] === "undefined" ||
            typeof typedObj["scale"] === "number") &&
        (typeof typedObj["suffix"] === "undefined" ||
            typedObj["suffix"] === null ||
            isTimezone(typedObj["suffix"]) as boolean ||
            isOnUpdateCurrentTimestamp(typedObj["suffix"]) as boolean ||
            Array.isArray(typedObj["suffix"]) &&
            typedObj["suffix"].every((e: any) =>
            (e === "UNSIGNED" ||
                e === "ZEROFILL")
            )) &&
        (typeof typedObj["array"] === "undefined" ||
            typedObj["array"] === "one" ||
            typedObj["array"] === "two") &&
        (typeof typedObj["expr"] === "undefined" ||
            isBinary(typedObj["expr"]) as boolean ||
            isUnary(typedObj["expr"]) as boolean ||
            isExprList(typedObj["expr"]) as boolean) &&
        (typeof typedObj["quoted"] === "undefined" ||
            typeof typedObj["quoted"] === "string")
    )
}

export function isOnUpdateCurrentTimestamp(obj: unknown): obj is OnUpdateCurrentTimestamp {
    const typedObj = obj as OnUpdateCurrentTimestamp
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "on_update_current_timestamp" &&
        typedObj["keyword"] === "on update" &&
        isFunction(typedObj["expr"]) as boolean
    )
}

export function isLiteralNotNull(obj: unknown): obj is LiteralNotNull {
    const typedObj = obj as LiteralNotNull
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "not null" &&
        typedObj["value"] === "not null"
    )
}

export function isLiteralNull(obj: unknown): obj is LiteralNull {
    const typedObj = obj as LiteralNull
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "null" &&
        (typedObj["value"] === null ||
            typedObj["value"] === "null")
    )
}

export function isColumnConstraint(obj: unknown): obj is ColumnConstraint {
    const typedObj = obj as ColumnConstraint
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["default_val"] !== null &&
            typeof typedObj["default_val"] === "object" ||
            typeof typedObj["default_val"] === "function") &&
        typedObj["default_val"]["type"] === "default" &&
        isExpressionValue(typedObj["default_val"]["value"]) as boolean &&
        (isLiteralNotNull(typedObj["nullable"]) as boolean ||
            isLiteralNull(typedObj["nullable"]) as boolean)
    )
}

export function isColumnDefinitionOptList(obj: unknown): obj is ColumnDefinitionOptList {
    const typedObj = obj as ColumnDefinitionOptList
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["nullable"] === "undefined" ||
            isLiteralNotNull(typedObj["nullable"]) as boolean ||
            isLiteralNull(typedObj["nullable"]) as boolean) &&
        (typeof typedObj["default_val"] === "undefined" ||
            (typedObj["default_val"] !== null &&
                typeof typedObj["default_val"] === "object" ||
                typeof typedObj["default_val"] === "function") &&
            typedObj["default_val"]["type"] === "default" &&
            isExpressionValue(typedObj["default_val"]["value"]) as boolean) &&
        (typeof typedObj["auto_increment"] === "undefined" ||
            typedObj["auto_increment"] === "auto_increment") &&
        (typeof typedObj["unique"] === "undefined" ||
            typedObj["unique"] === "unique" ||
            typedObj["unique"] === "unique key") &&
        (typeof typedObj["primary"] === "undefined" ||
            typedObj["primary"] === "key" ||
            typedObj["primary"] === "primary key") &&
        (typeof typedObj["comment"] === "undefined" ||
            isKeywordComment(typedObj["comment"]) as boolean) &&
        (typeof typedObj["collate"] === "undefined" ||
            isCollateExpr(typedObj["collate"]) as boolean) &&
        (typeof typedObj["column_format"] === "undefined" ||
            (typedObj["column_format"] !== null &&
                typeof typedObj["column_format"] === "object" ||
                typeof typedObj["column_format"] === "function") &&
            typeof typedObj["column_format"]["type"] === "string" &&
            typeof typedObj["column_format"]["value"] === "string") &&
        (typeof typedObj["storage"] === "undefined" ||
            (typedObj["storage"] !== null &&
                typeof typedObj["storage"] === "object" ||
                typeof typedObj["storage"] === "function") &&
            typeof typedObj["storage"]["type"] === "string" &&
            typeof typedObj["storage"]["value"] === "string") &&
        (typeof typedObj["reference_definition"] === "undefined" ||
            isReferenceDefinition(typedObj["reference_definition"]) as boolean) &&
        (typeof typedObj["character_set"] === "undefined" ||
            (typedObj["character_set"] !== null &&
                typeof typedObj["character_set"] === "object" ||
                typeof typedObj["character_set"] === "function") &&
            typedObj["character_set"]["type"] === "CHARACTER SET" &&
            (typedObj["character_set"]["value"] !== null &&
                typeof typedObj["character_set"]["value"] === "object" ||
                typeof typedObj["character_set"]["value"] === "function") &&
            (typedObj["character_set"]["value"]["type"] === "string" ||
                typedObj["character_set"]["value"]["type"] === "number" ||
                typedObj["character_set"]["value"]["type"] === "boolean" ||
                typedObj["character_set"]["value"]["type"] === "backticks_quote_string" ||
                typedObj["character_set"]["value"]["type"] === "regex_string" ||
                typedObj["character_set"]["value"]["type"] === "hex_string" ||
                typedObj["character_set"]["value"]["type"] === "full_hex_string" ||
                typedObj["character_set"]["value"]["type"] === "natural_string" ||
                typedObj["character_set"]["value"]["type"] === "bit_string" ||
                typedObj["character_set"]["value"]["type"] === "double_quote_string" ||
                typedObj["character_set"]["value"]["type"] === "single_quote_string" ||
                typedObj["character_set"]["value"]["type"] === "bool" ||
                typedObj["character_set"]["value"]["type"] === "null" ||
                typedObj["character_set"]["value"]["type"] === "star" ||
                typedObj["character_set"]["value"]["type"] === "param" ||
                typedObj["character_set"]["value"]["type"] === "origin" ||
                typedObj["character_set"]["value"]["type"] === "date" ||
                typedObj["character_set"]["value"]["type"] === "datetime" ||
                typedObj["character_set"]["value"]["type"] === "default" ||
                typedObj["character_set"]["value"]["type"] === "time" ||
                typedObj["character_set"]["value"]["type"] === "timestamp" ||
                typedObj["character_set"]["value"]["type"] === "var_string") &&
            (typeof typedObj["character_set"]["value"]["value"] === "string" ||
                typeof typedObj["character_set"]["value"]["value"] === "number" ||
                typedObj["character_set"]["value"]["value"] === false ||
                typedObj["character_set"]["value"]["value"] === true) &&
            (typedObj["character_set"]["symbol"] === null ||
                typedObj["character_set"]["symbol"] === "=")) &&
        (typeof typedObj["check"] === "undefined" ||
            (typedObj["check"] !== null &&
                typeof typedObj["check"] === "object" ||
                typeof typedObj["check"] === "function") &&
            typedObj["check"]["type"] === "check" &&
            isBinary(typedObj["check"]["expr"]) as boolean) &&
        (typeof typedObj["generated"] === "undefined" ||
            (typedObj["generated"] !== null &&
                typeof typedObj["generated"] === "object" ||
                typeof typedObj["generated"] === "function") &&
            typedObj["generated"]["type"] === "generated" &&
            isExpressionValue(typedObj["generated"]["expr"]) as boolean &&
            typeof typedObj["generated"]["value"] === "string" &&
            (typeof typedObj["generated"]["storage_type"] === "undefined" ||
                typedObj["generated"]["storage_type"] === "stored" ||
                typedObj["generated"]["storage_type"] === "virtual"))
    )
}

export function isReferenceDefinition(obj: unknown): obj is ReferenceDefinition {
    const typedObj = obj as ReferenceDefinition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["definition"] === "undefined" ||
            Array.isArray(typedObj["definition"]) &&
            typedObj["definition"].every((e: any) =>
                isColumnRefItem(e) as boolean
            )) &&
        (typeof typedObj["table"] === "undefined" ||
            Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
                isFrom(e) as boolean
            )) &&
        (typeof typedObj["keyword"] === "undefined" ||
            typeof typedObj["keyword"] === "string") &&
        (typeof typedObj["match"] === "undefined" ||
            typedObj["match"] === null ||
            typeof typedObj["match"] === "string") &&
        Array.isArray(typedObj["on_action"]) &&
        typedObj["on_action"].every((e: any) =>
            isOnReference(e) as boolean
        )
    )
}

export function isOnReference(obj: unknown): obj is OnReference {
    const typedObj = obj as OnReference
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "on update" ||
            typedObj["type"] === "on delete" ||
            typedObj["type"] === "on_reference") &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === "on update" ||
            typedObj["keyword"] === "on delete") &&
        ((typedObj["value"] !== null &&
            typeof typedObj["value"] === "object" ||
            typeof typedObj["value"] === "function") &&
            (typedObj["value"]["type"] === "string" ||
                typedObj["value"]["type"] === "number" ||
                typedObj["value"]["type"] === "boolean" ||
                typedObj["value"]["type"] === "backticks_quote_string" ||
                typedObj["value"]["type"] === "regex_string" ||
                typedObj["value"]["type"] === "hex_string" ||
                typedObj["value"]["type"] === "full_hex_string" ||
                typedObj["value"]["type"] === "natural_string" ||
                typedObj["value"]["type"] === "bit_string" ||
                typedObj["value"]["type"] === "double_quote_string" ||
                typedObj["value"]["type"] === "single_quote_string" ||
                typedObj["value"]["type"] === "bool" ||
                typedObj["value"]["type"] === "null" ||
                typedObj["value"]["type"] === "star" ||
                typedObj["value"]["type"] === "param" ||
                typedObj["value"]["type"] === "origin" ||
                typedObj["value"]["type"] === "date" ||
                typedObj["value"]["type"] === "datetime" ||
                typedObj["value"]["type"] === "default" ||
                typedObj["value"]["type"] === "time" ||
                typedObj["value"]["type"] === "timestamp" ||
                typedObj["value"]["type"] === "var_string") &&
            (typeof typedObj["value"]["value"] === "string" ||
                typeof typedObj["value"]["value"] === "number" ||
                typedObj["value"]["value"] === false ||
                typedObj["value"]["value"] === true) ||
            typedObj["value"] === "restrict" ||
            typedObj["value"] === "cascade" ||
            typedObj["value"] === "set null" ||
            typedObj["value"] === "no action" ||
            typedObj["value"] === "set default")
    )
}

export function isCreateColumnDefinition(obj: unknown): obj is CreateColumnDefinition {
    const typedObj = obj as CreateColumnDefinition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isColumnRefItem(typedObj["column"]) as boolean &&
        isDataType(typedObj["definition"]) as boolean &&
        typedObj["resource"] === "column" &&
        isColumnDefinitionOptList(typedObj) as boolean
    )
}

export function isIndexType(obj: unknown): obj is IndexType {
    const typedObj = obj as IndexType
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "using" &&
        (typedObj["type"] === "btree" ||
            typedObj["type"] === "hash" ||
            typedObj["type"] === "gist" ||
            typedObj["type"] === "gin")
    )
}

export function isIndexOption(obj: unknown): obj is IndexOption {
    const typedObj = obj as IndexOption
    return (
        ((typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
            typedObj["type"] === "key_block_size" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === "=") &&
            isValue(typedObj["expr"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "using" &&
            (typedObj["type"] === "btree" ||
                typedObj["type"] === "hash"))
    )
}

export function isCreateIndexDefinition(obj: unknown): obj is CreateIndexDefinition {
    const typedObj = obj as CreateIndexDefinition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["index"] === null ||
            typeof typedObj["index"] === "string") &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        (typedObj["keyword"] === "index" ||
            typedObj["keyword"] === "key") &&
        (typedObj["index_type"] === null ||
            isIndexType(typedObj["index_type"]) as boolean) &&
        typedObj["resource"] === "index" &&
        (typedObj["index_options"] === null ||
            Array.isArray(typedObj["index_options"]) &&
            typedObj["index_options"].every((e: any) =>
                isIndexOption(e) as boolean
            ))
    )
}

export function isCreateFulltextSpatialIndexDefinition(obj: unknown): obj is CreateFulltextSpatialIndexDefinition {
    const typedObj = obj as CreateFulltextSpatialIndexDefinition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["index"] === "undefined" ||
            typedObj["index"] === null ||
            typeof typedObj["index"] === "string") &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === "fulltext" ||
            typedObj["keyword"] === "spatial" ||
            typedObj["keyword"] === "fulltext key" ||
            typedObj["keyword"] === "spatial key" ||
            typedObj["keyword"] === "fulltext index" ||
            typedObj["keyword"] === "spatial index") &&
        (typeof typedObj["index_options"] === "undefined" ||
            typedObj["index_options"] === null ||
            Array.isArray(typedObj["index_options"]) &&
            typedObj["index_options"].every((e: any) =>
                isIndexOption(e) as boolean
            )) &&
        typedObj["resource"] === "index"
    )
}

export function isConstraintName(obj: unknown): obj is ConstraintName {
    const typedObj = obj as ConstraintName
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "constraint" &&
        typeof typedObj["constraint"] === "string"
    )
}

export function isCreateConstraintPrimary(obj: unknown): obj is CreateConstraintPrimary {
    const typedObj = obj as CreateConstraintPrimary
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["constraint"] === "undefined" ||
            typedObj["constraint"] === null ||
            typeof typedObj["constraint"] === "string") &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        typedObj["constraint_type"] === "primary key" &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === null ||
            typedObj["keyword"] === "constraint") &&
        (typeof typedObj["index_type"] === "undefined" ||
            typedObj["index_type"] === null ||
            isIndexType(typedObj["index_type"]) as boolean) &&
        typedObj["resource"] === "constraint" &&
        (typeof typedObj["index_options"] === "undefined" ||
            typedObj["index_options"] === null ||
            Array.isArray(typedObj["index_options"]) &&
            typedObj["index_options"].every((e: any) =>
                isIndexOption(e) as boolean
            ))
    )
}

export function isCreateConstraintUnique(obj: unknown): obj is CreateConstraintUnique {
    const typedObj = obj as CreateConstraintUnique
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["constraint"] === "undefined" ||
            typedObj["constraint"] === null ||
            typeof typedObj["constraint"] === "string") &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        (typedObj["constraint_type"] === "unique" ||
            typedObj["constraint_type"] === "unique key" ||
            typedObj["constraint_type"] === "unique index") &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === null ||
            typedObj["keyword"] === "constraint") &&
        (typeof typedObj["index_type"] === "undefined" ||
            typedObj["index_type"] === null ||
            isIndexType(typedObj["index_type"]) as boolean) &&
        (typeof typedObj["index"] === "undefined" ||
            typedObj["index"] === null ||
            typeof typedObj["index"] === "string") &&
        typedObj["resource"] === "constraint" &&
        (typeof typedObj["index_options"] === "undefined" ||
            typedObj["index_options"] === null ||
            Array.isArray(typedObj["index_options"]) &&
            typedObj["index_options"].every((e: any) =>
                isIndexOption(e) as boolean
            ))
    )
}

export function isCreateConstraintForeign(obj: unknown): obj is CreateConstraintForeign {
    const typedObj = obj as CreateConstraintForeign
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["constraint"] === "undefined" ||
            typedObj["constraint"] === null ||
            typeof typedObj["constraint"] === "string") &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        (typedObj["constraint_type"] === "foreign key" ||
            typedObj["constraint_type"] === "FOREIGN KEY") &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === null ||
            typedObj["keyword"] === "constraint") &&
        (typeof typedObj["index"] === "undefined" ||
            typedObj["index"] === null ||
            typeof typedObj["index"] === "string") &&
        typedObj["resource"] === "constraint" &&
        (typeof typedObj["reference_definition"] === "undefined" ||
            isReferenceDefinition(typedObj["reference_definition"]) as boolean)
    )
}

export function isCreateConstraintCheck(obj: unknown): obj is CreateConstraintCheck {
    const typedObj = obj as CreateConstraintCheck
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typeof typedObj["constraint"] === "undefined" ||
            typedObj["constraint"] === null ||
            typeof typedObj["constraint"] === "string") &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isBinary(e) as boolean
        ) &&
        typedObj["constraint_type"] === "check" &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === null ||
            typedObj["keyword"] === "constraint") &&
        typedObj["resource"] === "constraint" &&
        (typeof typedObj["index_type"] === "undefined" ||
            typedObj["index_type"] === null ||
            isIndexType(typedObj["index_type"]) as boolean)
    )
}

export function isCreateConstraintDefinition(obj: unknown): obj is CreateConstraintDefinition {
    const typedObj = obj as CreateConstraintDefinition
    return (
        (isCreateConstraintPrimary(typedObj) as boolean ||
            isCreateConstraintUnique(typedObj) as boolean ||
            isCreateConstraintForeign(typedObj) as boolean ||
            isCreateConstraintCheck(typedObj) as boolean)
    )
}

export function isCreateDefinition(obj: unknown): obj is CreateDefinition {
    const typedObj = obj as CreateDefinition
    return (
        (isCreateColumnDefinition(typedObj) as boolean ||
            isCreateIndexDefinition(typedObj) as boolean ||
            isCreateFulltextSpatialIndexDefinition(typedObj) as boolean ||
            isCreateConstraintPrimary(typedObj) as boolean ||
            isCreateConstraintUnique(typedObj) as boolean ||
            isCreateConstraintForeign(typedObj) as boolean ||
            isCreateConstraintCheck(typedObj) as boolean)
    )
}

export function isCreateTable(obj: unknown): obj is CreateTable {
    const typedObj = obj as CreateTable
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "table" &&
        (typedObj["temporary"] === null ||
            typedObj["temporary"] === "temporary") &&
        (Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["db"] === null ||
                    typeof e["db"] === "string") &&
                typeof e["table"] === "string"
            ) ||
            (typedObj["table"] !== null &&
                typeof typedObj["table"] === "object" ||
                typeof typedObj["table"] === "function") &&
            (typedObj["table"]["db"] === null ||
                typeof typedObj["table"]["db"] === "string") &&
            typeof typedObj["table"]["table"] === "string") &&
        (typedObj["if_not_exists"] === null ||
            typedObj["if_not_exists"] === "IF NOT EXISTS") &&
        (typeof typedObj["like"] === "undefined" ||
            typedObj["like"] === null ||
            (typedObj["like"] !== null &&
                typeof typedObj["like"] === "object" ||
                typeof typedObj["like"] === "function") &&
            typedObj["like"]["type"] === "like" &&
            Array.isArray(typedObj["like"]["table"]) &&
            typedObj["like"]["table"].every((e: any) =>
                isFrom(e) as boolean
            ) &&
            (typeof typedObj["like"]["parentheses"] === "undefined" ||
                typedObj["like"]["parentheses"] === false ||
                typedObj["like"]["parentheses"] === true)) &&
        (typeof typedObj["ignore_replace"] === "undefined" ||
            typedObj["ignore_replace"] === null ||
            typedObj["ignore_replace"] === "replace" ||
            typedObj["ignore_replace"] === "ignore") &&
        (typeof typedObj["as"] === "undefined" ||
            typedObj["as"] === null ||
            typeof typedObj["as"] === "string") &&
        (typeof typedObj["query_expr"] === "undefined" ||
            typedObj["query_expr"] === null ||
            isSelect(typedObj["query_expr"]) as boolean) &&
        (typeof typedObj["create_definitions"] === "undefined" ||
            typedObj["create_definitions"] === null ||
            Array.isArray(typedObj["create_definitions"]) &&
            typedObj["create_definitions"].every((e: any) =>
                isCreateDefinition(e) as boolean
            )) &&
        (typeof typedObj["table_options"] === "undefined" ||
            typedObj["table_options"] === null ||
            Array.isArray(typedObj["table_options"]) &&
            typedObj["table_options"].every((e: any) =>
                isTableOption(e) as boolean
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreateDatabase(obj: unknown): obj is CreateDatabase {
    const typedObj = obj as CreateDatabase
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "database" &&
        (typeof typedObj["if_not_exists"] === "undefined" ||
            typedObj["if_not_exists"] === null ||
            typedObj["if_not_exists"] === "IF NOT EXISTS") &&
        (typeof typedObj["database"] === "undefined" ||
            typeof typedObj["database"] === "string" ||
            (typedObj["database"] !== null &&
                typeof typedObj["database"] === "object" ||
                typeof typedObj["database"] === "function") &&
            Array.isArray(typedObj["database"]["schema"]) &&
            typedObj["database"]["schema"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["type"] === "string" ||
                    e["type"] === "number" ||
                    e["type"] === "boolean" ||
                    e["type"] === "backticks_quote_string" ||
                    e["type"] === "regex_string" ||
                    e["type"] === "hex_string" ||
                    e["type"] === "full_hex_string" ||
                    e["type"] === "natural_string" ||
                    e["type"] === "bit_string" ||
                    e["type"] === "double_quote_string" ||
                    e["type"] === "single_quote_string" ||
                    e["type"] === "bool" ||
                    e["type"] === "null" ||
                    e["type"] === "star" ||
                    e["type"] === "param" ||
                    e["type"] === "origin" ||
                    e["type"] === "date" ||
                    e["type"] === "datetime" ||
                    e["type"] === "default" ||
                    e["type"] === "time" ||
                    e["type"] === "timestamp" ||
                    e["type"] === "var_string") &&
                (typeof e["value"] === "string" ||
                    typeof e["value"] === "number" ||
                    e["value"] === false ||
                    e["value"] === true)
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreateSchema(obj: unknown): obj is CreateSchema {
    const typedObj = obj as CreateSchema
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "schema" &&
        (typeof typedObj["if_not_exists"] === "undefined" ||
            typedObj["if_not_exists"] === null ||
            typedObj["if_not_exists"] === "IF NOT EXISTS") &&
        (typeof typedObj["database"] === "undefined" ||
            typeof typedObj["database"] === "string" ||
            (typedObj["database"] !== null &&
                typeof typedObj["database"] === "object" ||
                typeof typedObj["database"] === "function") &&
            Array.isArray(typedObj["database"]["schema"]) &&
            typedObj["database"]["schema"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["type"] === "string" ||
                    e["type"] === "number" ||
                    e["type"] === "boolean" ||
                    e["type"] === "backticks_quote_string" ||
                    e["type"] === "regex_string" ||
                    e["type"] === "hex_string" ||
                    e["type"] === "full_hex_string" ||
                    e["type"] === "natural_string" ||
                    e["type"] === "bit_string" ||
                    e["type"] === "double_quote_string" ||
                    e["type"] === "single_quote_string" ||
                    e["type"] === "bool" ||
                    e["type"] === "null" ||
                    e["type"] === "star" ||
                    e["type"] === "param" ||
                    e["type"] === "origin" ||
                    e["type"] === "date" ||
                    e["type"] === "datetime" ||
                    e["type"] === "default" ||
                    e["type"] === "time" ||
                    e["type"] === "timestamp" ||
                    e["type"] === "var_string") &&
                (typeof e["value"] === "string" ||
                    typeof e["value"] === "number" ||
                    e["value"] === false ||
                    e["value"] === true)
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreateIndex(obj: unknown): obj is CreateIndex {
    const typedObj = obj as CreateIndex
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "index" &&
        (typeof typedObj["index_using"] === "undefined" ||
            typedObj["index_using"] === null ||
            (typedObj["index_using"] !== null &&
                typeof typedObj["index_using"] === "object" ||
                typeof typedObj["index_using"] === "function") &&
            typedObj["index_using"]["keyword"] === "using" &&
            (typedObj["index_using"]["type"] === "btree" ||
                typedObj["index_using"]["type"] === "hash")) &&
        (typeof typedObj["index"] === "undefined" ||
            typedObj["index"] === null ||
            typeof typedObj["index"] === "string" ||
            (typedObj["index"] !== null &&
                typeof typedObj["index"] === "object" ||
                typeof typedObj["index"] === "function") &&
            (typedObj["index"]["schema"] === null ||
                typeof typedObj["index"]["schema"] === "string") &&
            typeof typedObj["index"]["name"] === "string") &&
        (typeof typedObj["on_kw"] === "undefined" ||
            typedObj["on_kw"] === null ||
            typedObj["on_kw"] === "on") &&
        (typeof typedObj["table"] === "undefined" ||
            Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["db"] === null ||
                    typeof e["db"] === "string") &&
                typeof e["table"] === "string"
            ) ||
            (typedObj["table"] !== null &&
                typeof typedObj["table"] === "object" ||
                typeof typedObj["table"] === "function") &&
            (typedObj["table"]["db"] === null ||
                typeof typedObj["table"]["db"] === "string") &&
            typeof typedObj["table"]["table"] === "string") &&
        (typeof typedObj["index_columns"] === "undefined" ||
            typedObj["index_columns"] === null ||
            Array.isArray(typedObj["index_columns"]) &&
            typedObj["index_columns"].every((e: any) =>
                isColumnRefItem(e) as boolean
            )) &&
        (typeof typedObj["index_type"] === "undefined" ||
            typedObj["index_type"] === null ||
            typedObj["index_type"] === "unique" ||
            typedObj["index_type"] === "fulltext" ||
            typedObj["index_type"] === "spatial") &&
        (typeof typedObj["index_options"] === "undefined" ||
            typedObj["index_options"] === null ||
            Array.isArray(typedObj["index_options"]) &&
            typedObj["index_options"].every((e: any) =>
                isIndexOption(e) as boolean
            )) &&
        (typeof typedObj["algorithm_option"] === "undefined" ||
            typedObj["algorithm_option"] === null ||
            (typedObj["algorithm_option"] !== null &&
                typeof typedObj["algorithm_option"] === "object" ||
                typeof typedObj["algorithm_option"] === "function") &&
            typedObj["algorithm_option"]["type"] === "alter" &&
            typedObj["algorithm_option"]["keyword"] === "algorithm" &&
            typedObj["algorithm_option"]["resource"] === "algorithm" &&
            (typedObj["algorithm_option"]["symbol"] === null ||
                typedObj["algorithm_option"]["symbol"] === "=") &&
            typeof typedObj["algorithm_option"]["algorithm"] === "string") &&
        (typeof typedObj["lock_option"] === "undefined" ||
            typedObj["lock_option"] === null ||
            (typedObj["lock_option"] !== null &&
                typeof typedObj["lock_option"] === "object" ||
                typeof typedObj["lock_option"] === "function") &&
            typedObj["lock_option"]["type"] === "alter" &&
            typedObj["lock_option"]["keyword"] === "lock" &&
            typedObj["lock_option"]["resource"] === "lock" &&
            (typedObj["lock_option"]["symbol"] === null ||
                typedObj["lock_option"]["symbol"] === "=") &&
            typeof typedObj["lock_option"]["lock"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreateView(obj: unknown): obj is CreateView {
    const typedObj = obj as CreateView
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "view" &&
        (typeof typedObj["replace"] === "undefined" ||
            typedObj["replace"] === null ||
            typedObj["replace"] === false ||
            typedObj["replace"] === true) &&
        (typeof typedObj["algorithm"] === "undefined" ||
            typedObj["algorithm"] === null ||
            typedObj["algorithm"] === "undefined" ||
            typedObj["algorithm"] === "merge" ||
            typedObj["algorithm"] === "temptable") &&
        (typeof typedObj["definer"] === "undefined" ||
            typedObj["definer"] === null ||
            isBinary(typedObj["definer"]) as boolean) &&
        (typeof typedObj["sql_security"] === "undefined" ||
            typedObj["sql_security"] === null ||
            typedObj["sql_security"] === "definer" ||
            typedObj["sql_security"] === "invoker") &&
        (typeof typedObj["view"] === "undefined" ||
            typedObj["view"] === null ||
            isBaseFrom(typedObj["view"]) as boolean ||
            isJoin(typedObj["view"]) as boolean ||
            isTableExpr(typedObj["view"]) as boolean ||
            isDual(typedObj["view"]) as boolean ||
            (typedObj["view"] !== null &&
                typeof typedObj["view"] === "object" ||
                typeof typedObj["view"] === "function") &&
            (typedObj["view"]["db"] === null ||
                typeof typedObj["view"]["db"] === "string") &&
            typeof typedObj["view"]["view"] === "string") &&
        (typeof typedObj["columns"] === "undefined" ||
            typedObj["columns"] === null ||
            Array.isArray(typedObj["columns"]) &&
            typedObj["columns"].every((e: any) =>
                typeof e === "string"
            )) &&
        (typeof typedObj["select"] === "undefined" ||
            typedObj["select"] === null ||
            isSelect(typedObj["select"]) as boolean) &&
        (typeof typedObj["with"] === "undefined" ||
            typedObj["with"] === null ||
            typedObj["with"] === "cascaded" ||
            typedObj["with"] === "local") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreateTrigger(obj: unknown): obj is CreateTrigger {
    const typedObj = obj as CreateTrigger
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "trigger" &&
        (typeof typedObj["definer"] === "undefined" ||
            typedObj["definer"] === null ||
            isBinary(typedObj["definer"]) as boolean) &&
        (typeof typedObj["trigger"] === "undefined" ||
            (typedObj["trigger"] !== null &&
                typeof typedObj["trigger"] === "object" ||
                typeof typedObj["trigger"] === "function") &&
            (typedObj["trigger"]["db"] === null ||
                typeof typedObj["trigger"]["db"] === "string") &&
            typeof typedObj["trigger"]["table"] === "string") &&
        (typeof typedObj["time"] === "undefined" ||
            typeof typedObj["time"] === "string") &&
        (typeof typedObj["events"] === "undefined" ||
            typedObj["events"] === null ||
            Array.isArray(typedObj["events"]) &&
            typedObj["events"].every((e: any) =>
                isTriggerEvent(e) as boolean
            )) &&
        (typeof typedObj["table"] === "undefined" ||
            Array.isArray(typedObj["table"]) &&
            typedObj["table"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["db"] === null ||
                    typeof e["db"] === "string") &&
                typeof e["table"] === "string"
            ) ||
            (typedObj["table"] !== null &&
                typeof typedObj["table"] === "object" ||
                typeof typedObj["table"] === "function") &&
            (typedObj["table"]["db"] === null ||
                typeof typedObj["table"]["db"] === "string") &&
            typeof typedObj["table"]["table"] === "string") &&
        (typeof typedObj["for_each"] === "undefined" ||
            typedObj["for_each"] === null ||
            (typedObj["for_each"] !== null &&
                typeof typedObj["for_each"] === "object" ||
                typeof typedObj["for_each"] === "function") &&
            typeof typedObj["for_each"]["keyword"] === "string" &&
            typeof typedObj["for_each"]["args"] === "string" ||
            typedObj["for_each"] === "row" ||
            typedObj["for_each"] === "statement") &&
        (typeof typedObj["order"] === "undefined" ||
            typedObj["order"] === null ||
            (typedObj["order"] !== null &&
                typeof typedObj["order"] === "object" ||
                typeof typedObj["order"] === "function") &&
            (typedObj["order"]["keyword"] === "FOLLOWS" ||
                typedObj["order"]["keyword"] === "PRECEDES") &&
            typeof typedObj["order"]["trigger"] === "string") &&
        (typeof typedObj["execute"] === "undefined" ||
            typedObj["execute"] === null ||
            Array.isArray(typedObj["execute"]) &&
            typedObj["execute"].every((e: any) =>
                isSetList(e) as boolean
            ) ||
            (typedObj["execute"] !== null &&
                typeof typedObj["execute"] === "object" ||
                typeof typedObj["execute"] === "function") &&
            typedObj["execute"]["type"] === "set" &&
            Array.isArray(typedObj["execute"]["expr"]) &&
            typedObj["execute"]["expr"].every((e: any) =>
                isSetList(e) as boolean
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreateUser(obj: unknown): obj is CreateUser {
    const typedObj = obj as CreateUser
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "create" &&
        typedObj["keyword"] === "user" &&
        (typeof typedObj["if_not_exists"] === "undefined" ||
            typedObj["if_not_exists"] === null ||
            typedObj["if_not_exists"] === "IF NOT EXISTS") &&
        (typeof typedObj["user"] === "undefined" ||
            typedObj["user"] === null ||
            Array.isArray(typedObj["user"]) &&
            typedObj["user"].every((e: any) =>
                isUserAuthOption(e) as boolean
            )) &&
        (typeof typedObj["default_role"] === "undefined" ||
            typedObj["default_role"] === null ||
            Array.isArray(typedObj["default_role"]) &&
            typedObj["default_role"].every((e: any) =>
                typeof e === "string"
            )) &&
        (typeof typedObj["require"] === "undefined" ||
            typedObj["require"] === null ||
            isRequireOption(typedObj["require"]) as boolean) &&
        (typeof typedObj["resource_options"] === "undefined" ||
            typedObj["resource_options"] === null ||
            isResourceOption(typedObj["resource_options"]) as boolean) &&
        (typeof typedObj["password_options"] === "undefined" ||
            typedObj["password_options"] === null ||
            isPasswordOption(typedObj["password_options"]) as boolean) &&
        (typeof typedObj["lock_option_user"] === "undefined" ||
            typedObj["lock_option_user"] === null ||
            typedObj["lock_option_user"] === "account lock" ||
            typedObj["lock_option_user"] === "account unlock") &&
        (typeof typedObj["comment_user"] === "undefined" ||
            typedObj["comment_user"] === null ||
            typeof typedObj["comment_user"] === "string") &&
        (typeof typedObj["attribute"] === "undefined" ||
            typedObj["attribute"] === null ||
            typeof typedObj["attribute"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCreate(obj: unknown): obj is Create {
    const typedObj = obj as Create
    return (
        (isCreateTable(typedObj) as boolean ||
            isCreateDatabase(typedObj) as boolean ||
            isCreateSchema(typedObj) as boolean ||
            isCreateIndex(typedObj) as boolean ||
            isCreateView(typedObj) as boolean ||
            isCreateTrigger(typedObj) as boolean ||
            isCreateUser(typedObj) as boolean)
    )
}

export function isTriggerEvent(obj: unknown): obj is TriggerEvent {
    const typedObj = obj as TriggerEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["keyword"] === "insert" ||
            typedObj["keyword"] === "update" ||
            typedObj["keyword"] === "delete") &&
        (typeof typedObj["args"] === "undefined" ||
            Array.isArray(typedObj["args"]) &&
            typedObj["args"].every((e: any) =>
                isColumnRefItem(e) as boolean
            ))
    )
}

export function isUserAuthOption(obj: unknown): obj is UserAuthOption {
    const typedObj = obj as UserAuthOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["user"] !== null &&
            typeof typedObj["user"] === "object" ||
            typeof typedObj["user"] === "function") &&
        (typedObj["user"]["name"] !== null &&
            typeof typedObj["user"]["name"] === "object" ||
            typeof typedObj["user"]["name"] === "function") &&
        (typedObj["user"]["name"]["type"] === "string" ||
            typedObj["user"]["name"]["type"] === "number" ||
            typedObj["user"]["name"]["type"] === "boolean" ||
            typedObj["user"]["name"]["type"] === "backticks_quote_string" ||
            typedObj["user"]["name"]["type"] === "regex_string" ||
            typedObj["user"]["name"]["type"] === "hex_string" ||
            typedObj["user"]["name"]["type"] === "full_hex_string" ||
            typedObj["user"]["name"]["type"] === "natural_string" ||
            typedObj["user"]["name"]["type"] === "bit_string" ||
            typedObj["user"]["name"]["type"] === "double_quote_string" ||
            typedObj["user"]["name"]["type"] === "single_quote_string" ||
            typedObj["user"]["name"]["type"] === "bool" ||
            typedObj["user"]["name"]["type"] === "null" ||
            typedObj["user"]["name"]["type"] === "star" ||
            typedObj["user"]["name"]["type"] === "param" ||
            typedObj["user"]["name"]["type"] === "origin" ||
            typedObj["user"]["name"]["type"] === "date" ||
            typedObj["user"]["name"]["type"] === "datetime" ||
            typedObj["user"]["name"]["type"] === "default" ||
            typedObj["user"]["name"]["type"] === "time" ||
            typedObj["user"]["name"]["type"] === "timestamp" ||
            typedObj["user"]["name"]["type"] === "var_string") &&
        (typeof typedObj["user"]["name"]["value"] === "string" ||
            typeof typedObj["user"]["name"]["value"] === "number" ||
            typedObj["user"]["name"]["value"] === false ||
            typedObj["user"]["name"]["value"] === true) &&
        (typedObj["user"]["host"] !== null &&
            typeof typedObj["user"]["host"] === "object" ||
            typeof typedObj["user"]["host"] === "function") &&
        (typedObj["user"]["host"]["type"] === "string" ||
            typedObj["user"]["host"]["type"] === "number" ||
            typedObj["user"]["host"]["type"] === "boolean" ||
            typedObj["user"]["host"]["type"] === "backticks_quote_string" ||
            typedObj["user"]["host"]["type"] === "regex_string" ||
            typedObj["user"]["host"]["type"] === "hex_string" ||
            typedObj["user"]["host"]["type"] === "full_hex_string" ||
            typedObj["user"]["host"]["type"] === "natural_string" ||
            typedObj["user"]["host"]["type"] === "bit_string" ||
            typedObj["user"]["host"]["type"] === "double_quote_string" ||
            typedObj["user"]["host"]["type"] === "single_quote_string" ||
            typedObj["user"]["host"]["type"] === "bool" ||
            typedObj["user"]["host"]["type"] === "null" ||
            typedObj["user"]["host"]["type"] === "star" ||
            typedObj["user"]["host"]["type"] === "param" ||
            typedObj["user"]["host"]["type"] === "origin" ||
            typedObj["user"]["host"]["type"] === "date" ||
            typedObj["user"]["host"]["type"] === "datetime" ||
            typedObj["user"]["host"]["type"] === "default" ||
            typedObj["user"]["host"]["type"] === "time" ||
            typedObj["user"]["host"]["type"] === "timestamp" ||
            typedObj["user"]["host"]["type"] === "var_string") &&
        (typeof typedObj["user"]["host"]["value"] === "string" ||
            typeof typedObj["user"]["host"]["value"] === "number" ||
            typedObj["user"]["host"]["value"] === false ||
            typedObj["user"]["host"]["value"] === true) &&
        (typeof typedObj["auth_option"] === "undefined" ||
            typedObj["auth_option"] === null ||
            (typedObj["auth_option"] !== null &&
                typeof typedObj["auth_option"] === "object" ||
                typeof typedObj["auth_option"] === "function") &&
            typeof typedObj["auth_option"]["keyword"] === "string" &&
            (typeof typedObj["auth_option"]["auth_plugin"] === "undefined" ||
                typedObj["auth_option"]["auth_plugin"] === null ||
                typeof typedObj["auth_option"]["auth_plugin"] === "string") &&
            (typedObj["auth_option"]["value"] !== null &&
                typeof typedObj["auth_option"]["value"] === "object" ||
                typeof typedObj["auth_option"]["value"] === "function") &&
            (typedObj["auth_option"]["value"]["type"] === "string" ||
                typedObj["auth_option"]["value"]["type"] === "number" ||
                typedObj["auth_option"]["value"]["type"] === "boolean" ||
                typedObj["auth_option"]["value"]["type"] === "backticks_quote_string" ||
                typedObj["auth_option"]["value"]["type"] === "regex_string" ||
                typedObj["auth_option"]["value"]["type"] === "hex_string" ||
                typedObj["auth_option"]["value"]["type"] === "full_hex_string" ||
                typedObj["auth_option"]["value"]["type"] === "natural_string" ||
                typedObj["auth_option"]["value"]["type"] === "bit_string" ||
                typedObj["auth_option"]["value"]["type"] === "double_quote_string" ||
                typedObj["auth_option"]["value"]["type"] === "single_quote_string" ||
                typedObj["auth_option"]["value"]["type"] === "bool" ||
                typedObj["auth_option"]["value"]["type"] === "null" ||
                typedObj["auth_option"]["value"]["type"] === "star" ||
                typedObj["auth_option"]["value"]["type"] === "param" ||
                typedObj["auth_option"]["value"]["type"] === "origin" ||
                typedObj["auth_option"]["value"]["type"] === "date" ||
                typedObj["auth_option"]["value"]["type"] === "datetime" ||
                typedObj["auth_option"]["value"]["type"] === "default" ||
                typedObj["auth_option"]["value"]["type"] === "time" ||
                typedObj["auth_option"]["value"]["type"] === "timestamp" ||
                typedObj["auth_option"]["value"]["type"] === "var_string") &&
            (typeof typedObj["auth_option"]["value"]["value"] === "string" ||
                typeof typedObj["auth_option"]["value"]["value"] === "number" ||
                typedObj["auth_option"]["value"]["value"] === false ||
                typedObj["auth_option"]["value"]["value"] === true) &&
            (typedObj["auth_option"]["value"] !== null &&
                typeof typedObj["auth_option"]["value"] === "object" ||
                typeof typedObj["auth_option"]["value"] === "function") &&
            (typeof typedObj["auth_option"]["value"]["prefix"] === "undefined" ||
                typeof typedObj["auth_option"]["value"]["prefix"] === "string"))
    )
}

export function isRequireOption(obj: unknown): obj is RequireOption {
    const typedObj = obj as RequireOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "require" &&
        (typedObj["value"] !== null &&
            typeof typedObj["value"] === "object" ||
            typeof typedObj["value"] === "function") &&
        (typedObj["value"]["type"] === "string" ||
            typedObj["value"]["type"] === "number" ||
            typedObj["value"]["type"] === "boolean" ||
            typedObj["value"]["type"] === "backticks_quote_string" ||
            typedObj["value"]["type"] === "regex_string" ||
            typedObj["value"]["type"] === "hex_string" ||
            typedObj["value"]["type"] === "full_hex_string" ||
            typedObj["value"]["type"] === "natural_string" ||
            typedObj["value"]["type"] === "bit_string" ||
            typedObj["value"]["type"] === "double_quote_string" ||
            typedObj["value"]["type"] === "single_quote_string" ||
            typedObj["value"]["type"] === "bool" ||
            typedObj["value"]["type"] === "null" ||
            typedObj["value"]["type"] === "star" ||
            typedObj["value"]["type"] === "param" ||
            typedObj["value"]["type"] === "origin" ||
            typedObj["value"]["type"] === "date" ||
            typedObj["value"]["type"] === "datetime" ||
            typedObj["value"]["type"] === "default" ||
            typedObj["value"]["type"] === "time" ||
            typedObj["value"]["type"] === "timestamp" ||
            typedObj["value"]["type"] === "var_string") &&
        (typeof typedObj["value"]["value"] === "string" ||
            typeof typedObj["value"]["value"] === "number" ||
            typedObj["value"]["value"] === false ||
            typedObj["value"]["value"] === true)
    )
}

export function isResourceOption(obj: unknown): obj is ResourceOption {
    const typedObj = obj as ResourceOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "with" &&
        Array.isArray(typedObj["value"]) &&
        typedObj["value"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e["type"] === "string" &&
            typeof e["value"] === "number" &&
            typeof e["prefix"] === "string"
        )
    )
}

export function isPasswordOption(obj: unknown): obj is PasswordOption {
    const typedObj = obj as PasswordOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "password_expire" ||
            typedObj["type"] === "password_history" ||
            typedObj["type"] === "password_reuse_interval" ||
            typedObj["type"] === "password_require_current") &&
        (typedObj["value"] === null ||
            typeof typedObj["value"] === "string" ||
            typeof typedObj["value"] === "number")
    )
}

export function isTableOption(obj: unknown): obj is TableOption {
    const typedObj = obj as TableOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["keyword"] === "string" &&
        (typeof typedObj["symbol"] === "undefined" ||
            typedObj["symbol"] === "=") &&
        (typeof typedObj["value"] === "string" ||
            typeof typedObj["value"] === "number" ||
            isTableColumnAst(typedObj["value"]) as boolean ||
            isColumnRefItem(typedObj["value"]) as boolean ||
            isStar(typedObj["value"]) as boolean ||
            isCase(typedObj["value"]) as boolean ||
            isCast(typedObj["value"]) as boolean ||
            isAggrFunc(typedObj["value"]) as boolean ||
            isFunction(typedObj["value"]) as boolean ||
            isInterval(typedObj["value"]) as boolean ||
            isParam(typedObj["value"]) as boolean ||
            isVar(typedObj["value"]) as boolean ||
            isValue(typedObj["value"]) as boolean ||
            isBinary(typedObj["value"]) as boolean ||
            isUnary(typedObj["value"]) as boolean)
    )
}

export function isDropTable(obj: unknown): obj is DropTable {
    const typedObj = obj as DropTable
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "drop" &&
        typedObj["keyword"] === "table" &&
        Array.isArray(typedObj["name"]) &&
        typedObj["name"].every((e: any) =>
            isFrom(e) as boolean
        ) &&
        (typedObj["prefix"] === null ||
            typedObj["prefix"] === "if exists") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isDropDatabase(obj: unknown): obj is DropDatabase {
    const typedObj = obj as DropDatabase
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "drop" &&
        (typedObj["keyword"] === "database" ||
            typedObj["keyword"] === "schema") &&
        typeof typedObj["name"] === "string" &&
        (typedObj["prefix"] === null ||
            typedObj["prefix"] === "if exists") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isDropView(obj: unknown): obj is DropView {
    const typedObj = obj as DropView
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "drop" &&
        typedObj["keyword"] === "view" &&
        Array.isArray(typedObj["name"]) &&
        typedObj["name"].every((e: any) =>
            isFrom(e) as boolean
        ) &&
        (typedObj["prefix"] === null ||
            typedObj["prefix"] === "if exists") &&
        (typedObj["options"] === null ||
            typedObj["options"] === "restrict" ||
            typedObj["options"] === "cascade") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isDropIndex(obj: unknown): obj is DropIndex {
    const typedObj = obj as DropIndex
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "drop" &&
        typedObj["keyword"] === "index" &&
        isColumnRefItem(typedObj["name"]) as boolean &&
        isFrom(typedObj["table"]) as boolean &&
        (typedObj["options"] === null ||
            typedObj["options"] === "restrict" ||
            typedObj["options"] === "cascade") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isDropTrigger(obj: unknown): obj is DropTrigger {
    const typedObj = obj as DropTrigger
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "drop" &&
        typedObj["keyword"] === "trigger" &&
        Array.isArray(typedObj["name"]) &&
        typedObj["name"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["schema"] === null ||
                typeof e["schema"] === "string") &&
            typeof e["trigger"] === "string"
        ) &&
        (typedObj["prefix"] === null ||
            typedObj["prefix"] === "if exists") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isDrop(obj: unknown): obj is Drop {
    const typedObj = obj as Drop
    return (
        (isDropTable(typedObj) as boolean ||
            isDropDatabase(typedObj) as boolean ||
            isDropView(typedObj) as boolean ||
            isDropIndex(typedObj) as boolean ||
            isDropTrigger(typedObj) as boolean)
    )
}

export function isShow(obj: unknown): obj is Show {
    const typedObj = obj as Show
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typeof typedObj["keyword"] === "string" &&
        (typeof typedObj["suffix"] === "undefined" ||
            typeof typedObj["suffix"] === "string") &&
        (typeof typedObj["from"] === "undefined" ||
            isBaseFrom(typedObj["from"]) as boolean ||
            isJoin(typedObj["from"]) as boolean ||
            isTableExpr(typedObj["from"]) as boolean ||
            isDual(typedObj["from"]) as boolean) &&
        (typeof typedObj["where"] === "undefined" ||
            typedObj["where"] === null ||
            isFunction(typedObj["where"]) as boolean ||
            isBinary(typedObj["where"]) as boolean) &&
        (typeof typedObj["like"] === "undefined" ||
            typedObj["like"] === null ||
            (typedObj["like"] !== null &&
                typeof typedObj["like"] === "object" ||
                typeof typedObj["like"] === "function") &&
            typedObj["like"]["type"] === "like" &&
            typeof typedObj["like"]["value"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isDesc(obj: unknown): obj is Desc {
    const typedObj = obj as Desc
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "desc" &&
        typeof typedObj["table"] === "string" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isExplain(obj: unknown): obj is Explain {
    const typedObj = obj as Explain
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "explain" &&
        (isSelect(typedObj["expr"]) as boolean ||
            isInsert_Replace(typedObj["expr"]) as boolean ||
            isUpdate(typedObj["expr"]) as boolean ||
            isDelete(typedObj["expr"]) as boolean) &&
        (typeof typedObj["format"] === "undefined" ||
            typeof typedObj["format"] === "string") &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isCall(obj: unknown): obj is Call {
    const typedObj = obj as Call
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "call" &&
        isFunction(typedObj["expr"]) as boolean &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isSet(obj: unknown): obj is Set {
    const typedObj = obj as Set
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "set" &&
        (typeof typedObj["keyword"] === "undefined" ||
            typedObj["keyword"] === null ||
            typeof typedObj["keyword"] === "string") &&
        Array.isArray(typedObj["expr"]) &&
        typedObj["expr"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            e["type"] === "assign" &&
            isVar(e["left"]) as boolean &&
            typeof e["symbol"] === "string" &&
            isExpressionValue(e["right"]) as boolean
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isLock(obj: unknown): obj is Lock {
    const typedObj = obj as Lock
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "lock" &&
        typedObj["keyword"] === "tables" &&
        Array.isArray(typedObj["tables"]) &&
        typedObj["tables"].every((e: any) =>
            isLockTable(e) as boolean
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isLockTable(obj: unknown): obj is LockTable {
    const typedObj = obj as LockTable
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isFrom(typedObj["table"]) as boolean &&
        (typedObj["lock_type"] !== null &&
            typeof typedObj["lock_type"] === "object" ||
            typeof typedObj["lock_type"] === "function") &&
        (typedObj["lock_type"]["type"] === "read" ||
            typedObj["lock_type"]["type"] === "write") &&
        (typeof typedObj["lock_type"]["suffix"] === "undefined" ||
            typedObj["lock_type"]["suffix"] === null) &&
        (typeof typedObj["lock_type"]["prefix"] === "undefined" ||
            typedObj["lock_type"]["prefix"] === null)
    )
}

export function isUnlock(obj: unknown): obj is Unlock {
    const typedObj = obj as Unlock
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "unlock" &&
        typedObj["keyword"] === "tables" &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isGrant(obj: unknown): obj is Grant {
    const typedObj = obj as Grant
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "grant" &&
        typedObj["keyword"] === "priv" &&
        Array.isArray(typedObj["objects"]) &&
        typedObj["objects"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["priv"] !== null &&
                typeof e["priv"] === "object" ||
                typeof e["priv"] === "function") &&
            (e["priv"]["type"] === "string" ||
                e["priv"]["type"] === "number" ||
                e["priv"]["type"] === "boolean" ||
                e["priv"]["type"] === "backticks_quote_string" ||
                e["priv"]["type"] === "regex_string" ||
                e["priv"]["type"] === "hex_string" ||
                e["priv"]["type"] === "full_hex_string" ||
                e["priv"]["type"] === "natural_string" ||
                e["priv"]["type"] === "bit_string" ||
                e["priv"]["type"] === "double_quote_string" ||
                e["priv"]["type"] === "single_quote_string" ||
                e["priv"]["type"] === "bool" ||
                e["priv"]["type"] === "null" ||
                e["priv"]["type"] === "star" ||
                e["priv"]["type"] === "param" ||
                e["priv"]["type"] === "origin" ||
                e["priv"]["type"] === "date" ||
                e["priv"]["type"] === "datetime" ||
                e["priv"]["type"] === "default" ||
                e["priv"]["type"] === "time" ||
                e["priv"]["type"] === "timestamp" ||
                e["priv"]["type"] === "var_string") &&
            (typeof e["priv"]["value"] === "string" ||
                typeof e["priv"]["value"] === "number" ||
                e["priv"]["value"] === false ||
                e["priv"]["value"] === true) &&
            (e["columns"] === null ||
                Array.isArray(e["columns"]) &&
                e["columns"].every((e: any) =>
                    isColumnRefItem(e) as boolean
                ))
        ) &&
        (typedObj["on"] !== null &&
            typeof typedObj["on"] === "object" ||
            typeof typedObj["on"] === "function") &&
        (typedObj["on"]["object_type"] === null ||
            typedObj["on"]["object_type"] === "function" ||
            typedObj["on"]["object_type"] === "table" ||
            typedObj["on"]["object_type"] === "procedure") &&
        Array.isArray(typedObj["on"]["priv_level"]) &&
        typedObj["on"]["priv_level"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            typeof e["prefix"] === "string" &&
            typeof e["name"] === "string"
        ) &&
        (typedObj["to_from"] === "TO" ||
            typedObj["to_from"] === "FROM") &&
        Array.isArray(typedObj["user_or_roles"]) &&
        typedObj["user_or_roles"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["name"] !== null &&
                typeof e["name"] === "object" ||
                typeof e["name"] === "function") &&
            (e["name"]["type"] === "string" ||
                e["name"]["type"] === "number" ||
                e["name"]["type"] === "boolean" ||
                e["name"]["type"] === "backticks_quote_string" ||
                e["name"]["type"] === "regex_string" ||
                e["name"]["type"] === "hex_string" ||
                e["name"]["type"] === "full_hex_string" ||
                e["name"]["type"] === "natural_string" ||
                e["name"]["type"] === "bit_string" ||
                e["name"]["type"] === "double_quote_string" ||
                e["name"]["type"] === "single_quote_string" ||
                e["name"]["type"] === "bool" ||
                e["name"]["type"] === "null" ||
                e["name"]["type"] === "star" ||
                e["name"]["type"] === "param" ||
                e["name"]["type"] === "origin" ||
                e["name"]["type"] === "date" ||
                e["name"]["type"] === "datetime" ||
                e["name"]["type"] === "default" ||
                e["name"]["type"] === "time" ||
                e["name"]["type"] === "timestamp" ||
                e["name"]["type"] === "var_string") &&
            (typeof e["name"]["value"] === "string" ||
                typeof e["name"]["value"] === "number" ||
                e["name"]["value"] === false ||
                e["name"]["value"] === true) &&
            (e["host"] === null ||
                (e["host"] !== null &&
                    typeof e["host"] === "object" ||
                    typeof e["host"] === "function") &&
                (e["host"]["type"] === "string" ||
                    e["host"]["type"] === "number" ||
                    e["host"]["type"] === "boolean" ||
                    e["host"]["type"] === "backticks_quote_string" ||
                    e["host"]["type"] === "regex_string" ||
                    e["host"]["type"] === "hex_string" ||
                    e["host"]["type"] === "full_hex_string" ||
                    e["host"]["type"] === "natural_string" ||
                    e["host"]["type"] === "bit_string" ||
                    e["host"]["type"] === "double_quote_string" ||
                    e["host"]["type"] === "single_quote_string" ||
                    e["host"]["type"] === "bool" ||
                    e["host"]["type"] === "null" ||
                    e["host"]["type"] === "star" ||
                    e["host"]["type"] === "param" ||
                    e["host"]["type"] === "origin" ||
                    e["host"]["type"] === "date" ||
                    e["host"]["type"] === "datetime" ||
                    e["host"]["type"] === "default" ||
                    e["host"]["type"] === "time" ||
                    e["host"]["type"] === "timestamp" ||
                    e["host"]["type"] === "var_string") &&
                (typeof e["host"]["value"] === "string" ||
                    typeof e["host"]["value"] === "number" ||
                    e["host"]["value"] === false ||
                    e["host"]["value"] === true))
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isLoadData(obj: unknown): obj is LoadData {
    const typedObj = obj as LoadData
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "load_data" &&
        (typeof typedObj["mode"] === "undefined" ||
            typedObj["mode"] === null ||
            typeof typedObj["mode"] === "string") &&
        (typeof typedObj["local"] === "undefined" ||
            typedObj["local"] === null ||
            typedObj["local"] === "local") &&
        (typedObj["file"] !== null &&
            typeof typedObj["file"] === "object" ||
            typeof typedObj["file"] === "function") &&
        (typedObj["file"]["type"] === "string" ||
            typedObj["file"]["type"] === "number" ||
            typedObj["file"]["type"] === "boolean" ||
            typedObj["file"]["type"] === "backticks_quote_string" ||
            typedObj["file"]["type"] === "regex_string" ||
            typedObj["file"]["type"] === "hex_string" ||
            typedObj["file"]["type"] === "full_hex_string" ||
            typedObj["file"]["type"] === "natural_string" ||
            typedObj["file"]["type"] === "bit_string" ||
            typedObj["file"]["type"] === "double_quote_string" ||
            typedObj["file"]["type"] === "single_quote_string" ||
            typedObj["file"]["type"] === "bool" ||
            typedObj["file"]["type"] === "null" ||
            typedObj["file"]["type"] === "star" ||
            typedObj["file"]["type"] === "param" ||
            typedObj["file"]["type"] === "origin" ||
            typedObj["file"]["type"] === "date" ||
            typedObj["file"]["type"] === "datetime" ||
            typedObj["file"]["type"] === "default" ||
            typedObj["file"]["type"] === "time" ||
            typedObj["file"]["type"] === "timestamp" ||
            typedObj["file"]["type"] === "var_string") &&
        (typeof typedObj["file"]["value"] === "string" ||
            typeof typedObj["file"]["value"] === "number" ||
            typedObj["file"]["value"] === false ||
            typedObj["file"]["value"] === true) &&
        (typeof typedObj["replace_ignore"] === "undefined" ||
            typedObj["replace_ignore"] === null ||
            typedObj["replace_ignore"] === "replace" ||
            typedObj["replace_ignore"] === "ignore") &&
        (typedObj["table"] !== null &&
            typeof typedObj["table"] === "object" ||
            typeof typedObj["table"] === "function") &&
        (typedObj["table"]["db"] === null ||
            typeof typedObj["table"]["db"] === "string") &&
        typeof typedObj["table"]["table"] === "string" &&
        (typeof typedObj["partition"] === "undefined" ||
            typedObj["partition"] === null ||
            Array.isArray(typedObj["partition"]) &&
            typedObj["partition"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["type"] === "string" ||
                    e["type"] === "number" ||
                    e["type"] === "boolean" ||
                    e["type"] === "backticks_quote_string" ||
                    e["type"] === "regex_string" ||
                    e["type"] === "hex_string" ||
                    e["type"] === "full_hex_string" ||
                    e["type"] === "natural_string" ||
                    e["type"] === "bit_string" ||
                    e["type"] === "double_quote_string" ||
                    e["type"] === "single_quote_string" ||
                    e["type"] === "bool" ||
                    e["type"] === "null" ||
                    e["type"] === "star" ||
                    e["type"] === "param" ||
                    e["type"] === "origin" ||
                    e["type"] === "date" ||
                    e["type"] === "datetime" ||
                    e["type"] === "default" ||
                    e["type"] === "time" ||
                    e["type"] === "timestamp" ||
                    e["type"] === "var_string") &&
                typeof e["value"] === "string"
            )) &&
        (typeof typedObj["character_set"] === "undefined" ||
            typedObj["character_set"] === null ||
            typeof typedObj["character_set"] === "string") &&
        (typeof typedObj["fields"] === "undefined" ||
            typedObj["fields"] === null ||
            isLoadDataField(typedObj["fields"]) as boolean) &&
        (typeof typedObj["lines"] === "undefined" ||
            typedObj["lines"] === null ||
            isLoadDataLine(typedObj["lines"]) as boolean) &&
        (typeof typedObj["ignore"] === "undefined" ||
            typedObj["ignore"] === null ||
            typeof typedObj["ignore"] === "number") &&
        (typeof typedObj["column"] === "undefined" ||
            typedObj["column"] === null ||
            Array.isArray(typedObj["column"]) &&
            typedObj["column"].every((e: any) =>
                isColumnRefItem(e) as boolean
            )) &&
        (typeof typedObj["set"] === "undefined" ||
            typedObj["set"] === null ||
            Array.isArray(typedObj["set"]) &&
            typedObj["set"].every((e: any) =>
                isSetList(e) as boolean
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isLoadDataField(obj: unknown): obj is LoadDataField {
    const typedObj = obj as LoadDataField
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "FIELDS" &&
        (typedObj["terminated"] === null ||
            (typedObj["terminated"] !== null &&
                typeof typedObj["terminated"] === "object" ||
                typeof typedObj["terminated"] === "function") &&
            (typedObj["terminated"]["type"] === "string" ||
                typedObj["terminated"]["type"] === "number" ||
                typedObj["terminated"]["type"] === "boolean" ||
                typedObj["terminated"]["type"] === "backticks_quote_string" ||
                typedObj["terminated"]["type"] === "regex_string" ||
                typedObj["terminated"]["type"] === "hex_string" ||
                typedObj["terminated"]["type"] === "full_hex_string" ||
                typedObj["terminated"]["type"] === "natural_string" ||
                typedObj["terminated"]["type"] === "bit_string" ||
                typedObj["terminated"]["type"] === "double_quote_string" ||
                typedObj["terminated"]["type"] === "single_quote_string" ||
                typedObj["terminated"]["type"] === "bool" ||
                typedObj["terminated"]["type"] === "null" ||
                typedObj["terminated"]["type"] === "star" ||
                typedObj["terminated"]["type"] === "param" ||
                typedObj["terminated"]["type"] === "origin" ||
                typedObj["terminated"]["type"] === "date" ||
                typedObj["terminated"]["type"] === "datetime" ||
                typedObj["terminated"]["type"] === "default" ||
                typedObj["terminated"]["type"] === "time" ||
                typedObj["terminated"]["type"] === "timestamp" ||
                typedObj["terminated"]["type"] === "var_string") &&
            (typeof typedObj["terminated"]["value"] === "string" ||
                typeof typedObj["terminated"]["value"] === "number" ||
                typedObj["terminated"]["value"] === false ||
                typedObj["terminated"]["value"] === true) &&
            (typedObj["terminated"] !== null &&
                typeof typedObj["terminated"] === "object" ||
                typeof typedObj["terminated"] === "function") &&
            typeof typedObj["terminated"]["prefix"] === "string") &&
        (typedObj["enclosed"] === null ||
            (typedObj["enclosed"] !== null &&
                typeof typedObj["enclosed"] === "object" ||
                typeof typedObj["enclosed"] === "function") &&
            (typedObj["enclosed"]["type"] === "string" ||
                typedObj["enclosed"]["type"] === "number" ||
                typedObj["enclosed"]["type"] === "boolean" ||
                typedObj["enclosed"]["type"] === "backticks_quote_string" ||
                typedObj["enclosed"]["type"] === "regex_string" ||
                typedObj["enclosed"]["type"] === "hex_string" ||
                typedObj["enclosed"]["type"] === "full_hex_string" ||
                typedObj["enclosed"]["type"] === "natural_string" ||
                typedObj["enclosed"]["type"] === "bit_string" ||
                typedObj["enclosed"]["type"] === "double_quote_string" ||
                typedObj["enclosed"]["type"] === "single_quote_string" ||
                typedObj["enclosed"]["type"] === "bool" ||
                typedObj["enclosed"]["type"] === "null" ||
                typedObj["enclosed"]["type"] === "star" ||
                typedObj["enclosed"]["type"] === "param" ||
                typedObj["enclosed"]["type"] === "origin" ||
                typedObj["enclosed"]["type"] === "date" ||
                typedObj["enclosed"]["type"] === "datetime" ||
                typedObj["enclosed"]["type"] === "default" ||
                typedObj["enclosed"]["type"] === "time" ||
                typedObj["enclosed"]["type"] === "timestamp" ||
                typedObj["enclosed"]["type"] === "var_string") &&
            (typeof typedObj["enclosed"]["value"] === "string" ||
                typeof typedObj["enclosed"]["value"] === "number" ||
                typedObj["enclosed"]["value"] === false ||
                typedObj["enclosed"]["value"] === true) &&
            (typedObj["enclosed"] !== null &&
                typeof typedObj["enclosed"] === "object" ||
                typeof typedObj["enclosed"] === "function") &&
            typeof typedObj["enclosed"]["prefix"] === "string") &&
        (typedObj["escaped"] === null ||
            (typedObj["escaped"] !== null &&
                typeof typedObj["escaped"] === "object" ||
                typeof typedObj["escaped"] === "function") &&
            (typedObj["escaped"]["type"] === "string" ||
                typedObj["escaped"]["type"] === "number" ||
                typedObj["escaped"]["type"] === "boolean" ||
                typedObj["escaped"]["type"] === "backticks_quote_string" ||
                typedObj["escaped"]["type"] === "regex_string" ||
                typedObj["escaped"]["type"] === "hex_string" ||
                typedObj["escaped"]["type"] === "full_hex_string" ||
                typedObj["escaped"]["type"] === "natural_string" ||
                typedObj["escaped"]["type"] === "bit_string" ||
                typedObj["escaped"]["type"] === "double_quote_string" ||
                typedObj["escaped"]["type"] === "single_quote_string" ||
                typedObj["escaped"]["type"] === "bool" ||
                typedObj["escaped"]["type"] === "null" ||
                typedObj["escaped"]["type"] === "star" ||
                typedObj["escaped"]["type"] === "param" ||
                typedObj["escaped"]["type"] === "origin" ||
                typedObj["escaped"]["type"] === "date" ||
                typedObj["escaped"]["type"] === "datetime" ||
                typedObj["escaped"]["type"] === "default" ||
                typedObj["escaped"]["type"] === "time" ||
                typedObj["escaped"]["type"] === "timestamp" ||
                typedObj["escaped"]["type"] === "var_string") &&
            (typeof typedObj["escaped"]["value"] === "string" ||
                typeof typedObj["escaped"]["value"] === "number" ||
                typedObj["escaped"]["value"] === false ||
                typedObj["escaped"]["value"] === true) &&
            (typedObj["escaped"] !== null &&
                typeof typedObj["escaped"] === "object" ||
                typeof typedObj["escaped"] === "function") &&
            typeof typedObj["escaped"]["prefix"] === "string")
    )
}

export function isLoadDataLine(obj: unknown): obj is LoadDataLine {
    const typedObj = obj as LoadDataLine
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "LINES" &&
        (typeof typedObj["starting"] === "undefined" ||
            (typedObj["starting"] !== null &&
                typeof typedObj["starting"] === "object" ||
                typeof typedObj["starting"] === "function") &&
            (typedObj["starting"]["type"] === "string" ||
                typedObj["starting"]["type"] === "number" ||
                typedObj["starting"]["type"] === "boolean" ||
                typedObj["starting"]["type"] === "backticks_quote_string" ||
                typedObj["starting"]["type"] === "regex_string" ||
                typedObj["starting"]["type"] === "hex_string" ||
                typedObj["starting"]["type"] === "full_hex_string" ||
                typedObj["starting"]["type"] === "natural_string" ||
                typedObj["starting"]["type"] === "bit_string" ||
                typedObj["starting"]["type"] === "double_quote_string" ||
                typedObj["starting"]["type"] === "single_quote_string" ||
                typedObj["starting"]["type"] === "bool" ||
                typedObj["starting"]["type"] === "null" ||
                typedObj["starting"]["type"] === "star" ||
                typedObj["starting"]["type"] === "param" ||
                typedObj["starting"]["type"] === "origin" ||
                typedObj["starting"]["type"] === "date" ||
                typedObj["starting"]["type"] === "datetime" ||
                typedObj["starting"]["type"] === "default" ||
                typedObj["starting"]["type"] === "time" ||
                typedObj["starting"]["type"] === "timestamp" ||
                typedObj["starting"]["type"] === "var_string") &&
            (typeof typedObj["starting"]["value"] === "string" ||
                typeof typedObj["starting"]["value"] === "number" ||
                typedObj["starting"]["value"] === false ||
                typedObj["starting"]["value"] === true) &&
            (typedObj["starting"] !== null &&
                typeof typedObj["starting"] === "object" ||
                typeof typedObj["starting"] === "function") &&
            typeof typedObj["starting"]["prefix"] === "string") &&
        (typedObj["terminated"] === null ||
            (typedObj["terminated"] !== null &&
                typeof typedObj["terminated"] === "object" ||
                typeof typedObj["terminated"] === "function") &&
            (typedObj["terminated"]["type"] === "string" ||
                typedObj["terminated"]["type"] === "number" ||
                typedObj["terminated"]["type"] === "boolean" ||
                typedObj["terminated"]["type"] === "backticks_quote_string" ||
                typedObj["terminated"]["type"] === "regex_string" ||
                typedObj["terminated"]["type"] === "hex_string" ||
                typedObj["terminated"]["type"] === "full_hex_string" ||
                typedObj["terminated"]["type"] === "natural_string" ||
                typedObj["terminated"]["type"] === "bit_string" ||
                typedObj["terminated"]["type"] === "double_quote_string" ||
                typedObj["terminated"]["type"] === "single_quote_string" ||
                typedObj["terminated"]["type"] === "bool" ||
                typedObj["terminated"]["type"] === "null" ||
                typedObj["terminated"]["type"] === "star" ||
                typedObj["terminated"]["type"] === "param" ||
                typedObj["terminated"]["type"] === "origin" ||
                typedObj["terminated"]["type"] === "date" ||
                typedObj["terminated"]["type"] === "datetime" ||
                typedObj["terminated"]["type"] === "default" ||
                typedObj["terminated"]["type"] === "time" ||
                typedObj["terminated"]["type"] === "timestamp" ||
                typedObj["terminated"]["type"] === "var_string") &&
            (typeof typedObj["terminated"]["value"] === "string" ||
                typeof typedObj["terminated"]["value"] === "number" ||
                typedObj["terminated"]["value"] === false ||
                typedObj["terminated"]["value"] === true) &&
            (typedObj["terminated"] !== null &&
                typeof typedObj["terminated"] === "object" ||
                typeof typedObj["terminated"] === "function") &&
            typeof typedObj["terminated"]["prefix"] === "string")
    )
}

export function isTruncate(obj: unknown): obj is Truncate {
    const typedObj = obj as Truncate
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "truncate" &&
        typedObj["keyword"] === "table" &&
        Array.isArray(typedObj["name"]) &&
        typedObj["name"].every((e: any) =>
            isFrom(e) as boolean
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isRename(obj: unknown): obj is Rename {
    const typedObj = obj as Rename
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "rename" &&
        Array.isArray(typedObj["table"]) &&
        typedObj["table"].every((e: any) =>
            Array.isArray(e) &&
            (e[0] !== null &&
                typeof e[0] === "object" ||
                typeof e[0] === "function") &&
            (e[0]["db"] === null ||
                typeof e[0]["db"] === "string") &&
            typeof e[0]["table"] === "string" &&
            (e[1] !== null &&
                typeof e[1] === "object" ||
                typeof e[1] === "function") &&
            (e[1]["db"] === null ||
                typeof e[1]["db"] === "string") &&
            typeof e[1]["table"] === "string"
        ) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isTransaction(obj: unknown): obj is Transaction {
    const typedObj = obj as Transaction
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "transaction" &&
        (typedObj["expr"] !== null &&
            typeof typedObj["expr"] === "object" ||
            typeof typedObj["expr"] === "function") &&
        (typedObj["expr"]["action"] !== null &&
            typeof typedObj["expr"]["action"] === "object" ||
            typeof typedObj["expr"]["action"] === "function") &&
        (typedObj["expr"]["action"]["type"] === "string" ||
            typedObj["expr"]["action"]["type"] === "number" ||
            typedObj["expr"]["action"]["type"] === "boolean" ||
            typedObj["expr"]["action"]["type"] === "backticks_quote_string" ||
            typedObj["expr"]["action"]["type"] === "regex_string" ||
            typedObj["expr"]["action"]["type"] === "hex_string" ||
            typedObj["expr"]["action"]["type"] === "full_hex_string" ||
            typedObj["expr"]["action"]["type"] === "natural_string" ||
            typedObj["expr"]["action"]["type"] === "bit_string" ||
            typedObj["expr"]["action"]["type"] === "double_quote_string" ||
            typedObj["expr"]["action"]["type"] === "single_quote_string" ||
            typedObj["expr"]["action"]["type"] === "bool" ||
            typedObj["expr"]["action"]["type"] === "null" ||
            typedObj["expr"]["action"]["type"] === "star" ||
            typedObj["expr"]["action"]["type"] === "param" ||
            typedObj["expr"]["action"]["type"] === "origin" ||
            typedObj["expr"]["action"]["type"] === "date" ||
            typedObj["expr"]["action"]["type"] === "datetime" ||
            typedObj["expr"]["action"]["type"] === "default" ||
            typedObj["expr"]["action"]["type"] === "time" ||
            typedObj["expr"]["action"]["type"] === "timestamp" ||
            typedObj["expr"]["action"]["type"] === "var_string") &&
        (typedObj["expr"]["action"]["value"] === "start" ||
            typedObj["expr"]["action"]["value"] === "begin" ||
            typedObj["expr"]["action"]["value"] === "commit" ||
            typedObj["expr"]["action"]["value"] === "rollback" ||
            typedObj["expr"]["action"]["value"] === "START" ||
            typedObj["expr"]["action"]["value"] === "COMMIT" ||
            typedObj["expr"]["action"]["value"] === "ROLLBACK") &&
        (typeof typedObj["expr"]["keyword"] === "undefined" ||
            typedObj["expr"]["keyword"] === "TRANSACTION") &&
        (typeof typedObj["expr"]["modes"] === "undefined" ||
            typedObj["expr"]["modes"] === null ||
            Array.isArray(typedObj["expr"]["modes"]) &&
            typedObj["expr"]["modes"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["type"] === "string" ||
                    e["type"] === "number" ||
                    e["type"] === "boolean" ||
                    e["type"] === "backticks_quote_string" ||
                    e["type"] === "regex_string" ||
                    e["type"] === "hex_string" ||
                    e["type"] === "full_hex_string" ||
                    e["type"] === "natural_string" ||
                    e["type"] === "bit_string" ||
                    e["type"] === "double_quote_string" ||
                    e["type"] === "single_quote_string" ||
                    e["type"] === "bool" ||
                    e["type"] === "null" ||
                    e["type"] === "star" ||
                    e["type"] === "param" ||
                    e["type"] === "origin" ||
                    e["type"] === "date" ||
                    e["type"] === "datetime" ||
                    e["type"] === "default" ||
                    e["type"] === "time" ||
                    e["type"] === "timestamp" ||
                    e["type"] === "var_string") &&
                (typeof e["value"] === "string" ||
                    typeof e["value"] === "number" ||
                    e["value"] === false ||
                    e["value"] === true)
            )) &&
        (typeof typedObj["loc"] === "undefined" ||
            (typedObj["loc"] !== null &&
                typeof typedObj["loc"] === "object" ||
                typeof typedObj["loc"] === "function") &&
            (typedObj["loc"]["start"] !== null &&
                typeof typedObj["loc"]["start"] === "object" ||
                typeof typedObj["loc"]["start"] === "function") &&
            typeof typedObj["loc"]["start"]["line"] === "number" &&
            typeof typedObj["loc"]["start"]["column"] === "number" &&
            typeof typedObj["loc"]["start"]["offset"] === "number" &&
            (typedObj["loc"]["end"] !== null &&
                typeof typedObj["loc"]["end"] === "object" ||
                typeof typedObj["loc"]["end"] === "function") &&
            typeof typedObj["loc"]["end"]["line"] === "number" &&
            typeof typedObj["loc"]["end"]["column"] === "number" &&
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isAST(obj: unknown): obj is AST {
    const typedObj = obj as AST
    return (
        (isSelect(typedObj) as boolean ||
            isInsert_Replace(typedObj) as boolean ||
            isUpdate(typedObj) as boolean ||
            isDelete(typedObj) as boolean ||
            isAlter(typedObj) as boolean ||
            isUse(typedObj) as boolean ||
            isCreateTable(typedObj) as boolean ||
            isCreateDatabase(typedObj) as boolean ||
            isCreateSchema(typedObj) as boolean ||
            isCreateIndex(typedObj) as boolean ||
            isCreateView(typedObj) as boolean ||
            isCreateTrigger(typedObj) as boolean ||
            isCreateUser(typedObj) as boolean ||
            isDropTable(typedObj) as boolean ||
            isDropDatabase(typedObj) as boolean ||
            isDropView(typedObj) as boolean ||
            isDropIndex(typedObj) as boolean ||
            isDropTrigger(typedObj) as boolean ||
            isShow(typedObj) as boolean ||
            isDesc(typedObj) as boolean ||
            isExplain(typedObj) as boolean ||
            isCall(typedObj) as boolean ||
            isSet(typedObj) as boolean ||
            isLock(typedObj) as boolean ||
            isUnlock(typedObj) as boolean ||
            isGrant(typedObj) as boolean ||
            isLoadData(typedObj) as boolean ||
            isTruncate(typedObj) as boolean ||
            isRename(typedObj) as boolean ||
            isTransaction(typedObj) as boolean)
    )
}
