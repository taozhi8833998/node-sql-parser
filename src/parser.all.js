// Grammars are compiled by rollup-plugin-peggy (in the bundle) or by the require hook in test/setup.js.
import athena from '../pegjs/athena.pegjs'
import bigquery from '../pegjs/bigquery.pegjs'
import db2 from '../pegjs/db2.pegjs'
import flinksql from '../pegjs/flinksql.pegjs'
import hive from '../pegjs/hive.pegjs'
import mysql from '../pegjs/mysql.pegjs'
import mariadb from '../pegjs/mariadb.pegjs'
import noql from '../pegjs/noql.pegjs'
import postgresql from '../pegjs/postgresql.pegjs'
import redshift from '../pegjs/redshift.pegjs'
import sqlite from '../pegjs/sqlite.pegjs'
import transactsql from '../pegjs/transactsql.pegjs'
import snowflake from '../pegjs/snowflake.pegjs'
import trino from '../pegjs/trino.pegjs'

export default {
  athena      : athena.parse,
  bigquery    : bigquery.parse,
  db2         : db2.parse,
  flinksql    : flinksql.parse,
  hive        : hive.parse,
  mysql       : mysql.parse,
  mariadb     : mariadb.parse,
  noql        : noql.parse,
  postgresql  : postgresql.parse,
  redshift    : redshift.parse,
  snowflake   : snowflake.parse,
  sqlite      : sqlite.parse,
  transactsql : transactsql.parse,
  trino       : trino.parse,
}
