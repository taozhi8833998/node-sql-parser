// Comprehensive SQL keywords shared across all dialects
// Merged from all dialect files - use @import 'common/keyword/core.pegjs' to include

// ============================================================================
// Basic Literals
// ============================================================================
KW_NULL     = "NULL"i       !ident_start
KW_DEFAULT  = "DEFAULT"i    !ident_start
KW_NOT_NULL = "NOT NULL"i   !ident_start
KW_TRUE     = "TRUE"i       !ident_start
KW_TO       = "TO"i         !ident_start
KW_FALSE    = "FALSE"i      !ident_start

// ============================================================================
// DML Keywords
// ============================================================================
KW_SHOW     = "SHOW"i       !ident_start
KW_DROP     = "DROP"i       !ident_start { return 'DROP'; }
KW_USE      = "USE"i        !ident_start
KW_ALTER    = "ALTER"i      !ident_start { return 'ALTER'; }
KW_SELECT   = "SELECT"i     !ident_start
KW_UPDATE   = "UPDATE"i     !ident_start
KW_CREATE   = "CREATE"i     !ident_start
KW_TEMPORARY = "TEMPORARY"i !ident_start
KW_TEMP     = "TEMP"i       !ident_start
KW_DELETE   = "DELETE"i     !ident_start
KW_INSERT   = "INSERT"i     !ident_start
KW_RECURSIVE= "RECURSIVE"i  !ident_start { return 'RECURSIVE'; }
KW_REPLACE  = "REPLACE"i    !ident_start
KW_RETURN   = "RETURN"i     !ident_start { return 'RETURN'; }
KW_RETURNING = "RETURNING"i !ident_start { return 'RETURNING'; }
KW_RENAME   = "RENAME"i     !ident_start
KW_IGNORE   = "IGNORE"i     !ident_start
KW_EXPLAIN  = "EXPLAIN"i    !ident_start
KW_DESCRIBE = "DESCRIBE"i   !ident_start { return 'DESCRIBE'; }
KW_PARTITION = "PARTITION"i !ident_start { return 'PARTITION'; }
KW_ANALYZE  = "ANALYZE"i    !ident_start { return 'ANALYZE'; }
KW_ATTACH   = "ATTACH"i     !ident_start { return 'ATTACH'; }
KW_DECLARE  = "DECLARE"i    !ident_start { return 'DECLARE'; }

KW_INTO     = "INTO"i       !ident_start
KW_FROM     = "FROM"i       !ident_start
KW_OVERWRITE = "OVERWRITE"i !ident_start { return 'OVERWRITE'; }
KW_SET      = "SET"i        !ident_start { return 'SET'; }
KW_UNLOCK   = "UNLOCK"i     !ident_start
KW_LOCK     = "LOCK"i       !ident_start

// ============================================================================
// Table/Schema Keywords
// ============================================================================
KW_AS       = "AS"i         !ident_start
KW_TABLE    = "TABLE"i      !ident_start { return 'TABLE'; }
KW_TABLES   = "TABLES"i     !ident_start { return 'TABLES'; }
KW_DATABASE = "DATABASE"i   !ident_start { return 'DATABASE'; }
KW_SCHEMA   = "SCHEMA"i     !ident_start { return 'SCHEMA'; }
KW_SEQUENCE = "SEQUENCE"i   !ident_start { return 'SEQUENCE'; }
KW_TABLESPACE = "TABLESPACE"i !ident_start { return 'TABLESPACE'; }
KW_COLLATE  = "COLLATE"i    !ident_start { return 'COLLATE'; }
KW_COLLATION = "COLLATION"i !ident_start { return 'COLLATION'; }
KW_DEALLOCATE = "DEALLOCATE"i !ident_start { return 'DEALLOCATE'; }
KW_TRIGGER  = "TRIGGER"i    !ident_start { return 'TRIGGER'; }
KW_VIEW     = "VIEW"i       !ident_start { return 'VIEW'; }
KW_UNLOGGED = "UNLOGGED"i   !ident_start { return 'UNLOGGED'; }

