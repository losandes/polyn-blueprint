const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const ignoreExpression = /.([-.]test(s?)\.js)|([-.]spec(s?)\.js)|(index.browser.js)$/i
const walkSync = (dir) =>
  fs.readdirSync(dir).reduce((files, file) => {
    if (ignoreExpression.test(file)) {
      return files
    }

    const name = path.join(dir, file)
    const isDirectory = fs.statSync(name).isDirectory()
    return isDirectory ? [...files, ...walkSync(name)] : [...files, name]
  }, [])

const template = fs.readFileSync('./index.browser.js').toString().split('// MODULES_HERE')
const beginning = template[0]
const end = template[1]
const modules = [beginning]

walkSync('./src')
  .forEach(file => {
    modules.push(fs.readFileSync(file).toString())
  })

modules.push(end)

const output = babel.transform(modules.join('\n'), {
  minified: false,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead'
      }
    ]
  ]
})

const minOutput = babel.transform(modules.join('\n'), {
  minified: true,
  presets: [
    [
      '@babel/preset-env',
      {
        targets: '> 0.25%, not dead'
      }
    ]
  ]
})

// {
//   targets: {
//     // The % refers to the global coverage of users from browserslist
//     browsers: [
//       'last 2 Chrome versions',
//       'last 2 ie versions',
//       'not ie <= 10',
//       'last 2 Edge versions',
//       'last 2 Firefox versions',
//       'last 2 Safari versions',
//       'last 2 iOS versions',
//       'last 2 Android versions'
//     ]
//   }
// }

fs.writeFileSync('./dist/blueprint.js', output.code)
fs.writeFileSync('./dist/blueprint.min.js', minOutput.code)
