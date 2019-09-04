import {
  toUpper,
  hasVal,
} from './util'
import { indexTypeAndOptionToSQL } from './index-definition'
import { columnReferenceDefinitionToSQL } from './column'

function constraintDefinitionToSQL(constraintDefinition) {
  const {
    constraint,
    constraint_type: constraintType,
    index,
    keyword,
    reference_definition: referenceDefinition,
  } = constraintDefinition
  const constraintSQL = []
  constraintSQL.push(toUpper(keyword))
  constraintSQL.push(constraint)
  constraintSQL.push(toUpper(constraintType))
  constraintSQL.push(index)
  constraintSQL.push(...indexTypeAndOptionToSQL(constraintDefinition))
  constraintSQL.push(...columnReferenceDefinitionToSQL(referenceDefinition))
  return constraintSQL.filter(hasVal).join(' ')
}

export {
  constraintDefinitionToSQL,
}
