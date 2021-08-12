import {
  identifierToSql,
  toUpper,
  hasVal,
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
  constraintSQL.push(toUpper(keyword))
  constraintSQL.push(identifierToSql(constraint))
  constraintSQL.push(toUpper(constraintType))
  constraintSQL.push(identifierToSql(index))
  constraintSQL.push(...indexTypeAndOptionToSQL(constraintDefinition))
  constraintSQL.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  constraintSQL.push(toUpper(enforced))
  return constraintSQL.filter(hasVal).join(' ')
}

export {
  constraintDefinitionToSQL,
}
