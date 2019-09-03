import { exprToSQL } from './expr'

function commentToSQL(comment) {
  if (!comment) return
  const result = []
  const { keyword, symobl, value } = comment
  result.push(keyword.toUpperCase())
  if (symobl) result.push(symobl)
  result.push(exprToSQL(value))
  return result.join(' ')
}

export {
  commentToSQL,
}
