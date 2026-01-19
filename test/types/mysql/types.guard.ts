/*
 * Generated type guards for "mysql.d.ts".
 * WARNING: Do not manually change this file.
 */
import { With, ParseOptions, Option, TableColumnAst, BaseFrom, Join, Values, TableExpr, Dual, From, LimitValue, Limit, OrderBy, ValueExpr, StringValue, OriginValue, DefaultValue, NumberValue, IntervalExprValue, SeparatorValue, SortDirection, ColumnRefItem, ColumnRef, SetList, InsertReplaceValue, Star, Case, Cast, AggrFunc, FunctionNameValue, FunctionName, Function, FulltextSearch, Column, Interval, Param, Var, Assign, Binary, Unary, Expr, ExtractFunc, ExpressionValue, ExprList, PartitionBy, WindowSpec, WindowFrameClause, AsWindowSpec, NamedWindowExpr, WindowExpr, Select, Insert_Replace, Update, Delete, Alter, AlterExpr, AlterColumnPosition, AlterAddColumn, AlterDropColumn, AlterModifyColumn, AlterChangeColumn, AlterRenameTable, AlterRenameColumn, AlterAddIndex, AlterDropIndex, AlterDropKey, AlterAddConstraint, AlterDropConstraint, AlterEnableConstraint, AlterDisableConstraint, AlterAddPartition, AlterDropPartition, AlterOperatePartition, AlterAlgorithm, AlterLock, AlterTableOption, Use, KeywordComment, CollateExpr, MysqlType, ConvertDataType, DataType, OnUpdateCurrentTimestamp, LiteralNotNull, LiteralNull, ColumnConstraint, ColumnDefinitionOptList, ReferenceDefinition, OnReference, CreateColumnDefinition, IndexType, IndexOption, CreateIndexDefinition, CreateFulltextSpatialIndexDefinition, ConstraintName, CreateConstraintPrimary, CreateConstraintUnique, CreateConstraintForeign, CreateConstraintCheck, CreateConstraintDefinition, CreateDefinition, CreateTable, DatabaseOption, CreateDatabase, CreateSchema, CreateIndex, CreateView, CreateTrigger, CreateUser, Create, TriggerEvent, UserAuthOption, RequireOption, ResourceOption, PasswordOption, TableOption, DropTable, DropDatabase, DropView, DropIndex, DropTrigger, Drop, ShowLogs, ShowTables, ShowSimple, ShowProcedureFunctionStatus, ShowBinlogEvents, ShowCharacterSet, ShowCollationDatabases, ShowColumnsIndexes, ShowCreateTable, ShowCreateView, ShowCreateEvent, ShowCreateTrigger, ShowCreateProcedure, ShowGrants, Show, Desc, Explain, Call, SetAssign, SetStatement, Lock, LockTable, Unlock, Grant, LoadData, LoadDataField, LoadDataLine, Truncate, Rename, Transaction, AST } from "./mysql";

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
            isShowLogs(typedObj["ast"]) as boolean ||
            isShowTables(typedObj["ast"]) as boolean ||
            isShowSimple(typedObj["ast"]) as boolean ||
            isShowProcedureFunctionStatus(typedObj["ast"]) as boolean ||
            isShowBinlogEvents(typedObj["ast"]) as boolean ||
            isShowCharacterSet(typedObj["ast"]) as boolean ||
            isShowCollationDatabases(typedObj["ast"]) as boolean ||
            isShowColumnsIndexes(typedObj["ast"]) as boolean ||
            isShowCreateTable(typedObj["ast"]) as boolean ||
            isShowCreateView(typedObj["ast"]) as boolean ||
            isShowCreateEvent(typedObj["ast"]) as boolean ||
            isShowCreateTrigger(typedObj["ast"]) as boolean ||
            isShowCreateProcedure(typedObj["ast"]) as boolean ||
            isShowGrants(typedObj["ast"]) as boolean ||
            isDesc(typedObj["ast"]) as boolean ||
            isExplain(typedObj["ast"]) as boolean ||
            isCall(typedObj["ast"]) as boolean ||
            isSetStatement(typedObj["ast"]) as boolean ||
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
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean) &&
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

export function isValues(obj: unknown): obj is Values {
    const typedObj = obj as Values
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "values" &&
        Array.isArray(typedObj["values"]) &&
        typedObj["values"].every((e: any) =>
            isExprList(e) as boolean
        ) &&
        (typeof typedObj["prefix"] === "undefined" ||
            typeof typedObj["prefix"] === "string")
    )
}

export function isTableExpr(obj: unknown): obj is TableExpr {
    const typedObj = obj as TableExpr
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (isValues(typedObj["expr"]) as boolean ||
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
            typeof typedObj["expr"]["parentheses"] === "boolean") &&
        (typedObj["as"] === null ||
            typeof typedObj["as"] === "string") &&
        (typeof typedObj["prefix"] === "undefined" ||
            typeof typedObj["prefix"] === "string")
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
        (typedObj["type"] === "number" ||
            typedObj["type"] === "bigint" ||
            typedObj["type"] === "single_quote_string" ||
            typedObj["type"] === "double_quote_string" ||
            typedObj["type"] === "bool" ||
            typedObj["type"] === "null" ||
            typedObj["type"] === "hex_string" ||
            typedObj["type"] === "full_hex_string" ||
            typedObj["type"] === "bit_string" ||
            typedObj["type"] === "natural_string" ||
            typedObj["type"] === "date" ||
            typedObj["type"] === "time" ||
            typedObj["type"] === "datetime" ||
            typedObj["type"] === "timestamp" ||
            typedObj["type"] === "param" ||
            typedObj["type"] === "star" ||
            typedObj["type"] === "origin" ||
            typedObj["type"] === "default") &&
        (typedObj["value"] === null ||
            typeof typedObj["value"] === "string" ||
            typeof typedObj["value"] === "number" ||
            typedObj["value"] === false ||
            typedObj["value"] === true) &&
        (typeof typedObj["suffix"] === "undefined" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            (typeof typedObj["suffix"]["collate"] === "undefined" ||
                isCollateExpr(typedObj["suffix"]["collate"]) as boolean))
    )
}

export function isStringValue(obj: unknown): obj is StringValue {
    const typedObj = obj as StringValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "single_quote_string" ||
            typedObj["type"] === "double_quote_string") &&
        typeof typedObj["value"] === "string"
    )
}

export function isOriginValue(obj: unknown): obj is OriginValue {
    const typedObj = obj as OriginValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "origin" &&
        typeof typedObj["value"] === "string"
    )
}

export function isDefaultValue(obj: unknown): obj is DefaultValue {
    const typedObj = obj as DefaultValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "default" &&
        typeof typedObj["value"] === "string"
    )
}

export function isNumberValue(obj: unknown): obj is NumberValue {
    const typedObj = obj as NumberValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "number" &&
        typeof typedObj["value"] === "number"
    )
}

export function isIntervalExprValue(obj: unknown): obj is IntervalExprValue {
    const typedObj = obj as IntervalExprValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "number" ||
            typedObj["type"] === "single_quote_string" ||
            typedObj["type"] === "double_quote_string") &&
        (typeof typedObj["value"] === "string" ||
            typeof typedObj["value"] === "number") &&
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

