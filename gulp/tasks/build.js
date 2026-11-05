const { parallel, series } = require('gulp')

// const build = (done) => series('clean', parallel('compile', 'render'), 'generate')(done)
const build = (done) => series('clean', 'render', 'generate', 'compile')(done)

exports.build = build