// ============================================================================
// Join Keywords
// ============================================================================
KW_ON       = "ON"i         !ident_start
KW_OFF      = "OFF"i        !ident_start
KW_LEFT     = "LEFT"i       !ident_start { return 'LEFT'; }
KW_RIGHT    = "RIGHT"i      !ident_start { return 'RIGHT'; }
KW_FULL     = "FULL"i       !ident_start { return 'FULL'; }
KW_INNER    = "INNER"i      !ident_start { return 'INNER'; }
KW_CROSS    = "CROSS"i      !ident_start { return 'CROSS'; }
KW_JOIN     = "JOIN"i       !ident_start { return 'JOIN'; }
KW_OUTER    = "OUTER"i      !ident_start { return 'OUTER'; }
KW_OVER     = "OVER"i       !ident_start { return 'OVER'; }
KW_NATURAL  = "NATURAL"i    !ident_start { return 'NATURAL'; }
KW_APPLY    = "APPLY"i      !ident_start { return 'APPLY'; }
KW_STRAIGHT_JOIN = "STRAIGHT_JOIN"i !ident_start { return 'STRAIGHT_JOIN'; }

// ============================================================================
// Set Operations
// ============================================================================
KW_UNION    = "UNION"i      !ident_start { return 'UNION'; }
KW_MINUS    = "MINUS"i      !ident_start { return 'MINUS'; }
KW_INTERSECT = "INTERSECT"i !ident_start { return 'INTERSECT'; }
KW_EXCEPT   = "EXCEPT"i     !ident_start { return 'EXCEPT'; }
KW_VALUE    = "VALUE"i      !ident_start { return 'VALUE'; }
KW_VALUES   = "VALUES"i     !ident_start
KW_USING    = "USING"i      !ident_start

// ============================================================================
// Clause Keywords
// ============================================================================
KW_WHERE    = "WHERE"i      !ident_start
KW_WITH     = "WITH"i       !ident_start

KW_GO       = "GO"i         !ident_start { return 'GO'; }
KW_GROUP    = "GROUP"i      !ident_start
KW_BY       = "BY"i         !ident_start
KW_ORDER    = "ORDER"i      !ident_start
KW_HAVING   = "HAVING"i     !ident_start
KW_QUALIFY  = "QUALIFY"i    !ident_start { return 'QUALIFY'; }
KW_WINDOW   = "WINDOW"i     !ident_start { return 'WINDOW'; }

KW_LIMIT    = "LIMIT"i      !ident_start
KW_OFFSET   = "OFFSET"i     !ident_start { return 'OFFSET'; }
KW_FETCH    = "FETCH"i      !ident_start { return 'FETCH'; }
KW_TOP      = "TOP"i        !ident_start { return 'TOP'; }

// ============================================================================
// Order Keywords
// ============================================================================
KW_ASC      = "ASC"i        !ident_start { return 'ASC'; }
KW_DESC     = "DESC"i       !ident_start { return 'DESC'; }

KW_ALL      = "ALL"i        !ident_start { return 'ALL'; }
KW_DISTINCT = "DISTINCT"i   !ident_start { return 'DISTINCT'; }

// ============================================================================
// Comparison/Logical Keywords
// ============================================================================
KW_BETWEEN  = "BETWEEN"i    !ident_start { return 'BETWEEN'; }
KW_IN       = "IN"i         !ident_start { return 'IN'; }
KW_IS       = "IS"i         !ident_start { return 'IS'; }
KW_LIKE     = "LIKE"i       !ident_start { return 'LIKE'; }
KW_ILIKE    = "ILIKE"i      !ident_start { return 'ILIKE'; }
KW_RLIKE    = "RLIKE"i      !ident_start { return 'RLIKE'; }
KW_REGEXP   = "REGEXP"i     !ident_start { return 'REGEXP'; }
KW_SIMILAR  = "SIMILAR"i    !ident_start { return 'SIMILAR'; }
KW_EXISTS   = "EXISTS"i     !ident_start { return 'EXISTS'; }

