import { literalToSQL } from './util'

function commentToSQL(comment) {
  if (!comment) return
  const result = []
  const { keyword, symobl, value } = comment
  result.push(keyword.toUpperCase())
  if (symobl) result.push(symobl)
  result.push(literalToSQL(value))
  return result.join(' ')
}

export {
  commentToSQL,
}
