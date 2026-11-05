const fs = require('fs')
const path = require('path')
const dir = path.resolve(__dirname, './gulp/tasks')
const files = fs.readdirSync(dir)

for (const file of files) {
  const action = file.split('.')[0]
  try {
    exports[action] = require(path.join(dir, action))[action]
  } catch (e) {
    // Some tasks may have optional dependencies - skip if not available
    console.warn(`Warning: Could not load gulp task '${action}': ${e.message}`)
  }
}
