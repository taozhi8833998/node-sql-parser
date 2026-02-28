const { series } = require('gulp')

const defaultTask = (done) => series('build')(done)

exports.default = defaultTask