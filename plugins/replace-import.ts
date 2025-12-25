import { Pass, Plugin } from "peggy"

const IMPORT_REGEX = /import\s*\{[^}]*\}\s*from\s*['][^']*'\s*;?/g
let imports: Record<string, string[]> = {
  initializer: [],
  topLevelInitializer: []
}

export const replaceImports: Plugin = {
  use(config, options) {
    // Reset imports to avoid accumulation when building multiple files
    imports = { initializer: [], topLevelInitializer: [] }
    config.passes.generate.unshift(removeImport('initializer'), removeImport('topLevelInitializer'))
    config.passes.generate.push(addImport)
  },
}

const removeImport: (key: 'initializer' | 'topLevelInitializer') => Pass = (initializerName: 'initializer' | 'topLevelInitializer') => (ast) => {
  if (!ast[initializerName]) return
  const initializer = ast[initializerName]!
  const code = initializer.code
  imports[initializerName].push(...(code.match(IMPORT_REGEX) || []))
  const withoutImports = code.replace(IMPORT_REGEX, "")
  initializer.code = withoutImports
}

const addImport: Pass = (ast) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if(ast.code) ast.code.children[1] = `${imports.topLevelInitializer.concat(imports.initializer).join("\n")}\n` as any
}