KW_NOT      = "NOT"i        !ident_start { return 'NOT'; }
KW_AND      = "AND"i        !ident_start { return 'AND'; }
KW_OR       = "OR"i         !ident_start { return 'OR'; }

// ============================================================================
// Aggregate Functions
// ============================================================================
KW_COUNT    = "COUNT"i      !ident_start { return 'COUNT'; }
KW_MAX      = "MAX"i        !ident_start { return 'MAX'; }
KW_MIN      = "MIN"i        !ident_start { return 'MIN'; }
KW_SUM      = "SUM"i        !ident_start { return 'SUM'; }
KW_AVG      = "AVG"i        !ident_start { return 'AVG'; }
KW_GROUP_CONCAT = "GROUP_CONCAT"i !ident_start { return 'GROUP_CONCAT'; }
KW_STRING_AGG = "STRING_AGG"i !ident_start { return 'STRING_AGG'; }
KW_LISTAGG  = "LISTAGG"i    !ident_start { return 'LISTAGG'; }
KW_COLLECT  = "COLLECT"i    !ident_start { return 'COLLECT'; }

// ============================================================================
// Window Functions
// ============================================================================
KW_RANK       = "RANK"i       !ident_start { return 'RANK'; }
KW_DENSE_RANK = "DENSE_RANK"i !ident_start { return 'DENSE_RANK'; }
KW_ROW_NUMBER = "ROW_NUMBER"i !ident_start { return 'ROW_NUMBER'; }

// ============================================================================
// Function Keywords
// ============================================================================
KW_CALL     = "CALL"i       !ident_start { return 'CALL'; }
KW_EXTRACT  = "EXTRACT"i    !ident_start { return 'EXTRACT'; }
KW_ARRAY    = "ARRAY"i      !ident_start { return 'ARRAY'; }
KW_ARRAY_AGG = "ARRAY_AGG"i !ident_start { return 'ARRAY_AGG'; }

// ============================================================================
// Case Expression
// ============================================================================
KW_CASE     = "CASE"i       !ident_start
KW_WHEN     = "WHEN"i       !ident_start
KW_THEN     = "THEN"i       !ident_start
KW_ELSE     = "ELSE"i       !ident_start
KW_END      = "END"i        !ident_start

// ============================================================================
// Cast Keywords
// ============================================================================
KW_CAST     = "CAST"i       !ident_start { return 'CAST'; }
KW_TRY_CAST = "TRY_CAST"i   !ident_start { return 'TRY_CAST'; }
KW_SAFE_CAST = "SAFE_CAST"i !ident_start { return 'SAFE_CAST'; }

// ============================================================================
// Boolean Data Types
// ============================================================================
KW_BOOL     = "BOOL"i       !ident_start { return 'BOOL'; }
KW_BOOLEAN  = "BOOLEAN"i    !ident_start { return 'BOOLEAN'; }

// ============================================================================
// Character/String Data Types
// ============================================================================
KW_CHAR     = "CHAR"i       !ident_start { return 'CHAR'; }
KW_CHARACTER = "CHARACTER"i !ident_start { return 'CHARACTER'; }
KW_VARCHAR  = "VARCHAR"i    !ident_start { return 'VARCHAR'; }
KW_NCHAR    = "NCHAR"i      !ident_start { return 'NCHAR'; }
KW_NVARCHAR = "NVARCHAR"i   !ident_start { return 'NVARCHAR'; }
KW_STRING   = "STRING"i     !ident_start { return 'STRING'; }
KW_TEXT     = "TEXT"i       !ident_start { return 'TEXT'; }
KW_NTEXT    = "NTEXT"i      !ident_start { return 'NTEXT'; }
KW_TINYTEXT = "TINYTEXT"i   !ident_start { return 'TINYTEXT'; }
KW_MEDIUMTEXT = "MEDIUMTEXT"i !ident_start { return 'MEDIUMTEXT'; }
KW_LONGTEXT = "LONGTEXT"i   !ident_start { return 'LONGTEXT'; }
KW_BYTES    = "BYTES"i      !ident_start { return 'BYTES'; }
KW_BYTEA    = "BYTEA"i      !ident_start { return 'BYTEA'; }

