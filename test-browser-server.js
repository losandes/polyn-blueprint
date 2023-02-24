const { expect } = require('chai')
const path = require('path')
const puppeteer = require('puppeteer')
const { Suite } = require('supposed')
const blueprint = require('@polyn/blueprint')

const __projectdir = process.cwd()
const suiteConfig = {
  name: 'test:browser',
  assertionLibrary: expect,
  sut: blueprint,
}
const suite = Suite(suiteConfig)

module.exports = suite.runner({
  title: 'polyn-blueprint',
  directories: ['./src'],
  dependencies: ['/node_modules/chai/chai.js', '/dist/blueprint.min.js'],
  matchesNamingConvention: /.(\.test\.js)$/i,
  matchesIgnoredConvention: /node_modules|documentation.test.js/i,
  stringifiedSuiteConfig: '{ reporter: "event", assertionLibrary: chai.expect, inject: { expect: chai.expect, sut: polyn.blueprint } }',
}).startServer()
  .then(async (context) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.on('console', async (msg) => {
      const txt = msg.text()

      try {
        const json = JSON.parse(txt)
        context.lastEvent = json
        suite.config.reporters.forEach((reporter) => reporter.write({
          ...json,
          ...{ suiteId: suiteConfig.name }
        }))

        if (json.type === 'END' && json.totals.failed > 0) {
          // maybe print a PDF that someone can review if this is being automated
          await page.pdf({ path: path.join(__projectdir, `test-log.${Date.now()}.pdf`), format: 'A4' })
        }
      } catch (e) {
        console.log(txt) // eslint-disable-line no-console
        context.lastEvent = txt
      }
    })

    await page.goto(`http://localhost:${context.runConfig.port}`, { waitUntil: 'networkidle2' })
    await browser.close()

    return context
  })
