/*const fs = require('fs')
const path = require('path')
const peg = require('peggy')

const parserFolder = path.join(__dirname, 'pegjs')
const PARSER_FILE = /(.*)\.pegjs$/
*/

// note: we don't actually need it anymore now that we're pre-building
/*
fs.readdirSync(parserFolder)
  .filter(file => PARSER_FILE.test(file))
  .forEach(file => {
    const [, name] = file.match(PARSER_FILE)
    const source = fs.readFileSync(path.join(parserFolder, file), 'utf8')
    const parser = peg.generate(source, {
      format: 'umd',
      output: 'source',
      dependencies: {
        "BigInt": "big-integer",
      },
    })
    fs.writeFileSync(path.join(__dirname, `build/${name}.js`), parser)
  })
*/
