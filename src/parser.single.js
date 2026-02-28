// Import pre-generated parser (defaults to mysql, replaced by webpack for single-dialect builds)
import { parse } from '../lib/parser/mysql'

export default {
  [PARSER_NAME] : parse,
}