// ============================================================================
// Numeric Data Types
// ============================================================================
KW_NUMERIC  = "NUMERIC"i    !ident_start { return 'NUMERIC'; }
KW_DECIMAL  = "DECIMAL"i    !ident_start { return 'DECIMAL'; }
KW_NUMBER   = "NUMBER"i     !ident_start { return 'NUMBER'; }
KW_SIGNED   = "SIGNED"i     !ident_start { return 'SIGNED'; }
KW_UNSIGNED = "UNSIGNED"i   !ident_start { return 'UNSIGNED'; }
KW_INT      = "INT"i        !ident_start { return 'INT'; }
KW_INT_64   = "INT64"i      !ident_start { return 'INT64'; }
KW_INTEGER  = "INTEGER"i    !ident_start { return 'INTEGER'; }
KW_SMALLINT = "SMALLINT"i   !ident_start { return 'SMALLINT'; }
KW_MEDIUMINT = "MEDIUMINT"i !ident_start { return 'MEDIUMINT'; }
KW_TINYINT  = "TINYINT"i    !ident_start { return 'TINYINT'; }
KW_BYTEINT  = "BYTEINT"i    !ident_start { return 'BYTEINT'; }
KW_BIGINT   = "BIGINT"i     !ident_start { return 'BIGINT'; }
KW_FLOAT    = "FLOAT"i      !ident_start { return 'FLOAT'; }
KW_FLOAT4   = "FLOAT4"i     !ident_start { return 'FLOAT4'; }
KW_FLOAT8   = "FLOAT8"i     !ident_start { return 'FLOAT8'; }
KW_FLOAT_64 = "FLOAT64"i    !ident_start { return 'FLOAT64'; }
KW_DOUBLE   = "DOUBLE"i     !ident_start { return 'DOUBLE'; }
KW_REAL     = "REAL"i       !ident_start { return 'REAL'; }
KW_PRECISION = "PRECISION"i !ident_start { return 'PRECISION'; }
KW_ZEROFILL = "ZEROFILL"i   !ident_start { return 'ZEROFILL'; }

// ============================================================================
// Serial Types
// ============================================================================
KW_SERIAL   = "SERIAL"i     !ident_start { return 'SERIAL'; }
KW_SMALLSERIAL = "SMALLSERIAL"i !ident_start { return 'SMALLSERIAL'; }
KW_BIGSERIAL = "BIGSERIAL"i !ident_start { return 'BIGSERIAL'; }

// ============================================================================
// Binary Data Types
// ============================================================================
KW_BINARY   = "BINARY"i     !ident_start { return 'BINARY'; }
KW_VARBINARY = "VARBINARY"i !ident_start { return 'VARBINARY'; }
KW_BIT      = "BIT"i        !ident_start { return 'BIT'; }

// ============================================================================
// JSON Data Types
// ============================================================================
KW_JSON     = "JSON"i       !ident_start { return 'JSON'; }
KW_JSONB    = "JSONB"i      !ident_start { return 'JSONB'; }

// ============================================================================
// Enum Type
// ============================================================================
KW_ENUM     = "ENUM"i       !ident_start { return 'ENUM'; }

