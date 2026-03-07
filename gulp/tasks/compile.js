// This task is optional - TypeScript compilation is done via tsc in package.json
// Lazy-load gulp-typescript to avoid errors if not installed
const compile = () => {
  const gulp = require('gulp')
  const ts = require('gulp-typescript')
  const tsProject = ts.createProject('tsconfig.json')
  const tsResult = tsProject.src().pipe(tsProject())
  return tsResult.js.pipe(gulp.dest('dist'))
}

exports.compile = compile