export function isSeparatorValue(obj: unknown): obj is SeparatorValue {
    const typedObj = obj as SeparatorValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "single_quote_string" ||
            typedObj["type"] === "double_quote_string") &&
        typeof typedObj["value"] === "string"
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
        typeof typedObj["column"] === "string" &&
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
        typeof typedObj["column"] === "string" &&
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
        (isTableColumnAst(typedObj["value"]) as boolean ||
            isValueExpr(typedObj["value"]) as boolean ||
            isColumnRefItem(typedObj["value"]) as boolean ||
            isCase(typedObj["value"]) as boolean ||
            isCast(typedObj["value"]) as boolean ||
            isAggrFunc(typedObj["value"]) as boolean ||
            isFunction(typedObj["value"]) as boolean ||
            isInterval(typedObj["value"]) as boolean ||
            isParam(typedObj["value"]) as boolean ||
            isVar(typedObj["value"]) as boolean ||
            isBinary(typedObj["value"]) as boolean ||
            isUnary(typedObj["value"]) as boolean ||
            isExtractFunc(typedObj["value"]) as boolean) &&
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
        (typedObj["expr"] === null ||
            isTableColumnAst(typedObj["expr"]) as boolean ||
            isValueExpr(typedObj["expr"]) as boolean ||
            isColumnRefItem(typedObj["expr"]) as boolean ||
            isCase(typedObj["expr"]) as boolean ||
            isCast(typedObj["expr"]) as boolean ||
            isAggrFunc(typedObj["expr"]) as boolean ||
            isFunction(typedObj["expr"]) as boolean ||
            isInterval(typedObj["expr"]) as boolean ||
            isParam(typedObj["expr"]) as boolean ||
            isVar(typedObj["expr"]) as boolean ||
            isBinary(typedObj["expr"]) as boolean ||
            isUnary(typedObj["expr"]) as boolean) &&
        Array.isArray(typedObj["args"]) &&
        typedObj["args"].every((e: any) =>
        ((e !== null &&
            typeof e === "object" ||
            typeof e === "function") &&
            (isTableColumnAst(e["cond"]) as boolean ||
                isValueExpr(e["cond"]) as boolean ||
                isColumnRefItem(e["cond"]) as boolean ||
                isCase(e["cond"]) as boolean ||
                isCast(e["cond"]) as boolean ||
                isAggrFunc(e["cond"]) as boolean ||
                isFunction(e["cond"]) as boolean ||
                isInterval(e["cond"]) as boolean ||
                isParam(e["cond"]) as boolean ||
                isVar(e["cond"]) as boolean ||
                isBinary(e["cond"]) as boolean ||
                isUnary(e["cond"]) as boolean ||
                isExprList(e["cond"]) as boolean) &&
            isExpressionValue(e["result"]) as boolean &&
            e["type"] === "when" ||
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            isExpressionValue(e["result"]) as boolean &&
            e["type"] === "else")
        ) &&
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean)
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
            (e["dataType"] === "CHAR" ||
                e["dataType"] === "VARCHAR" ||
                e["dataType"] === "BINARY" ||
                e["dataType"] === "VARBINARY" ||
                e["dataType"] === "TINYTEXT" ||
                e["dataType"] === "TEXT" ||
                e["dataType"] === "MEDIUMTEXT" ||
                e["dataType"] === "LONGTEXT" ||
                e["dataType"] === "TINYBLOB" ||
                e["dataType"] === "BLOB" ||
                e["dataType"] === "MEDIUMBLOB" ||
                e["dataType"] === "LONGBLOB" ||
                e["dataType"] === "TINYINT" ||
                e["dataType"] === "SMALLINT" ||
                e["dataType"] === "MEDIUMINT" ||
                e["dataType"] === "INT" ||
                e["dataType"] === "INTEGER" ||
                e["dataType"] === "BIGINT" ||
                e["dataType"] === "FLOAT" ||
                e["dataType"] === "DOUBLE" ||
                e["dataType"] === "DECIMAL" ||
                e["dataType"] === "NUMERIC" ||
                e["dataType"] === "BIT" ||
                e["dataType"] === "DATE" ||
                e["dataType"] === "TIME" ||
                e["dataType"] === "DATETIME" ||
                e["dataType"] === "TIMESTAMP" ||
                e["dataType"] === "YEAR" ||
                e["dataType"] === "BOOLEAN" ||
                e["dataType"] === "JSON" ||
                e["dataType"] === "ENUM" ||
                e["dataType"] === "SET" ||
                e["dataType"] === "GEOMETRY" ||
                e["dataType"] === "POINT" ||
                e["dataType"] === "LINESTRING" ||
                e["dataType"] === "POLYGON" ||
                e["dataType"] === "MULTIPOINT" ||
                e["dataType"] === "MULTILINESTRING" ||
                e["dataType"] === "MULTIPOLYGON" ||
                e["dataType"] === "GEOMETRYCOLLECTION" ||
                e["dataType"] === "VECTOR" ||
                e["dataType"] === "SIGNED" ||
                e["dataType"] === "UNSIGNED" ||
                e["dataType"] === "SIGNED INTEGER" ||
                e["dataType"] === "UNSIGNED INTEGER") &&
            (typeof e["quoted"] === "undefined" ||
                typeof e["quoted"] === "string")
        ) &&
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean)
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
        (isTableColumnAst(typedObj["args"]["expr"]) as boolean ||
            isValueExpr(typedObj["args"]["expr"]) as boolean ||
            isColumnRefItem(typedObj["args"]["expr"]) as boolean ||
            isStar(typedObj["args"]["expr"]) as boolean ||
            isCase(typedObj["args"]["expr"]) as boolean ||
            isCast(typedObj["args"]["expr"]) as boolean ||
            isAggrFunc(typedObj["args"]["expr"]) as boolean ||
            isFunction(typedObj["args"]["expr"]) as boolean ||
            isInterval(typedObj["args"]["expr"]) as boolean ||
            isParam(typedObj["args"]["expr"]) as boolean ||
            isVar(typedObj["args"]["expr"]) as boolean ||
            isBinary(typedObj["args"]["expr"]) as boolean ||
            isUnary(typedObj["args"]["expr"]) as boolean) &&
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
            isSeparatorValue(typedObj["args"]["separator"]["value"]) as boolean) &&
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

export function isFunctionNameValue(obj: unknown): obj is FunctionNameValue {
    const typedObj = obj as FunctionNameValue
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["type"] === "origin" ||
            typedObj["type"] === "default" ||
            typedObj["type"] === "backticks_quote_string") &&
        typeof typedObj["value"] === "string"
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
            isFunctionNameValue(e) as boolean
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
            typedObj["args"] === null ||
            isExprList(typedObj["args"]) as boolean) &&
        (typeof typedObj["over"] === "undefined" ||
            typedObj["over"] === null ||
            isOnUpdateCurrentTimestamp(typedObj["over"]) as boolean ||
            (typedObj["over"] !== null &&
                typeof typedObj["over"] === "object" ||
                typeof typedObj["over"] === "function") &&
            typedObj["over"]["type"] === "window" &&
            isAsWindowSpec(typedObj["over"]["as_window_specification"]) as boolean) &&
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean) &&
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

export function isFulltextSearch(obj: unknown): obj is FulltextSearch {
    const typedObj = obj as FulltextSearch
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "fulltext_search" &&
        typedObj["match"] === "match" &&
        Array.isArray(typedObj["columns"]) &&
        typedObj["columns"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        typedObj["against"] === "against" &&
        isExpressionValue(typedObj["expr"]) as boolean &&
        (typedObj["mode"] === null ||
            (typedObj["mode"] !== null &&
                typeof typedObj["mode"] === "object" ||
                typeof typedObj["mode"] === "function") &&
            typedObj["mode"]["type"] === "origin" &&
            typeof typedObj["mode"]["value"] === "string") &&
        (typeof typedObj["as"] === "undefined" ||
            typedObj["as"] === null ||
            typeof typedObj["as"] === "string")
    )
}