// ============================================================================
// Struct/Row Types
// ============================================================================
KW_STRUCT   = "STRUCT"i     !ident_start { return 'STRUCT'; }
KW_ROW      = "ROW"i        !ident_start { return 'ROW'; }
KW_ROWS     = "ROWS"i       !ident_start { return 'ROWS'; }
KW_MAP      = "MAP"i        !ident_start { return 'MAP'; }
KW_MULTISET = "MULTISET"i   !ident_start { return 'MULTISET'; }

// ============================================================================
// Date/Time Data Types
// ============================================================================
KW_DATE     = "DATE"i       !ident_start { return 'DATE'; }
KW_DATETIME = "DATETIME"i   !ident_start { return 'DATETIME'; }
KW_DATETIME2 = "DATETIME2"i !ident_start { return 'DATETIME2'; }
KW_DATETIMEOFFSET = "DATETIMEOFFSET"i !ident_start { return 'DATETIMEOFFSET'; }
KW_SMALLDATETIME = "SMALLDATETIME"i !ident_start { return 'SMALLDATETIME'; }
KW_TIME     = "TIME"i       !ident_start { return 'TIME'; }
KW_TIMESTAMP = "TIMESTAMP"i !ident_start { return 'TIMESTAMP'; }
KW_TIMESTAMPTZ = "TIMESTAMPTZ"i !ident_start { return 'TIMESTAMPTZ'; }
KW_TIMESTAMP_TZ = "TIMESTAMP_TZ"i !ident_start { return 'TIMESTAMP_TZ'; }
KW_TIMESTAMP_NTZ = "TIMESTAMP_NTZ"i !ident_start { return 'TIMESTAMP_NTZ'; }
KW_YEAR     = "YEAR"i       !ident_start { return 'YEAR'; }

// ============================================================================
// Geometry/Geography Types
// ============================================================================
KW_GEOMETRY = "GEOMETRY"i   !ident_start { return 'GEOMETRY'; }
KW_GEOGRAPHY = "GEOGRAPHY"i !ident_start { return 'GEOGRAPHY'; }
KW_POINT    = "POINT"i      !ident_start { return 'POINT'; }
KW_LINESTRING = "LINESTRING"i !ident_start { return 'LINESTRING'; }
KW_POLYGON  = "POLYGON"i    !ident_start { return 'POLYGON'; }
KW_MULTIPOINT = "MULTIPOINT"i !ident_start { return 'MULTIPOINT'; }
KW_MULTILINESTRING = "MULTILINESTRING"i !ident_start { return 'MULTILINESTRING'; }
KW_MULTIPOLYGON = "MULTIPOLYGON"i !ident_start { return 'MULTIPOLYGON'; }
KW_GEOMETRYCOLLECTION = "GEOMETRYCOLLECTION"i !ident_start { return 'GEOMETRYCOLLECTION'; }

// ============================================================================
// UUID Type
// ============================================================================
KW_UUID     = "UUID"i       !ident_start { return 'UUID'; }
KW_UNIQUEIDENTIFIER = "UNIQUEIDENTIFIER"i !ident_start { return 'UNIQUEIDENTIFIER'; }

// ============================================================================
// PostgreSQL OID Types
// ============================================================================
KW_OID      = "OID"i        !ident_start { return 'OID'; }
KW_REGCLASS = "REGCLASS"i   !ident_start { return 'REGCLASS'; }
KW_REGCOLLATION = "REGCOLLATION"i !ident_start { return 'REGCOLLATION'; }
KW_REGCONFIG = "REGCONFIG"i !ident_start { return 'REGCONFIG'; }
KW_REGDICTIONARY = "REGDICTIONARY"i !ident_start { return 'REGDICTIONARY'; }
KW_REGNAMESPACE = "REGNAMESPACE"i !ident_start { return 'REGNAMESPACE'; }
KW_REGOPER  = "REGOPER"i    !ident_start { return 'REGOPER'; }
KW_REGOPERATOR = "REGOPERATOR"i !ident_start { return 'REGOPERATOR'; }
KW_REGPROC  = "REGPROC"i    !ident_start { return 'REGPROC'; }
KW_REGPROCEDURE = "REGPROCEDURE"i !ident_start { return 'REGPROCEDURE'; }
KW_REGROLE  = "REGROLE"i    !ident_start { return 'REGROLE'; }
KW_REGTYPE  = "REGTYPE"i    !ident_start { return 'REGTYPE'; }

