const { rimraf } = require('rimraf')
const config = require('../config')

const clean = async (done) => {
  const promises = config.outputs.map(output => rimraf(output))
  promises.push(rimraf('pegjs/*-build.pegjs', { glob: true }), rimraf(`src/parser/dialect/*`, { glob: true }))
  await Promise.all(promises)
  done()
}

exports.clean = clean