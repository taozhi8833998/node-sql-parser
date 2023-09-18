import {
  identifierToSql,
  getParserOpt,
  hasVal,
  toUpper,
} from './util'
import { indexTypeAndOptionToSQL } from './index-definition'
import { columnReferenceDefinitionToSQL } from './column'

function constraintDefinitionToSQL(constraintDefinition) {
  if (!constraintDefinition) return
  const {
    constraint,
    constraint_type: constraintType,
    enforced,
    index,
    keyword,
    reference_definition: referenceDefinition,
  } = constraintDefinition
  const constraintSQL = []
  const { database } = getParserOpt()
  constraintSQL.push(toUpper(keyword))
  constraintSQL.push(identifierToSql(constraint))
  let constraintTypeStr = toUpper(constraintType)
  if (database === 'sqlite' && constraintTypeStr === 'UNIQUE KEY') constraintTypeStr = 'UNIQUE'
  constraintSQL.push(constraintTypeStr)
  constraintSQL.push(database !== 'sqlite' && identifierToSql(index))
  constraintSQL.push(...indexTypeAndOptionToSQL(constraintDefinition))
  constraintSQL.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  constraintSQL.push(toUpper(enforced))
  return constraintSQL.filter(hasVal).join(' ')
}

export {
  constraintDefinitionToSQL,
}