export function isColumn(obj: unknown): obj is Column {
    const typedObj = obj as Column
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (isTableColumnAst(typedObj["expr"]) as boolean ||
            isValueExpr(typedObj["expr"]) as boolean ||
            isColumnRefItem(typedObj["expr"]) as boolean ||
            isStar(typedObj["expr"]) as boolean ||
            isCase(typedObj["expr"]) as boolean ||
            isCast(typedObj["expr"]) as boolean ||
            isAggrFunc(typedObj["expr"]) as boolean ||
            isFunction(typedObj["expr"]) as boolean ||
            isFulltextSearch(typedObj["expr"]) as boolean ||
            isInterval(typedObj["expr"]) as boolean ||
            isParam(typedObj["expr"]) as boolean ||
            isVar(typedObj["expr"]) as boolean ||
            isAssign(typedObj["expr"]) as boolean ||
            isBinary(typedObj["expr"]) as boolean ||
            isUnary(typedObj["expr"]) as boolean ||
            isExtractFunc(typedObj["expr"]) as boolean) &&
        (typedObj["as"] === null ||
            typeof typedObj["as"] === "string") &&
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
        isIntervalExprValue(typedObj["expr"]) as boolean &&
        (typeof typedObj["collate"] === "undefined" ||
            typedObj["collate"] === null ||
            isCollateExpr(typedObj["collate"]) as boolean)
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

export function isAssign(obj: unknown): obj is Assign {
    const typedObj = obj as Assign
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "assign" &&
        isVar(typedObj["left"]) as boolean &&
        typedObj["symbol"] === ":=" &&
        isExpressionValue(typedObj["right"]) as boolean &&
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
            isValueExpr(typedObj["left"]) as boolean ||
            isColumnRefItem(typedObj["left"]) as boolean ||
            isCase(typedObj["left"]) as boolean ||
            isCast(typedObj["left"]) as boolean ||
            isAggrFunc(typedObj["left"]) as boolean ||
            isFunction(typedObj["left"]) as boolean ||
            isInterval(typedObj["left"]) as boolean ||
            isParam(typedObj["left"]) as boolean ||
            isVar(typedObj["left"]) as boolean ||
            isBinary(typedObj["left"]) as boolean ||
            isUnary(typedObj["left"]) as boolean ||
            isExtractFunc(typedObj["left"]) as boolean ||
            isExprList(typedObj["left"]) as boolean) &&
        (isTableColumnAst(typedObj["right"]) as boolean ||
            isValueExpr(typedObj["right"]) as boolean ||
            isColumnRefItem(typedObj["right"]) as boolean ||
            isCase(typedObj["right"]) as boolean ||
            isCast(typedObj["right"]) as boolean ||
            isAggrFunc(typedObj["right"]) as boolean ||
            isFunction(typedObj["right"]) as boolean ||
            isInterval(typedObj["right"]) as boolean ||
            isParam(typedObj["right"]) as boolean ||
            isVar(typedObj["right"]) as boolean ||
            isBinary(typedObj["right"]) as boolean ||
            isUnary(typedObj["right"]) as boolean ||
            isExtractFunc(typedObj["right"]) as boolean ||
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

export function isExtractFunc(obj: unknown): obj is ExtractFunc {
    const typedObj = obj as ExtractFunc
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "extract" &&
        (typedObj["args"] !== null &&
            typeof typedObj["args"] === "object" ||
            typeof typedObj["args"] === "function") &&
        typeof typedObj["args"]["field"] === "string" &&
        isExpressionValue(typedObj["args"]["source"]) as boolean &&
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

export function isExpressionValue(obj: unknown): obj is ExpressionValue {
    const typedObj = obj as ExpressionValue
    return (
        (isTableColumnAst(typedObj) as boolean ||
            isValueExpr(typedObj) as boolean ||
            isColumnRefItem(typedObj) as boolean ||
            isCase(typedObj) as boolean ||
            isCast(typedObj) as boolean ||
            isAggrFunc(typedObj) as boolean ||
            isFunction(typedObj) as boolean ||
            isInterval(typedObj) as boolean ||
            isParam(typedObj) as boolean ||
            isVar(typedObj) as boolean ||
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
            (isTableColumnAst(e) as boolean ||
                isValueExpr(e) as boolean ||
                isColumnRefItem(e) as boolean ||
                isCase(e) as boolean ||
                isCast(e) as boolean ||
                isAggrFunc(e) as boolean ||
                isFunction(e) as boolean ||
                isInterval(e) as boolean ||
                isParam(e) as boolean ||
                isVar(e) as boolean ||
                isBinary(e) as boolean ||
                isUnary(e) as boolean ||
                isExprList(e) as boolean ||
                isConvertDataType(e) as boolean)
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
            isBinary(typedObj["window_frame_clause"]) as boolean ||
            (typedObj["window_frame_clause"] !== null &&
                typeof typedObj["window_frame_clause"] === "object" ||
                typeof typedObj["window_frame_clause"] === "function") &&
            typedObj["window_frame_clause"]["type"] === "rows" &&
            (isOriginValue(typedObj["window_frame_clause"]["expr"]) as boolean ||
                (typedObj["window_frame_clause"]["expr"] !== null &&
                    typeof typedObj["window_frame_clause"]["expr"] === "object" ||
                    typeof typedObj["window_frame_clause"]["expr"] === "function") &&
                typedObj["window_frame_clause"]["expr"]["type"] === "number" &&
                typeof typedObj["window_frame_clause"]["expr"]["value"] === "string"))
    )
}

export function isWindowFrameClause(obj: unknown): obj is WindowFrameClause {
    const typedObj = obj as WindowFrameClause
    return (
        (isBinary(typedObj) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "rows" &&
            (isOriginValue(typedObj["expr"]) as boolean ||
                (typedObj["expr"] !== null &&
                    typeof typedObj["expr"] === "object" ||
                    typeof typedObj["expr"] === "function") &&
                typedObj["expr"]["type"] === "number" &&
                typeof typedObj["expr"]["value"] === "string"))
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
            (e === "SQL_CALC_FOUND_ROWS" ||
                e === "SQL_CACHE" ||
                e === "SQL_NO_CACHE" ||
                e === "SQL_SMALL_RESULT" ||
                e === "SQL_BIG_RESULT" ||
                e === "SQL_BUFFER_RESULT")
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
            isStringValue(typedObj["into"]["expr"]) as boolean ||
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
            isColumnRefItem(typedObj["where"]) as boolean ||
            isFunction(typedObj["where"]) as boolean ||
            isFulltextSearch(typedObj["where"]) as boolean ||
            isBinary(typedObj["where"]) as boolean ||
            isUnary(typedObj["where"]) as boolean) &&
        (typedObj["groupby"] === null ||
            (typedObj["groupby"] !== null &&
                typeof typedObj["groupby"] === "object" ||
                typeof typedObj["groupby"] === "function") &&
            (typedObj["groupby"]["columns"] === null ||
                Array.isArray(typedObj["groupby"]["columns"]) &&
                typedObj["groupby"]["columns"].every((e: any) =>
                    isExpressionValue(e) as boolean
                )) &&
            Array.isArray(typedObj["groupby"]["modifiers"]) &&
            typedObj["groupby"]["modifiers"].every((e: any) =>
            (e === null ||
                isOriginValue(e) as boolean)
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
            typeof typedObj["locking_read"] === "string")
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
        (typedObj["prefix"] === "" ||
            typedObj["prefix"] === "ignore" ||
            typedObj["prefix"] === "into" ||
            typedObj["prefix"] === "ignore into") &&
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
            typeof typedObj["loc"]["end"]["offset"] === "number")
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
            isFulltextSearch(typedObj["where"]) as boolean ||
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
            typeof typedObj["loc"]["end"]["offset"] === "number")
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
            isFulltextSearch(typedObj["where"]) as boolean ||
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
            typeof typedObj["loc"]["end"]["offset"] === "number")
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
            isAlterEnableConstraint(typedObj) as boolean ||
            isAlterDisableConstraint(typedObj) as boolean ||
            isAlterAddPartition(typedObj) as boolean ||
            isAlterDropPartition(typedObj) as boolean ||
            isAlterOperatePartition(typedObj) as boolean ||
            isAlterAlgorithm(typedObj) as boolean ||
            isAlterLock(typedObj) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "engine" &&
            typedObj["keyword"] === "engine" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["engine"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "auto_increment" &&
            typedObj["keyword"] === "auto_increment" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["auto_increment"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "avg_row_length" &&
            typedObj["keyword"] === "avg_row_length" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["avg_row_length"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "key_block_size" &&
            typedObj["keyword"] === "key_block_size" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["key_block_size"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "max_rows" &&
            typedObj["keyword"] === "max_rows" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["max_rows"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "min_rows" &&
            typedObj["keyword"] === "min_rows" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["min_rows"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "stats_sample_pages" &&
            typedObj["keyword"] === "stats_sample_pages" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["stats_sample_pages"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "checksum" &&
            typedObj["keyword"] === "checksum" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["checksum"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "delay_key_write" &&
            typedObj["keyword"] === "delay_key_write" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["delay_key_write"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "comment" &&
            typedObj["keyword"] === "comment" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["comment"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "compression" &&
            typedObj["keyword"] === "compression" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["compression"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "connection" &&
            typedObj["keyword"] === "connection" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["connection"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "data directory" &&
            typedObj["keyword"] === "data directory" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["data directory"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "index directory" &&
            typedObj["keyword"] === "index directory" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["index directory"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "engine_attribute" &&
            typedObj["keyword"] === "engine_attribute" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["engine_attribute"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "secondary_engine_attribute" &&
            typedObj["keyword"] === "secondary_engine_attribute" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["secondary_engine_attribute"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "row_format" &&
            typedObj["keyword"] === "row_format" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["row_format"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "charset" &&
            typedObj["keyword"] === "charset" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["charset"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "character set" &&
            typedObj["keyword"] === "character set" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["character set"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "default charset" &&
            typedObj["keyword"] === "default charset" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["default charset"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "default character set" &&
            typedObj["keyword"] === "default character set" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["default character set"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "collate" &&
            typedObj["keyword"] === "collate" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["collate"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "default collate" &&
            typedObj["keyword"] === "default collate" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["default collate"]) as boolean)
    )
}

export function isAlterColumnPosition(obj: unknown): obj is AlterColumnPosition {
    const typedObj = obj as AlterColumnPosition
    return (
        ((typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
            typeof typedObj["keyword"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typeof typedObj["keyword"] === "string" &&
            isColumnRefItem(typedObj["expr"]) as boolean)
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
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string" &&
            isColumnRefItem(typedObj["suffix"]["expr"]) as boolean) &&
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
        (typeof typedObj["primary_key"] === "undefined" ||
            typedObj["primary_key"] === "key" ||
            typedObj["primary_key"] === "primary key") &&
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
            isDefaultValue(typedObj["character_set"]["value"]) as boolean &&
            (typedObj["character_set"]["symbol"] === null ||
                typedObj["character_set"]["symbol"] === "=")) &&
        (typeof typedObj["check"] === "undefined" ||
            (typedObj["check"] !== null &&
                typeof typedObj["check"] === "object" ||
                typeof typedObj["check"] === "function") &&
            typedObj["check"]["constraint_type"] === "check" &&
            (typedObj["check"]["keyword"] === null ||
                typedObj["check"]["keyword"] === "constraint") &&
            (typedObj["check"]["constraint"] === null ||
                typeof typedObj["check"]["constraint"] === "string") &&
            Array.isArray(typedObj["check"]["definition"]) &&
            typedObj["check"]["definition"].every((e: any) =>
                isBinary(e) as boolean
            ) &&
            (typedObj["check"]["enforced"] === "" ||
                typedObj["check"]["enforced"] === "enforced" ||
                typedObj["check"]["enforced"] === "not enforced") &&
            typedObj["check"]["resource"] === "constraint") &&
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
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string" &&
            isColumnRefItem(typedObj["suffix"]["expr"]) as boolean) &&
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
        (typeof typedObj["primary_key"] === "undefined" ||
            typedObj["primary_key"] === "key" ||
            typedObj["primary_key"] === "primary key") &&
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
            isDefaultValue(typedObj["character_set"]["value"]) as boolean &&
            (typedObj["character_set"]["symbol"] === null ||
                typedObj["character_set"]["symbol"] === "=")) &&
        (typeof typedObj["check"] === "undefined" ||
            (typedObj["check"] !== null &&
                typeof typedObj["check"] === "object" ||
                typeof typedObj["check"] === "function") &&
            typedObj["check"]["constraint_type"] === "check" &&
            (typedObj["check"]["keyword"] === null ||
                typedObj["check"]["keyword"] === "constraint") &&
            (typedObj["check"]["constraint"] === null ||
                typeof typedObj["check"]["constraint"] === "string") &&
            Array.isArray(typedObj["check"]["definition"]) &&
            typedObj["check"]["definition"].every((e: any) =>
                isBinary(e) as boolean
            ) &&
            (typedObj["check"]["enforced"] === "" ||
                typedObj["check"]["enforced"] === "enforced" ||
                typedObj["check"]["enforced"] === "not enforced") &&
            typedObj["check"]["resource"] === "constraint") &&
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
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string" ||
            (typedObj["suffix"] !== null &&
                typeof typedObj["suffix"] === "object" ||
                typeof typedObj["suffix"] === "function") &&
            typeof typedObj["suffix"]["keyword"] === "string" &&
            isColumnRefItem(typedObj["suffix"]["expr"]) as boolean) &&
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
        (typeof typedObj["primary_key"] === "undefined" ||
            typedObj["primary_key"] === "key" ||
            typedObj["primary_key"] === "primary key") &&
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
            isDefaultValue(typedObj["character_set"]["value"]) as boolean &&
            (typedObj["character_set"]["symbol"] === null ||
                typedObj["character_set"]["symbol"] === "=")) &&
        (typeof typedObj["check"] === "undefined" ||
            (typedObj["check"] !== null &&
                typeof typedObj["check"] === "object" ||
                typeof typedObj["check"] === "function") &&
            typedObj["check"]["constraint_type"] === "check" &&
            (typedObj["check"]["keyword"] === null ||
                typedObj["check"]["keyword"] === "constraint") &&
            (typedObj["check"]["constraint"] === null ||
                typeof typedObj["check"]["constraint"] === "string") &&
            Array.isArray(typedObj["check"]["definition"]) &&
            typedObj["check"]["definition"].every((e: any) =>
                isBinary(e) as boolean
            ) &&
            (typedObj["check"]["enforced"] === "" ||
                typedObj["check"]["enforced"] === "enforced" ||
                typedObj["check"]["enforced"] === "not enforced") &&
            typedObj["check"]["resource"] === "constraint") &&
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

export function isAlterRenameTable(obj: unknown): obj is AlterRenameTable {
    const typedObj = obj as AlterRenameTable
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "table" &&
        typedObj["action"] === "rename" &&
        (typedObj["keyword"] === null ||
            typedObj["keyword"] === "as" ||
            typedObj["keyword"] === "to") &&
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
        (typedObj["prefix"] === "as" ||
            typedObj["prefix"] === "to") &&
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
        (typedObj["keyword"] === "key" ||
            typedObj["keyword"] === "index" ||
            typedObj["keyword"] === "fulltext" ||
            typedObj["keyword"] === "spatial" ||
            typedObj["keyword"] === "fulltext key" ||
            typedObj["keyword"] === "spatial key" ||
            typedObj["keyword"] === "fulltext index" ||
            typedObj["keyword"] === "spatial index") &&
        typeof typedObj["index"] === "string" &&
        Array.isArray(typedObj["definition"]) &&
        typedObj["definition"].every((e: any) =>
            isColumnRefItem(e) as boolean
        ) &&
        (typeof typedObj["index_type"] === "undefined" ||
            typedObj["index_type"] === null ||
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
        (typedObj["keyword"] === "key" ||
            typedObj["keyword"] === "index") &&
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
        (typedObj["keyword"] === "key" ||
            typedObj["keyword"] === "primary key" ||
            typedObj["keyword"] === "foreign key") &&
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
        (typedObj["keyword"] === "check" ||
            typedObj["keyword"] === "constraint") &&
        typeof typedObj["constraint"] === "string"
    )
}

export function isAlterEnableConstraint(obj: unknown): obj is AlterEnableConstraint {
    const typedObj = obj as AlterEnableConstraint
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "constraint" &&
        typedObj["action"] === "with" &&
        typedObj["keyword"] === "check check" &&
        typeof typedObj["constraint"] === "string"
    )
}

export function isAlterDisableConstraint(obj: unknown): obj is AlterDisableConstraint {
    const typedObj = obj as AlterDisableConstraint
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "constraint" &&
        typedObj["action"] === "nocheck" &&
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
            isDefaultValue(e["name"]) as boolean &&
            (e["value"] !== null &&
                typeof e["value"] === "object" ||
                typeof e["value"] === "function") &&
            e["value"]["type"] === "less than" &&
            isNumberValue(e["value"]["expr"]) as boolean &&
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

export function isAlterOperatePartition(obj: unknown): obj is AlterOperatePartition {
    const typedObj = obj as AlterOperatePartition
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "alter" &&
        typedObj["resource"] === "partition" &&
        (typedObj["action"] === "check" ||
            typedObj["action"] === "analyze" ||
            typedObj["action"] === "truncate" ||
            typedObj["action"] === "discard" ||
            typedObj["action"] === "import" ||
            typedObj["action"] === "coalesce") &&
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
        (typedObj["symbol"] === null ||
            typedObj["symbol"] === "=") &&
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
        (typedObj["symbol"] === null ||
            typedObj["symbol"] === "=") &&
        typeof typedObj["lock"] === "string"
    )
}

export function isAlterTableOption(obj: unknown): obj is AlterTableOption {
    const typedObj = obj as AlterTableOption
    return (
        ((typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "engine" &&
            typedObj["keyword"] === "engine" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["engine"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "auto_increment" &&
            typedObj["keyword"] === "auto_increment" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["auto_increment"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "avg_row_length" &&
            typedObj["keyword"] === "avg_row_length" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["avg_row_length"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "key_block_size" &&
            typedObj["keyword"] === "key_block_size" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["key_block_size"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "max_rows" &&
            typedObj["keyword"] === "max_rows" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["max_rows"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "min_rows" &&
            typedObj["keyword"] === "min_rows" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["min_rows"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "stats_sample_pages" &&
            typedObj["keyword"] === "stats_sample_pages" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["stats_sample_pages"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "checksum" &&
            typedObj["keyword"] === "checksum" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["checksum"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "delay_key_write" &&
            typedObj["keyword"] === "delay_key_write" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["delay_key_write"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "comment" &&
            typedObj["keyword"] === "comment" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["comment"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "compression" &&
            typedObj["keyword"] === "compression" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["compression"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "connection" &&
            typedObj["keyword"] === "connection" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["connection"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "data directory" &&
            typedObj["keyword"] === "data directory" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["data directory"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "index directory" &&
            typedObj["keyword"] === "index directory" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["index directory"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "engine_attribute" &&
            typedObj["keyword"] === "engine_attribute" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["engine_attribute"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "secondary_engine_attribute" &&
            typedObj["keyword"] === "secondary_engine_attribute" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["secondary_engine_attribute"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "row_format" &&
            typedObj["keyword"] === "row_format" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["row_format"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "charset" &&
            typedObj["keyword"] === "charset" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["charset"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "character set" &&
            typedObj["keyword"] === "character set" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["character set"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "default charset" &&
            typedObj["keyword"] === "default charset" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["default charset"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "default character set" &&
            typedObj["keyword"] === "default character set" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["default character set"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "collate" &&
            typedObj["keyword"] === "collate" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["collate"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "alter" &&
            typedObj["resource"] === "default collate" &&
            typedObj["keyword"] === "default collate" &&
            (typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["default collate"]) as boolean)
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
            isStringValue(typedObj["value"]) as boolean)
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

export function isMysqlType(obj: unknown): obj is MysqlType {
    const typedObj = obj as MysqlType
    return (
        (typedObj === "CHAR" ||
            typedObj === "VARCHAR" ||
            typedObj === "BINARY" ||
            typedObj === "VARBINARY" ||
            typedObj === "TINYTEXT" ||
            typedObj === "TEXT" ||
            typedObj === "MEDIUMTEXT" ||
            typedObj === "LONGTEXT" ||
            typedObj === "TINYBLOB" ||
            typedObj === "BLOB" ||
            typedObj === "MEDIUMBLOB" ||
            typedObj === "LONGBLOB" ||
            typedObj === "TINYINT" ||
            typedObj === "SMALLINT" ||
            typedObj === "MEDIUMINT" ||
            typedObj === "INT" ||
            typedObj === "INTEGER" ||
            typedObj === "BIGINT" ||
            typedObj === "FLOAT" ||
            typedObj === "DOUBLE" ||
            typedObj === "DECIMAL" ||
            typedObj === "NUMERIC" ||
            typedObj === "BIT" ||
            typedObj === "DATE" ||
            typedObj === "TIME" ||
            typedObj === "DATETIME" ||
            typedObj === "TIMESTAMP" ||
            typedObj === "YEAR" ||
            typedObj === "BOOLEAN" ||
            typedObj === "JSON" ||
            typedObj === "ENUM" ||
            typedObj === "SET" ||
            typedObj === "GEOMETRY" ||
            typedObj === "POINT" ||
            typedObj === "LINESTRING" ||
            typedObj === "POLYGON" ||
            typedObj === "MULTIPOINT" ||
            typedObj === "MULTILINESTRING" ||
            typedObj === "MULTIPOLYGON" ||
            typedObj === "GEOMETRYCOLLECTION" ||
            typedObj === "VECTOR")
    )
}

export function isConvertDataType(obj: unknown): obj is ConvertDataType {
    const typedObj = obj as ConvertDataType
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "datatype" &&
        (typedObj["dataType"] === "CHAR" ||
            typedObj["dataType"] === "VARCHAR" ||
            typedObj["dataType"] === "BINARY" ||
            typedObj["dataType"] === "VARBINARY" ||
            typedObj["dataType"] === "TINYTEXT" ||
            typedObj["dataType"] === "TEXT" ||
            typedObj["dataType"] === "MEDIUMTEXT" ||
            typedObj["dataType"] === "LONGTEXT" ||
            typedObj["dataType"] === "TINYBLOB" ||
            typedObj["dataType"] === "BLOB" ||
            typedObj["dataType"] === "MEDIUMBLOB" ||
            typedObj["dataType"] === "LONGBLOB" ||
            typedObj["dataType"] === "TINYINT" ||
            typedObj["dataType"] === "SMALLINT" ||
            typedObj["dataType"] === "MEDIUMINT" ||
            typedObj["dataType"] === "INT" ||
            typedObj["dataType"] === "INTEGER" ||
            typedObj["dataType"] === "BIGINT" ||
            typedObj["dataType"] === "FLOAT" ||
            typedObj["dataType"] === "DOUBLE" ||
            typedObj["dataType"] === "DECIMAL" ||
            typedObj["dataType"] === "NUMERIC" ||
            typedObj["dataType"] === "BIT" ||
            typedObj["dataType"] === "DATE" ||
            typedObj["dataType"] === "TIME" ||
            typedObj["dataType"] === "DATETIME" ||
            typedObj["dataType"] === "TIMESTAMP" ||
            typedObj["dataType"] === "YEAR" ||
            typedObj["dataType"] === "BOOLEAN" ||
            typedObj["dataType"] === "JSON" ||
            typedObj["dataType"] === "ENUM" ||
            typedObj["dataType"] === "SET" ||
            typedObj["dataType"] === "GEOMETRY" ||
            typedObj["dataType"] === "POINT" ||
            typedObj["dataType"] === "LINESTRING" ||
            typedObj["dataType"] === "POLYGON" ||
            typedObj["dataType"] === "MULTIPOINT" ||
            typedObj["dataType"] === "MULTILINESTRING" ||
            typedObj["dataType"] === "MULTIPOLYGON" ||
            typedObj["dataType"] === "GEOMETRYCOLLECTION" ||
            typedObj["dataType"] === "VECTOR" ||
            typedObj["dataType"] === "SIGNED" ||
            typedObj["dataType"] === "UNSIGNED") &&
        (typeof typedObj["length"] === "undefined" ||
            typedObj["length"] === null ||
            typeof typedObj["length"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === true) &&
        (typeof typedObj["scale"] === "undefined" ||
            typedObj["scale"] === null ||
            typeof typedObj["scale"] === "number") &&
        (typeof typedObj["suffix"] === "undefined" ||
            typedObj["suffix"] === null ||
            Array.isArray(typedObj["suffix"]) &&
            typedObj["suffix"].every((e: any) =>
            (e === "SIGNED" ||
                e === "UNSIGNED" ||
                e === "ZEROFILL")
            ))
    )
}

export function isDataType(obj: unknown): obj is DataType {
    const typedObj = obj as DataType
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        isMysqlType(typedObj["dataType"]) as boolean &&
        (typeof typedObj["length"] === "undefined" ||
            typedObj["length"] === null ||
            typeof typedObj["length"] === "number") &&
        (typeof typedObj["parentheses"] === "undefined" ||
            typedObj["parentheses"] === true) &&
        (typeof typedObj["scale"] === "undefined" ||
            typedObj["scale"] === null ||
            typeof typedObj["scale"] === "number") &&
        (typeof typedObj["suffix"] === "undefined" ||
            typedObj["suffix"] === null ||
            Array.isArray(typedObj["suffix"]) &&
            typedObj["suffix"].every((e: any) =>
            (e === "SIGNED" ||
                e === "UNSIGNED" ||
                e === "ZEROFILL")
            )) &&
        (typeof typedObj["expr"] === "undefined" ||
            isBinary(typedObj["expr"]) as boolean ||
            isUnary(typedObj["expr"]) as boolean ||
            isExprList(typedObj["expr"]) as boolean)
    )
}

export function isOnUpdateCurrentTimestamp(obj: unknown): obj is OnUpdateCurrentTimestamp {
    const typedObj = obj as OnUpdateCurrentTimestamp
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "on update" &&
        typeof typedObj["keyword"] === "string" &&
        typeof typedObj["parentheses"] === "boolean" &&
        (typeof typedObj["expr"] === "undefined" ||
            typedObj["expr"] === null ||
            isExprList(typedObj["expr"]) as boolean)
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
        (typeof typedObj["primary_key"] === "undefined" ||
            typedObj["primary_key"] === "key" ||
            typedObj["primary_key"] === "primary key") &&
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
            isDefaultValue(typedObj["character_set"]["value"]) as boolean &&
            (typedObj["character_set"]["symbol"] === null ||
                typedObj["character_set"]["symbol"] === "=")) &&
        (typeof typedObj["check"] === "undefined" ||
            (typedObj["check"] !== null &&
                typeof typedObj["check"] === "object" ||
                typeof typedObj["check"] === "function") &&
            typedObj["check"]["constraint_type"] === "check" &&
            (typedObj["check"]["keyword"] === null ||
                typedObj["check"]["keyword"] === "constraint") &&
            (typedObj["check"]["constraint"] === null ||
                typeof typedObj["check"]["constraint"] === "string") &&
            Array.isArray(typedObj["check"]["definition"]) &&
            typedObj["check"]["definition"].every((e: any) =>
                isBinary(e) as boolean
            ) &&
            (typedObj["check"]["enforced"] === "" ||
                typedObj["check"]["enforced"] === "enforced" ||
                typedObj["check"]["enforced"] === "not enforced") &&
            typedObj["check"]["resource"] === "constraint") &&
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
            typedObj["keyword"] === "references") &&
        (typeof typedObj["match"] === "undefined" ||
            typedObj["match"] === null ||
            typedObj["match"] === "match full" ||
            typedObj["match"] === "match partial" ||
            typedObj["match"] === "match simple") &&
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
            typedObj["type"] === "on delete") &&
        (isOriginValue(typedObj["value"]) as boolean ||
            isFunction(typedObj["value"]) as boolean)
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
            typedObj["type"] === "hash")
    )
}

export function isIndexOption(obj: unknown): obj is IndexOption {
    const typedObj = obj as IndexOption
    return (
        (isKeywordComment(typedObj) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "key_block_size" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isNumberValue(typedObj["expr"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "using" &&
            (typedObj["type"] === "btree" ||
                typedObj["type"] === "hash") ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["type"] === "with parser" &&
            typeof typedObj["expr"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            (typedObj["type"] === "visible" ||
                typedObj["type"] === "invisible") &&
            typeof typedObj["expr"] === "string")
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
        (typedObj["keyword"] === "key" ||
            typedObj["keyword"] === "index") &&
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
        Array.isArray(typedObj["table"]) &&
        typedObj["table"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (e["db"] === null ||
                typeof e["db"] === "string") &&
            typeof e["table"] === "string"
        ) &&
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

export function isDatabaseOption(obj: unknown): obj is DatabaseOption {
    const typedObj = obj as DatabaseOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        (typedObj["keyword"] === "collate" ||
            typedObj["keyword"] === "charset" ||
            typedObj["keyword"] === "character set" ||
            typedObj["keyword"] === "default charset" ||
            typedObj["keyword"] === "default character set" ||
            typedObj["keyword"] === "default collate") &&
        (typeof typedObj["symbol"] === "undefined" ||
            typedObj["symbol"] === null ||
            typedObj["symbol"] === "=") &&
        isDefaultValue(typedObj["value"]) as boolean
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
                isDefaultValue(e) as boolean
            )) &&
        (typeof typedObj["create_definitions"] === "undefined" ||
            typedObj["create_definitions"] === null ||
            Array.isArray(typedObj["create_definitions"]) &&
            typedObj["create_definitions"].every((e: any) =>
                isDatabaseOption(e) as boolean
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
                isDefaultValue(e) as boolean
            )) &&
        (typeof typedObj["create_definitions"] === "undefined" ||
            typedObj["create_definitions"] === null ||
            Array.isArray(typedObj["create_definitions"]) &&
            typedObj["create_definitions"].every((e: any) =>
                isDatabaseOption(e) as boolean
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
        typeof typedObj["index"] === "string" &&
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
            (isColumnRefItem(e) as boolean ||
                isFunction(e) as boolean &&
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (typeof e["order_by"] === "undefined" ||
                    e["order_by"] === null ||
                    e["order_by"] === "ASC" ||
                    e["order_by"] === "DESC" ||
                    e["order_by"] === "asc" ||
                    e["order_by"] === "desc"))
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
        (typedObj["replace"] === null ||
            typedObj["replace"] === "or replace") &&
        (typedObj["algorithm"] === null ||
            typedObj["algorithm"] === "UNDEFINED" ||
            typedObj["algorithm"] === "MERGE" ||
            typedObj["algorithm"] === "TEMPTABLE") &&
        (typedObj["definer"] === null ||
            isBinary(typedObj["definer"]) as boolean) &&
        (typedObj["sql_security"] === null ||
            typedObj["sql_security"] === "DEFINER" ||
            typedObj["sql_security"] === "INVOKER") &&
        (typedObj["view"] !== null &&
            typeof typedObj["view"] === "object" ||
            typeof typedObj["view"] === "function") &&
        (typedObj["view"]["db"] === null ||
            typeof typedObj["view"]["db"] === "string") &&
        typeof typedObj["view"]["view"] === "string" &&
        (typedObj["columns"] === null ||
            Array.isArray(typedObj["columns"]) &&
            typedObj["columns"].every((e: any) =>
                typeof e === "string"
            )) &&
        isSelect(typedObj["select"]) as boolean &&
        (typedObj["with"] === null ||
            typedObj["with"] === "with check option" ||
            typedObj["with"] === "with cascaded check option" ||
            typedObj["with"] === "with local check option") &&
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
        (typedObj["definer"] === null ||
            isBinary(typedObj["definer"]) as boolean) &&
        (typedObj["trigger"] !== null &&
            typeof typedObj["trigger"] === "object" ||
            typeof typedObj["trigger"] === "function") &&
        (typedObj["trigger"]["db"] === null ||
            typeof typedObj["trigger"]["db"] === "string") &&
        typeof typedObj["trigger"]["table"] === "string" &&
        typeof typedObj["time"] === "string" &&
        Array.isArray(typedObj["events"]) &&
        typedObj["events"].every((e: any) =>
            isTriggerEvent(e) as boolean
        ) &&
        (typedObj["table"] !== null &&
            typeof typedObj["table"] === "object" ||
            typeof typedObj["table"] === "function") &&
        (typedObj["table"]["db"] === null ||
            typeof typedObj["table"]["db"] === "string") &&
        typeof typedObj["table"]["table"] === "string" &&
        (typedObj["for_each"] !== null &&
            typeof typedObj["for_each"] === "object" ||
            typeof typedObj["for_each"] === "function") &&
        typeof typedObj["for_each"]["keyword"] === "string" &&
        typeof typedObj["for_each"]["args"] === "string" &&
        (typedObj["order"] === null ||
            (typedObj["order"] !== null &&
                typeof typedObj["order"] === "object" ||
                typeof typedObj["order"] === "function") &&
            (typedObj["order"]["keyword"] === "FOLLOWS" ||
                typedObj["order"]["keyword"] === "PRECEDES") &&
            typeof typedObj["order"]["trigger"] === "string") &&
        (typedObj["execute"] !== null &&
            typeof typedObj["execute"] === "object" ||
            typeof typedObj["execute"] === "function") &&
        typedObj["execute"]["type"] === "set" &&
        Array.isArray(typedObj["execute"]["expr"]) &&
        typedObj["execute"]["expr"].every((e: any) =>
            isSetList(e) as boolean
        ) &&
        (typedObj["if_not_exists"] === null ||
            typeof typedObj["if_not_exists"] === "string") &&
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
            (typedObj["default_role"] !== null &&
                typeof typedObj["default_role"] === "object" ||
                typeof typedObj["default_role"] === "function") &&
            typeof typedObj["default_role"]["keyword"] === "string" &&
            Array.isArray(typedObj["default_role"]["value"]) &&
            typedObj["default_role"]["value"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                isStringValue(e["name"]) as boolean &&
                (e["host"] === null ||
                    isStringValue(e["host"]) as boolean)
            )) &&
        (typeof typedObj["require"] === "undefined" ||
            typedObj["require"] === null ||
            isRequireOption(typedObj["require"]) as boolean) &&
        (typeof typedObj["resource_options"] === "undefined" ||
            typedObj["resource_options"] === null ||
            isResourceOption(typedObj["resource_options"]) as boolean) &&
        (typeof typedObj["password_options"] === "undefined" ||
            typedObj["password_options"] === null ||
            Array.isArray(typedObj["password_options"]) &&
            typedObj["password_options"].every((e: any) =>
                isPasswordOption(e) as boolean
            )) &&
        (typeof typedObj["lock_option_user"] === "undefined" ||
            typedObj["lock_option_user"] === null ||
            typedObj["lock_option_user"] === "account lock" ||
            typedObj["lock_option_user"] === "account unlock") &&
        (typeof typedObj["comment_user"] === "undefined" ||
            typedObj["comment_user"] === null ||
            typeof typedObj["comment_user"] === "string") &&
        (typeof typedObj["attribute"] === "undefined" ||
            typedObj["attribute"] === null ||
            isStringValue(typedObj["attribute"]) as boolean &&
            (typedObj["attribute"] !== null &&
                typeof typedObj["attribute"] === "object" ||
                typeof typedObj["attribute"] === "function") &&
            (typeof typedObj["attribute"]["prefix"] === "undefined" ||
                typeof typedObj["attribute"]["prefix"] === "string")) &&
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
        isStringValue(typedObj["user"]["name"]) as boolean &&
        isStringValue(typedObj["user"]["host"]) as boolean &&
        (typeof typedObj["auth_option"] === "undefined" ||
            typedObj["auth_option"] === null ||
            (typedObj["auth_option"] !== null &&
                typeof typedObj["auth_option"] === "object" ||
                typeof typedObj["auth_option"] === "function") &&
            typeof typedObj["auth_option"]["keyword"] === "string" &&
            (typeof typedObj["auth_option"]["auth_plugin"] === "undefined" ||
                typedObj["auth_option"]["auth_plugin"] === null ||
                typeof typedObj["auth_option"]["auth_plugin"] === "string") &&
            (isStringValue(typedObj["auth_option"]["value"]) as boolean &&
                (typedObj["auth_option"]["value"] !== null &&
                    typeof typedObj["auth_option"]["value"] === "object" ||
                    typeof typedObj["auth_option"]["value"] === "function") &&
                (typeof typedObj["auth_option"]["value"]["prefix"] === "undefined" ||
                    typeof typedObj["auth_option"]["value"]["prefix"] === "string") ||
                isOriginValue(typedObj["auth_option"]["value"]) as boolean &&
                (typedObj["auth_option"]["value"] !== null &&
                    typeof typedObj["auth_option"]["value"] === "object" ||
                    typeof typedObj["auth_option"]["value"] === "function") &&
                (typeof typedObj["auth_option"]["value"]["prefix"] === "undefined" ||
                    typeof typedObj["auth_option"]["value"]["prefix"] === "string")))
    )
}

export function isRequireOption(obj: unknown): obj is RequireOption {
    const typedObj = obj as RequireOption
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["keyword"] === "require" &&
        (isBinary(typedObj["value"]) as boolean ||
            isStringValue(typedObj["value"]) as boolean &&
            (typedObj["value"] !== null &&
                typeof typedObj["value"] === "object" ||
                typeof typedObj["value"] === "function") &&
            (typeof typedObj["value"]["prefix"] === "undefined" ||
                typeof typedObj["value"]["prefix"] === "string") ||
            isOriginValue(typedObj["value"]) as boolean &&
            (typedObj["value"] !== null &&
                typeof typedObj["value"] === "object" ||
                typeof typedObj["value"] === "function") &&
            (typeof typedObj["value"]["prefix"] === "undefined" ||
                typeof typedObj["value"]["prefix"] === "string"))
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
        (typedObj["keyword"] === "password expire" ||
            typedObj["keyword"] === "password history" ||
            typedObj["keyword"] === "password reuse interval" ||
            typedObj["keyword"] === "password reuse" ||
            typedObj["keyword"] === "password require current" ||
            typedObj["keyword"] === "failed_login_attempts" ||
            typedObj["keyword"] === "password_lock_time") &&
        (isOriginValue(typedObj["value"]) as boolean ||
            isNumberValue(typedObj["value"]) as boolean ||
            isInterval(typedObj["value"]) as boolean)
    )
}

export function isTableOption(obj: unknown): obj is TableOption {
    const typedObj = obj as TableOption
    return (
        ((typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
            typedObj["keyword"] === "engine" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "auto_increment" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "avg_row_length" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "key_block_size" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "max_rows" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "min_rows" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "stats_sample_pages" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "number" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "checksum" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "delay_key_write" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "comment" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "compression" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "connection" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "data directory" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "index directory" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "engine_attribute" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "secondary_engine_attribute" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            typedObj["keyword"] === "row_format" &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            typeof typedObj["value"] === "string" ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            (typedObj["keyword"] === "charset" ||
                typedObj["keyword"] === "character set" ||
                typedObj["keyword"] === "default charset" ||
                typedObj["keyword"] === "default character set") &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["value"]) as boolean ||
            (typedObj !== null &&
                typeof typedObj === "object" ||
                typeof typedObj === "function") &&
            (typedObj["keyword"] === "collate" ||
                typedObj["keyword"] === "default collate") &&
            (typeof typedObj["symbol"] === "undefined" ||
                typedObj["symbol"] === null ||
                typedObj["symbol"] === "=") &&
            isDefaultValue(typedObj["value"]) as boolean)
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
            Array.isArray(typedObj["options"]) &&
            typedObj["options"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "origin" &&
                (e["value"] === "restrict" ||
                    e["value"] === "cascade")
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

export function isDropIndex(obj: unknown): obj is DropIndex {
    const typedObj = obj as DropIndex
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "drop" &&
        typedObj["keyword"] === "index" &&
        isColumnRefItem(typedObj["name"]) as boolean &&
        (typedObj["table"] !== null &&
            typeof typedObj["table"] === "object" ||
            typeof typedObj["table"] === "function") &&
        (typedObj["table"]["db"] === null ||
            typeof typedObj["table"]["db"] === "string") &&
        typeof typedObj["table"]["table"] === "string" &&
        (typedObj["options"] === null ||
            Array.isArray(typedObj["options"]) &&
            typedObj["options"].every((e: any) =>
            ((e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
                e["type"] === "origin" &&
                (e["value"] === "restrict" ||
                    e["value"] === "cascade") ||
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "alter" &&
                e["keyword"] === "algorithm" &&
                e["resource"] === "algorithm" &&
                e["symbol"] === "=" &&
                typeof e["algorithm"] === "string" ||
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                e["type"] === "alter" &&
                e["keyword"] === "lock" &&
                e["resource"] === "lock" &&
                e["symbol"] === "=" &&
                typeof e["lock"] === "string")
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

export function isShowLogs(obj: unknown): obj is ShowLogs {
    const typedObj = obj as ShowLogs
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        (typedObj["keyword"] === "binary" ||
            typedObj["keyword"] === "master") &&
        typedObj["suffix"] === "logs" &&
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

export function isShowTables(obj: unknown): obj is ShowTables {
    const typedObj = obj as ShowTables
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
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

export function isShowSimple(obj: unknown): obj is ShowSimple {
    const typedObj = obj as ShowSimple
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        (typedObj["keyword"] === "triggers" ||
            typedObj["keyword"] === "status" ||
            typedObj["keyword"] === "processlist") &&
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

export function isShowProcedureFunctionStatus(obj: unknown): obj is ShowProcedureFunctionStatus {
    const typedObj = obj as ShowProcedureFunctionStatus
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        (typedObj["keyword"] === "function" ||
            typedObj["keyword"] === "procedure") &&
        typedObj["suffix"] === "status" &&
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

export function isShowBinlogEvents(obj: unknown): obj is ShowBinlogEvents {
    const typedObj = obj as ShowBinlogEvents
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "binlog" &&
        typedObj["suffix"] === "events" &&
        (typedObj["in"] === null ||
            (typedObj["in"] !== null &&
                typeof typedObj["in"] === "object" ||
                typeof typedObj["in"] === "function") &&
            (typedObj["in"]["op"] === "IN" ||
                typedObj["in"]["op"] === "NOT IN") &&
            isExpressionValue(typedObj["in"]["right"]) as boolean) &&
        (typedObj["from"] === null ||
            Array.isArray(typedObj["from"]) &&
            typedObj["from"].every((e: any) =>
                isFrom(e) as boolean
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
            typeof typedObj["loc"]["end"]["offset"] === "number")
    )
}

export function isShowCharacterSet(obj: unknown): obj is ShowCharacterSet {
    const typedObj = obj as ShowCharacterSet
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "character" &&
        typedObj["suffix"] === "set" &&
        (typedObj["expr"] === null ||
            isBinary(typedObj["expr"]) as boolean ||
            (typedObj["expr"] !== null &&
                typeof typedObj["expr"] === "object" ||
                typeof typedObj["expr"] === "function") &&
            (typedObj["expr"]["op"] === "LIKE" ||
                typedObj["expr"]["op"] === "NOT LIKE") &&
            isExpressionValue(typedObj["expr"]["right"]) as boolean) &&
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

export function isShowCollationDatabases(obj: unknown): obj is ShowCollationDatabases {
    const typedObj = obj as ShowCollationDatabases
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        (typedObj["keyword"] === "collation" ||
            typedObj["keyword"] === "databases") &&
        (typedObj["expr"] === null ||
            isBinary(typedObj["expr"]) as boolean ||
            (typedObj["expr"] !== null &&
                typeof typedObj["expr"] === "object" ||
                typeof typedObj["expr"] === "function") &&
            (typedObj["expr"]["op"] === "LIKE" ||
                typedObj["expr"]["op"] === "NOT LIKE") &&
            isExpressionValue(typedObj["expr"]["right"]) as boolean) &&
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

export function isShowColumnsIndexes(obj: unknown): obj is ShowColumnsIndexes {
    const typedObj = obj as ShowColumnsIndexes
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        (typedObj["keyword"] === "index" ||
            typedObj["keyword"] === "columns" ||
            typedObj["keyword"] === "indexes") &&
        Array.isArray(typedObj["from"]) &&
        typedObj["from"].every((e: any) =>
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

export function isShowCreateTable(obj: unknown): obj is ShowCreateTable {
    const typedObj = obj as ShowCreateTable
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "create" &&
        typedObj["suffix"] === "table" &&
        (typedObj["table"] !== null &&
            typeof typedObj["table"] === "object" ||
            typeof typedObj["table"] === "function") &&
        (typedObj["table"]["db"] === null ||
            typeof typedObj["table"]["db"] === "string") &&
        typeof typedObj["table"]["table"] === "string" &&
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

export function isShowCreateView(obj: unknown): obj is ShowCreateView {
    const typedObj = obj as ShowCreateView
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "create" &&
        typedObj["suffix"] === "view" &&
        (typedObj["view"] !== null &&
            typeof typedObj["view"] === "object" ||
            typeof typedObj["view"] === "function") &&
        (typedObj["view"]["db"] === null ||
            typeof typedObj["view"]["db"] === "string") &&
        typeof typedObj["view"]["table"] === "string" &&
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

export function isShowCreateEvent(obj: unknown): obj is ShowCreateEvent {
    const typedObj = obj as ShowCreateEvent
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "create" &&
        typedObj["suffix"] === "event" &&
        (typedObj["event"] !== null &&
            typeof typedObj["event"] === "object" ||
            typeof typedObj["event"] === "function") &&
        (typedObj["event"]["db"] === null ||
            typeof typedObj["event"]["db"] === "string") &&
        typeof typedObj["event"]["table"] === "string" &&
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

export function isShowCreateTrigger(obj: unknown): obj is ShowCreateTrigger {
    const typedObj = obj as ShowCreateTrigger
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "create" &&
        typedObj["suffix"] === "trigger" &&
        (typedObj["trigger"] !== null &&
            typeof typedObj["trigger"] === "object" ||
            typeof typedObj["trigger"] === "function") &&
        (typedObj["trigger"]["db"] === null ||
            typeof typedObj["trigger"]["db"] === "string") &&
        typeof typedObj["trigger"]["table"] === "string" &&
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

export function isShowCreateProcedure(obj: unknown): obj is ShowCreateProcedure {
    const typedObj = obj as ShowCreateProcedure
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "create" &&
        typedObj["suffix"] === "procedure" &&
        (typedObj["procedure"] !== null &&
            typeof typedObj["procedure"] === "object" ||
            typeof typedObj["procedure"] === "function") &&
        (typedObj["procedure"]["db"] === null ||
            typeof typedObj["procedure"]["db"] === "string") &&
        typeof typedObj["procedure"]["table"] === "string" &&
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

export function isShowGrants(obj: unknown): obj is ShowGrants {
    const typedObj = obj as ShowGrants
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "show" &&
        typedObj["keyword"] === "grants" &&
        (typedObj["for"] === null ||
            (typedObj["for"] !== null &&
                typeof typedObj["for"] === "object" ||
                typeof typedObj["for"] === "function") &&
            typeof typedObj["for"]["user"] === "string" &&
            (typedObj["for"]["host"] === null ||
                typeof typedObj["for"]["host"] === "string") &&
            (typedObj["for"]["role_list"] === null ||
                Array.isArray(typedObj["for"]["role_list"]) &&
                typedObj["for"]["role_list"].every((e: any) =>
                    typeof e === "string"
                ))) &&
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

export function isShow(obj: unknown): obj is Show {
    const typedObj = obj as Show
    return (
        (isShowLogs(typedObj) as boolean ||
            isShowTables(typedObj) as boolean ||
            isShowSimple(typedObj) as boolean ||
            isShowProcedureFunctionStatus(typedObj) as boolean ||
            isShowBinlogEvents(typedObj) as boolean ||
            isShowCharacterSet(typedObj) as boolean ||
            isShowCollationDatabases(typedObj) as boolean ||
            isShowColumnsIndexes(typedObj) as boolean ||
            isShowCreateTable(typedObj) as boolean ||
            isShowCreateView(typedObj) as boolean ||
            isShowCreateEvent(typedObj) as boolean ||
            isShowCreateTrigger(typedObj) as boolean ||
            isShowCreateProcedure(typedObj) as boolean ||
            isShowGrants(typedObj) as boolean)
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

export function isSetAssign(obj: unknown): obj is SetAssign {
    const typedObj = obj as SetAssign
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["type"] === "assign" &&
        (typedObj["left"] !== null &&
            typeof typedObj["left"] === "object" ||
            typeof typedObj["left"] === "function") &&
        typedObj["left"]["type"] === "var" &&
        typeof typedObj["left"]["name"] === "string" &&
        Array.isArray(typedObj["left"]["members"]) &&
        typedObj["left"]["members"].every((e: any) =>
            typeof e === "string"
        ) &&
        (typedObj["left"]["prefix"] === null ||
            typeof typedObj["left"]["prefix"] === "string") &&
        typeof typedObj["symbol"] === "string" &&
        (isTableColumnAst(typedObj["right"]) as boolean ||
            isValueExpr(typedObj["right"]) as boolean ||
            isColumnRefItem(typedObj["right"]) as boolean ||
            isCase(typedObj["right"]) as boolean ||
            isCast(typedObj["right"]) as boolean ||
            isAggrFunc(typedObj["right"]) as boolean ||
            isFunction(typedObj["right"]) as boolean ||
            isFulltextSearch(typedObj["right"]) as boolean ||
            isInterval(typedObj["right"]) as boolean ||
            isParam(typedObj["right"]) as boolean ||
            isVar(typedObj["right"]) as boolean ||
            isBinary(typedObj["right"]) as boolean ||
            isUnary(typedObj["right"]) as boolean ||
            isExtractFunc(typedObj["right"]) as boolean)
    )
}

export function isSetStatement(obj: unknown): obj is SetStatement {
    const typedObj = obj as SetStatement
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
            isSetAssign(e) as boolean
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
        (typedObj["keyword"] === "priv" ||
            typedObj["keyword"] === "proxy" ||
            typedObj["keyword"] === "role") &&
        Array.isArray(typedObj["objects"]) &&
        typedObj["objects"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            (isStringValue(e["priv"]) as boolean ||
                isOriginValue(e["priv"]) as boolean ||
                (e["priv"] !== null &&
                    typeof e["priv"] === "object" ||
                    typeof e["priv"] === "function") &&
                e["priv"]["type"] === "string" &&
                typeof e["priv"]["value"] === "string" ||
                (e["priv"] !== null &&
                    typeof e["priv"] === "object" ||
                    typeof e["priv"] === "function") &&
                e["priv"]["type"] === "origin" &&
                Array.isArray(e["priv"]["value"]) &&
                typeof e["priv"]["value"][0] === "string" &&
                typeof e["priv"]["value"][1] === "undefined") &&
            (typeof e["columns"] === "undefined" ||
                e["columns"] === null ||
                Array.isArray(e["columns"]) &&
                e["columns"].every((e: any) =>
                    isColumnRefItem(e) as boolean
                ))
        ) &&
        (typeof typedObj["on"] === "undefined" ||
            (typedObj["on"] !== null &&
                typeof typedObj["on"] === "object" ||
                typeof typedObj["on"] === "function") &&
            (typedObj["on"]["object_type"] === null ||
                typedObj["on"]["object_type"] === "function" ||
                isOriginValue(typedObj["on"]["object_type"]) as boolean ||
                typedObj["on"]["object_type"] === "table" ||
                typedObj["on"]["object_type"] === "procedure") &&
            Array.isArray(typedObj["on"]["priv_level"]) &&
            typedObj["on"]["priv_level"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (e["prefix"] === null ||
                    typeof e["prefix"] === "string") &&
                typeof e["name"] === "string"
            ) ||
            (typedObj["on"] !== null &&
                typeof typedObj["on"] === "object" ||
                typeof typedObj["on"] === "function") &&
            isStringValue(typedObj["on"]["name"]) as boolean &&
            (typedObj["on"]["host"] === null ||
                isStringValue(typedObj["on"]["host"]) as boolean)) &&
        (typedObj["to_from"] === "TO" ||
            typedObj["to_from"] === "FROM") &&
        Array.isArray(typedObj["user_or_roles"]) &&
        typedObj["user_or_roles"].every((e: any) =>
            (e !== null &&
                typeof e === "object" ||
                typeof e === "function") &&
            isStringValue(e["name"]) as boolean &&
            (e["host"] === null ||
                isStringValue(e["host"]) as boolean)
        ) &&
        (typeof typedObj["with"] === "undefined" ||
            typedObj["with"] === null ||
            isOriginValue(typedObj["with"]) as boolean) &&
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
        isStringValue(typedObj["file"]) as boolean &&
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
                typeof e === "string"
            )) &&
        (typeof typedObj["character_set"] === "undefined" ||
            typedObj["character_set"] === null ||
            Array.isArray(typedObj["character_set"]) &&
            typeof typedObj["character_set"][0] === "string" &&
            Array.isArray(typedObj["character_set"][1]) &&
            typedObj["character_set"][1].every((e: any) =>
                typeof e === "string"
            ) &&
            isDefaultValue(typedObj["character_set"][2]) as boolean) &&
        (typeof typedObj["fields"] === "undefined" ||
            typedObj["fields"] === null ||
            isLoadDataField(typedObj["fields"]) as boolean) &&
        (typeof typedObj["lines"] === "undefined" ||
            typedObj["lines"] === null ||
            isLoadDataLine(typedObj["lines"]) as boolean) &&
        (typeof typedObj["ignore"] === "undefined" ||
            typedObj["ignore"] === null ||
            (typedObj["ignore"] !== null &&
                typeof typedObj["ignore"] === "object" ||
                typeof typedObj["ignore"] === "function") &&
            isNumberValue(typedObj["ignore"]["count"]) as boolean &&
            typeof typedObj["ignore"]["suffix"] === "string") &&
        (typeof typedObj["column"] === "undefined" ||
            typedObj["column"] === null ||
            Array.isArray(typedObj["column"]) &&
            typedObj["column"].every((e: any) =>
                (e !== null &&
                    typeof e === "object" ||
                    typeof e === "function") &&
                (isTableColumnAst(e["expr"]) as boolean ||
                    isValueExpr(e["expr"]) as boolean ||
                    isColumnRefItem(e["expr"]) as boolean ||
                    isStar(e["expr"]) as boolean ||
                    isCase(e["expr"]) as boolean ||
                    isCast(e["expr"]) as boolean ||
                    isAggrFunc(e["expr"]) as boolean ||
                    isFunction(e["expr"]) as boolean ||
                    isInterval(e["expr"]) as boolean ||
                    isParam(e["expr"]) as boolean ||
                    isVar(e["expr"]) as boolean ||
                    isBinary(e["expr"]) as boolean ||
                    isUnary(e["expr"]) as boolean ||
                    isExprList(e["expr"]) as boolean) &&
                (e["as"] === null ||
                    typeof e["as"] === "string")
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
            isStringValue(typedObj["terminated"]) as boolean &&
            (typedObj["terminated"] !== null &&
                typeof typedObj["terminated"] === "object" ||
                typeof typedObj["terminated"] === "function") &&
            typeof typedObj["terminated"]["prefix"] === "string") &&
        (typedObj["enclosed"] === null ||
            isStringValue(typedObj["enclosed"]) as boolean &&
            (typedObj["enclosed"] !== null &&
                typeof typedObj["enclosed"] === "object" ||
                typeof typedObj["enclosed"] === "function") &&
            typeof typedObj["enclosed"]["prefix"] === "string") &&
        (typedObj["escaped"] === null ||
            isStringValue(typedObj["escaped"]) as boolean &&
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
            isStringValue(typedObj["starting"]) as boolean &&
            (typedObj["starting"] !== null &&
                typeof typedObj["starting"] === "object" ||
                typeof typedObj["starting"] === "function") &&
            typeof typedObj["starting"]["prefix"] === "string") &&
        (typedObj["terminated"] === null ||
            isStringValue(typedObj["terminated"]) as boolean &&
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
        isOriginValue(typedObj["expr"]["action"]) as boolean &&
        (typeof typedObj["expr"]["keyword"] === "undefined" ||
            typedObj["expr"]["keyword"] === "TRANSACTION") &&
        (typeof typedObj["expr"]["modes"] === "undefined" ||
            typedObj["expr"]["modes"] === null ||
            Array.isArray(typedObj["expr"]["modes"]) &&
            typedObj["expr"]["modes"].every((e: any) =>
                isOriginValue(e) as boolean
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
            isShowLogs(typedObj) as boolean ||
            isShowTables(typedObj) as boolean ||
            isShowSimple(typedObj) as boolean ||
            isShowProcedureFunctionStatus(typedObj) as boolean ||
            isShowBinlogEvents(typedObj) as boolean ||
            isShowCharacterSet(typedObj) as boolean ||
            isShowCollationDatabases(typedObj) as boolean ||
            isShowColumnsIndexes(typedObj) as boolean ||
            isShowCreateTable(typedObj) as boolean ||
            isShowCreateView(typedObj) as boolean ||
            isShowCreateEvent(typedObj) as boolean ||
            isShowCreateTrigger(typedObj) as boolean ||
            isShowCreateProcedure(typedObj) as boolean ||
            isShowGrants(typedObj) as boolean ||
            isDesc(typedObj) as boolean ||
            isExplain(typedObj) as boolean ||
            isCall(typedObj) as boolean ||
            isSetStatement(typedObj) as boolean ||
            isLock(typedObj) as boolean ||
            isUnlock(typedObj) as boolean ||
            isGrant(typedObj) as boolean ||
            isLoadData(typedObj) as boolean ||
            isTruncate(typedObj) as boolean ||
            isRename(typedObj) as boolean ||
            isTransaction(typedObj) as boolean)
    )
}