// ============================================================================
// PostgreSQL Text Search Types
// ============================================================================
KW_TSVECTOR = "TSVECTOR"i   !ident_start { return 'TSVECTOR'; }
KW_TSQUERY  = "TSQUERY"i    !ident_start { return 'TSQUERY'; }

// ============================================================================
// PostgreSQL Network Types
// ============================================================================
KW_CIDR     = "CIDR"i       !ident_start { return 'CIDR'; }
KW_INET     = "INET"i       !ident_start { return 'INET'; }
KW_MACADDR  = "MACADDR"i    !ident_start { return 'MACADDR'; }
KW_MACADDR8 = "MACADDR8"i   !ident_start { return 'MACADDR8'; }

// ============================================================================
// Money Type
// ============================================================================
KW_MONEY    = "MONEY"i      !ident_start { return 'MONEY'; }
KW_SMALLMONEY = "SMALLMONEY"i !ident_start { return 'SMALLMONEY'; }

// ============================================================================
// Vector Type
// ============================================================================
KW_VECTOR   = "VECTOR"i     !ident_start { return 'VECTOR'; }

// ============================================================================
// Misc Types
// ============================================================================
KW_TRUNCATE = "TRUNCATE"i   !ident_start { return 'TRUNCATE'; }
KW_USER     = "USER"i       !ident_start { return 'USER'; }

// ============================================================================
// Date/Time Functions
// ============================================================================
KW_CURRENT_DATE     = "CURRENT_DATE"i !ident_start { return 'CURRENT_DATE'; }
KW_ADD_DATE         = "ADDDATE"i !ident_start { return 'ADDDATE'; }
KW_INTERVAL         = "INTERVAL"i !ident_start { return 'INTERVAL'; }
KW_CURRENT_TIME     = "CURRENT_TIME"i !ident_start { return 'CURRENT_TIME'; }
KW_CURRENT_TIMESTAMP = "CURRENT_TIMESTAMP"i !ident_start { return 'CURRENT_TIMESTAMP'; }
KW_CURRENT_USER     = "CURRENT_USER"i !ident_start { return 'CURRENT_USER'; }
KW_CURRENT_ROLE     = "CURRENT_ROLE"i !ident_start { return 'CURRENT_ROLE'; }
KW_SESSION_USER     = "SESSION_USER"i !ident_start { return 'SESSION_USER'; }
KW_SYSTEM_USER      = "SYSTEM_USER"i !ident_start { return 'SYSTEM_USER'; }

// ============================================================================
// Interval Units
// ============================================================================
KW_UNIT_YEAR        = "YEAR"i !ident_start { return 'YEAR'; }
KW_UNIT_ISOYEAR     = "ISOYEAR"i !ident_start { return 'ISOYEAR'; }
KW_UNIT_QUARTER     = "QUARTER"i !ident_start { return 'QUARTER'; }
KW_UNIT_MONTH       = "MONTH"i !ident_start { return 'MONTH'; }
KW_UNIT_WEEK        = ("WEEK"i / "W"i / "WK"i / "WEEKOFYEAR"i / "WOY"i / "WY"i / "WEEKS"i) !ident_start { return 'WEEK'; }
KW_UNIT_DAY         = "DAY"i !ident_start { return 'DAY'; }
KW_UNIT_HOUR        = "HOUR"i !ident_start { return 'HOUR'; }
KW_UNIT_MINUTE      = "MINUTE"i !ident_start { return 'MINUTE'; }
KW_UNIT_SECOND      = "SECOND"i !ident_start { return 'SECOND'; }
KW_UNIT_SECONDS     = "SECONDS"i !ident_start { return 'SECONDS'; }
KW_UNIT_MICROSECOND = "MICROSECOND"i !ident_start { return 'MICROSECOND'; }

