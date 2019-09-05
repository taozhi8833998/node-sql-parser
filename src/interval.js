function intervalToSQL(expr) {
  const [intervalNum, unit] = expr.value
  return `INTERVAL ${intervalNum} ${unit}`
}

export {
  intervalToSQL,
}
