const fs = require('fs/promises')

const readFile = async (filePath) => {
  return await fs.readFile(filePath, { encoding: 'utf-8' })
}

exports.readFile = readFile