// MySQL Compound Interval Units
KW_UNIT_SECOND_MICROSECOND = "SECOND_MICROSECOND"i !ident_start { return 'SECOND_MICROSECOND'; }
KW_UNIT_MINUTE_MICROSECOND = "MINUTE_MICROSECOND"i !ident_start { return 'MINUTE_MICROSECOND'; }
KW_UNIT_MINUTE_SECOND      = "MINUTE_SECOND"i !ident_start { return 'MINUTE_SECOND'; }
KW_UNIT_HOUR_MICROSECOND   = "HOUR_MICROSECOND"i !ident_start { return 'HOUR_MICROSECOND'; }
KW_UNIT_HOUR_SECOND        = "HOUR_SECOND"i !ident_start { return 'HOUR_SECOND'; }
KW_UNIT_HOUR_MINUTE        = "HOUR_MINUTE"i !ident_start { return 'HOUR_MINUTE'; }
KW_UNIT_DAY_MICROSECOND    = "DAY_MICROSECOND"i !ident_start { return 'DAY_MICROSECOND'; }
KW_UNIT_DAY_SECOND         = "DAY_SECOND"i !ident_start { return 'DAY_SECOND'; }
KW_UNIT_DAY_MINUTE         = "DAY_MINUTE"i !ident_start { return 'DAY_MINUTE'; }
KW_UNIT_DAY_HOUR           = "DAY_HOUR"i !ident_start { return 'DAY_HOUR'; }
KW_UNIT_YEAR_MONTH         = "YEAR_MONTH"i !ident_start { return 'YEAR_MONTH'; }

// ============================================================================
// Session Keywords
// ============================================================================
KW_GLOBAL         = "GLOBAL"i    !ident_start { return 'GLOBAL'; }
KW_SESSION        = "SESSION"i   !ident_start { return 'SESSION'; }
KW_LOCAL          = "LOCAL"i     !ident_start { return 'LOCAL'; }
KW_PERSIST        = "PERSIST"i   !ident_start { return 'PERSIST'; }
KW_PERSIST_ONLY   = "PERSIST_ONLY"i !ident_start { return 'PERSIST_ONLY'; }

// ============================================================================
// Pivot Keywords
// ============================================================================
KW_PIVOT    = "PIVOT"i      !ident_start { return 'PIVOT'; }
KW_UNPIVOT  = "UNPIVOT"i    !ident_start { return 'UNPIVOT'; }

// ============================================================================
// BigQuery Array Access
// ============================================================================
KW_ORDINAL       = "ORDINAL"i !ident_start { return 'ORDINAL'; }
KW_SAFE_ORDINAL  = "SAFE_ORDINAL"i !ident_start { return 'SAFE_ORDINAL'; }
KW_SAFE_OFFSET   = "SAFE_OFFSET"i !ident_start { return 'SAFE_OFFSET'; }

// ============================================================================
// Variable Prefixes
// ============================================================================
KW_VAR__PRE_AT = '@'
KW_VAR__PRE_AT_AT = '@@'
KW_VAR_PRE_DOLLAR = '$'
KW_VAR_PRE_DOLLAR_DOUBLE = '$$'
KW_VAR_PRE
  = KW_VAR__PRE_AT_AT / KW_VAR__PRE_AT / KW_VAR_PRE_DOLLAR_DOUBLE / KW_VAR_PRE_DOLLAR

// ============================================================================
// Operators and Symbols
// ============================================================================
KW_ASSIGN = ':='
KW_ASSIGIN_EQUAL = '='
KW_DOUBLE_COLON = '::'
KW_SINGLE_COLON = ':'

// ============================================================================
// Dual
// ============================================================================
KW_DUAL = "DUAL"i

