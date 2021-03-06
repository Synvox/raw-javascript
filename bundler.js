const path = require('path')
const fs = require('fs')

const entryPoints = {
  './todo/index.js': './todo/index.bundle.js',
  './photos/index.js': './photos/index.bundle.js',
  './book/index.js': './book/index.bundle.js',
  './stocks/index.js': './stocks/index.bundle.js'
}

const trimPath = path=>path.replace(__dirname, '')

const getImports = (filePath, imported)=>{
  const moduleKey = trimPath(filePath)

  const watcher = fs.watch(filePath, ()=>{
    watcher.close()
    main()
  })

  if (!imported[moduleKey]) {
    imported[moduleKey] = true // Stub
    const code = fs.readFileSync(filePath, 'UTF-8').replace(
      /require\(('|")(.+)\1\)/g,
      (_1, _2, newImport)=>{
        const newPath = path.resolve(path.dirname(filePath), newImport)
        getImports(newPath, imported)
        return `require('${trimPath(newPath)}')`
      }
    )
    imported[moduleKey] = code
  }
  return imported
}

const main = ()=>{
  process.stdout.write('\033c')
  console.log('Building...')
  Object.keys(entryPoints).forEach((input)=>{
    const output = entryPoints[input]
    const entryKey = trimPath(path.resolve(__dirname, input))
    const imported = {}
    getImports(path.resolve(__dirname, input), imported)

    const modules = '{\n'+Object.keys(imported)
      .map((key)=>(`"${key}":(module, require)=>{\n${imported[key]}\n}`))
      .join(',\n')+'\n}'

    const code = `// This is a generated file.
;((modules)=>{

const instances = {}
const require = (key)=>{
  if (instances[key])
    return instances[key].exports

  const module = {exports:{}}
  modules[key](module, require)
  instances[key] = module
  return module.exports
}

require('${entryKey}')

})(${modules});`

    fs.writeFileSync(path.resolve(__dirname, output), code)
    process.stdout.write('\033c')
    console.log('Bundle Complete')
  })
}

main()