// ============================================================================
// Alter Keywords
// ============================================================================
KW_ADD     = "ADD"i         !ident_start { return 'ADD'; }
KW_COLUMN  = "COLUMN"i      !ident_start { return 'COLUMN'; }
KW_MODIFY  = "MODIFY"i      !ident_start { return 'MODIFY'; }
KW_INDEX   = "INDEX"i       !ident_start { return 'INDEX'; }
KW_TYPE    = "TYPE"i        !ident_start { return 'TYPE'; }
KW_KEY     = "KEY"i         !ident_start { return 'KEY'; }
KW_FULLTEXT = "FULLTEXT"i   !ident_start { return 'FULLTEXT'; }
KW_SPATIAL  = "SPATIAL"i    !ident_start { return 'SPATIAL'; }
KW_UNIQUE   = "UNIQUE"i     !ident_start { return 'UNIQUE'; }
KW_CLUSTERED = "CLUSTERED"i !ident_start { return 'CLUSTERED'; }
KW_NONCLUSTERED = "NONCLUSTERED"i !ident_start { return 'NONCLUSTERED'; }
KW_KEY_BLOCK_SIZE = "KEY_BLOCK_SIZE"i !ident_start { return 'KEY_BLOCK_SIZE'; }
KW_COMMENT  = "COMMENT"i    !ident_start { return 'COMMENT'; }
KW_CONSTRAINT = "CONSTRAINT"i !ident_start { return 'CONSTRAINT'; }
KW_CONCURRENTLY = "CONCURRENTLY"i !ident_start { return 'CONCURRENTLY'; }
KW_REFERENCES = "REFERENCES"i !ident_start { return 'REFERENCES'; }

// ============================================================================
// FlinkSQL Window Functions
// ============================================================================
KW_TUMBLE         = "TUMBLE"i         !ident_start { return 'TUMBLE'; }
KW_TUMBLE_START   = "TUMBLE_START"i   !ident_start { return 'TUMBLE_START'; }
KW_TUMBLE_END     = "TUMBLE_END"i     !ident_start { return 'TUMBLE_END'; }
KW_TUMBLE_ROWTIME = "TUMBLE_ROWTIME"i !ident_start { return 'TUMBLE_ROWTIME'; }
KW_TUMBLE_PROCTIME = "TUMBLE_PROCTIME"i !ident_start { return 'TUMBLE_PROCTIME'; }
KW_HOP_START      = "HOP_START"i      !ident_start { return 'HOP_START'; }
KW_HOP_END        = "HOP_END"i        !ident_start { return 'HOP_END'; }
KW_HOP_ROWTIME    = "HOP_ROWTIME"i    !ident_start { return 'HOP_ROWTIME'; }
KW_HOP_PROCTIME   = "HOP_PROCTIME"i   !ident_start { return 'HOP_PROCTIME'; }
KW_SESSION_START  = "SESSION_START"i  !ident_start { return 'SESSION_START'; }
KW_SESSION_END    = "SESSION_END"i    !ident_start { return 'SESSION_END'; }
KW_SESSION_ROWTIME = "SESSION_ROWTIME"i !ident_start { return 'SESSION_ROWTIME'; }
KW_SESSION_PROCTIME = "SESSION_PROCTIME"i !ident_start { return 'SESSION_PROCTIME'; }

// ============================================================================
// MySQL Extensions
// ============================================================================
OPT_SQL_CALC_FOUND_ROWS = "SQL_CALC_FOUND_ROWS"i
OPT_SQL_CACHE           = "SQL_CACHE"i
OPT_SQL_NO_CACHE        = "SQL_NO_CACHE"i
OPT_SQL_SMALL_RESULT    = "SQL_SMALL_RESULT"i
OPT_SQL_BIG_RESULT      = "SQL_BIG_RESULT"i
OPT_SQL_BUFFER_RESULT   = "SQL_BUFFER_RESULT"i
